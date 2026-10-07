/*
 * The landing page's one script: the bento tiles (Quatro perguntas) rise in as they scroll into
 * view, the total counts up and the search types itself.
 *
 * Nothing leaves the page – no request, no storage, no measurement – and the page is complete
 * without it: the `js` class that hides the tiles until they are seen is set by the page only when
 * scripts run, and a reader who prefers reduced motion gets the finished tiles at once.
 */
(() => {
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const tiles = document.querySelectorAll('.qp-tile');

  const euros = (value) =>
    `${new Intl.NumberFormat('pt-PT', { maximumFractionDigits: 0 }).format(value)} €`;

  const countUp = (figure) => {
    const to = Number(figure.getAttribute('data-count'));
    const start = performance.now();
    const step = (now) => {
      const t = Math.min(1, (now - start) / 1100);
      figure.textContent = euros(Math.round(to * (1 - Math.pow(1 - t, 3))));
      if (t < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };

  const typeOut = (typed) => {
    const word = typed.getAttribute('data-type');
    let shown = 0;
    typed.textContent = '';
    const timer = setInterval(() => {
      shown += 1;
      typed.textContent = word.slice(0, shown);
      if (shown >= word.length) clearInterval(timer);
    }, 70);
  };

  const play = (tile) => {
    tile.classList.add('is-in');
    if (reduced) return;
    const figure = tile.querySelector('[data-count]');
    if (figure) countUp(figure);
    const typed = tile.querySelector('[data-type]');
    if (typed) typeOut(typed);
  };

  if (!('IntersectionObserver' in window)) {
    tiles.forEach(play);
    return;
  }

  const seen = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        seen.unobserve(entry.target);
        play(entry.target);
      });
    },
    { threshold: 0.25 },
  );
  tiles.forEach((tile) => seen.observe(tile));
})();
