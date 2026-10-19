import test from 'node:test';
import assert from 'node:assert/strict';
import {drawing,themeInfo,seededRandom} from '../dist/themes.js';
import {mediaInfo,paintScene} from '../dist/painterly.js';
import {studyCatalog,allStudies,resolveSample} from '../dist/catalog.js';

const frames=new Map(),docEvents=new Map(),mediaEvents=new Set();let frameId=0;
const media={matches:false,addEventListener:(_,fn)=>mediaEvents.add(fn),removeEventListener:(_,fn)=>mediaEvents.delete(fn)};
globalThis.matchMedia=()=>media;
globalThis.requestAnimationFrame=fn=>{frames.set(++frameId,fn);return frameId;};
globalThis.cancelAnimationFrame=id=>frames.delete(id);
globalThis.document={hidden:false,addEventListener:(key,fn)=>docEvents.set(fn,key),removeEventListener:(_,fn)=>docEvents.delete(fn)};
globalThis.IntersectionObserver=class{constructor(fn){this.fn=fn;}observe(){}disconnect(){this.disconnected=true;}emit(isIntersecting){this.fn([{isIntersecting}]);}};
class FakeRoot {
  set innerHTML(value){this.html=value;this.nodes=new Map();}
  querySelector(selector){if(!this.nodes.has(selector)){const ctx=new Proxy({globalAlpha:1,operations:0},{get(target,key){return key in target?target[key]:()=>{target.operations++;};}});this.nodes.set(selector,{style:{},firstElementChild:{style:{}},setAttribute(){},getContext:()=>ctx});}return this.nodes.get(selector);}
}
globalThis.Path2D=class{constructor(d){this.d=d;}};
globalThis.HTMLElement=class {
  constructor(){this.attributes=new Map();}
  attachShadow(){this.shadowRoot=new FakeRoot();}
  getAttribute(key){return this.attributes.get(key)??null;}
  hasAttribute(key){return this.attributes.has(key);}
  setAttribute(key,value){const old=this.getAttribute(key);this.attributes.set(key,String(value));this.attributeChangedCallback?.(key,old,String(value));}
  removeAttribute(key){const old=this.getAttribute(key);this.attributes.delete(key);this.attributeChangedCallback?.(key,old,null);}
};
globalThis.customElements={get:()=>false,define(){}};
const {WaitCanvas}=await import('../dist/waitcanvas.js');
const flush=timestamp=>{const callbacks=[...frames.values()];frames.clear();for(const fn of callbacks)fn(timestamp);};

test('seeded original themes are repeatable and vary across seeds without invalid SVG numbers',()=>{
  for(const theme of ['mist','garden','orbit']){
    const first=drawing(theme,'first'),same=drawing(theme,'first'),different=drawing(theme,'second');
    assert.deepEqual(first,same);assert.notDeepEqual(first,different);
    const markup=first.pieces.map(p=>p.markup).join('');
    assert.doesNotMatch(markup,/NaN|Infinity|<script|https?:|<image|<foreignObject/i);
    assert.ok(first.pieces.length>30);assert.ok(first.pieces.every(p=>p.at>=0&&p.duration>0));
  }
  const a=seededRandom('fixed'),b=seededRandom('fixed');for(let i=0;i<20;i++)assert.equal(a(),b());
});
test('six media produce deterministic finite instructions with media-specific marks',()=>{
  assert.equal(Object.keys(mediaInfo).length,6);
  const kinds=[];
  for(const medium of Object.keys(mediaInfo)){
    const scene=paintScene(medium,'study');assert.deepEqual(scene,paintScene(medium,'study'));
    assert.notDeepEqual(scene,paintScene(medium,'other'));assert.ok(scene.strokes.length>30&&scene.strokes.length<10000);
    for(const m of scene.strokes)for(const value of Object.values(m))if(typeof value==='number')assert.ok(Number.isFinite(value));
    kinds.push([...new Set(scene.strokes.map(s=>s.style||s.kind))].sort().join(','));
    assert.doesNotMatch(JSON.stringify(scene),/https?:|<script|<img/);
  }
  assert.ok(paintScene('oil','study').strokes.some(s=>s.style==='oil'));
  assert.ok(paintScene('crayon','study').strokes.some(s=>s.style==='wax'));
  assert.ok(paintScene('ink','study').strokes.some(s=>s.kind==='leaf'));
});
test('canvas seeking, reduced motion and state changes release animation frames',()=>{
  for(const theme of Object.keys(mediaInfo)){
    const art=new WaitCanvas();art.setAttribute('theme',theme);art.connectedCallback();art.state='loading';
    art.setAttribute('progress','50');assert.equal(frames.size,0);const middle=art._drawn;assert.ok(middle>0&&middle<art._scene.strokes.length);
    art.setAttribute('progress','10');assert.ok(art._drawn<middle);
    art.removeAttribute('progress');assert.equal(frames.size,1);art.setAttribute('paused','');assert.equal(frames.size,0);
    art.removeAttribute('paused');assert.equal(frames.size,1);art.state='cancelled';assert.equal(frames.size,0);
    art.state='loading';art.setAttribute('reduced-motion','true');assert.equal(art._drawn,art._scene.strokes.length);assert.equal(frames.size,0);
    art.disconnectedCallback();
  }
  assert.equal(frames.size,0);assert.equal(docEvents.size,0);assert.equal(mediaEvents.size,0);
});
test('every medium has ten independently composed deterministic samples',()=>{
  assert.equal(allStudies().length,60);
  for(const [medium,list] of Object.entries(studyCatalog)){
    assert.equal(list.length,10);const signatures=new Set();
    for(const [id] of list){const scene=paintScene(medium,'fixed',undefined,id);assert.equal(scene.sample,id);assert.deepEqual(scene,paintScene(medium,'fixed',undefined,id));assert.ok(scene.strokes.length>40&&scene.strokes.length<10000);for(const mark of scene.strokes)for(const value of Object.values(mark))if(typeof value==='number')assert.ok(Number.isFinite(value));signatures.add(JSON.stringify(scene.strokes));}
    assert.equal(signatures.size,10);
  }
  assert.equal(resolveSample('sketch','constructor').id,'apple-cube');
});
test('coffee cup has a continuous left wall from rim to base at completion',()=>{
  const scene=paintScene('line','fixed',undefined,'coffee');
  // Probe the actual missing edge at several heights, independently of how
  // the outline is encoded or split into drawing instructions.
  for(const y of [250,280,320,365]){
    const x=292+(y-235)*18/145;
    assert.ok(scene.strokes.some(m=>{
      if(m.kind!=='line'||Math.abs(m.y2-m.y)<.001)return false;
      const t=(y-m.y)/(m.y2-m.y);
      return t>=0&&t<=1&&Math.abs(m.x+(m.x2-m.x)*t-x)<.05;
    }), 'cup wall missing at y='+y);
  }
});

test('all ten sketches reserve visible time for high-contrast contour drawing before hatching',()=>{
  for(const [id] of studyCatalog.sketch){const scene=paintScene('sketch','fixed',undefined,id);assert.equal(scene.phases.length,4);assert.equal(scene.phases[0].end,.24);assert.ok(scene.phases.every(p=>p.to>p.from));const contours=scene.strokes.slice(scene.phases[0].from,scene.phases[0].to);assert.ok(contours.length>100);assert.ok(contours.every(m=>m.kind==='line'));assert.ok(contours.some(m=>m.alpha>=.7&&m.width>=1.5));}
});
test('invalid theme and color attributes cannot insert markup into the shadow DOM',()=>{
  const art=new WaitCanvas();art.setAttribute('theme','<img onerror=alert(1)>');art.setAttribute('primary','"/><script>alert(1)</script>');art.setAttribute('paper','url(https://example.com)');art.connectedCallback();
  assert.equal(art.config.theme,'mist');assert.deepEqual(art.config.colors,themeInfo.mist.colors);
  assert.doesNotMatch(art.shadowRoot.html,/<script|<img|https?:/);art.disconnectedCallback();
  for(const value of ['constructor','__proto__','toString']){const invalid=new WaitCanvas();invalid.setAttribute('theme',value);invalid.connectedCallback();assert.equal(invalid.config.theme,'mist');invalid.disconnectedCallback();assert.equal(paintScene(value,'safe').theme,'oil');}
});
test('50 consecutive tasks and unmounts leave no frame, listener or observer behind',()=>{
  for(let i=0;i<50;i++){
    const art=new WaitCanvas();art.connectedCallback();assert.equal(frames.size,0);
    art.state='loading';assert.equal(frames.size,1);flush(100);flush(150);assert.ok(art._elapsed>0);
    art.state=['success','cancelled','error'][i%3];assert.equal(frames.size,0);
    const elapsed=art._elapsed;flush(250);assert.equal(art._elapsed,elapsed);
    art.state='loading';assert.equal(art._elapsed,0);assert.equal(frames.size,1);
    art.disconnectedCallback();assert.equal(frames.size,0);assert.ok(art._observer.disconnected);
  }
  assert.equal(docEvents.size,0);assert.equal(mediaEvents.size,0);
});
test('hidden documents, offscreen drawings and reduced motion pause and resume cleanly',()=>{
  const art=new WaitCanvas();art.connectedCallback();art.state='loading';assert.equal(frames.size,1);
  art._observer.emit(false);assert.equal(frames.size,0);art._observer.emit(true);assert.equal(frames.size,1);
  document.hidden=true;for(const fn of docEvents.keys())fn();assert.equal(frames.size,0);
  document.hidden=false;for(const fn of docEvents.keys())fn();assert.equal(frames.size,1);
  art.setAttribute('reduced-motion','true');assert.equal(frames.size,0);
  assert.ok(art._pieces.every(p=>p.el.style.opacity==='1'));
  art.setAttribute('reduced-motion','false');assert.equal(frames.size,1);
  media.matches=true;for(const fn of mediaEvents)fn();assert.equal(frames.size,0);
  media.matches=false;for(const fn of mediaEvents)fn();assert.equal(frames.size,1);
  art.disconnectedCallback();
});
