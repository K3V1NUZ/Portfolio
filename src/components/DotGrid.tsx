"use client";

import { useEffect, useRef } from "react";
import styles from "./DotGrid.module.css";

// Dotted background for its parent element, drawn on a canvas so dots can react:
// - hover (mouse only): dots near the pointer grow and darken, like catching light
// - click / tap: a water-drop ripple pushes the dots out and back as it spreads
// The parent keeps a CSS dot background for first paint; it's hidden once this mounts.

const GAP = 26;            // grid spacing, matches the CSS fallback
const BASE_R = 1.2;        // dot radius at rest
const GLOW_RADIUS = 170;   // px around the pointer that react
const GLOW_STRENGTH = 0.4; // 0..1, how much hovered dots darken / grow (ripples stay full strength)
const RIPPLE_SPEED = 520;  // px per second
const RIPPLE_WIDTH = 44;   // thickness of the wave front
const RIPPLE_PUSH = 9;     // max px a dot is pushed by the wave
const RIPPLE_LIFE = 2.2;   // seconds until a ripple has faded out
const MAX_RIPPLES = 6;
// Clicks on these don't make a ripple: only the bare background does.
// h1 is kept free for its own name animation; footer = the contact strip.
const NO_RIPPLE = "a, button, input, label, select, textarea, [role='button'], footer, h1";
// While the pointer is over one of these, the hover glow fades out
const NO_GLOW = "a, button, [role='button']";

export default function DotGrid() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current!;
    const host = canvas.parentElement!;
    const ctx = canvas.getContext("2d")!;
    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const fine = matchMedia("(hover: hover) and (pointer: fine)").matches;
    host.dataset.dots = "canvas";

    let w = 0, h = 0, raf = 0;
    let px = new Float32Array(0), py = new Float32Array(0), glow = new Float32Array(0);
    const colors = { dot: "#ccc", fg: "#111" };
    const mouse = { x: 0, y: 0, on: false, k: 0 }; // k eases toward on (0..1)
    const ripples: { x: number; y: number; t0: number }[] = [];

    const readColors = () => {
      const cs = getComputedStyle(host);
      colors.dot = cs.getPropertyValue("--grid-dot").trim() || colors.dot;
      colors.fg = cs.getPropertyValue("--fg").trim() || colors.fg;
    };

    const draw = (now: number) => {
      raf = 0;
      const t = now / 1000;
      const target = mouse.on ? 1 : 0;
      mouse.k += (target - mouse.k) * (reduce ? 1 : 0.14);
      if (Math.abs(target - mouse.k) <= 0.002) mouse.k = target; // land exactly, so the last frame is clean
      for (let i = ripples.length - 1; i >= 0; i--) if (t - ripples[i].t0 > RIPPLE_LIFE) ripples.splice(i, 1);

      const cols = Math.ceil(w / GAP), rows = Math.ceil(h / GAP), n = cols * rows;
      if (px.length < n) { px = new Float32Array(n); py = new Float32Array(n); glow = new Float32Array(n); }

      // 1) positions + highlight per dot
      for (let r = 0, i = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++, i++) {
          const x0 = GAP / 2 + c * GAP, y0 = GAP / 2 + r * GAP;
          let x = x0, y = y0, g = 0;

          if (mouse.k > 0.001) {
            const d = Math.hypot(x0 - mouse.x, y0 - mouse.y);
            if (d < GLOW_RADIUS) { const q = 1 - d / GLOW_RADIUS; g = GLOW_STRENGTH * mouse.k * q * q * (3 - 2 * q); }
          }

          for (const rp of ripples) {
            const age = t - rp.t0;
            const dx = x0 - rp.x, dy = y0 - rp.y, d = Math.hypot(dx, dy) || 1;
            const off = d - age * RIPPLE_SPEED;                 // distance from the wave front
            if (off > RIPPLE_WIDTH * 3 || off < -RIPPLE_WIDTH * 3) continue;
            const fade = (1 - age / RIPPLE_LIFE) ** 2;
            const env = Math.exp(-(off * off) / (2 * RIPPLE_WIDTH * RIPPLE_WIDTH));
            // derivative-of-gaussian: dots ahead of the front are pushed out, behind it pulled back
            const push = RIPPLE_PUSH * fade * (-off / RIPPLE_WIDTH) * env * 1.65;
            x += (dx / d) * push; y += (dy / d) * push;
            g = Math.max(g, fade * env);
          }
          px[i] = x; py[i] = y; glow[i] = g;
        }
      }

      // 2) base dots in one path, then highlighted ones on top
      ctx.clearRect(0, 0, w, h);
      ctx.globalAlpha = 1;
      ctx.fillStyle = colors.dot;
      ctx.beginPath();
      for (let i = 0; i < n; i++) {
        const rad = BASE_R + glow[i] * 1.1;
        ctx.moveTo(px[i] + rad, py[i]);
        ctx.arc(px[i], py[i], rad, 0, Math.PI * 2);
      }
      ctx.fill();
      ctx.fillStyle = colors.fg;
      for (let i = 0; i < n; i++) {
        if (glow[i] < 0.02) continue;
        ctx.globalAlpha = glow[i] * 0.75;
        ctx.beginPath();
        ctx.arc(px[i], py[i], BASE_R + glow[i] * 1.1, 0, Math.PI * 2);
        ctx.fill();
      }

      // keep animating only while something is moving
      if (ripples.length || Math.abs((mouse.on ? 1 : 0) - mouse.k) > 0.002) raf = requestAnimationFrame(draw);
    };
    const kick = () => { if (!raf) raf = requestAnimationFrame(draw); };

    const resize = () => {
      const r = host.getBoundingClientRect();
      const dpr = Math.min(devicePixelRatio || 1, 2);
      w = r.width; h = r.height;
      canvas.width = Math.round(w * dpr); canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      kick();
    };

    const local = (e: PointerEvent) => {
      const r = host.getBoundingClientRect();
      return { x: e.clientX - r.left, y: e.clientY - r.top };
    };
    const onMove = (e: PointerEvent) => {
      if (!fine || e.pointerType !== "mouse") return;
      Object.assign(mouse, local(e), { on: !(e.target as Element).closest(NO_GLOW) });
      kick();
    };
    const onLeave = () => { mouse.on = false; kick(); };
    const onDown = (e: PointerEvent) => {
      if (reduce || (e.target as Element).closest(NO_RIPPLE)) return;
      if (ripples.length >= MAX_RIPPLES) ripples.shift();
      ripples.push({ ...local(e), t0: performance.now() / 1000 });
      kick();
    };

    readColors();
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(host);
    // theme toggle flips data-theme on <html>: re-read the colours
    const mo = new MutationObserver(() => { readColors(); kick(); });
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
    host.addEventListener("pointermove", onMove);
    host.addEventListener("pointerleave", onLeave);
    host.addEventListener("pointerdown", onDown);

    return () => {
      ro.disconnect(); mo.disconnect();
      host.removeEventListener("pointermove", onMove);
      host.removeEventListener("pointerleave", onLeave);
      host.removeEventListener("pointerdown", onDown);
      cancelAnimationFrame(raf);
      delete host.dataset.dots;
    };
  }, []);

  return <canvas ref={canvasRef} className={styles.canvas} aria-hidden="true" />;
}
