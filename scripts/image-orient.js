(function(){
  // Auto-detect image orientation and apply modifier classes to .post-image containers.
  // Respects prefers-reduced-motion by doing nothing if user has reduced motion set (conservative).
  if (typeof window === 'undefined') return;
  const prefersReduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReduced) return;

  function classifyImage(img){
    try {
      const parent = img.closest('.post-image');
      if (!parent) return;
      const w = img.naturalWidth || img.width || 0;
      const h = img.naturalHeight || img.height || 0;
      if (!w || !h) return; // can't decide

      // remove any previous orientation classes
      parent.classList.remove('landscape','square','portrait');

      if (Math.abs(w - h) <= 2 || Math.abs(w/h - 1) < 0.05) {
        parent.classList.add('square');
      } else if (w > h) {
        parent.classList.add('landscape');
      } else {
        parent.classList.add('portrait');
      }
    } catch (e) {
      // silent fail
      return;
    }
  }

  function init(){
    const imgs = Array.from(document.querySelectorAll('.post-image img'));
    if (!imgs.length) return;

    imgs.forEach(img => {
      if (img.complete && img.naturalWidth && img.naturalHeight) {
        classifyImage(img);
      } else {
        img.addEventListener('load', () => classifyImage(img), {once:true});
        // in case load already fired but complete not true yet
        setTimeout(() => { if (img.naturalWidth && img.naturalHeight) classifyImage(img); }, 300);
      }
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
