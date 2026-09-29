// Site-wide behaviour: scroll reveals, nav background, reading progress bar, cursor glow.
(() => {
  const root = document.documentElement;
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  root.classList.add('ready'); // tells the <head> fallback that this script loaded

  const year = document.getElementById('year');
  if (year) year.textContent = new Date().getFullYear();

  // Nav gets a solid background once you leave the top; progress bar tracks scroll depth.
  const nav = document.querySelector('.site-nav');
  const bar = document.createElement('div');
  bar.className = 'progress';
  bar.setAttribute('aria-hidden', 'true');
  document.body.appendChild(bar);
  let ticking = false;
  const onScroll = () => {
    ticking = false;
    const max = root.scrollHeight - innerHeight;
    root.style.setProperty('--progress', max > 0 ? Math.min(scrollY / max, 1) : 0);
    if (nav) nav.classList.toggle('scrolled', scrollY > 12);
  };
  addEventListener('scroll', () => {
    if (!ticking) { ticking = true; requestAnimationFrame(onScroll); }
  }, { passive: true });
  onScroll();

  // Scroll reveal. Keep in sync with the `.js :is(...)` selector in css/style.css.
  const REVEAL = '.grid>h2,.lead,.about-text,.skills>div,.list>.row,.big,.email,.social,.prose>*,.features>li,.gallery figure,.layer,.flow>*,.next .wrap';
  const items = [...document.querySelectorAll(REVEAL)];
  // Stagger siblings so cards and list items cascade in rather than appearing at once.
  items.forEach(el => {
    const siblings = [...el.parentElement.children].filter(c => c.matches(REVEAL));
    el.style.setProperty('--d', Math.min(siblings.indexOf(el), 6) * 90 + 'ms');
  });
  if (reduceMotion || !('IntersectionObserver' in window)) {
    items.forEach(el => el.classList.add('in'));
  } else {
    const io = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.12 });
    items.forEach(el => io.observe(el));
  }

  // Soft glow that follows the cursor over the hero and cards (mouse/trackpad only).
  if (!reduceMotion && matchMedia('(hover: hover)').matches) {
    const track = (el, target = el) => el.addEventListener('pointermove', e => {
      const r = el.getBoundingClientRect();
      target.style.setProperty('--mx', e.clientX - r.left + 'px');
      target.style.setProperty('--my', e.clientY - r.top + 'px');
    });
    const hero = document.querySelector('.hero');
    if (hero) track(hero, hero.querySelector('.hero-bg'));
    document.querySelectorAll('.row, .features>li, .skills>div').forEach(el => {
      el.classList.add('glow');
      track(el);
    });
  }
})();
