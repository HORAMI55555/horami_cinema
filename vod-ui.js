'use strict';
(()=>{
const names={'netflix':['netflix','Netflix'],'hulu':['hulu','Hulu'],'amazon prime video':['prime','Amazon Prime Video'],'prime video':['prime','Amazon Prime Video'],'disney+':['disney','Disney+'],'u-next':['unext','U-NEXT'],'tver':['tver','TVer'],'youtube':['youtube','YouTube']};
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
window.vodPilot=()=>true;
window.renderVodService=(service,id)=>{
 if(!/^https:\/\//.test(service.url||''))return '';
 const logo=names[String(service.name).trim().toLowerCase()];
 const attrs=`href="${esc(service.url)}" target="_blank" rel="noopener" data-track="vod/${esc(id)}"`;
 const name=String(service.name),short=/apple tv/i.test(name)?'Apple TV':/fod/i.test(name)?'FOD':name;
 return `<a class="vod-crystal-link" ${attrs}><span class="vod-orb ${logo?'vod-logo-'+logo[0]:'vod-logo-fallback'}" aria-hidden="true">${logo?'':`<span class="vod-wordmark ${/fod/i.test(name)?'vod-wordmark-fod':''}">${esc(short)}</span>`}</span><span class="vod-provider-name">${esc(logo?logo[1]:service.name)} <small>↗</small></span>${service.accessJa?`<span class="vod-access">${esc(document.documentElement.lang==='en'?(service.accessEn||'See service'):service.accessJa)}</span>`:''}</a>`;
};
window.vodAvailabilityNote=(d={})=>{
 const en=document.documentElement.lang==='en';
 if(d.checkedAt&&Date.now()-Date.parse(d.checkedAt)>=30*86400000)return en?'These listings need a fresh check. Use the link below for current availability.':'配信情報の再確認が必要です。下のリンクから最新の配信先をご確認ください。';
 if(d.availabilityNoteJa)return en?(d.availabilityNoteEn||'Please check the linked service for availability.'):d.availabilityNoteJa;
 if(!(d.services||[]).length)return en?'No confirmed Japanese streaming listings yet.':'日本での配信先は確認中です。';
 return '';
};
})();
