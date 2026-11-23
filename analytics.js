(() => {
  const isLocal = ['localhost', '127.0.0.1', '[::1]'].includes(location.hostname);
  const pending = [];
  function flush() {
    if (typeof window.goatcounter?.count !== 'function') return;
    while (pending.length) window.goatcounter.count({path: pending.shift(), event: true});
  }
  window.track = function (path) {
    if (isLocal || pending.length >= 50) return;
    pending.push(path);
    flush();
  };
  document.querySelector('script[data-goatcounter]')?.addEventListener('load', flush);
  window.addEventListener('load', flush);

  const page = location.pathname.match(/\/(trapped-films|haunted-homes|after-horror)(-en)?\.html$/);
  const query = new URLSearchParams(location.search);
  const placement = query.get('utm_medium');
  let campaign;
  if (page && query.get('utm_source') === 'instagram' &&
      ['story', 'bio'].includes(placement) && query.get('utm_campaign') === page[1].replace(/-/g, '_')) {
    campaign = ['ig-feature', page[1], placement, page[2] ? 'en' : 'ja'].join('/');
    window.track(campaign + '/open');
  }
  const detail = location.pathname.match(/[/]reviews[/]([a-z0-9_-]+)\.html$/i);
  const lang = /-en\.html$/.test(location.pathname) || query.get('lang') === 'en' ? 'en' : 'ja';
  if (detail && detail[1] !== 'index') {
    window.track('review_view/page/' + detail[1].replace(/-en$/, '') + '/' + lang);
  }
  const feature = location.pathname.match(/[/](gacha|quiz)\.html$/)?.[1];
  if (feature && query.get('utm_source') === 'story_card' && query.get('utm_medium') === 'qr') {
    window.track('story-return/' + feature);
  }
  if (query.get('utm_source') === 'instagram' && ['story','bio'].includes(placement)) {
    const destination = detail ? 'review' : page ? page[1] : feature || 'other';
    window.track('instagram_entry/' + placement + '/' + destination);
    const post = query.get('utm_content');
    if (query.get('utm_campaign') === 'catacombs' && ['reel-a','reel-b','review','carousel'].includes(post)) {
      window.track(['ig-post','catacombs',post,placement,destination].join('/'));
    }
  }
  document.addEventListener('click', event => {
    const link = event.target.closest('a');
    if (!link) return;
    const key = link.dataset.track || (link.hostname === 'www.instagram.com' ? 'instagram' : '');
    if (key) window.track(key);
    if (link.hostname === 'www.instagram.com') {
      const where = link.closest('.modal') ? 'modal' : detail ? 'page' : 'navigation';
      window.track('instagram_outbound/' + where);
    }
    if (!campaign) return;
    const prefix = 'collection/' + page[1] + '/review/' + (page[2] ? 'en/' : 'ja/');
    if (key.startsWith(prefix)) window.track(campaign + '/review/' + key.slice(prefix.length));
  });
})();
