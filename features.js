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
  const cycle=editions.length+1;
  const week=Math.floor((Date.now()-Date.parse('2026-11-16T00:00:00+09:00'))/604800000);
  const index=((week%cycle)+cycle)%cycle;
  const story=document.querySelector('#story'), list=document.querySelector('#weekly-picks');
  const en=lang==='en', i=en?1:0;
  list.replaceChildren();list.hidden=true;
  const art=story.querySelector('img');
  const action=document.querySelector('#feature-action');
  if(!index){
    action.textContent=en?'Read feature ↗':'特集を読む ↗';
    story.href=en?'trapped-films-en.html':'trapped-films.html';
    art.src='posters/open-water-2003.jpg';story.onclick=null;
    story.removeAttribute('aria-expanded');story.removeAttribute('aria-controls');return;
  }
  const edition=editions[index-1];
  const toggleLabel=()=>{action.textContent=list.hidden?(en?'Show films ↓':'作品を表示 ↓'):(en?'Hide films ↑':'作品を閉じる ↑');};
  toggleLabel();
  story.querySelector('h2 span').textContent=edition.title[i];
  story.querySelector('div > span:last-of-type').textContent=edition.intro[i];
  art.src=edition.cover;
  story.href='#weekly-picks';story.setAttribute('aria-controls',list.id);
  story.setAttribute('aria-expanded','false');
  const section=document.createElement('section');
  for(const film of edition.picks){
    const a=document.createElement('a'),img=document.createElement('img');
    a.className='weekly-film';a.href='reviews/'+film.id+(en?'-en':'')+'.html';
    img.alt='';img.src=film.posterUrl;a.append(img,document.createTextNode((en?film.en:film.jp)+' ↗'));section.append(a);
  }
  list.append(section);
  story.onclick=e=>{e.preventDefault();list.hidden=!list.hidden;toggleLabel();story.setAttribute('aria-expanded',String(!list.hidden));if(!list.hidden)section.querySelector('a').focus();};
}
document.addEventListener('visibilitychange',()=>{if(!document.hidden)translate();});
