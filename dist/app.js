import './waitcanvas.js';
import {themeInfo} from './themes.js';
import {mediaInfo} from './painterly.js';
import {buildStandalone} from './export.js';
import {studyCatalog,resolveSample,allStudies} from './catalog.js';

const $=id=>document.getElementById(id), painting=$('main-painting');
const requestedTheme=new URLSearchParams(location.search).get('theme');
let theme=Object.hasOwn(mediaInfo,requestedTheme)?requestedTheme:'oil',format='html',mode='preview',taskState='idle',timer=0,previewTimer=0,toastTimer=0,taskId=0,sourcePromise;
let sample=resolveSample(theme,new URLSearchParams(location.search).get('sample')).id;
const colors=()=>['primary','accent','paper'].map(id=>$(id).value);
const seed=()=>$('seed').value.trim()||'a-little-pause';
const attr=value=>String(value).replaceAll('&','&amp;').replaceAll('"','&quot;').replaceAll('<','&lt;').replaceAll('>','&gt;');
const config=()=>({theme,sample,seed:seed(),primary:colors()[0],accent:colors()[1],paper:colors()[2],speed:$('speed').value,reducedMotion:$('reduce-motion').checked});
const newSeed=()=>`pause-${crypto.getRandomValues(new Uint32Array(1))[0].toString(36)}`;
function toast(message){clearTimeout(toastTimer);$('toast').textContent=message;$('toast').hidden=false;toastTimer=setTimeout(()=>$('toast').hidden=true,3300);}
function applyConfig(){
  const c=config();
  for(const [key,value] of Object.entries(c))painting.setAttribute(key==='reducedMotion'?'reduced-motion':key,String(value));
  $('art-stage').style.background=c.paper;
  const hex=c.paper.slice(1),luma=[0,2,4].map(p=>parseInt(hex.slice(p,p+2),16));
  document.querySelector('.art-caption').style.color=(luma[0]*.299+luma[1]*.587+luma[2]*.114)>140?'#354b42':'#dfe8df';
  $('speed-value').textContent=`${Number(c.speed)}×`;
  const motionReduced=c.reducedMotion||matchMedia('(prefers-reduced-motion: reduce)').matches;
  $('paint-progress').disabled=motionReduced;$('pause-painting').disabled=motionReduced;
  $('painting-name').textContent=resolveSample(theme,sample).name;$('painting-subtitle').textContent=themeInfo[theme].subtitle;
  $('art-caption-title').textContent=resolveSample(theme,sample).name;
  document.querySelector('.study-count').textContent=`作品 ${resolveSample(theme,sample).index+1}/${studyCatalog[theme].length}`;
  $('medium-label').textContent=mediaInfo[theme].category;$('painting-method').textContent=mediaInfo[theme].method;
  updateCode();
}
function htmlCode(){const c=config();return `<script type="module" src="./waitcanvas.js"><`+`/script>\n\n<wait-canvas\n  id="painting"\n  theme="${c.theme}"\n  sample="${c.sample}"\n  seed="${attr(c.seed)}"\n  primary="${c.primary}"\n  accent="${c.accent}"\n  paper="${c.paper}"\n  speed="${c.speed}"${c.reducedMotion?'\n  reduced-motion="true"':''}\n  state="loading"\n  style="display:block;width:100%;height:320px"\n></wait-canvas>\n\n<!-- 任务完成后设置 state="success"，立即显示你的结果。 -->`;}
function reactCode(){const c=config();return `import { useEffect, useRef } from 'react';\nimport './waitcanvas.js';\n\nexport function LoadingArt({ state = 'loading' }) {\n  const ref = useRef(null);\n  useEffect(() => {\n    ref.current?.setAttribute('state', state);\n  }, [state]);\n\n  return (\n    <wait-canvas ref={ref}\n      theme="${c.theme}"\n      sample="${c.sample}"\n      seed={${JSON.stringify(c.seed).replaceAll('<','\\u003c')}}\n      primary="${c.primary}"\n      accent="${c.accent}"\n      paper="${c.paper}"\n      speed="${c.speed}"${c.reducedMotion?'\n      reduced-motion="true"':''}\n      style={{ display: 'block', width: '100%', height: 320 }}\n    />\n  );\n}`;}
function updateCode(){$('code-output').textContent=format==='html'?htmlCode():reactCode();$('code-note').textContent=format==='html'?'将下载包内所有 JS 模块保留在同一目录。':'这是客户端 React 示例；Next.js 中请在客户端动态引入，见免费包说明。';}
function stopTimers(){clearTimeout(timer);clearTimeout(previewTimer);taskId++;}
function preview(){
  if(taskState==='loading')return toast('请先完成或取消当前模拟任务。');
  stopTimers();mode='preview';taskState='idle';painting.removeAttribute('progress');painting.removeAttribute('paused');painting.state='idle';
  $('task-result').hidden=true;$('status-mark').className='status-mark';
  $('status-title').textContent='绘制预览';$('status-detail').textContent='这是动画预览，下面可以模拟一次 AI 等待。';
  $('start-task').textContent='开始体验';document.querySelector('.task-setup').hidden=false;document.querySelector('.task-running').hidden=true;
  painting.state='loading';$('pause-painting').textContent='暂停绘制';
}
function startTask(){
  stopTimers();mode='task';taskState='loading';const currentTask=taskId;
  if($('rotate-themes').checked){
    const candidates=allStudies().filter(item=>(!$('rotation-scope')||$('rotation-scope').value==='all'||item.theme===theme)&&!(item.theme===theme&&item.id===sample));
    const next=candidates[crypto.getRandomValues(new Uint32Array(1))[0]%candidates.length];theme=next.theme;sample=next.id;renderSamples();
    document.querySelectorAll('[data-theme]').forEach(b=>{b.classList.toggle('selected',b.dataset.theme===theme);b.setAttribute('aria-pressed',String(b.dataset.theme===theme));});
    ['primary','accent','paper'].forEach((id,i)=>$(id).value=themeInfo[theme].colors[i]);
  }
  // A new task varies the seed once; ongoing tasks never rotate themes.
  painting.removeAttribute('progress');painting.removeAttribute('paused');$('seed').value=newSeed();applyConfig();painting.state='idle';painting.state='loading';$('pause-painting').textContent='暂停绘制';
  $('task-result').hidden=true;$('status-mark').className='status-mark loading';
  $('status-title').textContent='正在整理思路…';$('status-detail').textContent='模拟 AI 处理中。你可以随时完成、失败或取消。';
  document.querySelector('.task-setup').hidden=true;document.querySelector('.task-running').hidden=false;
  const duration=Number($('duration').value);
  if(duration>0)timer=setTimeout(()=>{if(currentTask===taskId&&taskState==='loading')finishTask('success');},duration*1000);
}
function finishTask(state){
  if(mode!=='task'||taskState!=='loading')return;
  stopTimers();taskState=state;painting.state=state;
  document.querySelector('.task-setup').hidden=false;document.querySelector('.task-running').hidden=true;
  $('start-task').textContent=state==='success'?'再体验一次':'重新开始';
  $('status-mark').className=`status-mark ${state}`;
  const messages={success:['任务完成','结果立即出现，绘画已经停止。'],error:['这次请求未完成','这是模拟失败。点击重新开始即可重试。'],cancelled:['已取消等待','绘制已停止，可以开始一次新的任务。']};
  $('status-title').textContent=messages[state][0];$('status-detail').textContent=messages[state][1];$('task-result').hidden=state!=='success';
}
document.querySelectorAll('[data-theme]').forEach(button=>button.addEventListener('click',()=>{
  theme=button.dataset.theme;sample=resolveSample(theme).id;renderSamples();
  document.querySelectorAll('[data-theme]').forEach(b=>{b.classList.toggle('selected',b===button);b.setAttribute('aria-pressed',String(b===button));});
  ['primary','accent','paper'].forEach((id,i)=>$(id).value=themeInfo[theme].colors[i]);applyConfig();
  if(taskState!=='loading')preview();
}));
['primary','accent','paper','speed','reduce-motion'].forEach(id=>$(id).addEventListener('input',applyConfig));
$('seed').addEventListener('change',()=>{applyConfig();if(taskState!=='loading')preview();});
$('shuffle').addEventListener('click',()=>{$('seed').value=newSeed();applyConfig();if(taskState!=='loading')preview();});
$('reset-colors').addEventListener('click',()=>{['primary','accent','paper'].forEach((id,i)=>$(id).value=themeInfo[theme].colors[i]);applyConfig();});
document.querySelectorAll('[data-palette]').forEach(button=>button.addEventListener('click',()=>{
  const palettes={native:themeInfo[theme].colors,lilac:['#82709f','#c49c9c','#f1edf5'],blue:['#557f9a','#c5b287','#edf3f4'],night:['#a0b6ab','#d3b890','#21372e']};
  ['primary','accent','paper'].forEach((id,i)=>$(id).value=palettes[button.dataset.palette][i]);applyConfig();
}));
document.querySelectorAll('[data-size]').forEach(button=>button.addEventListener('click',()=>{
  document.querySelectorAll('[data-size]').forEach(b=>{b.classList.toggle('active',b===button);b.setAttribute('aria-pressed',String(b===button));});
  $('art-frame').classList.toggle('compact',button.dataset.size==='compact');
}));
document.querySelectorAll('[data-format]').forEach(button=>button.addEventListener('click',()=>{format=button.dataset.format;document.querySelectorAll('[data-format]').forEach(b=>{b.classList.toggle('active',b===button);b.setAttribute('aria-pressed',String(b===button));});updateCode();}));
$('replay').addEventListener('click',preview);$('start-task').addEventListener('click',startTask);$('again-task').addEventListener('click',startTask);
$('finish-task').addEventListener('click',()=>finishTask('success'));$('fail-task').addEventListener('click',()=>finishTask('error'));$('cancel-task').addEventListener('click',()=>finishTask('cancelled'));
$('copy-code').addEventListener('click',async()=>{
  try {await navigator.clipboard.writeText($('code-output').textContent);toast('接入代码已复制。');}
  catch {const range=document.createRange();range.selectNodeContents($('code-output'));const sel=getSelection();sel.removeAllRanges();sel.addRange(range);$('code-output').closest('pre').focus();toast('无法自动复制，已选中代码，请手动复制。');}
});
function saveFile(content,name,type='text/plain;charset=utf-8'){const url=URL.createObjectURL(new Blob([content],{type}));const a=document.createElement('a');a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),3000);}
async function componentSources(){
  if(!sourcePromise)sourcePromise=Promise.all(['catalog.js','studies.js','painterly.js','themes.js','waitcanvas.js','LICENSES.txt'].map(async path=>{const response=await fetch(new URL(path,location.href));if(!response.ok)throw Error('source unavailable');return response.text();})).catch(error=>{sourcePromise=undefined;throw error;});
  return sourcePromise;
}
$('download-demo').addEventListener('click',async()=>{
  const button=$('download-demo');button.disabled=true;
  try {const sources=await componentSources();saveFile(buildStandalone(config(),sources),`waitcanvas-${theme}-${sample}-example.html`,'text/html;charset=utf-8');toast('已生成独立示例，打开下载的 HTML 即可体验。');}
  catch {toast('示例生成失败，请重试，或下载完整免费包。');}
  finally {button.disabled=false;}
});
$('appearance').addEventListener('click',()=>{const dark=document.body.classList.toggle('dark');try{localStorage.setItem('waitcanvas-appearance',dark?'dark':'light');}catch{}$('appearance').setAttribute('aria-label',dark?'切换浅色界面':'切换深色界面');});
try{document.body.classList.toggle('dark',localStorage.getItem('waitcanvas-appearance')==='dark');}catch{}
if(document.body.classList.contains('dark'))$('appearance').setAttribute('aria-label','切换浅色界面');
window.addEventListener('pagehide',stopTimers);
painting.addEventListener('paint-progress',event=>{$('paint-progress').value=event.detail.progress;$('paint-percentage').textContent=`${event.detail.progress}%`;$('paint-stage').textContent=event.detail.stage||'逐笔绘制';if(event.detail.progress===100&&taskState!=='loading')$('pause-painting').textContent='重新绘制';});
$('paint-progress').addEventListener('input',event=>{painting.setAttribute('progress',event.target.value);$('pause-painting').textContent='继续绘制';});
$('view-finished').addEventListener('click',()=>{painting.setAttribute('progress','100');$('pause-painting').textContent='重新绘制';});
$('pause-painting').addEventListener('click',()=>{
  if(['success','error','cancelled'].includes(taskState))return toast('任务已结束，请重新开始体验或重看绘制。');
  if(painting.getAttribute('progress')==='100'||$('paint-progress').value==='100'){painting.removeAttribute('progress');painting.removeAttribute('paused');painting.state='idle';painting.state='loading';$('pause-painting').textContent='暂停绘制';}
  else if(painting.hasAttribute('progress')||painting.hasAttribute('paused')){painting.removeAttribute('progress');painting.removeAttribute('paused');$('pause-painting').textContent='暂停绘制';}
  else{painting.setAttribute('paused','');$('pause-painting').textContent='继续绘制';}
});
function renderSamples(){
  const container=$('sample-options');container.replaceChildren();
  for(const [id,name] of studyCatalog[theme]){const button=document.createElement('button');button.type='button';button.textContent=name;button.dataset.sample=id;button.className='sample-option'+(sample===id?' active':'');button.setAttribute('aria-pressed',String(sample===id));button.addEventListener('click',()=>{sample=id;renderSamples();applyConfig();if(taskState!=='loading')preview();});container.append(button);}
}
renderSamples();['primary','accent','paper'].forEach((id,i)=>$(id).value=themeInfo[theme].colors[i]);
document.querySelectorAll('[data-theme]').forEach(b=>{b.classList.toggle('selected',b.dataset.theme===theme);b.setAttribute('aria-pressed',String(b.dataset.theme===theme));});
applyConfig();preview();
