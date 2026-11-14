'use strict';
(()=>{
const pilot=new Set(['fall-2022','euphoria-s3','apple-cider-vinegar-2025']);
const names={'netflix':['netflix','Netflix'],'hulu':['hulu','Hulu'],'amazon prime video':['prime','Amazon Prime Video'],'prime video':['prime','Amazon Prime Video'],'disney+':['disney','Disney+'],'u-next':['unext','U-NEXT'],'tver':['tver','TVer'],'youtube':['youtube','YouTube']};
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
window.vodPilot=id=>pilot.has(id);
window.renderVodService=(service,id)=>{
 if(!/^https:\/\//.test(service.url||''))return '';
 const logo=names[String(service.name).trim().toLowerCase()];
 const attrs=`href="${esc(service.url)}" target="_blank" rel="noopener" data-track="vod/${esc(id)}"`;
 if(!pilot.has(id))return `<a class="vod-gem" ${attrs}>${esc(service.name)} ↗</a>`;
 return `<a class="vod-crystal-link" ${attrs}><span class="vod-orb ${logo?'vod-logo-'+logo[0]:'vod-logo-fallback'}" aria-hidden="true">${logo?'':esc(service.name)}</span><span class="vod-provider-name">${esc(logo?logo[1]:service.name)} <small>↗</small></span>${service.accessJa?`<span class="vod-access">${esc(document.documentElement.lang==='en'?service.accessEn:service.accessJa)}</span>`:''}</a>`;
};
})();
