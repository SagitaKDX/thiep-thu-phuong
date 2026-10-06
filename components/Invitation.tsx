"use client";

import { useRef, useState } from "react";
import { motion } from "motion/react";
import { bloom, settleStatic } from "./garden";

export function Invitation() {
  const [isOpen, setIsOpen] = useState(false);
  const [isBlooming, setIsBlooming] = useState(false);
  const [isSettled, setIsSettled] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const handleOpen = () => {
    if (isOpen) return;
    setIsOpen(true);
  };

  const playChord = () => {
    try {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext })
          .webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();

      const schedule = () => {
        try {
          const notes = [440, 523.25, 659.25];
          const now = ctx.currentTime;
          const duration = 1.4;

          const masterGain = ctx.createGain();
          masterGain.gain.setValueAtTime(0.0001, now);
          masterGain.gain.exponentialRampToValueAtTime(0.035, now + 0.04);
          masterGain.gain.exponentialRampToValueAtTime(0.0001, now + duration);
          masterGain.connect(ctx.destination);

          for (let i = 0; i < notes.length; i++) {
            const freq = notes[i];

            const oscSine = ctx.createOscillator();
            oscSine.type = "sine";
            oscSine.frequency.setValueAtTime(freq, now);
            oscSine.connect(masterGain);
            oscSine.start(now);
            oscSine.stop(now + duration);

            const oscTri = ctx.createOscillator();
            oscTri.type = "triangle";
            oscTri.frequency.setValueAtTime(freq, now);
            oscTri.connect(masterGain);
            oscTri.start(now);
            oscTri.stop(now + duration);
          }

          setTimeout(() => {
            try {
              ctx.close();
            } catch (_) {}
          }, (duration + 0.2) * 1000);
        } catch (_) {}
      };

      if (typeof ctx.resume === "function") {
        ctx.resume().then(schedule).catch(() => {});
      } else {
        schedule();
      }
    } catch (_) {
      // Silence if Web Audio fails
    }
  };

  const handleConfirm = () => {
    if (isBlooming) return;
    setIsBlooming(true);

    const canvas = canvasRef.current;
    let prefersReducedMotion = false;
    try {
      prefersReducedMotion =
        window.matchMedia &&
        window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    } catch (_) {}

    if (prefersReducedMotion) {
      if (canvas) {
        settleStatic(canvas);
      }
      requestAnimationFrame(() => {
        setIsSettled(true);
      });
    } else {
      if (canvas) {
        bloom(canvas, () => {
          setIsSettled(true);
        });
      } else {
        setIsSettled(true);
      }
    }

    playChord();
  };

  return (
    <>
      <svg className="grain-filter-svg" aria-hidden="true">
        <filter id="grain-filter">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.75"
            numOctaves={3}
            stitchTiles="stitch"
          />
        </filter>
      </svg>

      <main
        className={`${isOpen ? "is-open" : ""} ${
          isBlooming ? "is-blooming" : ""
        } ${isSettled ? "is-settled" : ""}`}
      >
        <div className="bokeh" aria-hidden="true">
          <span className="bokeh-dot dot-1"></span>
          <span className="bokeh-dot dot-2"></span>
          <span className="bokeh-dot dot-3"></span>
          <span className="bokeh-dot dot-4"></span>
          <span className="bokeh-dot dot-5"></span>
          <span className="bokeh-dot dot-6"></span>
          <span className="bokeh-dot dot-7"></span>
          <span className="bokeh-dot dot-8"></span>
          <span className="bokeh-dot dot-9"></span>
          <span className="bokeh-dot dot-10"></span>
          <span className="bokeh-dot dot-11"></span>
          <span className="bokeh-dot dot-12"></span>
          <span className="bokeh-dot dot-13"></span>
          <span className="bokeh-dot dot-14"></span>
        </div>

        <section
          className="stage-initial"
          aria-label="Thiệp mời Lã Thu Phương"
        >
          <p className="eyebrow text-rose">một tối · một người</p>
          <h1 className="guest-name text-deep">Lã Thu Phương</h1>

          <div className="rose-container">
            <svg
              className="closed-rose"
              viewBox="0 0 200 260"
              aria-hidden="true"
            >
              <defs>
                <linearGradient
                  id="bud-grad"
                  x1="0%"
                  y1="0%"
                  x2="0%"
                  y2="100%"
                >
                  <stop offset="0%" stopColor="#f8d5df" />
                  <stop offset="100%" stopColor="#c45370" />
                </linearGradient>
              </defs>
              <path
                className="rose-stem"
                d="M100 110 C 97 150 106 195 94 250"
                fill="none"
                stroke="var(--leaf)"
                strokeWidth="2.6"
                strokeLinecap="round"
              />
              <path
                className="rose-leaf"
                d="M98 158 C 76 152 68 165 65 175 C 77 177 91 170 97 165"
                fill="var(--leaf)"
              />
              <path
                className="rose-leaf"
                d="M101 188 C 120 182 129 191 132 201 C 120 204 107 197 102 192"
                fill="var(--leaf)"
              />

              <path
                className="bud-petal bud-petal-1"
                d="M 100 110 C 65 105 60 72 75 48 C 88 38 98 48 100 60 Z"
                fill="url(#bud-grad)"
              />
              <path
                className="bud-petal bud-petal-2"
                d="M 100 110 C 135 105 140 72 125 48 C 112 38 102 48 100 60 Z"
                fill="url(#bud-grad)"
              />
              <path
                className="bud-petal bud-petal-3"
                d="M 100 110 C 75 102 70 65 84 42 C 95 35 102 45 100 70 Z"
                fill="url(#bud-grad)"
              />
              <path
                className="bud-petal bud-petal-4"
                d="M 100 110 C 125 102 130 65 116 42 C 105 35 98 45 100 70 Z"
                fill="url(#bud-grad)"
              />
              <path
                className="bud-petal bud-petal-5"
                d="M 100 110 C 88 95 86 58 100 36 C 114 58 112 95 100 110 Z"
                fill="url(#bud-grad)"
              />

              <circle
                className="svg-seal"
                cx="100"
                cy="84"
                r="14"
                fill="var(--rose)"
                stroke="var(--gold)"
                strokeWidth="1"
              />
            </svg>

            {!isBlooming && (
              <button
                id="seal-btn"
                className="seal-button bg-rose text-blush border-gold"
                type="button"
                onClick={handleOpen}
              >
                Mở thiệp
              </button>
            )}
          </div>
        </section>

        <motion.article
          className="letter-card bg-card text-ink"
          aria-label="Nội dung thư mời"
          initial={{ opacity: 0, scale: 0.92 }}
          animate={
            isBlooming
              ? { opacity: 0, scale: 0.85 }
              : isOpen
              ? { opacity: 1, scale: 1 }
              : { opacity: 0, scale: 0.92 }
          }
          transition={
            isBlooming
              ? { duration: 0.6, ease: [0.22, 1, 0.36, 1] }
              : { duration: 1.2, delay: 0.3, ease: [0.22, 1, 0.36, 1] }
          }
          style={{
            pointerEvents: isOpen && !isBlooming ? "auto" : "none",
          }}
        >
          <div className="letter-content">
            <p className="letter-greeting text-deep">Thu Phương,</p>
            <p className="letter-p1 text-ink">
              Tối nay anh không nhắn thêm một câu nữa.
            </p>
            <p className="letter-p2 text-ink">
              Anh muốn đứng giữa ánh đèn Vincom Royal, giữ một đóa hồng nhạt, và
              chờ đúng người mang tên em bước tới.
            </p>

            <div className="time-block border-l-rose">
              <span className="time-hour text-deep">19:30</span>
              <span className="time-place text-rose">
                Vincom Mega Mall Royal City
              </span>
              <span className="time-address text-ink">
                72A Nguyễn Trãi, Thanh Xuân
              </span>
            </div>

            <p className="letter-closing text-ink">
              Nếu em nói có, khu vườn này sẽ nở — chỉ vì em.
            </p>

            <div className="letter-actions">
              <button
                id="confirm-btn"
                className="confirm-button bg-rose text-blush"
                type="button"
                onClick={handleConfirm}
              >
                Em đi.
              </button>
            </div>
          </div>
        </motion.article>

        <canvas id="garden" ref={canvasRef} aria-hidden="true" />

        <motion.section
          className="final-message"
          aria-label="Lời hẹn tối nay"
          initial={{ opacity: 0, y: 16 }}
          animate={
            isSettled
              ? { opacity: 1, y: 0 }
              : { opacity: 0, y: 16 }
          }
          transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1] }}
          style={{
            pointerEvents: isSettled ? "auto" : "none",
          }}
        >
          <h2 className="final-line1 text-deep">Anh sẽ đón em.</h2>
          <p className="final-line2 text-rose">Vincom Royal · 19:30 tối nay</p>
          <p className="final-line3 text-ink">
            Cảm ơn em đã cho anh một đóa tối.
          </p>
        </motion.section>
      </main>
    </>
  );
}
