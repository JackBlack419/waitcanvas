// Keep the initial waiting message in HTML, independent of these modules.
const loading=document.getElementById('gallery-loading');
const loadingTitle=document.getElementById('gallery-loading-title');
const loadingDetail=document.getElementById('gallery-loading-detail');
const refresh=document.getElementById('gallery-refresh');
const buttons=document.getElementById('gallery-filters');
const grid=document.getElementById('gallery-grid');
const count=document.getElementById('gallery-count');
const nextFrame=()=>new Promise(resolve=>requestAnimationFrame(resolve));
let renderId=0;

function showLoadError(){
  loading.hidden=false;
  loadingTitle.textContent='小画暂时没能加载出来';
  loadingDetail.textContent='请检查网络后重新加载，或先返回绘画工作台。';
  refresh.hidden=false;
  grid.setAttribute('aria-busy','false');
}

async function startGallery(){
  // Allow the browser to paint the HTML notice before importing the brush engine.
  await nextFrame();
  await nextFrame();
  const [,{mediaInfo},{allStudies,studyCatalog}]=await Promise.all([
    import('./waitcanvas.js'),import('./painterly.js'),import('./catalog.js')
  ]);
  let filter=new URLSearchParams(location.search).get('theme');
  if(!Object.hasOwn(mediaInfo,filter))filter='all';

  async function renderGallery(){
    const current=++renderId;
    const items=allStudies().filter(item=>filter==='all'||item.theme===filter);
    loading.hidden=false;
    refresh.hidden=true;
    loadingTitle.textContent='正在准备小画，请稍候……';
    loadingDetail.textContent='画作正在陆续就位，准备好后会自动显示。';
    grid.setAttribute('aria-busy','true');
    buttons.replaceChildren();
    for(const [id,label] of [['all','全部 '+allStudies().length+' 幅'],...Object.entries(mediaInfo).map(([key,value])=>[key,value.category])]){
      const button=document.createElement('button');
      button.textContent=label;
      button.className=filter===id?'active':'';
      button.setAttribute('aria-pressed',String(filter===id));
      button.addEventListener('click',()=>{filter=id;renderGallery().catch(showLoadError);});
      buttons.append(button);
    }
    grid.replaceChildren();
    count.textContent='';
    // Yield between small batches so the notice and page stay responsive.
    for(let start=0;start<items.length;start+=4){
      await nextFrame();
      if(current!==renderId)return;
      for(const item of items.slice(start,start+4)){
        const figure=document.createElement('figure');
        figure.className='study';
        const canvas=document.createElement('wait-canvas');
        canvas.setAttribute('theme',item.theme);
        canvas.setAttribute('sample',item.id);
        canvas.setAttribute('seed','a-little-pause');
        canvas.setAttribute('static','');
        const caption=document.createElement('figcaption'),text=document.createElement('div');
        const name=document.createElement('strong'),meta=document.createElement('span'),link=document.createElement('a');
        name.textContent=item.name;
        meta.textContent=mediaInfo[item.theme].category+' · '+(item.index+1)+'/'+studyCatalog[item.theme].length;
        text.append(name,meta);
        link.textContent='观看绘制过程';
        link.href='./index.html?theme='+item.theme+'&sample='+item.id;
        caption.append(text,link);
        figure.append(canvas,caption);
        grid.append(figure);
      }
      loadingDetail.textContent='已准备 '+Math.min(start+4,items.length)+' / '+items.length+' 幅，画作正在陆续就位。';
    }
    if(current!==renderId)return;
    count.textContent='显示 '+items.length+' 幅作品';
    grid.setAttribute('aria-busy','false');
    loading.hidden=true;
  }
  await renderGallery();
}

startGallery().catch(showLoadError);
