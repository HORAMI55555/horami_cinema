"""Render the two language editions of the trapped-film collection."""
from html import escape

PICKS = [
    ('oxygen-2021', '体ひとつ分の密室', 'Room for one', '目が覚めたら医療用カプセルの中。残り酸素の数字がひとつ減るたび、自分の呼吸まで意識してしまう。', 'She wakes inside a medical pod. With every tick of the oxygen gauge, you start listening to your own breathing.'),
    ('fall-2022', '地上600メートル', '600 metres up', '下をのぞくのが苦手ならこれ。塔のてっぺんで、手の届かないところにある水がどれだけ恋しくなるか。', 'Pick this if looking down makes your stomach drop. At the top of a tower, a little water just out of reach feels impossibly precious.'),
    ('open-water-2003', '見渡す限りの海', 'Open sea', '潜り終えて水面に顔を出すと、帰りの船がいない。泳ぐ方向を自分で決められることが、こんなに心細い。', 'Two divers surface to find their boat gone. They can swim in any direction. The trouble is choosing one.'),
    ('ig-17962666342693837', '解かなきゃ出られない部屋', 'A puzzle with stakes', '謎解き派にはこの一本。ゲーム開始の合図を待っていた時間まで、あとから手がかりに見えてくる。', 'For puzzle solvers. Even the minutes spent waiting for the game to start begin to look like clues.'),
    ('ig-17956530799745988', '背丈を越える草むら', 'Above the grass line', 'すぐそばにいるはずの人が見えない。助けを呼ぶ声を頼りに進むうち、耳まで信用できなくなる。', 'Someone sounds close enough to touch, yet you can’t see them. Follow a voice far enough and even your ears stop feeling trustworthy.'),
    ('ig-17966912902657243', '時間が逃げていく浜辺', 'A beach out of time', '砂浜も青い海も、最初は理想の休暇そのもの。家族の顔に起きた小さな変化から、その景色の意味が変わる。', 'Sand, blue water, a perfect family holiday. Then a small change in a familiar face transforms the whole view.')
]

def build_collection(root, rows, base):
    movies = {row['id']: row for row in rows}
    urls = []
    for english in (False, True):
        def tr(ja, en):
            return en if english else ja
        lang = tr('ja', 'en')
        suffix = tr('', '-en')
        filename = 'trapped-films' + suffix + '.html'
        title = tr('逃げ場のない映画６選', 'Six films with no way out')
        intro = tr('海と密室、どっちが怖い？ 今夜閉じ込められたい場所から、一本選んでみて。', 'Open water or a sealed room? Choose tonight’s film by the place you’d least like to be trapped.')
        cards = []
        for mid, ja, en, desc, desc_en in PICKS:
            movie = movies[mid]
            name = escape(movie[tr('jp', 'en')])
            cards.append(f'''<article><img src="{escape(movie['posterUrl'])}" alt=""><div><small>{tr(ja,en)}</small><h2><a data-track="collection/trapped/review/{lang}/{mid}" href="reviews/{mid}{suffix}.html">{name}</a></h2><p>{tr(desc,desc_en)}</p><small>{tr("おすすめ度","Recommended")} ★ {movie["rating"]}/5 · {tr("ホラー度","Scare")} {movie["scare"]}/5</small></div></article>''')
        url = base + filename
        urls.append(url)
        (root / filename).write_text(f'''<!doctype html><html lang="{lang}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>{title} | HORAMI CINEMA</title><meta name="description" content="{intro}"><link rel="canonical" href="{url}"><link rel="alternate" hreflang="ja" href="{base}trapped-films.html"><link rel="alternate" hreflang="en" href="{base}trapped-films-en.html"><meta property="og:title" content="{title} | HORAMI CINEMA"><meta property="og:description" content="{intro}"><meta property="og:url" content="{url}"><meta property="og:image" content="{base}assets/og-cover-v22.png"><meta property="og:type" content="article"><link rel="stylesheet" href="trapped.css"><script defer src="analytics.js"></script><script async data-goatcounter="https://horami-cinema.goatcounter.com/count" src="//gc.zgo.at/count.js"></script></head><body><main><nav><a href="index.html?lang={lang}">👻 HORAMI CINEMA</a><a href="{tr("trapped-films-en.html","trapped-films.html")}">{tr("English","日本語")} ↗</a></nav><header><h1>{title}</h1><p>{intro}</p></header><section>{''.join(cards)}</section><footer><a href="quiz.html?lang={lang}">{tr("まだ迷ったら、3問で映画診断","Still deciding? Take the movie quiz")} →</a></footer></main></body></html>''')
    return urls
