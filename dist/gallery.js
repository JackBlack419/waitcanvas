import './waitcanvas.js';
import {mediaInfo} from './painterly.js';
import {allStudies,studyCatalog} from './catalog.js';
let filter=new URLSearchParams(location.search).get('theme');if(!Object.hasOwn(mediaInfo,filter))filter='all';
const buttons=document.getElementById('gallery-filters'),grid=document.getElementById('gallery-grid');
function renderGallery(){
  buttons.replaceChildren();for(const [id,label] of [['all','全部 '+allStudies().length+' 幅'],...Object.entries(mediaInfo).map(([key,value])=>[key,value.category])]){const button=document.createElement('button');button.textContent=label;button.className=filter===id?'active':'';button.setAttribute('aria-pressed',String(filter===id));button.addEventListener('click',()=>{filter=id;renderGallery();});buttons.append(button);}
  grid.replaceChildren();const items=allStudies().filter(s=>filter==='all'||s.theme===filter);document.getElementById('gallery-count').textContent=`显示 ${items.length} 幅作品`;
  for(const item of items){const figure=document.createElement('figure');figure.className='study';const canvas=document.createElement('wait-canvas');canvas.setAttribute('theme',item.theme);canvas.setAttribute('sample',item.id);canvas.setAttribute('seed','a-little-pause');canvas.setAttribute('static','');const caption=document.createElement('figcaption'),text=document.createElement('div'),name=document.createElement('strong'),meta=document.createElement('span'),link=document.createElement('a');name.textContent=item.name;meta.textContent=`${mediaInfo[item.theme].category} · ${item.index+1}/${studyCatalog[item.theme].length}`;text.append(name,meta);link.textContent='观看绘制过程';link.href=`./index.html?theme=${item.theme}&sample=${item.id}`;caption.append(text,link);figure.append(canvas,caption);grid.append(figure);}
}
renderGallery();
