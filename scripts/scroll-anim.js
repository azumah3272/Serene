(function(){
  // Small progressive enhancement: animate posts on re-entry based on scroll direction.
  if (typeof window === 'undefined') return;
  const prefersReduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReduced) return; // don't add motion if user prefers reduced motion

  let lastScrollY = window.pageYOffset || document.documentElement.scrollTop || 0;

  const posts = Array.from(document.querySelectorAll('.feed .post'));
  if (!posts.length) return;

  // IntersectionObserver to detect when posts leave and re-enter viewport.
  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      const el = entry.target;

      // decide whether we're on a small viewport (mobile) to use vertical animations
      const isMobile = window.matchMedia && window.matchMedia('(max-width:900px)').matches;

      // prefer animating the image container if present; fallback to the whole post
      const imageContainer = el.querySelector && el.querySelector('.post-image');
      const targetEl = imageContainer || el;

      if (entry.isIntersecting) {
        // Only animate if this element previously left the viewport (dataset.left === 'true')
        if (el.dataset.left === 'true') {
          const currentY = window.pageYOffset || document.documentElement.scrollTop || 0;
          const direction = currentY > lastScrollY ? 'down' : 'up';

          // choose CSS class based on scroll direction and device
          if (isMobile) {
            // on mobile we want vertical float in/out applied to image (or post)
            targetEl.classList.remove('enter-from-bottom','enter-from-top');
            if (direction === 'down') targetEl.classList.add('enter-from-bottom');
            else targetEl.classList.add('enter-from-top');
            // cleanup after animation
            const cleanup = () => { targetEl.classList.remove('enter-from-bottom','enter-from-top'); targetEl.removeEventListener('animationend', cleanup); };
            targetEl.addEventListener('animationend', cleanup);
          } else {
            // desktop: keep sideways entrance on the post element (not the image) for layout consistency
            el.classList.remove('enter-from-left','enter-from-right');
            if (direction === 'down') el.classList.add('enter-from-right');
            else el.classList.add('enter-from-left');
            const cleanup = () => { el.classList.remove('enter-from-left','enter-from-right'); el.removeEventListener('animationend', cleanup); };
            el.addEventListener('animationend', cleanup);
          }

          el.dataset.left = 'false';
        }
        el.dataset.inView = 'true';
      } else {
        // mark as left so next time it enters we animate -- also animate the exit on mobile
        el.dataset.left = 'true';
        el.dataset.inView = 'false';
        // determine scroll direction now so outgoing element can float away
        const currentY = window.pageYOffset || document.documentElement.scrollTop || 0;
        const direction = currentY > lastScrollY ? 'down' : 'up';
        if (isMobile) {
          // user scrolled down -> outgoing element should float up and vanish; apply to image container if present
          const exitTarget = imageContainer || el;
          if (direction === 'down') {
            exitTarget.classList.remove('exit-up','exit-down');
            exitTarget.classList.add('exit-up');
          } else {
            exitTarget.classList.remove('exit-up','exit-down');
            exitTarget.classList.add('exit-down');
          }
          const cleanupExit = () => { exitTarget.classList.remove('exit-up','exit-down'); exitTarget.removeEventListener('animationend', cleanupExit); };
          exitTarget.addEventListener('animationend', cleanupExit);
        }
      }
    });
    lastScrollY = window.pageYOffset || document.documentElement.scrollTop || 0;
  }, {threshold: 0.15});

  posts.forEach(p => {
    // initialize dataset flags
    p.dataset.left = (p.getBoundingClientRect().top > window.innerHeight) ? 'true' : 'false';
    p.dataset.inView = p.getBoundingClientRect().top < window.innerHeight ? 'true' : 'false';
    io.observe(p);
  });

  // Keep observer alive; no exports
})();
