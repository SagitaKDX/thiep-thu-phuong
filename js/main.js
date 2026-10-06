(function () {
  'use strict';

  var sealBtn = document.querySelector('#seal-btn');
  var confirmBtn = document.querySelector('#confirm-btn');
  var main = document.querySelector('main');
  var canvas = document.querySelector('#garden');

  var opened = false;
  var confirmed = false;

  if (sealBtn && main) {
    sealBtn.addEventListener('click', function () {
      if (opened) return;
      opened = true;
      main.classList.add('is-open');
    });
  }

  function playChord() {
    try {
      var AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      var ctx = new AudioCtx();

      var schedule = function () {
        try {
          var notes = [440, 523.25, 659.25];
          var now = ctx.currentTime;
          var duration = 1.4;

          var masterGain = ctx.createGain();
          masterGain.gain.setValueAtTime(0.0001, now);
          masterGain.gain.exponentialRampToValueAtTime(0.035, now + 0.04);
          masterGain.gain.exponentialRampToValueAtTime(0.0001, now + duration);
          masterGain.connect(ctx.destination);

          for (var i = 0; i < notes.length; i++) {
            var freq = notes[i];

            var oscSine = ctx.createOscillator();
            oscSine.type = 'sine';
            oscSine.frequency.setValueAtTime(freq, now);
            oscSine.connect(masterGain);
            oscSine.start(now);
            oscSine.stop(now + duration);

            var oscTri = ctx.createOscillator();
            oscTri.type = 'triangle';
            oscTri.frequency.setValueAtTime(freq, now);
            oscTri.connect(masterGain);
            oscTri.start(now);
            oscTri.stop(now + duration);
          }

          setTimeout(function () {
            try {
              ctx.close();
            } catch (_) {}
          }, (duration + 0.2) * 1000);
        } catch (_) {}
      };

      if (typeof ctx.resume === 'function') {
        ctx.resume().then(schedule).catch(function () {});
      } else {
        schedule();
      }
    } catch (_) {
      // Silence if Web Audio fails
    }
  }

  if (confirmBtn && main) {
    confirmBtn.addEventListener('click', function () {
      if (confirmed) return;
      confirmed = true;

      main.classList.add('is-blooming');
      if (sealBtn) sealBtn.style.display = 'none';

      var prefersReducedMotion = false;
      try {
        prefersReducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      } catch (_) {}

      if (prefersReducedMotion) {
        if (window.Garden && typeof window.Garden.settleStatic === 'function' && canvas) {
          window.Garden.settleStatic(canvas);
        }
        requestAnimationFrame(function () {
          main.classList.add('is-settled');
        });
      } else {
        if (window.Garden && typeof window.Garden.bloom === 'function' && canvas) {
          window.Garden.bloom(canvas, function () {
            main.classList.add('is-settled');
          });
        } else {
          main.classList.add('is-settled');
        }
      }

      playChord();
    });
  }
})();
