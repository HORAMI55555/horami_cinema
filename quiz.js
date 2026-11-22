'use strict';
const params=new URLSearchParams(location.search);
let en=params.get('lang')==='en', step=0, answers=[], picks=[], movies=[], tags={}, loaded=false;
const say=(ja,english)=>en?english:ja;
const questions=[
  ['今夜観たいのは？','What fits tonight?',[['film','映画を1本','A film'],['series','シリーズに浸りたい','A series'],['any','どちらでも','Either']]],
  ['怖さはどのくらい？','How scary?',[['soft','穏やかに（ホラー度なし〜2）','Gentle (unrated for scares or up to 2)'],['mid','ほどよく（2.5〜3.5）','A little tension (2.5–3.5)'],['high','思いきり（4〜5）','Full scares (4–5)'],['any','おまかせ','Surprise me']]],
  ['惹かれるのは？','What draws you in?',[['puzzle','謎を追いたい','A mystery to unravel'],['survive','逃げ場のない緊張感','Survival under pressure'],['people','誰かの気持ちに浸りたい','Characters to care about'],['any','ジャンルはおまかせ','Any theme']]]
];
const themes={puzzle:['mystery','psychological','crime'],survive:['trapped','survival','disaster'],people:['romance','heartwarming','teen'],any:[]};
const panel=document.querySelector('#panel');
function node(tag,text,cls){const el=document.createElement(tag);if(text!==undefined)el.textContent=text;if(cls)el.className=cls;return el;}
function button(text,onClick,cls){const b=node('button',text,cls);b.onclick=onClick;return b;}
function matchesScare(m,level){
  if(level==='soft')return m.scare==null||m.scare<=2;
  if(level==='mid')return m.scare>=2.5&&m.scare<=3.5;
  if(level==='high')return m.scare>=4;
  return true;
}
function recommend(rows,metadata,[format,scare,theme]){
  const score=m=>Number(matchesScare(m,scare))*16+Number(format==='any'||format===m.format)*8+
    Number((metadata[m.id]?.tags||[]).some(t=>themes[theme].includes(t)))*6+(m.rating??0);
  return rows.slice().sort((a,b)=>score(b)-score(a)||a.id.localeCompare(b.id)).slice(0,3);
}
function updateUrl(){const url=new URL(location.href);url.searchParams.set('lang',en?'en':'ja');if(picks.length)url.searchParams.set('picks',picks.map(m=>m.id).join(','));else url.searchParams.delete('picks');history.replaceState(null,'',url);}
function reset(){picks=[];answers=[];step=0;updateUrl();render(true);}
function render(focus=false){
  document.documentElement.lang=en?'en':'ja';
  document.title=say('今夜の映画診断','Tonight’s Movie Quiz')+' | HORAMI CINEMA';
  document.querySelector('#title').textContent=say('今夜の映画診断','Tonight’s Movie Quiz');
  document.querySelector('#home').href='index.html?lang='+(en?'en':'ja');
  document.querySelector('#language').textContent=say('EN ↗','日本語 ↗');
  panel.replaceChildren();
  if(!loaded){panel.textContent=say('作品を読み込み中…','Loading reviews…');return;}
  if(!movies.length){panel.append(button(say('再読み込み','Reload reviews'),()=>location.reload()));return;}
  if(picks.length){results();}else{
    const [jp,eng,options]=questions[step];
    panel.append(node('div',(step+1)+' / 3','progress'),node('h2',say(jp,eng)));
    const choices=node('div',undefined,'choices');
    for(const [value,j,e] of options)choices.append(button(say(j,e),()=>{
      if(!answers.length)window.track?.('quiz_start');
      answers[step]=value;
      if(step===2){picks=recommend(movies,tags,answers);updateUrl();window.track?.('quiz_complete');}
      else step++;
      render(true);
    }));
    panel.append(choices);if(step>0)panel.append(button(say('← 戻る','← Back'),()=>{step--;render(true);},'back'));
  }
  if(focus){const h=panel.querySelector('h2');h.tabIndex=-1;h.focus();}
}
function results(){
  panel.append(node('h2',say('今夜の候補はこちら','Your picks for tonight')));
  if(answers.length&&picks.some(m=>!matchesScare(m,answers[1])||(answers[0]!=='any'&&m.format!==answers[0])))
    panel.append(node('p',say('候補が少ないため、近い条件の作品も含めました。','A few near matches are included to round out your picks.')));
  for(const m of picks){
    const a=node('a',undefined,'pick');a.href='reviews/'+encodeURIComponent(m.id)+(en?'-en':'')+'.html';a.dataset.track='quiz-review/'+m.id;
    const art=node('span');if(/^(?:\.\/)?posters\/|^https:\/\//.test(m.posterUrl||'')){const img=node('img');img.alt='';img.src=m.posterUrl;art.append(img);}
    const copy=node('span');copy.append(node('strong',(en?m.en:m.jp)+' ↗'),node('small',say('おすすめ度 ','Rating ')+(m.rating==null?'—':m.rating+'/5')+' · '+say('ホラー度 ','Scare ')+(m.scare==null?'—':m.scare+'/5')),node('small',en?m.hookEn:m.hook));a.append(art,copy);panel.append(a);
  }
  const actions=node('div',undefined,'actions'), status=node('p');status.setAttribute('role','status');
  const text=say('今夜の映画診断で選ばれた作品','My movie quiz picks')+' · '+picks.map(m=>en?m.en:m.jp).join(' / ');
  const label=say('結果をシェア ↗','Share picks ↗');
  if(navigator.share)actions.append(button(label,async()=>{try{await navigator.share({text,url:location.href});window.track?.('quiz-share/native');}catch(e){if(e.name!=='AbortError')status.textContent=say('共有できませんでした。','Sharing failed.');}}));
  else{const a=node('a',label,'action');a.href='https://twitter.com/intent/tweet?'+new URLSearchParams({text,url:location.href});a.target='_blank';a.rel='noopener';a.dataset.track='quiz-share/twitter';actions.append(a);}
  actions.append(button(say('もう一度診断','Try again'),reset));panel.append(actions,status);
}
document.querySelector('#language').onclick=()=>{en=!en;updateUrl();render();};
render();
async function json(path){const r=await fetch(path);if(!r.ok)throw Error();return r.json();}
Promise.all([json('data/reviews.json'),json('data/discovery.json').catch(()=>({}))]).then(([rows,metadata])=>{
  movies=rows;tags=metadata;
  const ids=(params.get('picks')||'').split(',');if(ids.length===3&&new Set(ids).size===3){const saved=ids.map(id=>movies.find(m=>m.id===id));if(saved.every(Boolean))picks=saved;}
}).catch(()=>{}).finally(()=>{loaded=true;render();});
