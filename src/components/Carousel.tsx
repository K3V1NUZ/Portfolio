"use client";

import { useEffect, useRef, useState } from "react";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";
import styles from "./Carousel.module.css";

export type Slide = {
  src?: string;          // 16:10 screenshot (1600 × 1000)
  video?: string;        // or a short muted, looping clip (mp4 / webm)
  alt: string;           // description; also the label of the placeholder when there's no src / video
  browser?: string;      // show the browser bar on top, with this text as the address
  placeholder?: string;  // custom placeholder text (default: "1600 × 1000")
};

// Seconds each slide stays before the carousel moves on by itself
const AUTOPLAY_S = 5;
// Horizontal swipe distance (px) one gesture needs before it turns a slide
const SWIPE_STEP = 60;
// A gesture ends after this long without wheel events (trackpad momentum keeps firing until then)
const GESTURE_END_MS = 220;

// Screenshot carousel: a horizontal scroll-snap track (touch swiping is native), arrows, dots,
// ←/→ keys when focused, and autoplay that pauses while you hover or focus it.
// Vertical scrolling is left alone, so the page or window scrolls straight past it.
export default function Carousel({ slides }: { slides: Slide[] }) {
  const rootRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [cycle, setCycle] = useState(0); // bumped on manual navigation to restart the timer
  const indexRef = useRef(0);
  const many = slides.length > 1;

  const scrollToSlide = (i: number) => {
    const track = trackRef.current!;
    track.scrollTo({ left: i * track.clientWidth, behavior: "smooth" });
  };
  // Wraps around at both ends; manual = restart the autoplay countdown
  const go = (i: number, manual = true) => {
    scrollToSlide((i + slides.length) % slides.length);
    if (manual) setCycle((c) => c + 1);
  };

  // Track position -> active dot; sideways trackpad swipes turn one slide per gesture
  useEffect(() => {
    const track = trackRef.current!;
    const onScroll = () => {
      indexRef.current = Math.round(track.scrollLeft / track.clientWidth);
      setIndex(indexRef.current);
    };
    let charge = 0, lastEvent = 0, used = false;
    const onWheel = (e: WheelEvent) => {
      if (Math.abs(e.deltaX) <= Math.abs(e.deltaY)) return; // vertical: let the page scroll on
      e.preventDefault();
      const now = performance.now();
      if (now - lastEvent > GESTURE_END_MS) { charge = 0; used = false; }
      lastEvent = now;
      if (used) return; // the rest of this gesture is momentum
      charge += Math.abs(e.deltaX);
      const dir = Math.sign(e.deltaX), next = indexRef.current + dir;
      if (charge >= SWIPE_STEP && next >= 0 && next < slides.length) {
        used = true;
        scrollToSlide(next);
        setCycle((c) => c + 1);
      }
    };
    track.addEventListener("scroll", onScroll, { passive: true });
    track.addEventListener("wheel", onWheel, { passive: false });
    return () => {
      track.removeEventListener("scroll", onScroll);
      track.removeEventListener("wheel", onWheel);
    };
  }, [slides.length]);

  // Autoplay. Skipped for reduced motion, while paused, when the tab is hidden,
  // and while a real video is showing (it plays through instead).
  const playingVideo = !!slides[index]?.video;
  const autoplay = many && !paused && !playingVideo;
  useEffect(() => {
    if (!autoplay || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = setTimeout(() => { if (!document.hidden) go(indexRef.current + 1, false); }, AUTOPLAY_S * 1000);
    return () => clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- restarts on every slide change / manual move
  }, [autoplay, index, cycle]);

  return (
    <div
      ref={rootRef}
      className={`${styles.carousel} ${autoplay ? styles.playing : ""}`}
      style={{ "--autoplay": `${AUTOPLAY_S}s` } as React.CSSProperties}
      role="region"
      aria-roledescription="carousel"
      aria-label="Screenshots"
      tabIndex={0}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={(e) => { if (!rootRef.current?.contains(e.relatedTarget as Node)) setPaused(false); }}
      onKeyDown={(e) => {
        if (e.key === "ArrowLeft") { e.preventDefault(); go(index - 1); }
        if (e.key === "ArrowRight") { e.preventDefault(); go(index + 1); }
      }}
    >
      <div ref={trackRef} className={styles.track}>
        {slides.map((s, i) => (
          <figure key={i} className={styles.slide} aria-roledescription="slide" aria-label={`${i + 1} of ${slides.length}`}>
            <div className={`${styles.frame} ${s.browser ? styles.framed : ""}`}>
              {s.browser && <span className={styles.bar}><i /><i /><i /><em>{s.browser}</em></span>}
              {s.video ? (
                <video src={s.video} className={styles.img} autoPlay muted loop playsInline aria-label={s.alt} />
              ) : s.src ? (
                // eslint-disable-next-line @next/next/no-img-element -- fixed 16:10 frame, plain img is simplest
                <img src={s.src} alt={s.alt} className={styles.img} loading={i ? "lazy" : "eager"} />
              ) : (
                <div className={styles.ph}>{s.alt}<br />{s.placeholder ?? "1600 × 1000"}</div>
              )}
            </div>
          </figure>
        ))}
      </div>

      {many && (
        <>
          <button type="button" className={`${styles.arrow} ${styles.prev}`} onClick={() => go(index - 1)} aria-label="Previous screenshot">
            <FiChevronLeft aria-hidden />
          </button>
          <button type="button" className={`${styles.arrow} ${styles.next}`} onClick={() => go(index + 1)} aria-label="Next screenshot">
            <FiChevronRight aria-hidden />
          </button>
          <div className={styles.dots}>
            {slides.map((_, i) => (
              // key changes with cycle so the active dot's progress fill restarts with the timer
              <button
                key={i === index ? `${i}-${cycle}` : i}
                type="button"
                aria-label={`Screenshot ${i + 1}`}
                aria-current={i === index}
                onClick={() => go(i)}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
