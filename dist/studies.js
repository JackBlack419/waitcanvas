import { resolveSample } from './catalog.js';

function studyRandom(seed){let h=2166136261;for(const c of String(seed))h=Math.imul(h^c.charCodeAt(0),16777619);return()=>{h+=0x6d2b79f5;let t=Math.imul(h^h>>>15,1|h);t^=t+Math.imul(t^t>>>7,61|t);return((t^t>>>14)>>>0)/4294967296;};}
function studyMix(a,b,t){const aa=a.slice(1).match(/../g).map(x=>parseInt(x,16)),bb=b.slice(1).match(/../g).map(x=>parseInt(x,16));return'#'+aa.map((x,i)=>Math.round(x+(bb[i]-x)*Math.min(1,Math.max(0,t))).toString(16).padStart(2,'0')).join('');}

export function buildStudy(theme,seed,colors,id){
  const sample=resolveSample(theme,id),v=sample.index,r=studyRandom(theme+'/'+sample.id+'/'+seed),[p,a,paper]=colors,s=[];let phase=0;
  const m=(kind,props)=>s.push({kind,phase,...props});
  const ln=(x,y,x2,y2,color=p,width=1.4,alpha=.75,clip)=>m('line',{x,y,x2,y2,color,width,alpha,...(clip?{clip}:{})});
  const path=(d,color=p,width=1.3,alpha=.7,fill=false)=>m('path',{d,color,width,alpha,fill});
  const ell=(x,y,rx,ry,color=p,alpha=.6)=>m('ellipse',{x,y,rx,ry,color,alpha});
  const brush=(x,y,length,width,color,angle=0,alpha=.8,style='oil',clip)=>m('brush',{x,y,length,width,color,angle,alpha,style,noise:Math.floor(r()*999999),...(clip?{clip}:{})});
  const poly=(points,color=p,width=1.5,alpha=.7,closed=false)=>{
    const pts=closed?[...points,points[0]]:points;
    for(let j=1;j<pts.length;j++){const [x,y]=pts[j-1],[x2,y2]=pts[j],n=Math.ceil(Math.hypot(x2-x,y2-y)/9);for(let i=0;i<n;i++)ln(x+(x2-x)*i/n,y+(y2-y)*i/n,x+(x2-x)*(i+1)/n,y+(y2-y)*(i+1)/n,color,width,alpha);}
  };
  const oval=(x,y,rx,ry,color=p,width=1.4,alpha=.65)=>poly(Array.from({length:71},(_,i)=>[x+rx*Math.cos(i/70*Math.PI*2),y+ry*Math.sin(i/70*Math.PI*2)]),color,width,alpha);
  const shape=(points)=>'M '+points.map(pt=>pt.join(' ')).join(' L ')+' Z';
  const ovalD=(x,y,rx,ry)=>`M ${x-rx} ${y} a ${rx} ${ry} 0 1 0 ${rx*2} 0 a ${rx} ${ry} 0 1 0 ${-rx*2} 0`;
  const hatch=(d,bounds,count,color=p,alpha=.27,width=.85,angle=-.65)=>{
    const [x,y,w,h]=bounds;
    for(let i=0;i<count;i++){const xx=x+r()*w,yy=y+r()*h,len=10+r()*27;ln(xx,yy,xx+Math.cos(angle)*len,yy+Math.sin(angle)*len,color,width+r()*.2,alpha,d);}
  };
  const fill=(d,bounds,color,count=220,style='oil',alpha=.85)=>{
    const [x,y,w,h]=bounds;
    for(let i=0;i<count;i++){const xx=x+r()*w,yy=y+r()*h,shade=studyMix(color,r()>.55?'#fff0d5':p,r()*.2);brush(xx,yy,15+r()*36,style==='wax'?8+r()*10:9+r()*14,shade,(r()-.5)*.5,alpha,style,d);}
  };
  const flower=(x,y,size,color,style='oil')=>{
    if(style==='ink'){for(let j=0;j<5;j++)ell(x+Math.cos(j*1.257)*size*.6,y+Math.sin(j*1.257)*size*.6,size*.53,size*.53,color,.45);ell(x,y,2,p,.85);return;}
    const d=ovalD(x,y,size,size);fill(d,[x-size,y-size,size*2,size*2],color,28,style,.8);ell(x,y,size*.22,size*.22,studyMix(color,p,.7),.85);
  };
  const bg=(top,bottom,style='oil')=>{for(let row=0;row<23;row++)for(let col=0;col<23;col++){const x=67+col*35+(r()-.5)*14,y=63+row*19+(r()-.5)*10;brush(x,y,54+r()*20,26+r()*9,studyMix(top,bottom,(y-60)/440),(r()-.5)*.08,.87,style);}};
  const phases=theme==='sketch'?['轮廓起形','第一层明暗','交叉排线','压暗与刻画']:['主体构图','铺色与结构','层次与细节','最后的笔触'];

  if(v>=5){
    // Each of these thirty studies has its own geometry. Curves are sampled into
    // short strokes so an outline develops under the pen instead of appearing whole.
    const ring=(x,y,rx,ry,n=90)=>Array.from({length:n+1},(_,i)=>[x+rx*Math.cos(i/n*6.283185),y+ry*Math.sin(i/n*6.283185)]);
    const bez=(pts,color=p,width=1.5,alpha=.8)=>{
      const [a0,b0,c0,d0]=pts;poly(Array.from({length:65},(_,i)=>{const t=i/64,u=1-t;return[0,1].map(k=>u*u*u*a0[k]+3*u*u*t*b0[k]+3*u*t*t*c0[k]+t*t*t*d0[k]);}),color,width,alpha);
    };
    const stem=(x,y,xx,yy,color=p,width=2)=>bez([[x,y],[x-20,(y+yy)/2],[xx+18,(y+yy)/2],[xx,yy]],color,width);
    const leaf=(x,y,size,angle,color=p,alpha=.7)=>m('leaf',{x,y,length:size,width:size*.28,angle,color,alpha});
    const polygon=(pts,color,count=220,style='oil',alpha=.85)=>fill(shape(pts),[
      Math.min(...pts.map(t=>t[0])),Math.min(...pts.map(t=>t[1])),
      Math.max(...pts.map(t=>t[0]))-Math.min(...pts.map(t=>t[0])),
      Math.max(...pts.map(t=>t[1]))-Math.min(...pts.map(t=>t[1]))],color,count,style,alpha);
    const dots=(count,bounds,color,sz=2)=>{const[x,y,w,h]=bounds;for(let i=0;i<count;i++)ell(x+r()*w,y+r()*h,sz,sz*.7,color,.65);};
    if(theme==='oil'){
      if(v===5){ // Floating pads: cropped water surface, inspired by Monet.
        bg('#9fb9b2','#507c80');phase=1;
        for(let i=0;i<170;i++)brush(80+r()*740,90+r()*390,18+r()*25,7,studyMix(p,'#c0c8b8',r()),Math.PI/2,.5);
        phase=2;for(const[x,y,rx]of[[210,290,65],[380,365,82],[650,245,73],[575,420,53],[295,170,43]]){fill(ovalD(x,y,rx,rx*.27),[x-rx,y-rx*.27,rx*2,rx*.54],'#7e986a',90);flower(x+13,y-9,13,'#e4b7ad');}
        phase=3;for(let i=0;i<100;i++)brush(80+r()*740,130+r()*340,13+r()*24,3,'#d5d5bc',0,.55);
      }else if(v===6){
        bg('#93a7a0','#96816c');phase=1;
        polygon([[100,337],[737,302],[813,459],[137,487]],'#ac8b69',370);
        polygon([[237,297],[562,284],[681,476],[262,490],[187,413]],'#e1d7bd',400);phase=2;
        for(const[x,y,sz,col]of[[300,350,36,'#b65a45'],[407,390,42,'#c29d45'],[533,351,34,'#83914e'],[621,425,36,'#bc744a']]){fill(ovalD(x,y,sz,sz*.9),[x-sz,y-sz,sz*2,sz*2],col,150);brush(x-12,y-13,12,5,'#e7c895',-.5,.8);}
        phase=3;polygon([[636,303],[623,220],[699,220],[690,303]],p,110);
        for(let i=0;i<15;i++){const x=631+r()*65,y=143+r()*70;stem(660,230,x,y,'#65774f',2);flower(x,y,8,'#e8cf9d');}
      }else if(v===7){
        bg('#5f748e','#324c66');phase=1;ell(665,145,38,38,'#e8d49d',.9);
        polygon([[60,435],[260,317],[390,341],[536,454],[840,483],[840,500],[60,500]],'#4c635c',400);phase=2;
        polygon([[304,348],[316,170],[354,170],[371,348]],'#e6d5ac',220);
        polygon([[306,170],[306,145],[365,145],[365,170]],'#a65f4d',90);polygon([[297,145],[336,117],[374,145]],'#77565b',80);
        phase=3;for(let i=0;i<160;i++)brush(418+r()*400,306+r()*176,18+r()*30,3,i%4===0?'#d4b580':'#72969b',0,.65);
        for(const x of[322,346])brush(x,161,12,9,'#f2d78f',Math.PI/2,.95);
      }else if(v===8){
        bg('#c6d3cc','#9ba76d');phase=1;
        for(let j=0;j<3;j++)polygon([[61,340+j*40],[220,235+j*60],[402,295+j*36],[610,240+j*50],[839,310+j*35],[839,500],[61,500]],['#a0b18d','#8e9d75','#b7a36c'][j],300);
        phase=2;polygon([[400,500],[483,332],[522,316],[477,500]],'#d6bc8b',180);
        for(const[x,y]of[[250,310],[300,330],[690,323]]){brush(x,y+32,70,7,'#80644e',Math.PI/2,.9);fill(ovalD(x,y,39,52),[x-40,y-52,80,104],'#657f62',100);}
        phase=3;for(let i=0;i<130;i++)brush(80+r()*740,412+r()*80,14,3,i%2?'#e2ca89':'#a28d57',-1.15,.8);
      }else{
        bg('#b8cbc6','#6f9492');phase=1;
        polygon([[65,300],[162,238],[300,270],[391,228],[555,272],[714,223],[839,283],[839,352],[65,352]],'#80966e',420);
        phase=2;const bridge='M 153 350 Q 450 154 748 350 L 748 393 Q 450 234 153 393 Z';fill(bridge,[150,200,600,200],'#c0aa82',500);
        bez([[153,320],[351,189],[550,189],[748,320]],'#77674f',3,.8);
        for(let j=0;j<=16;j++){const t=j/16,x=153+595*t,y=350-392*t*(1-t);poly([[x,y-30],[x,y+6]],'#77674f',2,.8);}phase=3;
        for(let i=0;i<140;i++)brush(90+r()*720,399+r()*90,20+r()*35,3,i%3?p:'#c4c7ac',0,.6);
        for(let i=0;i<13;i++){const t=(i+.5)/13,x=153+595*t,y=350-392*t*(1-t)+8;brush(x,y,21,2,'#e2ceb0',Math.PI/2,.8);}
      }
    }else if(theme==='line'){
      if(v===5){
        oval(287,368,109,109,p,1.8,.85);oval(632,368,109,109,p,1.8,.85);phase=1;
        poly([[287,368],[378,210],[469,368],[287,368],[518,239],[632,368]],p,2,.85);
        poly([[469,368],[527,207],[568,207]],p,2,.85);poly([[346,210],[410,210]],p,4,.8);phase=2;
        for(const cx of[287,632])for(let j=0;j<20;j++){const t=j/20*6.283;poly([[cx,368],[cx+104*Math.cos(t),368+104*Math.sin(t)]],p,.65,.35);}
        oval(469,368,22,22);poly([[451,354],[490,391],[511,391]],p,1.7);phase=3;poly([[180,486],[749,486]],p,.8,.25);bez([[527,207],[512,163],[566,161],[566,190]]);
      }else if(v===6){
        poly([[246,338],[281,241],[618,241],[659,338],[659,440],[246,440]],p,1.8,.85,true);phase=1;
        poly([[315,241],[315,145],[589,145],[589,241]],p,1.5,.8);poly([[281,254],[618,254]],p,3,.8);
        phase=2;for(let j=0;j<4;j++)for(let k=0;k<10-j%2;k++)oval(287+k*34+j%2*15,316+j*27,9,7,p,1,.7);
        poly([[357,420],[558,420]],p,4,.75);phase=3;for(let y=174;y<220;y+=14)poly([[342,y],[556,y]],p,.8,.4);poly([[223,258],[223,240],[680,240],[680,258]],p,1.2,.65);
      }else if(v===7){
        poly([[356,348],[548,348],[528,474],[377,474]],p,1.8,.85,true);oval(452,349,96,15);phase=1;
        for(const[x,y]of[[344,212],[455,162],[561,227]]){stem(452,350,x,y);poly([[x,y],[x-30,y-24],[x-34,y-67],[x-14,y-53],[x,y-77],[x+13,y-53],[x+34,y-67],[x+30,y-24],[x,y]],p,1.6,.8);}
        phase=2;for(const[x,y,dir]of[[404,294,-1],[483,288,1]]){bez([[451,345],[x+dir*65,y-15],[x+dir*60,y-80],[451,345]],p,1.4);}
        phase=3;oval(452,490,139,17,p,.8,.35);for(let i=0;i<7;i++)ln(393+i*18,366,401+i*15,455,p,.7,.3);
      }else if(v===8){
        poly([[318,123],[546,123],[563,323],[352,343],[318,123]],p,1.9,.85);phase=1;
        poly([[352,343],[563,323],[640,377],[414,409],[352,343]],p,1.8,.85);
        for(const pts of[[[352,343],[326,475]],[[414,409],[414,500]],[[640,377],[665,474]],[[563,323],[579,459]]])poly(pts,p,2,.85);
        phase=2;for(let i=0;i<5;i++)poly([[351+i*36,146],[378+i*36,319]],p,1.4,.65);
        poly([[335,425],[414,455],[650,428]],p,1.2,.6);phase=3;for(let i=0;i<9;i++)ln(381+i*19,353,438+i*19,391,p,.65,.3);
      }else{
        const body=[[417,228],[377,210],[341,239],[345,293],[378,316],[348,350],[341,416],[379,451],[477,451],[518,416],[511,350],[482,316],[515,293],[519,239],[486,210],[449,228]];
        poly(body,p,1.8,.85,true);phase=1;poly([[417,228],[417,108],[449,108],[449,228]],p,1.7,.85);oval(433,98,31,18);
        phase=2;poly([[422,121],[422,409],[442,409],[442,121]],p,.8,.6);poly([[402,371],[466,371]],p,2,.8);oval(432,415,10,17,p,1.3,.7);
        bez([[380,260],[349,291],[405,288],[379,325]]);bez([[480,260],[510,291],[452,288],[480,325]]);phase=3;poly([[602,133],[557,451]],p,2,.8);poly([[610,133],[565,451]],p,.8,.5);
      }
    }else if(theme==='crayon'){
      const wax=(pts,col,n=220)=>polygon(pts,col,n,'wax',.8);
      if(v===5){
        bg('#b7d7dc','#dce0b4','wax');phase=1;
        const balloon=ovalD(451,230,132,156);fill(balloon,[319,74,264,312],a,420,'wax');
        for(const dx of[-65,0,65]){const d=ovalD(451+dx*.5,230,32,152);fill(d,[419+dx*.5,78,64,304],dx===0?'#e3bd69':p,130,'wax');}phase=2;
        poly([[390,354],[409,417],[493,417],[515,354]],'#89725c',3,.8);wax([[399,409],[506,409],[493,468],[412,468]],'#ba8e62',130);phase=3;
        for(let i=0;i<8;i++)brush(412+i*11,440,45,2,'#e0bd85',Math.PI/2,.7,'wax');for(const[x,y]of[[197,217],[691,332]])fill(ovalD(x,y,61,20),[x-61,y-20,122,40],'#fff4d7',70,'wax');
      }else if(v===6){
        bg('#add4d9','#6ea6b4','wax');phase=1;
        const whale='M 201 327 C 159 192 456 168 559 300 Q 651 343 689 235 L 727 290 L 784 287 Q 749 389 581 371 C 403 480 237 427 201 327 Z';
        fill(whale,[180,190,610,245],p,720,'wax');phase=2;
        bez([[235,355],[405,444],[490,398],[559,351]],'#e3e1bb',9,.8);ell(281,287,6,6,'#3f626d',.95);bez([[325,235],[319,166],[364,167],[385,183]],p,5);
        phase=3;for(const[x,y]of[[149,175],[706,158],[642,424]])oval(x,y,10,10,'#eef0d0',3,.7);for(let i=0;i<20;i++)brush(90+r()*740,470+r()*15,24,3,'#d3e6d6',0,.65,'wax');
      }else if(v===7){
        bg('#c7d6d6','#b2c29b','wax');phase=1;wax([[260,462],[260,250],[337,250],[337,462]],'#c99483');wax([[558,462],[558,250],[636,250],[636,462]],p);
        wax([[337,462],[337,319],[558,319],[558,462]],'#e4bd80');phase=2;
        for(const x of[298,597])wax([[x-59,252],[x,156],[x+59,252]],'#b7787b',130);
        wax([[406,319],[406,213],[489,213],[489,319]],'#d9bf93',120);wax([[394,213],[448,123],[501,213]],p,120);
        phase=3;path('M 420 462 L 420 399 Q 447 356 475 399 L 475 462 Z','#967559',1,.85,true);for(const x of[280,578])wax([[x,293],[x+35,293],[x+35,335],[x,335]],'#f1d59f',45);poly([[448,123],[448,86],[496,103],[448,107]],'#c97967',3,.9);
      }else if(v===8){
        bg('#6d7b9c','#979eb1','wax');phase=1;
        wax([[383,385],[383,203],[450,105],[517,203],[517,385]],'#eadfc0',360);phase=2;
        wax([[383,305],[323,405],[383,377]],a,130);wax([[517,305],[577,405],[517,377]],a,130);
        fill(ovalD(450,243,36,43),[414,200,72,86],p,100,'wax');phase=3;
        wax([[410,385],[425,475],[450,440],[475,475],[490,385]],'#e2aa61',180);dots(55,[90,65,720,400],'#f1d995',2);
      }else{
        bg('#b5d0d4','#d9e4dc','wax');phase=1;
        fill(ovalD(450,321,115,155),[335,166,230,310],'#52677a',470,'wax');phase=2;
        fill(ovalD(450,350,78,110),[372,240,156,220],'#f2e7cd',650,'wax',.95);
        wax([[341,276],[293,378],[352,350]],'#52677a',100);wax([[558,276],[607,378],[548,350]],'#52677a',100);phase=3;
        for(const x of[414,486])ell(x,232,5,5,'#263e4e',.95);wax([[432,255],[468,255],[450,277]],'#dca056',55);for(const x of[403,482])fill(ovalD(x,472,37,12),[x-37,460,74,24],'#d7a056',55,'wax');
      }
    }else if(theme==='ink'){
      const seal=()=>{poly([[741,420],[762,420],[762,446],[741,446]],a,2,.7,true);poly([[747,426],[755,426],[747,439],[756,439]],a,1,.6);};
      if(v===5){
        poly([[186,466],[241,371],[270,236],[252,116]],p,12,.7);phase=1;
        for(const pts of[[[266,243],[379,187],[470,198]],[[240,368],[151,304],[100,288]],[[266,280],[403,272],[530,308]]])poly(pts,p,4,.65);
        phase=2;for(const[x,y]of[[270,236],[370,192],[459,197],[400,275],[519,305],[151,304]])for(let j=0;j<20;j++){const t=-Math.PI+j/19*Math.PI;ln(x,y,x+Math.cos(t)*42,y+Math.sin(t)*36,p,.8,.55);}
        ell(610,345,42,25,p,.15);leaf(602,344,43,.2,p,.8);bez([[635,339],[676,293],[643,252],[661,231]],p,2,.8);ell(661,226,11,9,p,.6);poly([[671,226],[701,231],[672,232]],p,1,.8);poly([[599,366],[599,431],[583,451]],p,1.5);poly([[614,366],[628,421],[614,450]],p,1.5);phase=3;ell(657,223,2,2,p,.9);ell(662,219,5,3,a,.6);seal();
      }else if(v===6){
        for(const[x,y,angle]of[[320,236,.5],[530,335,-.6],[433,412,.2]]){for(let j=0;j<8;j++)ell(x+j*9*Math.cos(angle),y+j*9*Math.sin(angle),11-j*.65,6,p,.13+j*.045);}phase=1;
        for(const[x,y,dir]of[[320,236,1],[530,335,-1],[433,412,1]]){for(let j=0;j<5;j++)bez([[x+j*7,y],[x-45*dir,y-35-j*5],[x-100*dir,y-15-j*8],[x-145*dir,y+20-j*6]],p,.6,.5);for(let j=0;j<5;j++)poly([[x+j*11,y+5],[x+j*8+10,y+30],[x+j*9+28,y+34]],p,.8,.6);}
        phase=2;for(const[x,y]of[[320,236],[530,335],[433,412]]){ell(x-11,y-3,2,2,p,.9);poly([[x+61,y],[x+82,y-18],[x+82,y+17],[x+61,y]],p,1,.55);}
        phase=3;for(let j=0;j<16;j++)ln(190+r()*490,480+r()*10,220+r()*490,483+r()*10,p,.6,.1);seal();
      }else if(v===7){
        poly([[166,183],[303,244],[465,285],[655,340]],p,7,.75);phase=1;
        for(const[x,y]of[[308,245],[477,287],[620,329]]){poly([[x,y],[x+12,y+50]],p,1.8,.8);ell(x+12,y+77,31,27,a,.48);ell(x+19,y+83,23,21,a,.22);for(let j=0;j<4;j++)leaf(x+12,y+52,14,j*1.57,p,.8);}
        phase=2;for(const[x,y,ang]of[[239,211,-.7],[374,263,-.9],[511,299,-.7],[565,320,.8]])leaf(x,y,60,ang,p,.6);
        phase=3;for(let j=0;j<20;j++)brush(180+r()*460,199+r()*130,12,2,p,.3,.12,'ink');seal();
      }else if(v===8){
        for(const pts of[[[150,450],[190,171],[305,111],[389,172],[352,453]],[[517,453],[537,141],[655,81],[728,208],[765,451]]])path(shape(pts),p,1,.14,true);phase=1;
        poly([[190,449],[215,182],[298,138],[339,190]],p,2,.55);poly([[557,444],[579,181],[655,116],[705,225]],p,2,.6);phase=2;
        for(let j=0;j<33;j++){const x=409+r()*72;bez([[x,141],[x+15,244],[x-21,348],[x-28,431]],p,.7,.16);}
        for(let j=0;j<25;j++)oval(432,450,30+j*5,3+j*.7,p,.6,.17);phase=3;
        for(let j=0;j<120;j++){const x=211+r()*125,y=212+r()*220;brush(x,y,10+r()*25,1+r()*3,p,-1.25,.18,'ink');}seal();
      }else{
        for(const[x,y]of[[350,204],[503,294],[593,186]])stem(451,463,x,y,p,2);phase=1;
        for(const[x,y]of[[350,204],[503,294],[593,186]])for(let j=0;j<26;j++){const t=j/26*6.283;bez([[x,y],[x+Math.cos(t+.3)*52,y+Math.sin(t+.3)*52],[x+Math.cos(t)*59,y+Math.sin(t)*59],[x+Math.cos(t)*35,y+Math.sin(t)*35]],a,1,.75);}
        phase=2;for(const[x,y,ang]of[[429,406,-2.5],[456,369,-.4],[399,311,-2.8],[516,330,.3]])leaf(x,y,68,ang,p,.7);
        phase=3;for(const[x,y]of[[350,204],[503,294],[593,186]])dots(18,[x-9,y-9,18,18],p,1);seal();
      }
    }else if(theme==='sketch'){
      const dark=studyMix(p,'#191817',.7),forms=[];
      const form=(pts,angle=-.65)=>{poly(pts,dark,1.9,.8,true);const xs=pts.map(t=>t[0]),ys=pts.map(t=>t[1]);forms.push({d:shape(pts),bounds:[Math.min(...xs),Math.min(...ys),Math.max(...xs)-Math.min(...xs),Math.max(...ys)-Math.min(...ys)],angle});};
      if(v===5){
        form([[320,130],[368,130],[368,224],[396,259],[403,441],[384,460],[297,460],[280,440],[287,259],[320,224]]);
        oval(344,130,24,7,dark,1.7,.8);poly([[319,152],[368,152]],dark,1.7,.75);
        const pear=Array.from({length:101},(_,i)=>{const t=i/100*6.283,wide=1+.3*Math.sin(t);return[557+75*Math.cos(t)*wide,358+99*Math.sin(t)];});form(pear);poly([[558,260],[565,232],[584,225]],dark,2,.85);
      }else if(v===6){
        form([[304,123],[541,123],[553,299],[321,318]]);form([[321,318],[553,299],[625,355],[391,390]]);
        for(const pts of[[[321,318],[298,478]],[[391,390],[388,497]],[[625,355],[647,478]],[[553,299],[570,441]]])poly(pts,dark,4,.8);
        for(let j=0;j<5;j++)poly([[332+j*39,145],[345+j*38,294]],dark,1.9,.8);poly([[304,422],[388,451],[636,425]],dark,2,.7);
      }else if(v===7){
        form([[270,403],[378,153],[487,403]]);oval(378,403,109,29,dark,1.8,.8);
        form(ring(591,361,80,80));oval(591,361,31,80,dark,.8,.36);
        poly([[218,454],[713,454]],dark,1,.35);poly([[378,153],[378,403]],dark,1,.35);
      }else if(v===8){
        form([[174,265],[696,265],[731,313],[160,313]]);
        for(const[x,w]of[[186,97],[341,97],[496,97],[652,54]])form([[x,313],[x+w,313],[x+w,451],[x,451]]);
        for(const x of[283,438,593]){const pts=Array.from({length:61},(_,i)=>{const t=Math.PI+i/60*Math.PI;return[x+29+29*Math.cos(t),366+53*Math.sin(t)];});poly([[x,451],[x,366],...pts,[x+58,451]],dark,1.8,.85);}
        for(const x of[192,347,502,660])poly([[x,260],[x,223],[x+16,223],[x+16,260]],dark,1.8,.8);
      }else{
        for(const[x,y,dx]of[[275,171,0],[484,203,15]]){const pts=[[x,y],[x+115,y],[x+103,y+165],[x+168,y+202],[x+176,y+252],[x+144,y+279],[x-25,y+279],[x-28,y+230],[x+9,y+167]];form(pts);oval(x+57,y,57,15,dark,1.8,.8);poly([[x-25,y+267],[x+143,y+267],[x+174,y+249]],dark,2,.8);for(let j=0;j<6;j++){poly([[x+20,y+40+j*19],[x+83,y+40+j*19]],dark,1.5,.7);oval(x+15,y+40+j*19,3,3,dark,1,.8);oval(x+88,y+40+j*19,3,3,dark,1,.8);}}
      }
      phase=1;for(const f of forms)hatch(f.d,f.bounds,470,p,.25,1.05,f.angle);
      phase=2;for(const f of forms)hatch(f.d,f.bounds,550,dark,.29,.8,-f.angle);
      phase=3;for(const f of forms){const[x,y,w,h]=f.bounds;hatch(f.d,[x+w*.64,y+h*.35,w*.35,h*.65],180,dark,.45,1.1,f.angle);}
      for(let i=0;i<220;i++){const x=220+r()*490,y=455+r()*26;ln(x,y,x+12+r()*25,y-3,dark,.8,.21);}
    }else if(theme==='pencil'){
      const forms=[];
      const colored=(pts,col)=>{poly(pts,col,1,.6,true);const xs=pts.map(t=>t[0]),ys=pts.map(t=>t[1]);forms.push({d:shape(pts),bounds:[Math.min(...xs),Math.min(...ys),Math.max(...xs)-Math.min(...xs),Math.max(...ys)-Math.min(...ys)],col});};
      if(v===5){
        for(const[x,y,dir]of[[330,245,1],[565,357,-1]]){const fish=ring(x,y,105,47).map(([xx,yy])=>[xx,yy+(xx-x)*dir*.22]);colored(fish,dir===1?'#ce865a':p);colored([[x-97*dir,y-28],[x-170*dir,y-70],[x-153*dir,y+25],[x-97*dir,y-15]],a);colored([[x-18*dir,y+39],[x-44*dir,y+76],[x+28*dir,y+47]],a);colored([[x-13*dir,y-46],[x+12*dir,y-72],[x+49*dir,y-32]],p);}
      }else if(v===6){
        oval(453,428,239,42,p,1,.35);
        for(const[x,y,sz]of[[310,321,64],[462,376,67],[589,296,57]]){const pts=Array.from({length:91},(_,i)=>{const t=i/90*6.283;return[x+sz*Math.cos(t)*(1-.3*Math.sin(t)),y+sz*Math.sin(t)];});colored(pts,'#bb665c');for(let j=0;j<5;j++)leaf(x,y-sz*.8,35,j*1.256,'#6b915d',.55);}
      }else if(v===7){
        for(const[x,y]of[[299,212],[455,164],[611,255]]){stem(x+15,465,x,y,'#719368',1.5);const pts=[[x,y+38],[x-47,y-7],[x-37,y-71],[x-10,y-49],[x+8,y-83],[x+24,y-49],[x+48,y-65],[x+45,y-5]];colored(pts,x===455?'#cd808e':a);}
        for(const[x,y,dir]of[[300,373,-1],[471,391,1],[610,393,1]])colored([[x,y+72],[x+dir*81,y-75],[x+dir*61,y+7],[x,y+72]],'#72946e');
      }else if(v===8){
        poly([[180,439],[743,377]],'#92785b',5,.75);colored(ring(451,296,85,57),p);
        colored([[476,305],[545,271],[541,220],[511,195],[477,217]],'#4b91a2');colored([[424,295],[469,284],[497,330],[442,347]],'#d39a59');
        colored([[380,306],[312,386],[408,348]],p);poly([[541,228],[610,244],[541,246]],'#526b70',1.2,.8);oval(524,219,4,4,p,1.4,.9);poly([[451,348],[451,404],[470,408]],'#96785b',2,.8);
      }else{
        const pts=[];for(let i=0;i<=60;i++){const t=i/60;pts.push([247+394*t,435-294*t-83*Math.sin(t*Math.PI)]);}for(let i=60;i>=0;i--){const t=i/60;pts.push([247+394*t,435-294*t+83*Math.sin(t*Math.PI)]);}colored(pts,p);poly([[217,461],[641,141]],a,2,.8);
      }
      phase=1;for(const f of forms)hatch(f.d,f.bounds,Math.min(680,Math.max(90,Math.round(f.bounds[2]*f.bounds[3]/30))),f.col,.32,.85,-.65);
      phase=2;for(const f of forms)hatch(f.d,f.bounds,Math.min(440,Math.max(65,Math.round(f.bounds[2]*f.bounds[3]/45))),studyMix(f.col,a,.25),.3,.65,.6);
      phase=3;for(const f of forms){const[x,y,w,h]=f.bounds;hatch(f.d,[x+w*.6,y+h*.3,w*.4,h*.65],180,studyMix(f.col,p,.5),.35,.8,-.6);}
      if(v===5)for(const[x,y,dir]of[[330,245,1],[565,357,-1]]){ell(x+78*dir,y+12,4,4,'#384e53',.95);bez([[x+55*dir,y-14],[x+42*dir,y+2],[x+50*dir,y+21],[x+62*dir,y+32]],p,1,.75);poly([[x+102*dir,y+22],[x+113*dir,y+27]],a,1.2,.8);}
      if(v===8){ell(524,219,4,4,'#304f58',.95);ell(525,218,1,1,'#f9ebce',.95);poly([[530,250],[552,245],[602,244]],p,1,.7);}
      if(v===6)for(const[x,y,sz]of[[310,321,64],[462,376,67],[589,296,57]])for(let j=0;j<35;j++){const t=r()*6.283,rad=Math.sqrt(r())*sz*.75;ln(x+Math.cos(t)*rad,y+Math.sin(t)*rad,x+Math.cos(t)*rad+2,y+Math.sin(t)*rad+4,'#e7c58a',1.6,.8);}
      if(v===9)for(let j=0;j<56;j++){const t=j/56,x=247+394*t,y=435-294*t,wide=80*Math.sin(t*Math.PI);for(const side of[-1,1])poly([[x,y],[x+side*wide*.55+15,y+side*wide*.6-18]],side===1?p:a,.8,.65);}
    }
  }else{
  if(theme==='oil'){
    if(v===1){
      bg('#bed0cb','#799574');phase=1;
      const hills=[[60,285],[160,228],[270,245],[385,211],[515,256],[650,223],[840,280],[840,410],[60,410]];fill(shape(hills),[60,211,780,200],studyMix(p,'#8ca486',.4),330);
      phase=2;for(let i=0;i<65;i++){const x=70+r()*755,y=325+r()*170;brush(x,y,30+r()*40,8,p,-1.2,.55);flower(x,y-14,7+(y-320)/22,studyMix('#ce5d48',a,r()*.3));}
      phase=3;for(let i=0;i<95;i++){const x=60+r()*780,y=390+r()*105;brush(x,y,9+r()*16,3,'#e9c78e',-.3,.8);}
    }else if(v===2){
      bg('#c4b79b','#9d8c76');phase=1;
      const vase='M 370 340 Q 350 455 392 480 L 512 480 Q 555 434 530 340 Z';fill(vase,[350,340,205,140],p,350);phase=2;
      for(const [x,y,size] of [[336,211,38],[452,160,49],[565,223,39],[392,284,37],[508,295,32]]){
        brush((x+450)/2,(y+350)/2,Math.hypot(450-x,350-y),4,'#627656',Math.atan2(350-y,450-x),.9);
        flower(x,y,size,'#d6a640');for(let j=0;j<18;j++){const t=j/18*Math.PI*2;brush(x+Math.cos(t)*size*.8,y+Math.sin(t)*size*.8,size*.6,8,'#e7bd5b',t,.9);}flower(x,y,size*.37,'#695344');
      }
      phase=3;for(let i=0;i<45;i++)brush(381+r()*135,351+r()*120,13,4,studyMix(p,'#e3d8b5',.55),0,.8);
    }else if(v===3){
      bg('#9ea6ad','#8e8d89');phase=1;
      const buildings=[[[63,110],[250,94],[270,338],[64,485]],[[840,85],[670,118],[635,345],[839,488]],[[268,160],[360,182],[380,330],[289,360]]];
      buildings.forEach((pts,i)=>fill(shape(pts),[60+i*180,80,780,410],i%2?studyMix(p,'#655970',.5):'#b79883',420));
      phase=2;for(let side=0;side<2;side++)for(let j=0;j<25;j++){const x=side?687+r()*118:92+r()*135,y=126+r()*170;brush(x,y,13,20,'#e1bd81',.02,.9);}
      for(let i=0;i<210;i++){const x=170+r()*560,y=350+r()*145;brush(x,y,10+r()*30,3,studyMix(a,'#c5c5ad',r()),.1,.8);}
      phase=3;for(const x of [344,552]){brush(x,350,107,5,'#4d5557',Math.PI/2,.9);path(`M ${x-20} 313 Q ${x} 277 ${x+23} 313 Z`,a,1,.95,true);}
    }else{
      bg('#c8c8cf','#769198');phase=1;
      fill(shape([[65,370],[280,118],[440,319],[574,156],[840,381],[840,499],[65,499]]),[65,110,775,390],'#748899',550);
      phase=2;for(const pts of [[[190,233],[280,118],[358,234],[306,215],[283,243],[255,208]],[[494,250],[574,156],[675,282],[597,243],[565,261]]])fill(shape(pts),[180,115,520,175],'#e8e2cc',300);
      phase=3;for(let i=0;i<140;i++){const x=65+r()*770,y=384+r()*112;brush(x,y,20+r()*30,4,studyMix(p,'#d3c8a1',r()*.7),0,.8);}
    }
  }
  if(theme==='line'){
    if(v===1){
      oval(450,405,241,49,p,1.2,.35);phase=1;
      const body=Array.from({length:81},(_,i)=>{const t=i/80*6.283;return[452+165*Math.cos(t),337+80*Math.sin(t)];});poly(body,p,1.8,.8);
      poly([[322,323],[295,260],[347,279],[382,265],[407,307]],p,1.8,.8);phase=2;
      path('M 424 354 C 505 299 596 339 570 387 C 542 427 471 399 491 371',p,2,.8);path('M 319 324 q 12 13 25 0 M 365 323 q 11 13 23 0 M 344 344 q 6 8 12 0',p,1.8,.9);
      phase=3;for(let i=0;i<5;i++){ln(325,345,285-i*4,338+i*4,p,1,.5);ln(370,345,403+i*4,339+i*4,p,1,.5);}
    }else if(v===2){
      const houses=[{x:128,y:285,w:150,h:146},{x:305,y:205,w:150,h:226},{x:480,y:250,w:137,h:181},{x:639,y:310,w:105,h:121}];
      for(const h of houses)poly([[h.x,h.y],[h.x+h.w/2,h.y-69],[h.x+h.w,h.y],[h.x+h.w,h.y+h.h],[h.x,h.y+h.h]],p,1.4,.8,true);
      phase=1;for(const h of houses){poly([[h.x-12,h.y],[h.x+h.w/2,h.y-82],[h.x+h.w+12,h.y]],p,1.5,.85);for(let j=0;j<2;j++)for(let k=0;k<2;k++)poly([[h.x+24+j*64,h.y+25+k*55],[h.x+48+j*64,h.y+25+k*55],[h.x+48+j*64,h.y+53+k*55],[h.x+24+j*64,h.y+53+k*55]],p,1,.65,true);}
      phase=2;for(let i=0;i<70;i++){const x=130+r()*585,y=170+r()*160;ln(x,y,x+9,y,p,.65,.2);}phase=3;poly([[95,444],[780,444]],p,1.8,.65);
    }else if(v===3){
      oval(445,420,261,56,p,1.2,.5);phase=1;
      poly([[292,235],[417,235],[402,380],[310,380]],p,1.7,.8,true);oval(355,235,63,16,p,1.4,.75);phase=2;
      path('M 417 265 C 498 241 484 353 409 343',p,1.8,.8);oval(355,395,114,21,p,1,.5);
      poly([[536,321],[664,301],[710,338],[583,359]],p,1.5,.7,true);poly([[536,321],[535,365],[583,404],[710,384],[710,338]],p,1.2,.7);
      phase=3;for(let i=0;i<3;i++)path(`M ${332+i*25} 202 q -13 -21 0 -42 q 11 -16 0 -32`,p,.9,.35);
    }else{
      poly([[236,320],[447,157],[661,320]],p,1.8,.8);phase=1;
      poly([[270,300],[270,455],[621,455],[621,300]],p,1.5,.8);poly([[245,320],[447,174],[648,320]],p,1,.7);
      phase=2;poly([[421,346],[476,346],[476,455],[421,455]],p,1.4,.8);for(const x of [310,527]){poly([[x,341],[x+48,341],[x+48,395],[x,395]],p,1.3,.8,true);ln(x+24,341,x+24,395);ln(x,368,x+48,368);}
      for(const x of [145,730])for(let i=0;i<4;i++)poly([[x-36+i*3,320+i*31],[x,240+i*31],[x+36-i*3,320+i*31]],p,1,.6);
      phase=3;for(let y=321;y<450;y+=18)ln(277,y,615,y,p,.6,.25);
    }
  }
  if(theme==='crayon'){
    if(v===1){
      bg('#c1d6b1','#a6bf85','wax');phase=1;
      for(const x of [165,315,630,755]){brush(x,315,250,18,'#a28461',Math.PI/2,.7,'wax');fill(ovalD(x,190,74,98),[x-75,90,150,200],studyMix(p,'#799262',.5),120,'wax',.6);}
      phase=2;fill(shape([[311,377],[568,377],[616,478],[264,478]]),[260,375,360,105],a,200,'wax',.6);
      for(let i=0;i<6;i++){ln(287+i*50,387,300+i*50,468,'#f3e4cc',7,.7);ln(286,393+i*14,592,393+i*14,'#f3e4cc',4,.6);}
      phase=3;oval(430,421,37,18,'#b08c69',5,.7);flower(525,425,14,'#d1a055','wax');flower(376,430,10,'#c86e5d','wax');
    }else if(v===2){
      bg('#7889ae','#aaa0b6','wax');phase=1;
      const cx=450,cy=275;for(let i=0;i<110;i++){const t=i/110*6.283;brush(cx+160*Math.cos(t),cy+160*Math.sin(t),18,7,'#f1c982',t+1.57,.8,'wax');}
      phase=2;for(let j=0;j<12;j++){const t=j/12*6.283,x=cx+160*Math.cos(t),y=cy+160*Math.sin(t);brush((cx+x)/2,(cy+y)/2,160,2,'#e8ddc2',t,.9,'wax');fill(shape([[x-18,y],[x+18,y],[x+18,y+30],[x-18,y+30]]),[x-18,y,36,30],j%2?a:'#b2cac4',25,'wax',.9);}
      phase=3;brush(395,420,196,9,'#e5ba88',-1.18,.9,'wax');brush(510,420,196,9,'#e5ba88',1.18,.9,'wax');for(let i=0;i<45;i++)ell(80+r()*740,70+r()*230,1+r()*2,1+r()*2,'#f6df9a',.75);
    }else if(v===3){
      bg('#bcdae0',studyMix(p,'#95bdc5',.5),'wax');phase=1;
      for(let i=0;i<160;i++)brush(80+r()*740,380+r()*100,35,5,p,0,.45,'wax');
      phase=2;fill(shape([[290,361],[600,361],[550,419],[341,419]]),[290,360,310,60],a,180,'wax');brush(449,258,245,7,'#a28468',Math.PI/2,.8,'wax');
      fill(shape([[435,140],[435,340],[285,340]]),[280,140,160,200],'#f0d79f',230,'wax');fill(shape([[463,199],[463,340],[586,340]]),[460,195,130,150],'#e8b496',180,'wax');phase=3;for(let i=0;i<40;i++)brush(300+r()*300,428+r()*30,18,3,'#e7ddbd',0,.65,'wax');
    }else{
      bg('#c6d9d5','#a1b184','wax');phase=1;
      for(let i=0;i<70;i++){const x=65+r()*770,y=270+r()*210;brush(x,y,55+r()*50,4,'#719475',-1.4,.5,'wax');}
      phase=2;for(let i=0;i<55;i++){const x=75+r()*740,y=250+r()*235;flower(x,y,8+(y-250)/23,i%3===0?'#d5958f':i%3===1?'#e2b85e':'#e8debd','wax');}phase=3;for(let i=0;i<45;i++)brush(80+r()*740,450+r()*38,12,3,p,-1.2,.55,'wax');
    }
  }
  if(theme==='ink'){
    if(v===1){
      for(const [x,y,rx,ry] of [[324,336,101,34],[585,359,98,29],[475,263,81,33]]){ell(x,y,rx,ry,p,.12);oval(x,y,rx,ry,p,.6,.35);}phase=1;
      for(const [x,y] of [[345,315],[512,247],[605,341]]){poly([[x,y+135],[x-10,y-65]],p,2,.65);flower(x-12,y-65,26,a,'ink');}phase=2;
      for(const [x,y,dir] of [[367,435,1],[554,444,-1]]){path(`M ${x} ${y} q ${dir*30} -25 ${dir*60} 0 q ${-dir*30} 24 ${-dir*60} 0`,p,1,.6,true);poly([[x,y],[x-dir*19,y-10],[x-dir*19,y+10],[x,y]],p,1,.55);ell(x+dir*47,y-3,2,2,p,.8);}phase=3;for(let i=0;i<20;i++)ln(180+r()*540,430+r()*40,210+r()*540,434+r()*40,p,.5,.12);
    }else if(v===2){
      for(let j=0;j<3;j++){const pts=[[70,270+j*45],[200,150+j*60],[307,225+j*40],[469,120+j*67],[630,244+j*33],[825,163+j*64],[840,400],[70,400]];path(shape(pts),p,1,.07+j*.045,true);}phase=1;
      poly([[85,391],[230,282],[330,392]],p,2,.5);poly([[564,387],[728,233],[842,376]],p,2,.5);phase=2;
      path('M 400 437 Q 445 461 493 435 Z',p,1,.8,true);poly([[452,436],[452,381],[476,432]],p,1.3,.75);phase=3;for(let i=0;i<25;i++)ln(285+r()*400,455+r()*25,305+r()*400,457+r()*25,p,.7,.16);
    }else if(v===3){
      poly([[195,475],[282,393],[347,335],[465,247],[646,175]],p,9,.75);phase=1;
      for(const pts of [[[331,346],[300,259],[241,201]],[[427,277],[466,193],[475,118]],[[512,225],[622,252],[707,232]]])poly(pts,p,3,.65);
      phase=2;for(let i=0;i<36;i++){const x=250+r()*430,y=155+r()*180;if(r()>.3)flower(x,y,6+r()*8,a,'ink');}phase=3;for(let i=0;i<17;i++)ell(278+r()*385,160+r()*190,1.6,1.6,p,.65);
    }else{
      path('M 215 444 L 295 345 L 353 376 L 390 462 Z',p,1,.18,true);path('M 215 444 L 295 345 L 353 376 L 390 462',p,2,.65);phase=1;
      for(let i=0;i<15;i++){const endX=390+(r()-.3)*280,endY=170+r()*210;path(`M 438 443 Q ${390+r()*180} ${220+r()*120} ${endX} ${endY}`,p,1+r()*2,.7);}
      phase=2;for(const [x,y] of [[469,281],[528,233],[563,318]])flower(x,y,9,a,'ink');phase=3;for(let i=0;i<26;i++)brush(233+r()*140,400+r()*45,12,1.3,p,-.8,.2,'ink');
    }
  }
  if(theme==='sketch'){
    // Long, high-contrast contour strokes are intentionally allotted the first 24%.
    const dark=studyMix(p,'#1e1d1b',.65),mid=studyMix(p,'#69615b',.35),forms=[];
    const form=(d,bounds,contour,angle=-.7)=>{forms.push({d,bounds,angle});poly(contour,dark,1.8,.72,true);};
    if(v===0){
      const cube=[[250,220],[369,184],[436,244],[321,280],[250,220],[250,385],[321,447],[321,280],[436,244],[436,402],[321,447]];poly(cube,dark,1.7,.8);
      forms.push({d:shape([[250,220],[321,280],[321,447],[250,385]]),bounds:[250,220,72,228],angle:-.7},{d:shape([[321,280],[436,244],[436,402],[321,447]]),bounds:[321,245,116,203],angle:.7});
      const apple=Array.from({length:76},(_,i)=>{const t=i/75*6.283;return[580+86*Math.cos(t)*(1+.1*Math.sin(t*3)),350+93*Math.sin(t)];});form(shape(apple),[490,257,183,188],apple);poly([[576,267],[580,245],[595,231]],dark,2,.8);
    }else if(v===1){
      const pot=[[346,224],[476,224],[501,402],[479,431],[349,431],[324,403]];form(shape(pot),[324,224,179,208],pot);oval(411,224,65,15,dark,1.7,.75);
      poly([[337,265],[265,249],[311,366],[331,370]],dark,2,.8);poly([[487,258],[553,246],[577,283],[564,351],[496,369]],dark,2,.8);oval(411,211,21,8,dark,1.5,.7);poly([[403,207],[403,188],[419,188],[419,207]],dark,1.5,.75);
    }else if(v===2){
      const shell=[];for(let i=0;i<=160;i++){const t=i/160*Math.PI*5.5,rad=8+t*7.2;shell.push([453+Math.cos(t)*rad*1.2,306+Math.sin(t)*rad]);}poly(shell,dark,1.8,.8);
      const outline=Array.from({length:101},(_,i)=>{const t=i/100*6.283;return[455+154*Math.cos(t),322+118*Math.sin(t)];});form(shape(outline),[295,200,315,244],outline);
    }else if(v===3){
      for(const [x,y,w] of [[245,428,345],[265,390,313],[236,353,337]]){poly([[x,y],[x+w,y-25],[x+w+43,y+4],[x+34,y+36],[x,y]],dark,1.6,.8);poly([[x+34,y+36],[x+34,y+53],[x+w+43,y+23],[x+w+43,y+4]],dark,1.4,.7);forms.push({d:shape([[x+34,y+36],[x+34,y+53],[x+w+43,y+23],[x+w+43,y+4]]),bounds:[x+30,y,360,55],angle:-.6});}
      poly([[605,377],[605,252],[544,196]],dark,2.4,.85);const shade=[[481,149],[586,149],[630,220],[439,220]];form(shape(shade),[439,149,191,73],shade);oval(604,384,51,12,dark,1.6,.65);
    }else{
      poly([[226,470],[226,192],[278,122],[450,101],[622,123],[675,193],[675,470]],dark,2,.8);
      const arch=[];for(let i=0;i<=60;i++){const t=Math.PI+i/60*Math.PI;arch.push([450+137*Math.cos(t),278+137*Math.sin(t)]);}poly([[313,470],[313,278],...arch,[587,470]],dark,2.1,.85);
      forms.push({d:shape([[226,470],[226,192],[278,122],[313,160],[313,470]]),bounds:[226,120,88,350],angle:-.65},{d:shape([[587,470],[587,160],[622,123],[675,193],[675,470]]),bounds:[587,120,88,350],angle:.65});
    }
    phase=1;for(const f of forms)hatch(f.d,f.bounds,430,mid,.25,1.05,f.angle);phase=2;
    for(const f of forms)hatch(f.d,f.bounds,520,dark,.29,.8,-f.angle);
    if(v===2)for(let j=0;j<23;j++){const t=j/23*6.283;poly([[453+Math.cos(t)*35,306+Math.sin(t)*25],[455+Math.cos(t+.3)*150,322+Math.sin(t+.3)*114]],dark,.8,.45);}
    if(v===4){for(let y=193;y<471;y+=32){poly([[230,y],[308,y]],dark,1,.45);poly([[592,y],[670,y]],dark,1,.45);}for(let j=0;j<11;j++){const t=Math.PI+j/10*Math.PI;poly([[450+137*Math.cos(t),278+137*Math.sin(t)],[450+174*Math.cos(t),278+174*Math.sin(t)]],dark,1.2,.6);}}
    phase=3;for(let i=0;i<210;i++){const x=238+r()*450,y=440+r()*30;ln(x,y,x+12+r()*28,y-2,dark,.8,.23);}
    for(const f of forms){const [x,y,w,h]=f.bounds;hatch(f.d,[x+w*.68,y+h*.4,w*.3,h*.6],180,dark,.42,1.1,f.angle);}
    if(v===0)poly([[577,267],[580,245],[595,231]],dark,3,.9);
  }
  if(theme==='pencil'){
    if(v===1){
      oval(450,421,239,49,p,1.1,.35);phase=1;const lemon=ovalD(464,329,103,68);hatch(lemon,[360,260,210,140],750,'#d2ba4a',.34,.8,-.5);phase=2;hatch(lemon,[360,280,210,120],650,a,.3,.65,.6);
      for(const [x,y] of [[293,398],[343,419],[575,400],[626,385],[603,432]]){oval(x,y,22,22,p,.8,.5);hatch(ovalD(x,y,22,22),[x-22,y-22,44,44],140,studyMix(p,'#6d6ba1',.5),.38,.7);}
      phase=3;hatch(lemon,[495,310,70,90],260,'#a8a045',.33,.7,.5);
    }else if(v===2){
      const wings=[[[446,285],[325,164],[229,203],[268,321],[433,322]],[[455,285],[577,164],[674,203],[634,321],[468,322]],[[432,321],[272,329],[304,435],[411,386]],[[470,321],[629,329],[602,435],[490,386]]];
      wings.forEach(pts=>poly(pts,p,1,.45,true));phase=1;wings.forEach((pts,i)=>hatch(shape(pts),[220,155,470,290],680,i%2?p:a,.28,.8,i%2?.6:-.6));phase=2;
      for(const pts of wings){const d=shape(pts);hatch(d,[245,185,405,225],380,studyMix(p,'#513f72',.3),.26,.65,.5);}
      phase=3;poly([[450,263],[450,376]],p,5,.85);poly([[450,268],[432,232],[423,226]],p,1.5,.8);poly([[450,268],[467,232],[478,225]],p,1.5,.8);
    }else if(v===3){
      poly([[338,340],[565,340],[539,466],[365,466]],p,1.1,.6,true);phase=1;hatch(shape([[338,340],[565,340],[539,466],[365,466]]),[335,340,235,130],600,a,.28,.75,-.6);
      const leaves=[];for(let i=0;i<11;i++){const t=i/11*6.283,cx=450+Math.cos(t)*75,cy=292+Math.sin(t)*48;leaves.push({x:cx,y:cy,rx:35,ry:70});oval(cx,cy,35,70,p,.5,.4);}phase=2;
      for(const f of leaves)hatch(ovalD(f.x,f.y,f.rx,f.ry),[f.x-35,f.y-70,70,140],170,studyMix(p,'#72956d',.55),.23,.65,-.8);phase=3;oval(450,285,37,48,p,.9,.45);hatch(ovalD(450,285,37,48),[413,237,74,96],250,p,.3,.8,.6);
    }else{
      const centers=[[299,246,.85],[527,314,1.1],[667,196,.7]];const leaves=[];
      for(const [x,y,scale] of centers){const pts=[[0,-92],[22,-44],[60,-67],[48,-12],[91,0],[42,27],[52,67],[14,48],[0,92],[-14,48],[-52,67],[-42,27],[-91,0],[-48,-12],[-60,-67],[-22,-44]].map(([xx,yy])=>[x+xx*scale,y+yy*scale]);poly(pts,a,1,.55,true);leaves.push({d:shape(pts),x,y,scale});}phase=1;
      for(const f of leaves)hatch(f.d,[f.x-100*f.scale,f.y-100*f.scale,200*f.scale,200*f.scale],760,studyMix(a,'#c87048',.6),.25,.8,-.7);phase=2;
      for(const f of leaves)hatch(f.d,[f.x-95*f.scale,f.y-95*f.scale,190*f.scale,190*f.scale],500,'#d2a551',.28,.65,.7);phase=3;
      for(const f of leaves){poly([[f.x,f.y+110*f.scale],[f.x,f.y-76*f.scale]],a,1.5,.8);for(const side of [-1,1])for(let i=0;i<3;i++)ln(f.x,f.y+24-i*27,f.x+side*(56-i*12)*f.scale,f.y+8-i*31,a,.9,.65);}
    }
  }
  }
  // Keep phase timing independent from the number of hatching marks. The first
  // quarter remains visible contour drawing even when later shading is dense.
  const ordered=[...s].sort((x,y)=>x.phase-y.phase),boundaries=[0];for(let i=0;i<4;i++)boundaries.push(ordered.filter(mark=>mark.phase<=i).length);
  return{theme,sample:sample.id,name:sample.name,background:paper,duration:theme==='sketch'?24:20,strokes:ordered,phases:phases.map((label,i)=>({label,start:[0,.24,.53,.8][i],end:[.24,.53,.8,1][i],from:boundaries[i],to:boundaries[i+1]}))};
}
