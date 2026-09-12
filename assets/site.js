/* Symmetric Cryptography Lab — shared behaviour
   ------------------------------------------------------------------
   Auto-scrolling lists.

   Any element with  data-autoscroll  becomes a looping list, but only
   when its content is actually taller than the box. Markup:

     <div class="news-viewport" data-autoscroll>
       <div class="scroll-track" data-autoscroll-track>
         <ul class="news-list"> ... </ul>
       </div>
     </div>

   Behaviour:
     - content fits      -> class .is-static, no animation
     - content overflows -> the list is cloned and looped seamlessly
     - hover or keyboard focus pauses it
     - disabled entirely under prefers-reduced-motion
     - re-measured on resize
------------------------------------------------------------------ */
(function () {
  'use strict';

  var reduceMotion = window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function setup(viewport) {
    var track = viewport.querySelector('[data-autoscroll-track]');
    if (!track) return;

    var list = track.firstElementChild;
    if (!list) return;

    // reset before measuring
    viewport.classList.remove('is-scrolling', 'is-static');
    var oldClone = track.querySelector('[data-clone]');
    if (oldClone) track.removeChild(oldClone);

    // nothing worth looping
    if (reduceMotion || list.scrollHeight <= viewport.clientHeight + 16) {
      viewport.classList.add('is-static');
      return;
    }

    var clone = list.cloneNode(true);
    clone.setAttribute('data-clone', '');
    clone.setAttribute('aria-hidden', 'true');
    track.appendChild(clone);

    // roughly 20px per second, never faster than 18s a lap
    var seconds = Math.max(18, Math.round(list.scrollHeight / 20));
    viewport.style.setProperty('--scroll-duration', seconds + 's');
    viewport.classList.add('is-scrolling');
  }

  function runAll() {
    var nodes = document.querySelectorAll('[data-autoscroll]');
    for (var i = 0; i < nodes.length; i++) setup(nodes[i]);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', runAll);
  } else {
    runAll();
  }

  var timer;
  window.addEventListener('resize', function () {
    clearTimeout(timer);
    timer = setTimeout(runAll, 200);
  });
})();
