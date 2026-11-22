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

COLLECTIONS = [
    ('trapped-films', ('逃げ場のない映画６選','Six films with no way out'),
     ('海と密室、どっちが怖い？ 今夜閉じ込められたい場所から、一本選んでみて。','Open water or a sealed room? Choose tonight’s film by the place you’d least like to be trapped.'), PICKS),
    ('haunted-homes', ('家の中に、誰かいる。','Someone else is home'),
     ('人形、古い家、手製の装置。日常のすぐそばから怪異が始まる３本。','A doll, an old house, a homemade machine. Three ways the uncanny slips into everyday life.'), [
        ('ig-17873743862606496','聞こえるはずのない声','A voice in the wires','発明がきっかけで、家の気配が変わり始める。亡くした人にもう一度会いたい気持ちがいちばん怖い一本。','An invention changes the atmosphere at home. The unsettling part is how much you want the presence to be someone you miss.'),
        ('ig-18370153597224869','念願の一軒家','The dream house','家族で越してきた一軒家に先客がいた。怖さの中で、家族の誰が先に反撃に出るかにも注目。','A family moves into a house that already has an occupant. Watch for the moment someone finally decides to fight back.'),
        ('ig-18079421159225767','棚の上の人形','The doll on the shelf','人形に愛情を注ぐほど、そばに置きたい気持ちも強くなる。家の中での人形の居場所に注目して。','Caring for a doll means keeping it close. Follow where it turns up in the house as comfort gives way to unease.')]),
    ('after-horror', ('怖い映画のあとに、ひと息','A breather after the scares'),
     ('観終わったあとも眠れない夜に。歌う、恋する、笑う、の３本から。','Still too wired to sleep? Wind down with a song, an unlikely romance or a laugh.'), [
        ('ig-18279545686010546','歌いたい夜','Sing along','海辺の結婚式とABBAの曲。気持ちを切り替えたいなら、最初のサビから一緒に歌ってみて。','A seaside wedding and a whole songbook of ABBA. If you need a change of mood, join in at the first chorus.'),
        ('ig-17931361091116476','恋したい夜','Fall in love','映画スターと本屋の店主。ふたりの生活の差が、ひとことの告白にぎゅっと詰まっている。','A movie star and a bookshop owner. Two wildly different lives make one quiet declaration land all the harder.'),
        ('ig-17888646405563068','笑いたい夜','Laugh a little','昨日と同じ自分でも、堂々と入っていくと部屋の空気まで変わる。主人公の歩き方に注目。','Watch how the heroine walks into a room. The change in her stride says as much as any line of dialogue.')])
]

def build_collection(root, rows, base):
    return [url for edition in COLLECTIONS for url in render_edition(root,rows,base,*edition)]

def render_edition(root, rows, base, slug, titles, intros, picks):
    movies = {row['id']: row for row in rows}
    urls = []
    for english in (False, True):
        def tr(ja, en):
            return en if english else ja
        lang = tr('ja', 'en')
        suffix = tr('', '-en')
        filename = slug + suffix + '.html'
        title = tr(*titles)
        intro = tr(*intros)
        cards = []
        for mid, ja, en, desc, desc_en in picks:
            movie = movies[mid]
            name = escape(movie[tr('jp', 'en')])
            scare = '' if movie['scare'] is None else f' · {tr("ホラー度","Scare")} {movie["scare"]}/5'
            cards.append(f'''<article><img src="{escape(movie['posterUrl'])}" alt=""><div><small>{tr(ja,en)}</small><h2><a data-track="collection/{slug}/review/{lang}/{mid}" href="reviews/{mid}{suffix}.html">{name}</a></h2><p>{tr(desc,desc_en)}</p><small>{tr("おすすめ度","Recommended")} ★ {movie["rating"]}/5{scare}</small><button type="button" data-save="{mid}" hidden></button></div></article>''')
        url = base + filename
        urls.append(url)
        (root / filename).write_text(f'''<!doctype html><html lang="{lang}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"><title>{title} | HORAMI CINEMA</title><meta name="description" content="{intro}"><link rel="canonical" href="{url}"><link rel="alternate" hreflang="ja" href="{base}{slug}.html"><link rel="alternate" hreflang="en" href="{base}{slug}-en.html"><meta property="og:title" content="{title} | HORAMI CINEMA"><meta property="og:description" content="{intro}"><meta property="og:url" content="{url}"><meta property="og:image" content="{base}assets/og-cover-v22.png"><meta property="og:type" content="article"><link rel="stylesheet" href="trapped.css?v=step11"><script defer src="collection-save.js"></script><script defer src="analytics.js"></script><script async data-goatcounter="https://horami-cinema.goatcounter.com/count" src="//gc.zgo.at/count.js"></script><link rel="stylesheet" href="journal-theme.css?v=13"></head><body class="trapped-edition"><div class="page-scenery" aria-hidden="true"></div><main><nav><a href="index.html?lang={lang}"><img class="signature-ghost" src="assets/horami-brand-ghost.svg" alt=""> HORAMI CINEMA</a><a href="features.html?lang={lang}">{tr("特集一覧へ","All features")} ↗</a></nav><header><h1>{title}</h1><p>{intro}</p></header><section>{''.join(cards)}</section><footer><a href="quiz.html?lang={lang}">{tr("まだ迷ったら、3問で映画診断","Still deciding? Take the movie quiz")} →</a></footer></main></body></html>''')
    return urls
