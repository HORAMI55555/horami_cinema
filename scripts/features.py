from html import escape

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
    page = f'''<!doctype html><html lang="ja"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>特集・ランキング | HORAMI CINEMA</title><meta name="description" content="テーマ別映画特集とホラみのおすすめ度・怖さランキング。"><meta property="og:image" content="{base}assets/og-cover-v22.png"><link rel="canonical" href="{base}features.html"><link rel="stylesheet" href="styles.css"><link rel="stylesheet" href="cinema-nav.css"><link rel="stylesheet" href="features.css"><script defer src="features.js"></script><script defer src="cinema-nav.js"></script><script async data-goatcounter="https://horami-cinema.goatcounter.com/count" src="//gc.zgo.at/count.js"></script></head><body>{header}<main class="features"><h1>{dual('特集・ランキング','Features & rankings')}</h1><a class="feature-story" id="story" href="trapped-films.html"><div>{dual('今夜の特集','In focus')}<h2>{dual('逃げ場のない映画６選','Six films with no way out')}</h2>{dual('海、密室、地上600メートル。どこなら耐えられる？','Open water, a sealed pod, or a tower. Where would you last longest?')} ↗</div><img src="posters/open-water-2003.jpg" alt=""></a><p>{dual('ホラー・スリラー映画から各5本。同点は同順位で、最近の投稿から掲載。','Five horror and thriller films per list. Ties share a rank, with recent posts shown first.')}</p><div class="rankings"><section><h2>{dual('ホラみのおすすめ順','Horami’s highest rated')}</h2>{ranks('rating')}</section><section><h2>{dual('ホラー度が高い順','Highest scare scores')}</h2>{ranks('scare')}</section></div></main></body></html>'''
    (root/'features.html').write_text(page)
    return base+'features.html'
