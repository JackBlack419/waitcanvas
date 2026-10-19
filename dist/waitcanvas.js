import { drawing, themeInfo } from './themes.js';
import { mediaInfo, paintScene, paintPaper, drawMark, paintTarget } from './painterly.js';

const validColor = value => /^#[0-9a-f]{6}$/i.test(value);
export class WaitCanvas extends HTMLElement {
  static observedAttributes = ['theme','sample','seed','primary','accent','paper','speed','state','reduced-motion','static','progress','paused'];
  constructor() {
    super(); this.attachShadow({mode:'open'}); this._elapsed=0; this._raf=0; this._visible=true;
    this._media=matchMedia('(prefers-reduced-motion: reduce)');
    this._tick=this._tick.bind(this); this._visibility=()=>this._sync(); this._motion=()=>{this._paint();this._sync();};
  }
  connectedCallback() {
    this._connected=true; this._last=0;
    this._media.addEventListener('change',this._motion);
    document.addEventListener('visibilitychange',this._visibility);
    this._observer=new IntersectionObserver(entries=>{this._visible=entries[0].isIntersecting;this._sync();});
    this._observer.observe(this); this._render(); this._sync();
  }
  disconnectedCallback() {
    this._connected=false; this._stop(); this._observer?.disconnect();
    this._media.removeEventListener('change',this._motion); document.removeEventListener('visibilitychange',this._visibility);
  }
  attributeChangedCallback(name,oldValue,value) {
    if(oldValue===value || !this._connected)return;
    if(name==='state') {if(value==='loading' && oldValue!=='loading')this._elapsed=0;this._paint();}
    else if(name==='progress') {if(value!==null&&this._scene)this._elapsed=Math.min(100,Math.max(0,Number(value)||0))/100*this._scene.duration*1000/(Math.min(2,Math.max(.5,Number(this.getAttribute('speed'))||1)));this._paint();}
    else if(['speed','reduced-motion','static','paused'].includes(name))this._paint();
    else {this._elapsed=0;this._render();}
    this._sync();
  }
  get state(){return this.getAttribute('state')||'idle';}
  set state(value){this.setAttribute('state',value);}
  get reduced(){return this.getAttribute('reduced-motion')==='true'||this._media.matches;}
  get config(){
    const theme=Object.hasOwn(themeInfo,this.getAttribute('theme'))?this.getAttribute('theme'):'mist';
    const defaults=themeInfo[theme].colors;
    return {theme,sample:this.getAttribute('sample')||undefined,seed:this.getAttribute('seed')||'a-little-pause',colors:['primary','accent','paper'].map((k,i)=>validColor(this.getAttribute(k)||'')?this.getAttribute(k):defaults[i])};
  }
  _render(){
    const c=this.config;
    this._scene=null;this._pieces=null;this._ambience=null;this._ctx=null;
    if(Object.hasOwn(mediaInfo,c.theme)){
      this._scene=paintScene(c.theme,c.seed,c.colors,c.sample);this._drawn=-1;
      const factor=this.hasAttribute('static') ? 0.5 : 1.5;
      this.shadowRoot.innerHTML=`<style>:host{display:block;width:100%;height:100%;min-height:150px;overflow:hidden;background:${c.colors[2]}}canvas{display:block;width:100%;height:100%;object-fit:contain}</style><canvas width="${900*factor}" height="${560*factor}" aria-hidden="true"></canvas>`;
      this._ctx=this.shadowRoot.querySelector('canvas').getContext('2d');this._ctx.setTransform(factor,0,0,factor,0,0);this._paint();return;
    }
    const art=drawing(c.theme,c.seed,c.colors);
    this.shadowRoot.innerHTML=`<style>:host{display:block;width:100%;height:100%;min-height:150px;overflow:hidden;background:${art.background}}svg{display:block;width:100%;height:100%}.piece{transform-box:fill-box;transform-origin:center}.ambience{transform-origin:450px 280px}</style><svg viewBox="0 0 900 560" preserveAspectRatio="xMidYMid slice" aria-hidden="true"><g>${art.texture}</g><g class="ambience">${art.pieces.map((p,i)=>`<g class="piece" data-piece="${i}">${p.markup}</g>`).join('')}</g></svg>`;
    this._pieces=art.pieces.map((p,i)=>({...p,el:this.shadowRoot.querySelector(`[data-piece="${i}"]`)}));
    this._ambience=this.shadowRoot.querySelector('.ambience');this._paint();
  }
  _paint(){
    const staticMode=this.hasAttribute('static')||this.reduced||this.state==='idle';
    const speed=Math.min(2,Math.max(.5,Number(this.getAttribute('speed'))||1));
    let t=staticMode?100:this._elapsed/1000*speed;
    if(this._scene&&this._ctx){
      if(this.hasAttribute('progress')&&!this.reduced)t=Math.min(100,Math.max(0,Number(this.getAttribute('progress'))||0))/100*this._scene.duration;
      const fraction=Math.max(0,Math.min(1,t/this._scene.duration)),target=paintTarget(this._scene,fraction);
      if(this._drawn<0||target<this._drawn){paintPaper(this._ctx,this._scene.background,this.config.seed,this.config.theme);this._drawn=0;}
      for(;this._drawn<target;this._drawn++)drawMark(this._ctx,this._scene.strokes[this._drawn]);
      const percentage=Math.round(fraction*100),stage=this._scene.phases?.find(p=>fraction>=p.start&&fraction<p.end)?.label||(fraction>=1?'绘制完成':'逐笔绘制');
      if(percentage!==this._percentage||stage!==this._stage){this._percentage=percentage;this._stage=stage;this.dispatchEvent?.(new CustomEvent('paint-progress',{detail:{progress:percentage,stage}}));}
      return;
    }
    if(!this._pieces)return;
    for(const p of this._pieces){
      let progress=Math.max(0,Math.min(1,(t-p.at)/p.duration)); progress=1-Math.pow(1-progress,3);
      p.el.style.opacity=String(progress);
      if(p.stroke){const child=p.el.firstElementChild;child.style.strokeDasharray='1';child.style.strokeDashoffset=String(1-progress);}
    }
    this._ambience?.setAttribute('transform',`translate(0 ${staticMode?0:Math.sin(t*.35)*1.3})`);
  }
  _sync(){
    const active=this._connected&&this.state==='loading'&&!this.hasAttribute('static')&&!this.hasAttribute('paused')&&!this.hasAttribute('progress')&&!this.reduced&&this._visible&&!document.hidden&&(!this._scene||this._drawn<this._scene.strokes.length);
    if(active&&!this._raf){this._last=0;this._raf=requestAnimationFrame(this._tick);}else if(!active)this._stop();
  }
  _stop(){if(this._raf)cancelAnimationFrame(this._raf);this._raf=0;this._last=0;}
  _tick(now){
    if(!this._connected)return;
    this._elapsed+=this._last?Math.min(now-this._last,100):0;this._last=now;this._paint();
    if(this._scene&&this._drawn>=this._scene.strokes.length){this._raf=0;this._last=0;return;}
    this._raf=requestAnimationFrame(this._tick);
  }
}
if(!customElements.get('wait-canvas'))customElements.define('wait-canvas',WaitCanvas);
