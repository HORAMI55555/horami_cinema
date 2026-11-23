let cardCache;
function prepareMovieStory(movies,en,kind){
  const key=JSON.stringify([kind,en,movies.map(m=>m.id)]);
  if(cardCache?.key===key)return cardCache;
  const entry={key};
  entry.ready=renderMovieStory(movies,en,kind).then(blob=>{
    if(typeof File==='function')entry.file=new File([blob],'HORAMI-'+kind+'-story.png',{type:'image/png'});
    return blob;
  }).catch(()=>null);
  cardCache=entry;
  return entry;
}
async function renderMovieStory(movies,en,kind){
  const t=(ja,english)=>en?english:ja;
  async function image(src) {
    if(!src || new URL(src,location.href).origin!==location.origin)return null;
    const img=new Image();img.src=src;
    try { await img.decode();return img; } catch {return null;}
  }
    const [paper,logo,qr,...art]=await Promise.all(['assets/crystal-ribbons.png','assets/horami-pearl-wordmark.png','assets/story-qr-'+kind+(en?'-en':'')+'.png',...movies.map(m=>m.posterUrl)].map(image));
    const theme=getComputedStyle(document.documentElement);
    const token=name=>theme.getPropertyValue('--journal-'+name).trim();
    const family=token('serif');
    const sample=movies.map(m=>(en?m.en:m.jp)||m.en).join(' ')+(en?' Tonight':' 今夜の映画診断 おすすめ度');
    if(document.fonts)await document.fonts.load('42px '+family,sample).catch(()=>{});
    const canvas=document.createElement('canvas');canvas.width=1080;canvas.height=1920;
    const c=canvas.getContext('2d');
    function ink(top,bottom){
      const gradient=c.createLinearGradient(0,top,0,bottom);
      gradient.addColorStop(0,token('title'));
      gradient.addColorStop(.55,token('muted'));
      gradient.addColorStop(1,token('pearl'));
      return gradient;
    }
    function crop(img,x,y,w,h){
      const scale=Math.max(w/img.width,h/img.height),sw=w/scale,sh=h/scale;
      c.drawImage(img,(img.width-sw)/2,(img.height-sh)/2,sw,sh,x,y,w,h);
    }
    function text(value,x,y,size,width,align='left'){
      c.textAlign=align;c.font=size+'px '+family;
      c.fillText(value,x,y,width);
    }
    c.fillStyle='#bfe9e7';c.fillRect(0,0,1080,1920);
    if(paper)crop(paper,0,0,1080,1920);
    c.fillStyle='#ebfffa70';c.fillRect(0,0,1080,1920);
    const foil=c.createLinearGradient(40,0,1040,1920);
    for(const [stop,color] of [[0,'#fffdf3'],[.24,'#70adb5'],[.45,'#fff6eb'],[.67,'#aba8cf'],[1,'#f8ffff']])foil.addColorStop(stop,color);
    c.strokeStyle=foil;c.lineWidth=6;c.strokeRect(40,57,1000,1806);
    c.lineWidth=2;c.strokeRect(52,69,976,1782);
    c.fillStyle=ink(250,425);
    if(logo){const w=720,h=w*logo.height/logo.width;c.drawImage(logo,(1080-w)/2,110,w,h);}
    else text('HORAMI',540,285,102,800,'center');
    text(kind==='quiz'?t('今夜の映画診断','Tonight’s movie quiz'):t('今夜の１本ガチャ','Tonight’s movie draw'),540,420,58,900,'center');
    c.strokeStyle='#508686';c.beginPath();c.moveTo(388,462);c.lineTo(692,462);c.stroke();
    const solo=movies.length===1;
    movies.forEach((m,i)=>{
      const x=84,y=solo?545:540+i*345,w=912,h=solo?935:302;
      c.save();c.shadowColor='#193e5255';c.shadowBlur=26;c.shadowOffsetY=12;
      c.fillStyle='rgba(246,255,253,.76)';c.beginPath();c.roundRect(x,y,w,h,35);c.fill();c.strokeStyle='white';c.lineWidth=4;c.stroke();c.restore();
      const side=solo?622:220,px=solo?(1080-side)/2:x+38,py=y+40;
      c.fillStyle=foil;c.fillRect(px-6,py-6,side+12,side+12);
      c.save();c.beginPath();c.roundRect(px,py,side,side,18);c.clip();
      if(art[i])crop(art[i],px,py,side,side);else{c.fillStyle='#88b8bc';c.fillRect(px,py,side,side);}
      c.restore();c.fillStyle=token('muted');
      const left=solo?540:px+side+36,top=solo?py+side+95:py+93,room=solo?810:570,align=solo?'center':'left';
      if(!solo){text(String(i+1).padStart(2,'0')+'   /   '+(m.year||'—'),left,py+33,26,room,align);}
      const title=(en?m.en:m.jp)||m.en;
      // Two title lines retain the poster hierarchy on narrow phone screens.
      const fontSize=solo?54:42;c.font=fontSize+'px '+family;
      let first='',second='';
      for(const ch of title){if(!second&&c.measureText(first+ch).width<=room)first+=ch;else second+=ch;}
      c.fillStyle=ink(top-fontSize,top+fontSize);
      text(first,left,top,fontSize,room,align);
      if(second)text(second,left,top+fontSize+6,fontSize,room,align);
      c.fillStyle=token('muted');
      text(t('おすすめ度','Recommended')+'   '+(m.rating==null?'—':m.rating+' / 5'),left,top+(second?fontSize+6:0)+62,32,room,align);
    });
    c.fillStyle=foil;
    for(const x of [462,540,618]){
      const y=1570,r=x===540?16:8;c.beginPath();c.moveTo(x,y-r);c.lineTo(x+r*.6,y);c.lineTo(x,y+r);c.lineTo(x-r*.6,y);c.closePath();c.fill();
    }
    c.fillStyle=token('muted');text('For films that stay with you.',540,1668,48,900,'center');
    text('@dontlookback25   ·   HORAMI CINEMA',540,1750,32,900,'center');
    if(qr){
      c.save();c.imageSmoothingEnabled=false;
      c.drawImage(qr,862,1648,147,147);c.restore();
      text(t('友達も試せる','Try it too'),936,1850,25,190,'center');
    }
    const blob=await new Promise(resolve=>canvas.toBlob(resolve,'image/png'));
    if(!blob)throw Error();
    return blob;
}
async function openMovieStory(movies,en,kind){
  if(document.querySelector('#story-sheet'))return;
  const t=(ja,english)=>en?english:ja;
  const entry=prepareMovieStory(movies,en,kind);
  if(entry.file && navigator.canShare?.({files:[entry.file]})){
    try{await navigator.share({files:[entry.file]});window.track?.('story-handoff/'+kind);return;}
    catch(error){if(error.name==='AbortError')return;}
  }
  const sheet=document.createElement('dialog');
  sheet.id='story-sheet';
  const close=document.createElement('button'),status=document.createElement('p');
  close.textContent=t('閉じる','Close');
  close.onclick=()=>sheet.close();
  status.setAttribute('role','status');
  status.textContent=t('画像を準備中…','Preparing your story…');
  sheet.append(close,status);
  document.body.append(sheet);
  let url;
  sheet.addEventListener('close',()=>{sheet.remove();if(url)URL.revokeObjectURL(url);},{once:true});
  sheet.showModal();
  try{
    const blob=await entry.ready;
    if(!sheet.open)return;
    if(!blob){cardCache=null;throw Error();}
    const filename='HORAMI-'+kind+'-story.png';url=URL.createObjectURL(blob);
    const preview=new Image();preview.src=url;preview.alt=t('ストーリー画像のプレビュー','Story card preview');sheet.insertBefore(preview,status);
    status.textContent=t('保存した画像をInstagramのストーリーズで選んでね。','Choose the saved image in Instagram Stories.');
    const save=document.createElement('a');save.href=url;save.download=filename;save.onclick=()=>window.track?.("story-download/"+kind);save.textContent=t('画像を保存','Save image');sheet.append(save);
    if(typeof File==='function'){
      const files=[entry.file];
      if(navigator.canShare?.({files})){
        const share=document.createElement('button');share.textContent=t('画像をシェア','Share image');
        share.onclick=async()=>{try{await navigator.share({files});window.track?.("story-handoff/"+kind);}catch(e){if(e.name!=='AbortError')status.textContent=t('画像を保存して共有してね。','Save the image to share it.');}};
        sheet.append(share);
      }
    }
  } catch {status.textContent=t('画像を作れませんでした。閉じてもう一度試してね。','Could not make the image. Close and try again.');}
};
