import {resolveSample} from './catalog.js';
import {buildStudy} from './studies.js';
// Original, locally rendered brush studies. No raster assets or network calls.
export const mediaInfo = {
  oil: {name:'海边落日',category:'油画',en:'Oil painting',subtitle:'铺底、叠色，再点亮海面的光',colors:['#447c83','#d79572','#f4ead8'],method:'宽笔铺底 → 短笔叠色 → 波光与高光',duration:18},
  line: {name:'窗台植物',category:'线条画',en:'Line drawing',subtitle:'沿着轮廓，留下一窗安静',colors:['#365a50','#a48e78','#f8f5ec'],method:'窗框轮廓 → 枝叶结构 → 少量细节',duration:12},
  crayon: {name:'彩虹小镇',category:'蜡笔画',en:'Wax crayon',subtitle:'带着纸纹，把小镇涂成彩色',colors:['#679b9d','#dc967b','#faf0d8'],method:'粗笔起形 → 颗粒涂色 → 自然的出界',duration:16},
  ink: {name:'竹影清风',category:'国画',en:'Chinese ink',subtitle:'浓淡之间，一枝竹影',colors:['#344d43','#ad5a49','#f3efe3'],method:'淡墨远竹 → 竹节与枝干 → 浓墨写叶',duration:15},
  sketch: {name:'苹果与方体',category:'素描',en:'Graphite sketch',subtitle:'先看清轮廓，再一层层塑造明暗',colors:['#514b45','#97897b','#f1ece2'],method:'轮廓起形 → 第一层明暗 → 交叉排线 → 压暗',duration:24},
  pencil: {name:'枝头小鸟',category:'彩铅画',en:'Colored pencil',subtitle:'细细叠色，留住枝头的一刻',colors:['#427f9d','#d5a65b','#f8f2e6'],method:'淡色起形 → 细线叠色 → 羽毛与枝叶',duration:18}
};
export function paintRandom(seed){let h=2166136261;for(const ch of String(seed))h=Math.imul(h^ch.charCodeAt(0),16777619);return()=>{h+=0x6d2b79f5;let t=Math.imul(h^h>>>15,1|h);t^=t+Math.imul(t^t>>>7,61|t);return((t^t>>>14)>>>0)/4294967296;};}
const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
export function mixColor(a,b,t){const aa=a.slice(1).match(/../g).map(x=>parseInt(x,16)),bb=b.slice(1).match(/../g).map(x=>parseInt(x,16));return '#'+aa.map((x,i)=>Math.round(x+(bb[i]-x)*clamp(t,0,1)).toString(16).padStart(2,'0')).join('');}

export function paintScene(theme,seed,colors,sampleId){
  if(!Object.hasOwn(mediaInfo,theme))theme='oil';
  const selected=resolveSample(theme,sampleId);
  if(selected.index>0||theme==='sketch')return buildStudy(theme,seed,colors||mediaInfo[theme].colors,selected.id);
  const r=paintRandom(seed),[p,a,paper]=colors||mediaInfo[theme].colors,s=[];
  const mark=(kind,props)=>s.push({kind,...props});
  const line=(x,y,x2,y2,color=p,width=1,alpha=.6)=>mark('line',{x,y,x2,y2,color,width,alpha});
  const ellipse=(x,y,rx,ry,color,alpha=1,rotation=0)=>mark('ellipse',{x,y,rx,ry,color,alpha,rotation});
  const brush=(x,y,length,width,color,angle=0,alpha=1,style='oil')=>mark('brush',{x,y,length,width,color,angle,alpha,style,noise:Math.floor(r()*100000)});
  const path=(d,color=p,width=1,alpha=.7,fill=false)=>mark('path',{d,color,width,alpha,fill});
  const jitter=(value,amount)=>value+(r()-.5)*amount;
  const shuffle=arr=>{for(let i=arr.length-1;i>0;i--){const j=Math.floor(r()*(i+1));[arr[i],arr[j]]=[arr[j],arr[i]];}return arr;};
  const scribble=(shape,count,color,width=1,alpha=.2)=>{
    for(let i=0;i<count;i++){
      const x=shape.x+(r()-.5)*shape.rx*2,y=shape.y+(r()-.5)*shape.ry*2;
      if(((x-shape.x)/shape.rx)**2+((y-shape.y)/shape.ry)**2>1)continue;
      line(x,y,x+6+r()*17,y-8-r()*17,color,width,alpha);
    }
  };
  if(theme==='oil'){
    // Broad underpainting is laid down in scattered strokes before smaller marks.
    const skyTop=mixColor('#8186a4',p,.13),skyBottom=mixColor('#edbe84',a,.22),seaTop=mixColor(p,'#a5aba7',.3),deep=mixColor(p,'#263b54',.22);
    const base=[];
    for(let y=62;y<500;y+=23)for(let x=63;x<840;x+=48){
      const yy=jitter(y,12),sunGlow=Math.max(0,1-Math.abs(x-605)/400);
      let color=y<278?mixColor(skyTop,skyBottom,(y-62)/217):mixColor(seaTop,deep,(y-278)/222);
      if(y<278)color=mixColor(color,'#f1cc8d',sunGlow*.18);
      base.push({x:jitter(x,14),y:yy,color});
    }
    for(const b of shuffle(base))brush(b.x,b.y,64+r()*30,34+r()*13,b.color,(r()-.5)*.12,.94);
    for(let i=0;i<240;i++){
      const x=60+r()*780,y=60+r()*215;
      let color=mixColor(skyTop,skyBottom,(y-60)/215);
      color=mixColor(color,r()>.5?'#fff0c7':a,.1+r()*.25);
      brush(x,y,18+r()*45,5+r()*13,color,(r()-.5)*.24,.7);
    }
    // Low clouds are formed by small, cool, horizontal strokes.
    for(let cloud=0;cloud<4;cloud++){
      const cx=130+cloud*185,cy=132+r()*55;
      for(let i=0;i<45;i++){
        const x=cx+(r()-.5)*170,y=cy+(r()-.5)*24;
        brush(x,y,17+r()*34,4+r()*9,mixColor('#8b86a1',a,r()*.35),(r()-.5)*.13,.55);
      }
    }
    const sunX=610+jitter(0,35),sunY=227;
    // The sun is built from paint dabs, rather than a single fading disk.
    for(let i=0;i<100;i++){const angle=r()*Math.PI*2,radius=Math.sqrt(r())*27;brush(sunX+Math.cos(angle)*radius,sunY+Math.sin(angle)*radius,8+r()*12,5+r()*7,mixColor('#ffe8a3','#fff5cf',r()),(r()-.5)*.5,.9);}
    for(let i=0;i<450;i++){
      const x=60+r()*780,y=282+r()*216,near=(y-282)/216;
      const reflection=Math.abs(x-sunX)<(18+near*105)&&r()<.65;
      let color=reflection?mixColor('#f6d693',a,r()*.5):mixColor(p,r()>.5?'#7d9c9e':'#344e63',r()*.6);
      brush(x,y,12+r()*38+near*18,2+r()*6,color,(r()-.5)*.1,.8);
    }
    // A dark headland anchors the lower-left corner; textured foreground overlays the sea.
    for(let i=0;i<190;i++){
      const x=55+r()*290,y=360+r()*150;
      if(y<360+x*.37)continue;
      brush(x,y,13+r()*27,8+r()*16,mixColor('#354b48',p,r()*.35),-.35+r()*.5,.93);
    }
    for(let i=0;i<75;i++){const y=300+r()*190;brush(sunX+(r()-.5)*(y-265)*.85,y,7+r()*28,1+r()*3,'#f9dda0',0,.88);}
  }
  if(theme==='line'){
    const x=185+jitter(0,15),right=714;
    // Segment-by-segment outlines retain a clear drawing order.
    for(const [x1,y1,x2,y2] of [[x,435,x,90],[x,90,right,90],[right,90,right,435],[x-25,435,right+25,435],[x-25,447,right+25,447],[x-25,435,x-25,447],[right+25,435,right+25,447],[445,90,445,330],[x,270,right,270]]){
      const n=Math.ceil(Math.hypot(x2-x1,y2-y1)/18);for(let j=0;j<n;j++)line(x1+(x2-x1)*j/n,y1+(y2-y1)*j/n,x1+(x2-x1)*(j+1)/n,y1+(y2-y1)*(j+1)/n,p,1.4,.65);
    }
    path('M 205 243 Q 300 160 355 224 Q 390 190 427 228',p,.8,.2);
    ellipse(629,161,28,28,a,.12);path('M 604 161 A 25 25 0 0 1 651 150',a,.8,.5);
    const plants=[{x:290,y:392,w:45,top:209},{x:490,y:395,w:51,top:245},{x:627,y:396,w:36,top:309}];
    for(const b of plants){
      path(`M ${b.x-b.w} ${b.y} L ${b.x-b.w+12} 432 L ${b.x+b.w-12} 432 L ${b.x+b.w} ${b.y} Z`,p,1.6,.8);
      path(`M ${b.x-b.w-4} ${b.y-7} H ${b.x+b.w+4} V ${b.y+2} H ${b.x-b.w-4} Z`,p,1,.7);
      for(let stem=0;stem<3;stem++){
        const bx=b.x+(stem-1)*16,ty=b.top+r()*25,tx=bx+(stem-1)*25;
        path(`M ${bx} ${b.y-9} Q ${tx+10} ${(b.y+ty)/2} ${tx} ${ty}`,p,1.3,.8);
        for(let j=0;j<5;j++){
          const yy=ty+24+j*(b.y-ty-40)/5,xx=tx+(bx-tx)*(yy-ty)/(b.y-ty),side=j%2?-1:1,len=18+r()*15;
          path(`M ${xx} ${yy} Q ${xx+side*len*.25} ${yy-22} ${xx+side*len} ${yy-23} Q ${xx+side*len} ${yy-5} ${xx} ${yy}`,p,1,.7);
          line(xx,yy,xx+side*len*.85,yy-19,p,.7,.35);
        }
      }
      for(let j=0;j<5;j++)line(b.x-b.w+13+j*9,b.y+9,b.x-b.w+17+j*8,b.y+28,p,.6,.2);
    }
    path('M 337 483 Q 450 472 567 484',p,.9,.18);
  }
  if(theme==='crayon'){
    // Dry wax strokes leave holes, rough edges and deliberately loose overlaps.
    for(let i=0;i<300;i++){const x=65+r()*770,y=65+r()*310;brush(x,y,18+r()*58,7+r()*16,mixColor('#96c9db',p,.13),(r()-.5)*.4,.2,'wax');}
    const rainbow=['#cb7874','#dda478','#e3c975','#a6ba91',mixColor(p,'#8eafbf',.35)];
    for(let k=0;k<5;k++)for(let j=0;j<95;j++){const t=Math.PI+j/94*Math.PI,rx=270-k*12,ry=215-k*11,x=450+Math.cos(t)*rx,y=330+Math.sin(t)*ry;brush(x,y,14,11,rainbow[k],t+Math.PI/2,.65,'wax');}
    for(let i=0;i<210;i++){const x=55+r()*790,y=390+r()*110;brush(x,y,20+r()*48,12+r()*12,mixColor('#a5b281',p,r()*.18),-.12+r()*.25,.4,'wax');}
    const houses=[{x:170,w:125,top:292,color:mixColor(a,'#dcaf75',.25)},{x:362,w:135,top:268,color:mixColor(p,'#a3c1c1',.4)},{x:575,w:133,top:302,color:'#d9b86e'}];
    for(const h of houses){
      for(let j=0;j<170;j++){const y=h.top+r()*(451-h.top),x=h.x+r()*h.w;brush(x,y,14+r()*24,4+r()*9,h.color,-.3+r()*.6,.55,'wax');}
      for(let j=0;j<120;j++){const x=h.x-12+r()*(h.w+24),roofY=h.top-65+Math.abs(x-(h.x+h.w/2))*.85,y=roofY+r()*Math.max(0,h.top-roofY);if(y<h.top)brush(x,y,12+r()*18,6+r()*6,mixColor('#ab6c62',a,.35),-.25,.6,'wax');}
      for(const bx of [h.x+20,h.x+h.w-43])for(let j=0;j<26;j++){const y=h.top+35+r()*36,x=bx+r()*22;brush(x,y,8+r()*8,3+r()*5,'#6c91a2',0,.6,'wax');}
      for(let j=0;j<32;j++){const x=h.x+h.w/2-10+r()*22,y=410+r()*42;brush(x,y,8+r()*8,5,'#9c8271',.1,.6,'wax');}
      for(const [x1,y1,x2,y2] of [[h.x,h.top,h.x,451],[h.x,451,h.x+h.w,451],[h.x+h.w,451,h.x+h.w,h.top],[h.x-12,h.top,h.x+h.w/2,h.top-65],[h.x+h.w/2,h.top-65,h.x+h.w+12,h.top]])brush((x1+x2)/2,(y1+y2)/2,Math.hypot(x2-x1,y2-y1),2,'#6b6861',Math.atan2(y2-y1,x2-x1),.55,'wax');
    }
    for(let i=0;i<60;i++){const x=90+r()*730,y=450+r()*55;brush(x,y,5+r()*8,4,r()>.5?'#d18480':'#efe0a0',r()*3,.8,'wax');}
  }
  if(theme==='ink'){
    // Restrained ink wash, jointed bamboo culms, then individual tapered leaves.
    for(let layer=0;layer<2;layer++){
      const baseX=layer?485:410,alpha=layer?.65:.16;
      for(let culm=0;culm<3;culm++){
        const bx=baseX+culm*62,lean=(culm-1)*35+(r()-.5)*15;
        for(let j=0;j<7;j++){
          const y=500-j*57,x=bx+lean*j/7;
          brush(x,y-26,52,layer?7:10,p,-Math.PI/2-.05,alpha,'ink');
          path(`M ${x-6} ${y-52} q 6 -3 12 -1`,p,1.7,alpha);
        }
      }
    }
    const clusters=[{x:488,y:320,side:-1},{x:545,y:260,side:1},{x:590,y:175,side:-1},{x:465,y:158,side:-1},{x:608,y:370,side:1},{x:548,y:420,side:-1},{x:605,y:100,side:1}];
    for(const b of clusters){
      path(`M ${b.x} ${b.y} Q ${b.x+b.side*45} ${b.y-28} ${b.x+b.side*99} ${b.y-37}`,p,1.8,.7);
      for(let j=0;j<9;j++){
        const x=b.x+b.side*(15+j*10),y=b.y-10-j*3,angle=(b.side<0?Math.PI:0)+(-.9+r()*1.8),length=32+r()*32;
        mark('leaf',{x,y,length,width:4+r()*7,angle,color:p,alpha:.5+r()*.43,noise:r()});
      }
    }
    for(let i=0;i<12;i++)brush(335+r()*270,490+r()*16,15+r()*30,2,p,(r()-.5)*.2,.12,'ink');
    // A small vermilion artist-mark motif, without counterfeit calligraphy.
    path('M 232 405 h 24 v 29 h -24 Z',a,1.8,.8);
    for(const d of ['M 238 412 h 12','M 238 419 h 10 v 8','M 244 409 v 21','M 238 426 h 5'])path(d,a,1.3,.65);
  }
  if(theme==='sketch'){
    const gray=mixColor(p,'#292827',.3);
    for(let i=0;i<90;i++)line(155+r()*570,434+r()*35,210+r()*530,437+r()*35,p,.55,.07);
    const cup='M 281 253 Q 340 270 402 253 L 390 403 Q 338 426 293 401 Z';
    const pear='M 570 270 C 567 293 532 303 513 350 C 477 424 528 448 578 448 C 645 450 687 414 661 361 C 645 326 603 310 598 280 C 596 262 579 255 570 270 Z';
    path('M 137 437 Q 433 430 750 443',p,.7,.3);
    for(const d of [cup,'M 280 251 C 280 232 405 231 404 252 C 400 272 283 272 280 251','M 404 278 C 471 253 479 355 399 368',pear,'M 581 269 Q 575 245 596 230'])path(d,p,.9,.45);
    // Hatching is clipped into separately defined forms, not added as a flat overlay.
    for(let layer=0;layer<3;layer++){
      for(let i=0;i<420;i++){
        const x=287+r()*115,y=267+r()*135;
        if(r()<(x-285)/145+.15)mark('line',{x,y,x2:x+10+r()*17,y2:y-12-r()*15,color:gray,width:.45+r()*.35,alpha:.08+layer*.04,clip:cup});
      }
      for(let i=0;i<650;i++){
        const x=502+r()*166,y=273+r()*175;
        if(r()<.15+(x-510)/200+(y-300)/500)mark('line',{x,y,x2:x+12+r()*18,y2:y-10-r()*16,color:gray,width:.45+r()*.4,alpha:.1+layer*.04,clip:pear});
      }
    }
    for(let i=0;i<150;i++){const x=295+r()*95,y=243+r()*13;if(((x-344)/54)**2+((y-250)/9)**2<1)line(x,y,x+8,y-2,p,.6,.2);}
    path('M 282 253 C 291 273 392 273 404 252',gray,1.3,.7);path('M 405 292 C 449 276 455 335 402 349',gray,1.3,.7);
    path('M 582 266 Q 579 247 596 230',gray,2,.75);
    for(let i=0;i<120;i++){const x=510+r()*162,y=441+r()*13;line(x,y,x+13,y-1,p,.6,.17);}
  }
  if(theme==='pencil'){
    // An original blue-and-gold songbird drawn with translucent colored hatching.
    const body='M 389 315 C 367 284 372 251 403 233 C 410 187 459 158 500 184 C 524 198 532 226 523 254 C 555 288 551 337 519 363 C 478 391 411 375 389 315 Z';
    const wing='M 401 256 C 460 224 509 261 520 318 C 481 338 439 326 401 256 Z';
    path('M 193 438 Q 452 393 723 412',mixColor(a,'#8b7164',.6),1,.3);
    path(body,p,.6,.25);path(wing,p,.5,.2);
    for(let layer=0;layer<4;layer++){
      for(let i=0;i<740;i++){
        const x=370+r()*182,y=175+r()*210,color=y>280?mixColor(a,'#ddc87c',r()*.5):mixColor(p,'#9bbac7',r()*.4);
        mark('line',{x,y,x2:x-6+r()*20,y2:y+9+r()*17,color,width:.55+r()*.65,alpha:.14+layer*.03,clip:body});
      }
      for(let i=0;i<330;i++){const x=398+r()*126,y=245+r()*91;mark('line',{x,y,x2:x+12+r()*19,y2:y+12+r()*19,color:mixColor(p,'#2c4c6d',r()*.5),width:.7,alpha:.2,clip:wing});}
    }
    for(let i=0;i<120;i++){const x=390+r()*80,y=338+r()*100;mark('line',{x,y,x2:x-38-r()*15,y2:y+65,color:p,width:.6,alpha:.17,clip:'M 400 326 L 455 356 L 377 462 L 350 456 Z'});}
    for(let i=0;i<70;i++){const x=516+r()*25,y=218+r()*16;if(y>219+(x-516)*.28&&y<235-(x-516)*.32)line(x,y,x+5,y,a,.6,.6);}
    ellipse(491,215,4,4,'#303e3f',.9);ellipse(490,214,1.1,1.1,paper,1);
    for(const x of [447,482]){line(x,370,x-3,412,mixColor(a,'#574b44',.6),1,.8);line(x-3,412,x+11,413,p,.8,.65);line(x-3,412,x-12,415,p,.7,.6);}
    for(let i=0;i<220;i++){const x=196+r()*515,y=406+(x-450)*-.05+r()*8;line(x,y,x+13,y-2,mixColor(a,'#8d7562',.65),.7,.3);}
    for(const b of [{x:240,y:426},{x:650,y:414},{x:703,y:409}]){
      path(`M ${b.x} ${b.y} q -10 -40 -28 -56`,p,.8,.35);
      scribble({x:b.x-23,y:b.y-43,rx:20,ry:9},130,mixColor(p,'#7f966a',.6),.6,.25);
    }
  }
  // All strokes have stable IDs and their own paint order. No generated HTML.
  return {theme,sample:selected.id,name:selected.name,background:paper,duration:mediaInfo[theme].duration,strokes:s};
}

export function paintTarget(scene,fraction){
  const f=Math.max(0,Math.min(1,fraction));if(f>=1)return scene.strokes.length;
  if(!scene.phases)return Math.floor(f*scene.strokes.length);
  const stage=scene.phases.find(p=>f>=p.start&&f<p.end)||scene.phases[0];
  return Math.floor(stage.from+(stage.to-stage.from)*(f-stage.start)/(stage.end-stage.start));
}

export function drawMark(ctx,m,progress=1){
  ctx.save();if(m.clip)ctx.clip(new Path2D(m.clip));ctx.globalAlpha=m.alpha??1;ctx.strokeStyle=m.color;ctx.fillStyle=m.color;ctx.lineWidth=m.width||1;ctx.lineCap='round';ctx.lineJoin='round';
  if(m.kind==='line'){ctx.beginPath();ctx.moveTo(m.x,m.y);ctx.lineTo(m.x+(m.x2-m.x)*progress,m.y+(m.y2-m.y)*progress);ctx.stroke();}
  else if(m.kind==='ellipse'){ctx.beginPath();ctx.ellipse(m.x,m.y,m.rx,m.ry,m.rotation||0,0,Math.PI*2);ctx.fill();}
  else if(m.kind==='path'){const path=new Path2D(m.d);m.fill?ctx.fill(path):ctx.stroke(path);}
  else if(m.kind==='leaf'){
    ctx.translate(m.x,m.y);ctx.rotate(m.angle);ctx.beginPath();ctx.moveTo(0,0);ctx.bezierCurveTo(m.length*.32,-m.width,m.length*.7,-m.width*.4,m.length,0);ctx.bezierCurveTo(m.length*.54,m.width*.9,m.length*.25,m.width*.45,0,0);ctx.fill();
    ctx.globalAlpha*=.25;ctx.strokeStyle='#f3efe3';ctx.lineWidth=.5;ctx.beginPath();ctx.moveTo(1,0);ctx.lineTo(m.length*.85,0);ctx.stroke();
  } else if(m.kind==='brush'){
    const r=paintRandom(m.noise),len=m.length*progress,w=m.width;ctx.translate(m.x,m.y);ctx.rotate(m.angle||0);
    if(m.style==='wax'){
      for(let j=0;j<Math.max(6,w*2);j++){ctx.globalAlpha=(m.alpha||1)*(.15+r()*.5);ctx.lineWidth=.5+r()*1.6;ctx.beginPath();const y=(r()-.5)*w;ctx.moveTo(-len/2+r()*3,y);ctx.lineTo(len/2-r()*4,y+(r()-.5)*3);ctx.stroke();}
      for(let j=0;j<Math.min(65,len*w/9);j++){ctx.globalAlpha=(m.alpha||1)*.35;ctx.fillRect((r()-.5)*len,(r()-.5)*w,.6+r()*1.5,.6+r()*1.5);}
    }else if(m.style==='ink'){
      ctx.beginPath();ctx.moveTo(-len/2,-w*.35);ctx.bezierCurveTo(-len*.1,-w*.8,len*.4,-w*.25,len/2,0);ctx.lineTo(len*.44,w*.4);ctx.bezierCurveTo(0,w*.45,-len*.35,w*.25,-len/2,w*.28);ctx.closePath();ctx.fill();
      for(let j=0;j<3;j++){ctx.globalAlpha=(m.alpha||1)*.12;ctx.strokeStyle='#f3efe3';ctx.lineWidth=.4+r()*.6;ctx.beginPath();ctx.moveTo(-len/2,(r()-.5)*w);ctx.lineTo(len*.4,(r()-.5)*w);ctx.stroke();}
    }else{
      ctx.beginPath();ctx.moveTo(-len*.5,-w*.3);ctx.lineTo(-len*.35,-w*.46);ctx.lineTo(len*.4,-w*.36);ctx.lineTo(len*.5,-w*.18);ctx.lineTo(len*.44,w*.26);ctx.lineTo(len*.3,w*.4);ctx.lineTo(-len*.42,w*.38);ctx.closePath();ctx.fill();
      for(let j=0;j<Math.min(10,w*.8);j++){const y=(r()-.5)*w*.65;ctx.globalAlpha=(m.alpha||1)*(.07+r()*.1);ctx.strokeStyle=j%2?'#fff3db':'#2b3d49';ctx.lineWidth=.4+r()*.8;ctx.beginPath();ctx.moveTo(-len*.43+r()*4,y);ctx.lineTo(len*.4-r()*4,y+(r()-.5));ctx.stroke();}
    }
  }
  ctx.restore();
}

export function paintPaper(ctx,background,seed,style='oil'){
  ctx.fillStyle=background;ctx.fillRect(0,0,900,560);
  const r=paintRandom('paper-'+seed);ctx.fillStyle='#51473d';
  for(let i=0;i<3400;i++){ctx.globalAlpha=.02+r()*.035;ctx.fillRect(r()*900,r()*560,r()*.7+.2,r()*.7+.2);}
  if(style==='oil'){ctx.strokeStyle='#fff8e8';ctx.lineWidth=.45;ctx.globalAlpha=.17;for(let x=0;x<900;x+=4){ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,560);ctx.stroke();}for(let y=0;y<560;y+=4){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(900,y);ctx.stroke();}}
  ctx.globalAlpha=1;
}
