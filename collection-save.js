(()=>{
  const key='horami_cinema.watchlist.v1',en=document.documentElement.lang==='en';
  const buttons=document.querySelectorAll('[data-save]');
  function read(){const ids=JSON.parse(localStorage.getItem(key)||'[]');return new Set(Array.isArray(ids)?ids:[]);}
  function paint(){try{const ids=read();for(const b of buttons){const saved=ids.has(b.dataset.save);b.hidden=false;b.setAttribute('aria-pressed',String(saved));b.textContent=saved?(en?'✓ Saved':'✓ 保存済み'):(en?'+ Watchlist':'＋ 観たいリスト');}}catch{for(const b of buttons)b.hidden=true;}}
  for(const b of buttons)b.onclick=()=>{try{const ids=read(),id=b.dataset.save;if(ids.has(id))ids.delete(id);else ids.add(id);localStorage.setItem(key,JSON.stringify([...ids]));paint();}catch{b.hidden=true;}};
  addEventListener('pageshow',paint);addEventListener('storage',paint);paint();
})();
