(function () {
  'use strict';

  var TINTS = ['#f6c1cf', '#e989a3', '#f3d5dc', '#d46a86'];
  var spriteCanvases = null;

  function initSprites() {
    if (spriteCanvases) return spriteCanvases;
    spriteCanvases = [];
    for (var i = 0; i < TINTS.length; i++) {
      var sc = document.createElement('canvas');
      sc.width = 50;
      sc.height = 50;
      var sCtx = sc.getContext('2d');
      if (sCtx) {
        sCtx.translate(25, 45);
        sCtx.fillStyle = TINTS[i];
        sCtx.beginPath();
        sCtx.moveTo(0, 0);
        sCtx.bezierCurveTo(12, -8, 18, -28, 0, -40);
        sCtx.bezierCurveTo(-18, -28, -12, -8, 0, 0);
        sCtx.closePath();
        sCtx.fill();
      }
      spriteCanvases.push(sc);
    }
    return spriteCanvases;
  }

  function easeOutBack(t) {
    var c1 = 1.70158;
    var c3 = c1 + 1;
    return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
  }

  function drawRose(ctx, x, y, radius, baseAngle) {
    if (radius <= 0.1) return;

    var layers = [
      { count: 7, fill: '#d46a86', dist: radius * 0.44, rx: radius * 0.42, ry: radius * 0.52, offset: 0 },
      { count: 6, fill: '#e7a0b4', dist: radius * 0.28, rx: radius * 0.34, ry: radius * 0.42, offset: Math.PI / 6 },
      { count: 5, fill: '#f8d5df', dist: radius * 0.14, rx: radius * 0.24, ry: radius * 0.32, offset: Math.PI / 4 }
    ];

    for (var l = 0; l < layers.length; l++) {
      var lay = layers[l];
      ctx.fillStyle = lay.fill;
      for (var p = 0; p < lay.count; p++) {
        var angle = baseAngle + lay.offset + (p * 2 * Math.PI / lay.count);
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(angle);
        ctx.beginPath();
        ctx.ellipse(0, -lay.dist, lay.rx, lay.ry, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
    }

    ctx.fillStyle = '#e7c27a';
    ctx.beginPath();
    ctx.arc(x, y, radius * 0.14, 0, Math.PI * 2);
    ctx.fill();
  }

  function setupRoses(W, H) {
    var roses = [];
    var count = 24;
    var cx = W / 2;
    var cy = H / 2;
    var rx = W * 0.46 / 2;
    var ry = H * 0.32 / 2;

    for (var i = 0; i < count; i++) {
      var theta = (i / count) * 2 * Math.PI + (i % 2 === 0 ? 0.1 : -0.1);
      var cosT = Math.cos(theta);
      var sinT = Math.sin(theta);

      var eRadius = 1 / Math.sqrt((cosT * cosT) / (rx * rx) + (sinT * sinT) / (ry * ry));
      var maxDist = Math.min(
        cosT !== 0 ? Math.abs((W / 2) / cosT) : H,
        sinT !== 0 ? Math.abs((H / 2) / sinT) : W
      );

      var spreadFactor = 0.22 + ((i * 7) % 11) / 13;
      var dist = eRadius * 1.12 + (maxDist - eRadius * 1.12) * spreadFactor;

      var x = cx + cosT * dist;
      var y = cy + sinT * dist;

      var normDx = (x - cx) / rx;
      var normDy = (y - cy) / ry;
      if (normDx * normDx + normDy * normDy < 1.05) {
        dist = eRadius * 1.25;
        x = cx + cosT * dist;
        y = cy + sinT * dist;
      }

      var targetRadius = 28 + ((i * 13) % 59);
      var startDelay = (i / (count - 1)) * 2.7;
      var baseAngle = ((i * 1.618) % 1) * Math.PI * 2;

      roses.push({
        x: x,
        y: y,
        nx: x / W,
        ny: y / H,
        targetRadius: targetRadius,
        startDelay: startDelay,
        baseAngle: baseAngle
      });
    }

    return roses;
  }

  function computeBurstVector(i, spiralAngle, W, H) {
    var speedRatio = 0.5 + ((i * 11) % 90) / 90 * 0.5;
    return {
      vx0: Math.cos(spiralAngle) * (W * 0.4) * speedRatio,
      vy0: Math.sin(spiralAngle) * (H * 0.4) * speedRatio
    };
  }

  function setupPetals(W, H) {
    var petals = [];
    var count = 160;
    var goldenAngle = 2.39996323;

    for (var i = 0; i < count; i++) {
      var spawnTime = (i / count) * 0.9;
      var spiralAngle = i * goldenAngle;
      var burst = computeBurstVector(i, spiralAngle, W, H);

      petals.push({
        index: i,
        tintIndex: i % 4,
        spawnTime: spawnTime,
        spiralAngle: spiralAngle,
        vx0: burst.vx0,
        vy0: burst.vy0,
        scale: 0.55 + ((i * 7) % 10) * 0.05,
        swayFreq: 1.2 + ((i * 3) % 7) * 0.3,
        swayAmp: 16 + ((i * 5) % 8) * 3,
        swayPhase: ((i * 13) % 10) * 0.6,
        floatSpeed: -20 - ((i * 4) % 6) * 6,
        rotSpeed: (i % 2 === 0 ? 1 : -1) * (0.8 + ((i * 3) % 5) * 0.25),
        rotation: (i * 1.2) % (Math.PI * 2),
        lifetime: 4.0 + ((i * 7) % 5) * 0.5,
        recycled: false,
        x: W / 2,
        y: H / 2
      });
    }

    return petals;
  }

  function bloom(canvas, onSettled) {
    var ctx = canvas.getContext('2d');
    if (!ctx) {
      if (typeof onSettled === 'function') onSettled();
      return;
    }

    var sprites = initSprites();
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    var W = window.innerWidth;
    var H = window.innerHeight;

    canvas.width = Math.round(W * dpr);
    canvas.height = Math.round(H * dpr);
    canvas.style.width = W + 'px';
    canvas.style.height = H + 'px';

    var roses = setupRoses(W, H);
    var petals = setupPetals(W, H);

    var startTime = performance.now();
    var lastTime = startTime;
    var settledCalled = false;
    var running = true;
    var animId = null;

    function renderFrame(now) {
      var t = (now - startTime) / 1000;

      if (t >= 3.8 && !settledCalled) {
        settledCalled = true;
        if (typeof onSettled === 'function') {
          onSettled();
        }
      }

      ctx.save();
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.scale(dpr, dpr);

      for (var r = 0; r < roses.length; r++) {
        var rose = roses[r];
        var rx = rose.nx * W;
        var ry = rose.ny * H;

        var roseTime = t - rose.startDelay;
        if (roseTime > 0) {
          var prog = Math.min(1, roseTime / 0.9);
          var scale = easeOutBack(prog);
          var rad = Math.max(0, rose.targetRadius * scale);
          drawRose(ctx, rx, ry, rad, rose.baseAngle);
        }
      }

      for (var p = 0; p < petals.length; p++) {
        var pt = petals[p];
        if (t < pt.spawnTime) continue;

        var age = t - pt.spawnTime;

        if (age > pt.lifetime) {
          pt.recycled = true;
          pt.spawnTime = t;
          pt.lifetime = 4.5 + Math.random() * 2.5;
          pt.x = Math.random() * W;
          pt.y = H + 20;
          pt.vx0 = 0;
          pt.vy0 = 0;
          age = 0;
        }

        var px, py;
        if (!pt.recycled) {
          var burstFade = Math.exp(-age * 1.8);
          var burstDist = (1 - burstFade) * 0.9;
          px = (W / 2) + pt.vx0 * burstDist + Math.sin(age * pt.swayFreq + pt.swayPhase) * pt.swayAmp;
          py = (H / 2) + pt.vy0 * burstDist + age * pt.floatSpeed;
        } else {
          px = pt.x + Math.sin(age * pt.swayFreq + pt.swayPhase) * pt.swayAmp;
          py = pt.y + age * pt.floatSpeed;
        }

        var alpha = 1;
        if (age < 0.25) {
          alpha = age / 0.25;
        } else if (age > pt.lifetime - 0.75) {
          alpha = Math.max(0, (pt.lifetime - age) / 0.75);
        }

        var currentAngle = pt.rotation + age * pt.rotSpeed;
        var spr = sprites[pt.tintIndex];

        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.translate(px, py);
        ctx.rotate(currentAngle);
        ctx.scale(pt.scale, pt.scale);
        ctx.drawImage(spr, -25, -45);
        ctx.restore();
      }

      ctx.restore();
    }

    function resize() {
      var newW = window.innerWidth;
      var newH = window.innerHeight;
      var newDpr = Math.min(window.devicePixelRatio || 1, 2);

      if (newW === W && newH === H && newDpr === dpr) {
        return;
      }

      var sizeChanged = (newW !== W || newH !== H);
      W = newW;
      H = newH;
      dpr = newDpr;

      canvas.width = Math.round(W * dpr);
      canvas.height = Math.round(H * dpr);
      canvas.style.width = W + 'px';
      canvas.style.height = H + 'px';

      if (sizeChanged) {
        for (var i = 0; i < petals.length; i++) {
          if (!petals[i].recycled) {
            var b = computeBurstVector(petals[i].index, petals[i].spiralAngle, W, H);
            petals[i].vx0 = b.vx0;
            petals[i].vy0 = b.vy0;
          }
        }
      }

      renderFrame(lastTime || performance.now());
    }

    window.addEventListener('resize', resize);

    function handleVisibility() {
      if (document.hidden) {
        running = false;
        if (animId) cancelAnimationFrame(animId);
      } else {
        if (!running) {
          running = true;
          animId = requestAnimationFrame(loop);
        }
      }
    }
    document.addEventListener('visibilitychange', handleVisibility);

    function loop(now) {
      if (!running) return;
      lastTime = now;
      renderFrame(now);
      animId = requestAnimationFrame(loop);
    }

    animId = requestAnimationFrame(loop);
  }

  function settleStatic(canvas) {
    var ctx = canvas.getContext('2d');
    if (!ctx) return;

    var sprites = initSprites();
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    var W = window.innerWidth;
    var H = window.innerHeight;

    canvas.width = Math.round(W * dpr);
    canvas.height = Math.round(H * dpr);

    ctx.save();
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, W, H);

    var staticRoses = [
      { x: W * 0.1,  y: H * 0.12, r: 65 },
      { x: W * 0.9,  y: H * 0.12, r: 60 },
      { x: W * 0.08, y: H * 0.88, r: 70 },
      { x: W * 0.92, y: H * 0.86, r: 68 },
      { x: W * 0.5,  y: H * 0.08, r: 52 },
      { x: W * 0.5,  y: H * 0.92, r: 55 },
      { x: W * 0.06, y: H * 0.5,  r: 58 },
      { x: W * 0.94, y: H * 0.5,  r: 62 }
    ];

    for (var i = 0; i < staticRoses.length; i++) {
      var sr = staticRoses[i];
      drawRose(ctx, sr.x, sr.y, sr.r, i * 0.8);
    }

    for (var p = 0; p < 25; p++) {
      var px = (p % 2 === 0 ? 0.05 + (p * 0.035) : 0.65 + (p * 0.015)) * W;
      var py = (0.05 + (p * 0.038) % 0.9) * H;
      var spr = sprites[p % 4];

      ctx.save();
      ctx.globalAlpha = 0.75;
      ctx.translate(px, py);
      ctx.rotate(p * 0.6);
      ctx.scale(0.8, 0.8);
      ctx.drawImage(spr, -25, -45);
      ctx.restore();
    }

    ctx.restore();
  }

  window.Garden = {
    bloom: bloom,
    settleStatic: settleStatic
  };
})();
