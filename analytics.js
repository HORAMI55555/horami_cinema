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
  document.addEventListener('click', event => {
    const link = event.target.closest('a');
    if (!link) return;
    const key = link.dataset.track || (link.hostname === 'www.instagram.com' ? 'instagram' : '');
    if (key) window.track(key);
    if (!campaign) return;
    const prefix = 'collection/' + page[1] + '/review/' + (page[2] ? 'en/' : 'ja/');
    if (key.startsWith(prefix)) window.track(campaign + '/review/' + key.slice(prefix.length));
  });
})();
