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

  const playPhrase = () => {
    try {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext })
          .webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();

      const schedule = () => {
        try {
          const now = ctx.currentTime;

          const masterGain = ctx.createGain();
          masterGain.gain.setValueAtTime(0.07, now);
          masterGain.connect(ctx.destination);

          const delay = ctx.createDelay();
          delay.delayTime.setValueAtTime(0.23, now);

          const delayFilter = ctx.createBiquadFilter();
          delayFilter.type = "lowpass";
          delayFilter.frequency.setValueAtTime(1400, now);

          const feedback = ctx.createGain();
          feedback.gain.setValueAtTime(0.2, now);

          const wetGain = ctx.createGain();
          wetGain.gain.setValueAtTime(0.25, now);

          masterGain.connect(delay);
          delay.connect(delayFilter);
          delayFilter.connect(feedback);
          feedback.connect(delay);
          delayFilter.connect(wetGain);
          wetGain.connect(ctx.destination);

          const notes = [
            { freq: 329.63, offset: 0 },
            { freq: 392, offset: 0.18 },
            { freq: 493.88, offset: 0.36 },
            { freq: 587.33, offset: 0.58 },
          ];
          const noteDuration = 1.8;
          const partialMultiples = [1, 2, 3.01, 4.02];
          const partialGains = [1, 0.4, 0.15, 0.05];

          for (let i = 0; i < notes.length; i++) {
            const { freq, offset } = notes[i];
            const startTime = now + offset;
            const stopTime = startTime + noteDuration;

            const noteGain = ctx.createGain();
            noteGain.gain.setValueAtTime(0.0001, startTime);
            noteGain.gain.exponentialRampToValueAtTime(0.2, startTime + 0.04);
            noteGain.gain.exponentialRampToValueAtTime(0.0001, stopTime);

            const filter = ctx.createBiquadFilter();
            filter.type = "lowpass";
            filter.frequency.setValueAtTime(1600, startTime);
            filter.frequency.exponentialRampToValueAtTime(800, stopTime);

            noteGain.connect(filter);
            filter.connect(masterGain);

            for (let p = 0; p < partialMultiples.length; p++) {
              const osc = ctx.createOscillator();
              osc.type = "sine";
              osc.frequency.setValueAtTime(freq * partialMultiples[p], startTime);

              const pGain = ctx.createGain();
              pGain.gain.setValueAtTime(partialGains[p], startTime);

              osc.connect(pGain);
              pGain.connect(noteGain);

              osc.start(startTime);
              osc.stop(stopTime);
            }
          }

          setTimeout(() => {
            try {
              ctx.close();
            } catch (_) {}
          }, 3200);
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

    playPhrase();
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
          <p className="eyebrow text-rose">tối nay</p>
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
            <motion.p
              className="letter-greeting text-deep"
              initial={{ opacity: 0, y: 12 }}
              animate={isOpen ? { opacity: 1, y: 0 } : { opacity: 0, y: 12 }}
              transition={{
                duration: 0.7,
                delay: 0.28,
                ease: [0.22, 1, 0.36, 1],
              }}
            >
              Thu Phương,
            </motion.p>
            <motion.p
              className="letter-p1 text-ink"
              initial={{ opacity: 0, y: 12 }}
              animate={isOpen ? { opacity: 1, y: 0 } : { opacity: 0, y: 12 }}
              transition={{
                duration: 0.7,
                delay: 0.39,
                ease: [0.22, 1, 0.36, 1],
              }}
            >
              Tối nay anh muốn gặp em.
            </motion.p>
            <motion.p
              className="letter-p2 text-ink"
              initial={{ opacity: 0, y: 12 }}
              animate={isOpen ? { opacity: 1, y: 0 } : { opacity: 0, y: 12 }}
              transition={{
                duration: 0.7,
                delay: 0.5,
                ease: [0.22, 1, 0.36, 1],
              }}
            >
              19:30 ở Vincom Royal. Mình đi một vòng, ngồi lại nói chuyện. Anh đợi ở sảnh.
            </motion.p>

            <motion.div
              className="time-block border-l-rose"
              initial={{ opacity: 0, y: 12 }}
              animate={isOpen ? { opacity: 1, y: 0 } : { opacity: 0, y: 12 }}
              transition={{
                duration: 0.7,
                delay: 0.61,
                ease: [0.22, 1, 0.36, 1],
              }}
            >
              <span className="time-hour text-deep">19:30</span>
              <span className="time-place text-rose">
                Vincom Mega Mall Royal City
              </span>
              <span className="time-address text-ink">
                72A Nguyễn Trãi, Thanh Xuân
              </span>
            </motion.div>

            <motion.p
              className="letter-closing text-ink"
              initial={{ opacity: 0, y: 12 }}
              animate={isOpen ? { opacity: 1, y: 0 } : { opacity: 0, y: 12 }}
              transition={{
                duration: 0.7,
                delay: 0.72,
                ease: [0.22, 1, 0.36, 1],
              }}
            >
              Em đi được không?
            </motion.p>

            <div className="letter-actions">
              <motion.button
                id="confirm-btn"
                className="confirm-button bg-rose text-blush"
                type="button"
                onClick={handleConfirm}
                initial={{ opacity: 0, y: 12 }}
                animate={isOpen ? { opacity: 1, y: 0 } : { opacity: 0, y: 12 }}
                transition={{
                  duration: 0.7,
                  delay: 0.83,
                  ease: [0.22, 1, 0.36, 1],
                }}
              >
                Được, mình đi.
              </motion.button>
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
          <h2 className="final-line1 text-deep">Vậy tối nay gặp nhau.</h2>
          <p className="final-line2 text-rose">Vincom Royal · 19:30</p>
          <p className="final-line3 text-ink">Anh đứng ở sảnh.</p>
        </motion.section>
      </main>
    </>
  );
}
