let lang = new URLSearchParams(location.search).get('lang') === 'en' ? 'en' : 'ja';
function translate() {
  document.documentElement.lang=lang;
  document.querySelectorAll('[data-ja]').forEach(el=>el.textContent=el.dataset[lang]);
  const en = lang==='en';
  document.title=(en?'Features & rankings':'特集・ランキング')+' | HORAMI CINEMA';
  document.querySelector('#language').textContent=en?'日本語 ↗':'EN ↗';
  document.querySelector('#story').href=en?'trapped-films-en.html':'trapped-films.html';
  document.querySelectorAll('[data-review]').forEach(a=>a.href='reviews/'+a.dataset.review+(en?'-en':'')+'.html');
  for (const selector of ['.brand','.gacha-link','.news-link']) {
    const a=document.querySelector(selector), url=new URL(a.href);url.searchParams.set('lang',lang);a.href=url;
  }
}
document.querySelector('#language').onclick=()=>{
  lang=lang==='en'?'ja':'en';const u=new URL(location.href);u.searchParams.set('lang',lang);history.replaceState(null,'',u);translate();
};
translate();
