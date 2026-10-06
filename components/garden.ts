interface Rose {
  x: number;
  y: number;
  nx: number;
  ny: number;
  targetRadius: number;
  startDelay: number;
  baseAngle: number;
}

interface Petal {
  index: number;
  tintIndex: number;
  spawnTime: number;
  spiralAngle: number;
  vx0: number;
  vy0: number;
  scale: number;
  swayFreq: number;
  swayAmp: number;
  swayPhase: number;
  floatSpeed: number;
  rotSpeed: number;
  rotation: number;
  lifetime: number;
  recycled: boolean;
  x: number;
  y: number;
}

const TINTS = ["#f6c1cf", "#e989a3", "#f3d5dc", "#d46a86"];
let spriteCanvases: HTMLCanvasElement[] | null = null;

function initSprites(): HTMLCanvasElement[] {
  if (spriteCanvases) return spriteCanvases;
  spriteCanvases = [];
  for (let i = 0; i < TINTS.length; i++) {
    const sc = document.createElement("canvas");
    sc.width = 50;
    sc.height = 50;
    const sCtx = sc.getContext("2d");
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

function easeOutBack(t: number): number {
  const c1 = 1.70158;
  const c3 = c1 + 1;
  return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
}

function drawRose(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  radius: number,
  baseAngle: number
): void {
  if (radius <= 0.1) return;

  const layers = [
    { count: 7, fill: "#d46a86", dist: radius * 0.44, rx: radius * 0.42, ry: radius * 0.52, offset: 0 },
    { count: 6, fill: "#e7a0b4", dist: radius * 0.28, rx: radius * 0.34, ry: radius * 0.42, offset: Math.PI / 6 },
    { count: 5, fill: "#f8d5df", dist: radius * 0.14, rx: radius * 0.24, ry: radius * 0.32, offset: Math.PI / 4 }
  ];

  for (let l = 0; l < layers.length; l++) {
    const lay = layers[l];
    ctx.fillStyle = lay.fill;
    for (let p = 0; p < lay.count; p++) {
      const angle = baseAngle + lay.offset + ((p * 2 * Math.PI) / lay.count);
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(angle);
      ctx.beginPath();
      ctx.ellipse(0, -lay.dist, lay.rx, lay.ry, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }

  ctx.fillStyle = "#e7c27a";
  ctx.beginPath();
  ctx.arc(x, y, radius * 0.14, 0, Math.PI * 2);
  ctx.fill();
}

function setupRoses(W: number, H: number): Rose[] {
  const roses: Rose[] = [];
  const count = 24;
  const cx = W / 2;
  const cy = H / 2;
  const rx = (W * 0.46) / 2;
  const ry = (H * 0.32) / 2;

  for (let i = 0; i < count; i++) {
    const theta = ((i / count) * 2 * Math.PI) + (i % 2 === 0 ? 0.1 : -0.1);
    const cosT = Math.cos(theta);
    const sinT = Math.sin(theta);

    const eRadius = 1 / Math.sqrt(((cosT * cosT) / (rx * rx)) + ((sinT * sinT) / (ry * ry)));
    const maxDist = Math.min(
      cosT !== 0 ? Math.abs((W / 2) / cosT) : H,
      sinT !== 0 ? Math.abs((H / 2) / sinT) : W
    );

    const spreadFactor = 0.22 + (((i * 7) % 11) / 13);
    let dist = eRadius * 1.12 + (maxDist - eRadius * 1.12) * spreadFactor;

    let x = cx + cosT * dist;
    let y = cy + sinT * dist;

    const normDx = (x - cx) / rx;
    const normDy = (y - cy) / ry;
    if (normDx * normDx + normDy * normDy < 1.05) {
      dist = eRadius * 1.25;
      x = cx + cosT * dist;
      y = cy + sinT * dist;
    }

    const targetRadius = 28 + ((i * 13) % 59);
    const startDelay = (i / (count - 1)) * 2.7;
    const baseAngle = ((i * 1.618) % 1) * Math.PI * 2;

    roses.push({
      x,
      y,
      nx: x / W,
      ny: y / H,
      targetRadius,
      startDelay,
      baseAngle
    });
  }

  return roses;
}

function computeBurstVector(
  i: number,
  spiralAngle: number,
  W: number,
  H: number
): { vx0: number; vy0: number } {
  const speedRatio = 0.5 + ((((i * 11) % 90) / 90) * 0.5);
  return {
    vx0: Math.cos(spiralAngle) * (W * 0.4) * speedRatio,
    vy0: Math.sin(spiralAngle) * (H * 0.4) * speedRatio
  };
}

function setupPetals(W: number, H: number): Petal[] {
  const petals: Petal[] = [];
  const count = 160;
  const goldenAngle = 2.39996323;

  for (let i = 0; i < count; i++) {
    const spawnTime = (i / count) * 0.9;
    const spiralAngle = i * goldenAngle;
    const burst = computeBurstVector(i, spiralAngle, W, H);

    petals.push({
      index: i,
      tintIndex: i % 4,
      spawnTime,
      spiralAngle,
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

export function bloom(
  canvas: HTMLCanvasElement,
  onSettled?: () => void
): () => void {
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    if (typeof onSettled === "function") onSettled();
    return () => {};
  }

  const sprites = initSprites();
  let dpr = Math.min(window.devicePixelRatio || 1, 2);
  let W = window.innerWidth;
  let H = window.innerHeight;

  canvas.width = Math.round(W * dpr);
  canvas.height = Math.round(H * dpr);
  canvas.style.width = W + "px";
  canvas.style.height = H + "px";

  const roses = setupRoses(W, H);
  const petals = setupPetals(W, H);

  const startTime = performance.now();
  let lastTime = startTime;
  let settledCalled = false;
  let running = true;
  let animId: number | null = null;

  function renderFrame(now: number): void {
    if (!ctx) return;
    const t = (now - startTime) / 1000;

    if (t >= 3.8 && !settledCalled) {
      settledCalled = true;
      if (typeof onSettled === "function") {
        onSettled();
      }
    }

    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.scale(dpr, dpr);

    for (let r = 0; r < roses.length; r++) {
      const rose = roses[r];
      const rx = rose.nx * W;
      const ry = rose.ny * H;

      const roseTime = t - rose.startDelay;
      if (roseTime > 0) {
        const prog = Math.min(1, roseTime / 0.9);
        const scale = easeOutBack(prog);
        const rad = Math.max(0, rose.targetRadius * scale);
        drawRose(ctx, rx, ry, rad, rose.baseAngle);
      }
    }

    for (let p = 0; p < petals.length; p++) {
      const pt = petals[p];
      if (t < pt.spawnTime) continue;

      let age = t - pt.spawnTime;

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

      let px: number;
      let py: number;
      if (!pt.recycled) {
        const burstFade = Math.exp(-age * 1.8);
        const burstDist = (1 - burstFade) * 0.9;
        px = (W / 2) + pt.vx0 * burstDist + Math.sin(age * pt.swayFreq + pt.swayPhase) * pt.swayAmp;
        py = (H / 2) + pt.vy0 * burstDist + age * pt.floatSpeed;
      } else {
        px = pt.x + Math.sin(age * pt.swayFreq + pt.swayPhase) * pt.swayAmp;
        py = pt.y + age * pt.floatSpeed;
      }

      let alpha = 1;
      if (age < 0.25) {
        alpha = age / 0.25;
      } else if (age > pt.lifetime - 0.75) {
        alpha = Math.max(0, (pt.lifetime - age) / 0.75);
      }

      const currentAngle = pt.rotation + age * pt.rotSpeed;
      const spr = sprites[pt.tintIndex];

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

  function resize(): void {
    const newW = window.innerWidth;
    const newH = window.innerHeight;
    const newDpr = Math.min(window.devicePixelRatio || 1, 2);

    if (newW === W && newH === H && newDpr === dpr) {
      return;
    }

    const sizeChanged = newW !== W || newH !== H;
    W = newW;
    H = newH;
    dpr = newDpr;

    canvas.width = Math.round(W * dpr);
    canvas.height = Math.round(H * dpr);
    canvas.style.width = W + "px";
    canvas.style.height = H + "px";

    if (sizeChanged) {
      for (let i = 0; i < petals.length; i++) {
        if (!petals[i].recycled) {
          const b = computeBurstVector(petals[i].index, petals[i].spiralAngle, W, H);
          petals[i].vx0 = b.vx0;
          petals[i].vy0 = b.vy0;
        }
      }
    }

    renderFrame(lastTime || performance.now());
  }

  window.addEventListener("resize", resize);

  function handleVisibility(): void {
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
  document.addEventListener("visibilitychange", handleVisibility);

  function loop(now: number): void {
    if (!running) return;
    lastTime = now;
    renderFrame(now);
    animId = requestAnimationFrame(loop);
  }

  animId = requestAnimationFrame(loop);

  return () => {
    running = false;
    if (animId) cancelAnimationFrame(animId);
    window.removeEventListener("resize", resize);
    document.removeEventListener("visibilitychange", handleVisibility);
  };
}

export function settleStatic(canvas: HTMLCanvasElement): void {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  const sprites = initSprites();
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const W = window.innerWidth;
  const H = window.innerHeight;

  canvas.width = Math.round(W * dpr);
  canvas.height = Math.round(H * dpr);

  ctx.save();
  ctx.scale(dpr, dpr);
  ctx.clearRect(0, 0, W, H);

  const staticRoses = [
    { x: W * 0.1, y: H * 0.12, r: 65 },
    { x: W * 0.9, y: H * 0.12, r: 60 },
    { x: W * 0.08, y: H * 0.88, r: 70 },
    { x: W * 0.92, y: H * 0.86, r: 68 },
    { x: W * 0.5, y: H * 0.08, r: 52 },
    { x: W * 0.5, y: H * 0.92, r: 55 },
    { x: W * 0.06, y: H * 0.5, r: 58 },
    { x: W * 0.94, y: H * 0.5, r: 62 }
  ];

  for (let i = 0; i < staticRoses.length; i++) {
    const sr = staticRoses[i];
    drawRose(ctx, sr.x, sr.y, sr.r, i * 0.8);
  }

  for (let p = 0; p < 25; p++) {
    const px = (p % 2 === 0 ? 0.05 + p * 0.035 : 0.65 + p * 0.015) * W;
    const py = (0.05 + (p * 0.038) % 0.9) * H;
    const spr = sprites[p % 4];

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
