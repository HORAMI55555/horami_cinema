let lang = new URLSearchParams(location.search).get('lang') === 'en' ? 'en' : 'ja';
function translate() {
  document.documentElement.lang=lang;
  document.querySelectorAll('[data-ja]').forEach(el=>el.textContent=el.dataset[lang]);
  const en = lang==='en';
  document.title=(en?'Features & rankings':'特集・ランキング')+' | HORAMI CINEMA';
  document.querySelector('#language').textContent=en?'日本語 ↗':'EN ↗';
  for(const a of document.querySelectorAll('[data-edition]'))a.href=a.dataset.edition+(en?'-en':'')+'.html';
  showEdition();
  document.querySelectorAll('[data-review]').forEach(a=>a.href='reviews/'+a.dataset.review+(en?'-en':'')+'.html');
  for (const selector of ['.brand','.gacha-link','.news-link']) {
    const a=document.querySelector(selector), url=new URL(a.href);url.searchParams.set('lang',lang);a.href=url;
  }
}
document.querySelector('#language').onclick=()=>{
  lang=lang==='en'?'ja':'en';const u=new URL(location.href);u.searchParams.set('lang',lang);history.replaceState(null,'',u);translate();
};
translate();

function showEdition(){
  const editions=JSON.parse(document.querySelector('#editions').textContent);
  const week=Math.floor((Date.now()-Date.parse('2026-11-16T00:00:00+09:00'))/604800000);
  const index=((week%editions.length)+editions.length)%editions.length;
  const edition=editions[index], en=lang==='en', i=en?1:0;
  const story=document.querySelector('#story');
  story.href=edition.slug+(en?'-en':'')+'.html';
  story.querySelector('h2 span').textContent=edition.title[i];
  story.querySelector('div > span:last-of-type').textContent=edition.intro[i];
  story.querySelector('img').src=edition.cover;
  document.querySelector('#feature-action').textContent=en?'Read feature ↗':'特集を読む ↗';
}
document.addEventListener('visibilitychange',()=>{if(!document.hidden)translate();});
