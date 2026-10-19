import { mediaInfo } from './painterly.js';
// Original procedural drawings. v0.1 theme IDs remain supported for compatibility.
export const themeInfo = {
  ...mediaInfo,
  mist: { name: '山岚', subtitle: '一重山色，一笔远方', en: 'Mountain mist', colors: ['#517b70','#a8b7a3','#f2f3e9'] },
  garden: { name: '纸上花园', subtitle: '枝叶生长，花渐渐开', en: 'Paper garden', colors: ['#698169','#d59785','#f5f1e9'] },
  orbit: { name: '轨道星图', subtitle: '让思绪，沿星光漫游', en: 'Quiet orbits', colors: ['#7d7ab2','#c0a887','#eff0f7'] }
};
export function seededRandom(seed) {
  let h = 2166136261;
  for (const ch of String(seed)) h = Math.imul(h ^ ch.charCodeAt(0), 16777619);
  return () => { h += 0x6D2B79F5; let t = Math.imul(h ^ h >>> 15, 1 | h); t ^= t + Math.imul(t ^ t >>> 7, 61 | t); return ((t ^ t >>> 14) >>> 0) / 4294967296; };
}
export function drawing(theme = 'mist', seed = 'a-little-pause', colors) {
  if (!Object.hasOwn(themeInfo,theme)) theme = 'mist';
  const [primary, accent, paper] = colors || themeInfo[theme].colors;
  const r = seededRandom(seed), pieces = [];
  const add = (markup, at = 0, duration = 1.5, stroke = false) => pieces.push({markup, at, duration, stroke});
  const line = (d, color, width, opacity, at, duration=2) => add(`<path d="${d}" fill="none" stroke="${color}" stroke-width="${width}" opacity="${opacity}" stroke-linecap="round" stroke-linejoin="round" pathLength="1"/>`,at,duration,true);
  const dot = (x,y,radius,color,opacity,at) => add(`<circle cx="${x}" cy="${y}" r="${radius}" fill="${color}" opacity="${opacity}"/>`,at,1.5);
  // Small fixed paper flecks keep the drawing self-contained; no images or network requests.
  let texture = '';
  for(let i=0;i<95;i++) texture += `<circle cx="${(r()*900).toFixed(1)}" cy="${(r()*560).toFixed(1)}" r="${(.25+r()*.6).toFixed(2)}" fill="${primary}" opacity=".07"/>`;
  if(theme === 'mist') {
    const sunX=610+r()*100, sunY=125+r()*30;
    dot(sunX,sunY,39,accent,.6,.3);
    for(let layer=0;layer<5;layer++) {
      const baseline=240+layer*48, points=[];
      for(let x=-60;x<=960;x+=60) points.push([x,baseline-Math.sin(x/150+layer*1.3+r()*.3)*(38+layer*5)-r()*35]);
      let d=`M ${points[0][0]} ${points[0][1]}`;
      for(let p=1;p<points.length;p++) { const a=points[p-1],b=points[p]; d+=` Q ${a[0]+30} ${a[1]-14} ${b[0]} ${b[1]}`; }
      add(`<path d="${d} L 960 600 L -60 600 Z" fill="${primary}" opacity="${.055+layer*.035}"/>`,.5+layer*.65,2.5);
      line(d,primary,.8+layer*.4,.22+layer*.08,1+layer*.55,3);
      for(let j=0;j<4;j++) line(d,primary,.4,.05,3+layer+j*.3,3);
    }
    for(let i=0;i<22;i++) {
      const y=370+r()*170,x=r()*900,w=25+r()*130;
      line(`M ${x} ${y} q ${w/2} ${-4-r()*7} ${w} 0`,i%3?primary:accent,.6,.15,4+r()*9,2);
    }
    for(let i=0;i<5;i++) { const x=210+i*19+r()*12,y=160+r()*25; line(`M ${x-6} ${y+2} q 4 -7 9 0 q 4 -6 9 -1`,primary,1.1,.55,5+i*.35,1); }
    const x=560+r()*70,y=439;
    add(`<path d="M ${x-20} ${y} Q ${x} ${y+14} ${x+29} ${y-2} Z" fill="${primary}" opacity=".8"/>`,7,1.8);
    line(`M ${x+5} ${y-2} l 0 -34 m -8 8 l 29 26`,primary,1.5,.7,7.5,1.5);
    line(`M ${x-35} ${y+16} q 35 -5 70 0`,primary,.8,.3,9,2);
  } else if(theme === 'garden') {
    // Stem curves and leaves use the same seed for repeatable arrangements.
    dot(670,135,58,accent,.12,0);
    for(let i=0;i<10;i++) {
      const x=135+i*69+r()*25,y=150+r()*165,base=535+r()*25,bend=(r()-.5)*90;
      line(`M ${x} ${base} Q ${x+bend} ${(base+y)/2} ${x+bend*.4} ${y}`,primary,1.8+r()*1.2,.68,i*.35,3);
      for(let j=0;j<5;j++) {
        const t=.16+j*.14,lx=x+bend*t,ly=base-(base-y)*t,side=j%2?1:-1,len=24+r()*22;
        add(`<path d="M ${lx} ${ly} Q ${lx+side*len*.3} ${ly-30} ${lx+side*len} ${ly-32} Q ${lx+side*len} ${ly-4} ${lx} ${ly}Z" fill="${primary}" opacity="${.3+r()*.3}"/>`,1+i*.35+j*.45,1.5);
        line(`M ${lx} ${ly} l ${side*len*.85} -27`,primary,.6,.3,2+i*.35+j*.4,1.2);
      }
      const fx=x+bend*.4,fy=y;
      for(let p=0;p<5;p++) {
        const a=p*Math.PI*2/5,px=fx+Math.cos(a)*12,py=fy+Math.sin(a)*12;
        add(`<ellipse cx="${px}" cy="${py}" rx="12" ry="17" transform="rotate(${a*180/Math.PI+90} ${px} ${py})" fill="${accent}" opacity=".6"/>`,4+i*.35+p*.13,1.8);
      }
      dot(fx,fy,4.2,accent,.9,5+i*.35);
    }
    for(let i=0;i<20;i++) dot(80+r()*740,110+r()*350,.8+r()*1.2,accent,.35,6+r()*8);
  } else {
    const cx=450+(r()-.5)*70,cy=285+(r()-.5)*25;
    for(let i=0;i<5;i++) {
      const rx=80+i*56,ry=45+i*28,angle=-28+i*13;
      add(`<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" transform="rotate(${angle} ${cx} ${cy})" fill="none" stroke="${primary}" opacity="${.2+i*.035}" stroke-width="1" pathLength="1"/>`,.5+i*.55,3.5,true);
      const a=.6+r()*5,rad=angle*Math.PI/180,dx=Math.cos(a)*rx,dy=Math.sin(a)*ry,px=cx+dx*Math.cos(rad)-dy*Math.sin(rad),py=cy+dx*Math.sin(rad)+dy*Math.cos(rad);
      dot(px,py,4+i*1.8,i%2?primary:accent,.85,3+i*.7);
      dot(px,py,10+i*2,i%2?primary:accent,.09,3+i*.7);
    }
    dot(cx,cy,21,accent,.55,.3); dot(cx-4,cy-4,8,paper,.5,1);
    const stars=[];
    for(let i=0;i<42;i++) {const x=80+r()*740,y=65+r()*430; stars.push([x,y]); dot(x,y,.8+r()*1.8,primary,.3+r()*.4,1+r()*11);}
    for(let i=0;i<9;i++) { const a=stars[i*2],b=stars[i*2+1]; if(Math.hypot(a[0]-b[0],a[1]-b[1])<260) line(`M ${a[0]} ${a[1]} L ${b[0]} ${b[1]}`,primary,.6,.18,5+i*.4,2); }
    for(let i=0;i<5;i++) {const x=100+r()*700,y=65+r()*400; line(`M ${x-5} ${y} h 10 M ${x} ${y-5} v 10`,accent,1,.65,6+i*.7,1);}
  }
  return {background:paper,texture,pieces};
}
