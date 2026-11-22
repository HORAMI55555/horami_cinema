// A fresh image for the selected result. Same-origin artwork keeps the canvas exportable.
window.openMovieStory = async function (movies, en, kind) {
  if (document.querySelector('#story-sheet')) return;
  const t=(ja,english)=>en?english:ja;
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
  async function image(src) {
    if(!src || new URL(src,location.href).origin!==location.origin)return null;
    const img=new Image();img.src=src;
    try { await img.decode();return img; } catch {return null;}
  }
  try {
    const [paper,logo,...art]=await Promise.all(['assets/crystal-ribbons.png','assets/horami-pearl-wordmark.png',...movies.map(m=>m.posterUrl)].map(image));
    if(!sheet.open)return;
    const canvas=document.createElement('canvas');canvas.width=1080;canvas.height=1920;
    const c=canvas.getContext('2d');
    function crop(img,x,y,w,h){
      const scale=Math.max(w/img.width,h/img.height),sw=w/scale,sh=h/scale;
      c.drawImage(img,(img.width-sw)/2,(img.height-sh)/2,sw,sh,x,y,w,h);
    }
    function text(value,x,y,size,width,align='left'){
      c.textAlign=align;c.font=size+'px Georgia, "Hiragino Mincho ProN", serif';
      c.fillText(value,x,y,width);
    }
    c.fillStyle='#bfe9e7';c.fillRect(0,0,1080,1920);
    if(paper)crop(paper,0,0,1080,1920);
    c.fillStyle='#ebfffa70';c.fillRect(0,0,1080,1920);
    c.fillStyle='#204f5a';
    if(logo){const w=720,h=w*logo.height/logo.width;c.drawImage(logo,(1080-w)/2,110,w,h);}
    else text('HORAMI',540,285,102,800,'center');
    text(kind==='quiz'?t('今夜の映画診断','Tonight’s movie quiz'):t('今夜の１本ガチャ','Tonight’s movie draw'),540,420,58,900,'center');
    c.strokeStyle='#508686';c.beginPath();c.moveTo(388,462);c.lineTo(692,462);c.stroke();
    const solo=movies.length===1;
    movies.forEach((m,i)=>{
      const x=84,y=solo?545:540+i*345,w=912,h=solo?935:302;
      c.fillStyle='rgba(242,255,253,.80)';c.beginPath();c.roundRect(x,y,w,h,35);c.fill();c.strokeStyle='white';c.lineWidth=4;c.stroke();
      const side=solo?622:220,px=solo?(1080-side)/2:x+38,py=y+40;
      c.save();c.beginPath();c.roundRect(px,py,side,side,18);c.clip();
      if(art[i])crop(art[i],px,py,side,side);else{c.fillStyle='#88b8bc';c.fillRect(px,py,side,side);}
      c.restore();c.fillStyle='#164954';
      const left=solo?540:px+side+36,top=solo?py+side+95:py+93,room=solo?810:570,align=solo?'center':'left';
      const title=(en?m.en:m.jp)||m.en;
      // Two title lines retain the poster hierarchy on narrow phone screens.
      const fontSize=solo?54:42;c.font=fontSize+'px Georgia, serif';
      let first='',second='';
      for(const ch of title){if(!second&&c.measureText(first+ch).width<=room)first+=ch;else second+=ch;}
      text(first,left,top,fontSize,room,align);
      if(second)text(second,left,top+fontSize+6,fontSize,room,align);
      text(t('おすすめ度','Recommended')+'   '+(m.rating==null?'—':m.rating+' / 5'),left,top+(second?fontSize+6:0)+62,32,room,align);
    });
    c.fillStyle='#205260';text('For films that stay with you.',540,1668,48,900,'center');
    text('@dontlookback25   ·   HORAMI CINEMA',540,1750,32,900,'center');
    const blob=await new Promise(resolve=>canvas.toBlob(resolve,'image/png'));
    if(!sheet.open)return;
    if(!blob)throw Error();
    const filename='HORAMI-'+kind+'-story.png';url=URL.createObjectURL(blob);
    const preview=new Image();preview.src=url;preview.alt=t('ストーリー画像のプレビュー','Story card preview');sheet.insertBefore(preview,status);
    status.textContent=t('保存した画像をInstagramのストーリーズで選んでね。','Choose the saved image in Instagram Stories.');
    const save=document.createElement('a');save.href=url;save.download=filename;save.textContent=t('画像を保存','Save image');sheet.append(save);
    if(typeof File==='function'){
      const files=[new File([blob],filename,{type:'image/png'})];
      if(navigator.canShare?.({files})){
        const share=document.createElement('button');share.textContent=t('画像をシェア','Share image');
        share.onclick=async()=>{try{await navigator.share({files});}catch(e){if(e.name!=='AbortError')status.textContent=t('画像を保存して共有してね。','Save the image to share it.');}};
        sheet.append(share);
      }
    }
  } catch {status.textContent=t('画像を作れませんでした。閉じてもう一度試してね。','Could not make the image. Close and try again.');}
};
