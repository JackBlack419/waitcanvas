'use client';
import { useEffect, useRef, useState } from 'react';

// React must be installed by the host app. No React runtime is bundled here.
// Import inside useEffect to keep server-side rendering free of HTMLElement access.
export function LoadingArt({ state = 'idle', theme = 'oil', sample = 'sunset', seed = 'a-little-pause' }) {
  const ref = useRef(null);
  useEffect(() => { let alive = true; import('./waitcanvas.js').then(() => { if (alive) ref.current?.setAttribute('state', state); }); return () => { alive = false; }; }, [state]);
  return <wait-canvas ref={ref} theme={theme} sample={sample} seed={seed} style={{display:'block',width:'100%',height:320}} />;
}

export default function Example() {
  const [state, setState] = useState('idle');
  return <main><LoadingArt state={state}/><p role="status">{state}</p><button onClick={()=>setState('loading')}>开始</button><button onClick={()=>setState('success')}>完成</button><button onClick={()=>setState('error')}>失败</button><button onClick={()=>setState('cancelled')}>取消</button></main>;
}
