from html import escape
import json

def build_features(root, rows, base):
    template = (root/'index.html').read_text()
    header = template[template.index('<header'):template.index('</header>')+9]
    def dual(ja,en):
        return f'<span data-ja="{escape(ja,quote=True)}" data-en="{escape(en,quote=True)}">{escape(ja)}</span>'
    films = [r for r in rows if r['format']=='film' and r.get('scare') is not None and r.get('rating') is not None]
    def ranks(key):
        scores = sorted(films,key=lambda r:(-r[key],-(r['postedAt'] or 0),r['id']))[:5]
        cards=[]
        for row in scores:
            rank=1+sum(m[key]>row[key] for m in scores)
            cards.append(f'<a class="rank" data-review="{row["id"]}" href="reviews/{row["id"]}.html"><img loading="lazy" src="{escape(row["posterUrl"])}" alt=""><strong>{rank}</strong>{dual(row["jp"],row["en"])}<small>{row[key]:g}/5</small></a>')
        return ''.join(cards)
    themes = [
        (['家の中に、誰かいる。','Someone else is home'], ['壁一枚の向こうに潜む怪異をめぐる３本。','Three haunted houses with very different secrets.'], ['ig-17873743862606496','ig-18370153597224869','ig-18079421159225767']),
        (['子ども部屋から始まる悪夢','Nightmares in the nursery'], ['無邪気なひと言まで疑いたくなる３本。','Three films that make an innocent voice sound unsettling.'], ['ig-17912422550467111','ig-17932171453989829','ig-17924596022023891']),
        (['怖い映画のあとに、ひと息','A breather after the scares'], ['歌って、恋して、ちょっと笑える３本。','Three nights of music, romance and laughter.'], ['ig-18279545686010546','ig-17931361091116476','ig-17888646405563068'])
    ]
    by_id = {r['id']: r for r in rows}
    editions = []
    for title, intro, ids in themes:
        picks = [{k: by_id[i][k] for k in ('id','jp','en','posterUrl')} for i in ids]
        editions.append(dict(title=title,intro=intro,picks=picks))
    payload = json.dumps(editions,ensure_ascii=False).replace('<',r'\u003c')
    page = f'''<!doctype html><html lang="ja"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>特集・ランキング | HORAMI CINEMA</title><meta name="description" content="テーマ別映画特集とホラみのおすすめ度・怖さランキング。"><meta property="og:image" content="{base}assets/og-cover-v22.png"><link rel="canonical" href="{base}features.html"><link rel="stylesheet" href="styles.css"><link rel="stylesheet" href="cinema-nav.css?v=step11"><link rel="stylesheet" href="features.css?v=step11"><script defer src="features.js?v=step11"></script><script defer src="cinema-nav.js"></script><script async data-goatcounter="https://horami-cinema.goatcounter.com/count" src="//gc.zgo.at/count.js"></script><link rel="stylesheet" href="journal-theme.css?v=12"></head><body>{header}<main class="features"><h1>{dual('特集・ランキング','Features & rankings')}</h1><a class="feature-story" id="story" href="trapped-films.html"><div>{dual('今夜の特集','In focus')}<h2>{dual('逃げ場のない映画６選','Six films with no way out')}</h2>{dual('海、密室、地上600メートル。どこなら耐えられる？','Open water, a sealed pod, or a tower. Where would you last longest?')} ↗</div><img src="posters/open-water-2003.jpg" alt=""></a><section id="weekly-picks" class="rankings" hidden></section><script type="application/json" id="editions">{payload}</script><p>{dual('ホラー・スリラー映画から各5本。同点は同順位で、最近の投稿から掲載。','Five horror and thriller films per list. Ties share a rank, with recent posts shown first.')}</p><div class="rankings"><section><h2>{dual('ホラみのおすすめ順','Horami’s highest rated')}</h2>{ranks('rating')}</section><section><h2>{dual('ホラー度が高い順','Highest scare scores')}</h2>{ranks('scare')}</section></div></main></body></html>'''
    (root/'features.html').write_text(page)
    return base+'features.html'
