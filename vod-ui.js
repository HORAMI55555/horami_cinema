'use strict';
(()=>{
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const svg=body=>`<svg viewBox="0 0 120 80" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">${body}</svg>`;
const text=(s,color,size=27)=>`<text x="60" y="48" text-anchor="middle" fill="${color}" font-family="Arial,sans-serif" font-weight="700" font-size="${size}">${s}</text>`;
const marks={
 netflix:svg('<path fill="#b20710" d="M39 10h13v60H39zm29 0h13v60H68z"/><path fill="#e50914" d="M39 10h15l27 60H66z"/>'),
 hulu:svg(text('hulu','#59c52b',37)),
 prime:svg(text('prime video','#069bd4',18)+'<path d="M34 58q26 15 51-1m-9-1 10-1-4 8" fill="none" stroke="#069bd4" stroke-width="4" stroke-linecap="round"/>'),
 disney:svg('<path d="M24 27q35-36 75 0" fill="none" stroke="#0576b3" stroke-width="2"/>'+text('Disney+','#18356a',25)),
 unext:svg('<path d="M43 9h34v29q0 20-17 25-17-5-17-25zM50 16h20v23q0 12-10 16-10-4-10-16z" fill="none" stroke="#142a3c" stroke-width="4"/><text x="60" y="77" text-anchor="middle" fill="#142a3c" font-family="Arial,sans-serif" font-size="13" font-weight="700">U-NEXT</text>'),
 tver:svg(text('TVer','#00a6ca',33)),
 youtube:svg('<rect x="24" y="16" width="72" height="48" rx="13" fill="#ed2340"/><path d="m51 27 24 13-24 13z" fill="white"/>'),
 fod:svg(text('FOD','#ef653a',35)),
 apple:svg('<path d="M36 22c4-6 3-12 3-12-6 0-11 6-10 12 0 0 3 1 7 0zm5 5c-8-6-11 0-16-1-10-3-17 4-16 14 1 10 8 22 13 23 4 1 6-3 11-2 5 3 8 0 12-7-10-6-10-17-4-27z" fill="#172b37"/><text x="77" y="54" text-anchor="middle" fill="#172b37" font-family="Arial,sans-serif" font-size="39" font-weight="600">tv</text>')
};
function provider(name){const n=String(name).trim().toLowerCase();if(n.includes('netflix'))return 'netflix';if(n.includes('hulu'))return 'hulu';if(n.includes('amazon')||n==='prime video')return 'prime';if(n.includes('disney'))return 'disney';if(n.includes('u-next'))return 'unext';if(n==='tver')return 'tver';if(n.includes('youtube'))return 'youtube';if(n.includes('fod'))return 'fod';if(n.includes('apple tv'))return 'apple';return '';}
window.vodPilot=()=>true;
window.renderVodService=(s,id)=>{
 if(!/^https:\/\//.test(s.url||''))return '';
 const key=provider(s.name),en=document.documentElement.lang==='en',label=String(s.name),condition=en?(s.accessEn||''):s.accessJa||'';
 const mark=marks[key]||`<span class="vod-generic-name">${esc(label)}</span>`;
 return `<a class="vod-crystal-link" href="${esc(s.url)}" target="_blank" rel="noopener" data-track="vod/${esc(id)}"><span class="vod-orb vod-orb-unified" aria-hidden="true"><span class="vod-brand-mark">${mark}</span></span><span class="vod-provider-name">${esc(label)}</span><span class="vod-access">${esc(condition)}</span></a>`;
};
window.vodAvailabilityNote=(d={})=>{
 const en=document.documentElement.lang==='en';
 if(d.checkedAt&&Date.now()-Date.parse(d.checkedAt)>=30*86400000)return en?'Check current availability below.':'最新の配信先は下のリンクから。';
 if(!(d.services||[]).length)return en?'Streaming listings are being checked.':'配信先は確認中です。';
 return '';
};
})();
