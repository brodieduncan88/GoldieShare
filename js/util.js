export const el = html => { const t = document.createElement('template'); t.innerHTML = html.trim(); return t.content.firstElementChild; };

/* fire once (or every time) an element crosses into the viewport */
export function onView(node, fn, { once = true, threshold = .25, rootMargin = '0px 0px -8% 0px' } = {}) {
  if (!('IntersectionObserver' in window)) { fn(node); return; }
  const io = new IntersectionObserver(es => {
    es.forEach(e => {
      if (!e.isIntersecting) return;
      fn(node);
      if (once) io.disconnect();
    });
  }, { threshold, rootMargin });
  io.observe(node);
  return io;
}

/* add `.in` when the element scrolls into view — the hook every chart animates off */
export function animateIn(node, opts) {
  onView(node, n => n.classList.add('in'), opts);
}
