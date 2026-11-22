'use strict';
const params=new URLSearchParams(location.search);
let en=params.get('lang')==='en', step=0, answers=[], picks=[], movies=[], tags={}, loaded=false;
const say=(ja,english)=>en?english:ja;
const questions=[
  ['今夜観たいのは？','What fits tonight?',[['film','映画を1本','A film'],['series','シリーズに浸りたい','A series'],['any','どちらでも','Either']]],
  ['怖さはどのくらい？','How scary?',[['beyond','今日はホラー以外','Beyond horror tonight'],['soft','穏やかに（ホラー度なし〜2）','Gentle (unrated for scares or up to 2)'],['mid','ほどよく（2.5〜3.5）','A little tension (2.5–3.5)'],['high','思いきり（4〜5）','Full scares (4–5)'],['any','おまかせ','Surprise me']]],
  ['惹かれるのは？','What draws you in?',[['puzzle','謎を追いたい','A mystery to unravel'],['survive','逃げ場のない緊張感','Survival under pressure'],['people','誰かの気持ちに浸りたい','Characters to care about'],['any','ジャンルはおまかせ','Any theme']]]
];
let detailed = params.get('mode') === 'deep';
const deepQuestions = [
  ...questions.slice(0,2),
  ['今夜いちばん気になる題材は？','Which subject sounds best tonight?',[
    ...questions[2][2].slice(0,3),['ghost','幽霊・呪い','Ghosts and curses'],
    ['strange','SF・モンスター','Sci-fi and creatures'],['laugh','コメディ','Comedy'],
    ['real','実録・ドキュメンタリー','Documentary and true crime'],questions[2][2][3]]],
  ['どの年代から選ぶ？','Which era appeals to you?',[
    ['classic','1999年まで','Before 2000'],['middle','2000〜2014年','2000–2014'],
    ['modern','2015年以降','2015 onward'],['any','年代はおまかせ','Any era']]],
  ['最後の決め手は？','What should tip the balance?',[
    ['rating','ホラみのおすすめ度','Horami’s rating'],['latest','最近の公開作品','Recent releases'],
    ['surprise','意外な一本との出会い','A surprise discovery']]]
];
const themes={ghost:['supernatural','possession','doll'],strange:['scifi','creature','zombie','vampire'],real:['documentary','truecrime'],laugh:['comedy','darkcomedy'],puzzle:['mystery','psychological','crime'],survive:['trapped','survival','disaster'],people:['romance','heartwarming','teen'],any:[]};
const panel=document.querySelector('#panel');
function node(tag,text,cls){const el=document.createElement(tag);if(text!==undefined)el.textContent=text;if(cls)el.className=cls;return el;}
function button(text,onClick,cls){const b=node('button',text,cls);b.onclick=onClick;return b;}
function matchesScare(m,level){
  if(level==='beyond')return !['horror','thriller'].includes(m.genre);
  if(level==='soft')return m.scare==null||m.scare<=2;
  if(level==='mid')return m.scare>=2.5&&m.scare<=3.5;
  if(level==='high')return m.scare>=4;
  return true;
}
function recommend(rows,metadata,[format,scare,theme]){
  return deepPicks(rows,metadata,[format,scare,theme,'any','mix']);
}
function eraFits(year, era) {
  if (era === 'any') return true;
  if (!year) return false;
  return era === 'classic' ? year < 2000 : era === 'middle' ? year >= 2000 && year <= 2014 : year >= 2015;
}
function deepPicks(rows, metadata, [format, scare, theme, era, priority]) {
  let recent=[];
  try{recent=JSON.parse(sessionStorage.getItem('horami.quiz.recent')||'[]');if(!Array.isArray(recent))recent=[];}catch{}
  const eligible=scare==='beyond'?rows.filter(m=>matchesScare(m,'beyond')):rows;
  const scored = eligible.map(m => {
    const tagMatch = theme === 'any' || (metadata[m.id]?.tags || []).some(tag=>themes[theme].includes(tag));
    const match = Number(matchesScare(m,scare))*8 + Number(format==='any'||m.format===format)*4
      + Number(eraFits(m.year,era))*2 + Number(tagMatch);
    const preference = priority==='rating' ? m.rating??-1 : priority==='latest' ? m.year??0 : priority==='mix' ? (m.rating??2)+Math.random()*2 : 0;
    return {m, match, seen:Number(recent.includes(m.id)), preference, tie:Math.random()};
  });
  const result=scored.sort((a,b)=>b.match-a.match || a.seen-b.seen || b.preference-a.preference || a.tie-b.tie).slice(0,3).map(x=>x.m);
  try{sessionStorage.setItem('horami.quiz.recent',JSON.stringify([...recent,...result.map(m=>m.id)].slice(-18)));}catch{}
  return result;
}
function modeButton() {
  return button(detailed ? say('3問のかんたん診断へ','Switch to the 3-question quiz') :
    say('もっと詳しく診断する（5問）','Find a closer match · 5 questions'),()=>{
    detailed=!detailed;
    reset();
  },'back');
}
function updateUrl(){const url=new URL(location.href);url.searchParams.set('lang',en?'en':'ja');if(detailed)url.searchParams.set('mode','deep');else url.searchParams.delete('mode');if(picks.length)url.searchParams.set('picks',picks.map(m=>m.id).join(','));else url.searchParams.delete('picks');history.replaceState(null,'',url);}
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
    const active=detailed?deepQuestions:questions;
    const [jp,eng,options]=active[step];
    panel.append(node('div',(step+1)+' / '+active.length,'progress'),node('h2',say(jp,eng)));
    const choices=node('div',undefined,'choices');
    for(const [value,j,e] of options)choices.append(button(say(j,e),()=>{
      if(!answers.length)window.track?.('quiz_start');
      answers[step]=value;
      if(step===active.length-1){picks=(detailed?deepPicks:recommend)(movies,tags,answers);if(detailed)window.track?.('quiz_deep_complete');updateUrl();window.track?.('quiz_complete');}
      else step++;
      render(true);
    }));
    panel.append(choices);if(step===0)panel.append(modeButton());if(step>0)panel.append(button(say('← 戻る','← Back'),()=>{step--;render(true);},'back'));
  }
  if(focus){const h=panel.querySelector('h2');h.tabIndex=-1;h.focus();}
}
function results(){
  panel.append(node('h2',say('今夜の候補はこちら','Your picks for tonight')));
  if(detailed && answers.length){
    panel.append(node('p',say('怖さ・作品タイプ・年代・題材の順に近い3本を選びました。','Three closest matches, prioritizing scare level, format, era, then subject.')));
  }
  if(answers.length&&picks.some(m=>!matchesScare(m,answers[1])||(answers[0]!=='any'&&m.format!==answers[0])))
    panel.append(node('p',say('候補が少ないため、近い条件の作品も含めました。','A few near matches are included to round out your picks.')));
  for(const m of picks){
    const a=node('a',undefined,'pick');a.href='reviews/'+encodeURIComponent(m.id)+(en?'-en':'')+'.html';a.dataset.track='quiz-review/'+m.id;
    const art=node('span');if(/^(?:\.\/)?posters\/|^https:\/\//.test(m.posterUrl||'')){const img=node('img');img.alt='';img.src=m.posterUrl;art.append(img);}
    const copy=node('span');copy.append(node('strong',(en?m.en:m.jp)+' ↗'),node('small',say('おすすめ度 ','Rating ')+(m.rating==null?'—':m.rating+'/5')+' · '+say('ホラー度 ','Scare ')+(m.scare==null?'—':m.scare+'/5')),node('small',en?m.hookEn:m.hook));a.append(art,copy);panel.append(a);
  }
  const actions=node('div',undefined,'actions'), status=node('p');status.setAttribute('role','status');
  actions.append(button(say('ストーリー画像をシェア ↗','Share story card ↗'),()=>{
    window.track?.('quiz-share/story');openMovieStory(picks,en,'quiz');
  }));
  actions.append(button(say('もう一度診断','Try again'),reset));actions.append(modeButton());panel.append(actions,status);
}
document.querySelector('#language').onclick=()=>{en=!en;updateUrl();render();};
render();
async function json(path){const r=await fetch(path);if(!r.ok)throw Error();return r.json();}
Promise.all([json('data/reviews.json'),json('data/discovery.json').catch(()=>({}))]).then(([rows,metadata])=>{
  movies=rows;tags=metadata;
  const ids=(params.get('picks')||'').split(',');if(ids.length===3&&new Set(ids).size===3){const saved=ids.map(id=>movies.find(m=>m.id===id));if(saved.every(Boolean))picks=saved;}
}).catch(()=>{}).finally(()=>{loaded=true;render();});
