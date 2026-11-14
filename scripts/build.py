"""Build static bilingual review pages from the current editable JSON."""
import json,html,shutil,re
from pathlib import Path
from urllib.parse import quote,urljoin
ROOT=Path(__file__).resolve().parents[1]
BASE='https://horami55555.github.io/horami_cinema/'
rows=json.loads((ROOT/'data/reviews.json').read_text())
out=ROOT/'reviews';out.mkdir(exist_ok=True)
esc=lambda x:html.escape(str(x or ''),quote=True)
urls=[BASE,BASE+'gacha.html',BASE+'coming-soon.html',BASE+'reviews/index.html']
links=[]
for m in rows:
 assert re.fullmatch(r'[A-Za-z0-9_-]+',m['id']), 'Unsafe review ID'
 for en in [False,True]:
  lang='en' if en else 'ja';title=m['en' if en else 'jp'];suffix='-en' if en else '';name=m['id']+suffix+'.html';url=BASE+'reviews/'+name;urls.append(url)
  text=lambda key:m.get(key+('En' if en else ''),'') or ''
  description=(text('synopsis') or text('review') or title)[:155]
  image=urljoin(BASE,m.get('posterUrl') or 'assets/crystal-ribbons.png')
  parts=''
  for key,ja,eng in [('synopsis','あらすじ','Synopsis'),('review','ホラみちゃんの本音','My thoughts'),('cast','出演者','Cast'),('trivia','豆知識','Trivia')]:
   if text(key):parts+=f'<h2>{eng if en else ja}</h2><p class="review-text">{esc(text(key))}</p>'
  if en and not text('review'):parts+='<p>English review coming soon.</p>'
  rating=m.get('rating');scare=m.get('scare')
  stars=''
  if rating is not None:stars=f'<span class="rating-row"><b>{'Recommended' if en else 'おすすめ度'}</b><span class="rating-stars"><span class="star-track">☆☆☆☆☆<span style="width:{rating/5*100}%">★★★★★</span></span><small>{rating}/5</small></span></span>'
  ghosts=''
  if scare is not None:
   icons=''.join(f'<span class="ghost-unit"><img src="../assets/ghost.svg" alt=""><span style="width:{max(0,min(1,scare-i))*100}%"><img src="../assets/ghost.svg" alt=""></span></span>' for i in range(5))
   ghosts=f'<span class="rating-row"><b>{"Scare" if en else "ホラー度"}</b><span class="ghost-rating">{icons}<small>{scare}/5</small></span></span>'
  other=m['id']+('' if en else '-en')+'.html'
  structured={'@context':'https://schema.org','@type':'Review','author':{'@type':'Person','name':'ホラみちゃん'},'itemReviewed':{'@type':'TVSeries' if m.get('format')=='series' else 'Movie','name':title},'inLanguage':lang,'reviewBody':text('review'),'url':url}
  if rating is not None:structured['reviewRating']={'@type':'Rating','ratingValue':rating,'bestRating':5,'worstRating':0}
  source=f'<p><a href="{esc(m.get("sourceUrl"))}" rel="noopener" target="_blank">{"Source" if en else "出典"} ↗</a></p>' if (m.get('sourceUrl') or '').startswith('https://') else ''
  insta=f'<a data-track="instagram" href="{esc(m.get("instagramUrl"))}" target="_blank" rel="noopener">Instagram ↗</a>' if (m.get('instagramUrl') or '').startswith('https://www.instagram.com/') else ''
  page=f'''<!doctype html><html lang="{lang}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>{esc(title)} | HORAMI CINEMA</title><meta name="description" content="{esc(description)}"><link rel="canonical" href="{url}"><link rel="alternate" hreflang="ja" href="{BASE}reviews/{m['id']}.html"><link rel="alternate" hreflang="en" href="{BASE}reviews/{m['id']}-en.html"><meta property="og:title" content="{esc(title)} | HORAMI CINEMA"><meta property="og:description" content="{esc(description)}"><meta property="og:image" content="{esc(image)}"><meta property="og:url" content="{url}"><meta property="og:type" content="article"><meta name="twitter:card" content="summary_large_image"><link rel="stylesheet" href="../styles.css?v=news14"><script type="application/ld+json">{json.dumps(structured,ensure_ascii=False).replace('<','\\u003c')}</script><script src="../analytics.js" defer></script><script src="../vod-ui.js?v=news14" defer></script><script src="../review-vod.js?v=news14" defer></script><script data-goatcounter="https://horami-cinema.goatcounter.com/count" async src="//gc.zgo.at/count.js"></script></head><body><main class="review-page"><nav class="review-index"><a href="../index.html?lang={lang}">👻 HORAMI CINEMA</a><a href="../gacha.html?lang={lang}">{"Tonight’s Pick" if en else "今夜の１本ガチャ"}</a><a href="../coming-soon.html?lang={lang}">{"New Releases" if en else "新作映画"}</a><a href="{other}">{'日本語' if en else 'English'} ↗</a></nav><div class="modal-banner jewel-display"><span class="jewel-caption" aria-hidden="true">THE HORAMI COLLECTION</span><div class="jewel-poster-frame"><img src="{esc(image)}" alt="{esc(title)}"></div><span class="jewel-base" aria-hidden="true"></span><span class="jewel-glint glint-left" aria-hidden="true">✧</span><span class="jewel-glint glint-right" aria-hidden="true">✦</span></div><h1>{esc(title)}</h1><p>{esc(m.get('year'))}</p><div class="modal-ratings">{stars}{ghosts}</div><p>{esc(text('hook'))}</p>{parts}{source}<h2>{'Where to watch · Japan' if en else 'どこで観られる？ · 日本'}</h2><div class="vod-links" data-vod-id="{m['id']}"></div><a class="vod-search" data-track="vod-search/{m['id']}" href="https://www.justwatch.com/jp/検索?q={quote(m['jp'])}" target="_blank" rel="noopener">{'Check current availability' if en else '最新の配信先を調べる'} ↗</a><p>{insta}</p><a href="../index.html?lang={lang}">{'Explore more reviews' if en else 'ほかのレビューを探す'} →</a></main></body></html>'''
  (out/name).write_text(page)
 links.append(f'<a href="{m["id"]}.html">{esc(m["jp"])}</a> <a href="{m["id"]}-en.html">English</a>')
(out/'index.html').write_text('<!doctype html><html lang="ja"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>全作品 | HORAMI CINEMA</title><link rel="stylesheet" href="../styles.css?v=news14"><script data-goatcounter="https://horami-cinema.goatcounter.com/count" async src="//gc.zgo.at/count.js"></script><main class="review-page"><a href="../index.html">👻 HORAMI CINEMA</a><h1>全作品 / All reviews</h1>'+''.join('<p>'+x+'</p>' for x in links)+'</main></html>')
(ROOT/'sitemap.xml').write_text('<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'+''.join('<url><loc>'+esc(u)+'</loc></url>' for u in urls)+'</urlset>')
site=ROOT/'_site'
if site.exists():shutil.rmtree(site)
site.mkdir()
for pattern in ['*.html','*.css','*.js','sitemap.xml']:
 for f in ROOT.glob(pattern):shutil.copy2(f,site/f.name)
for folder in ['assets','data','posters','reviews']:
 if (ROOT/folder).exists():shutil.copytree(ROOT/folder,site/folder)
print(f'Built {len(rows)} reviews / {len(rows)*2} bilingual pages')
