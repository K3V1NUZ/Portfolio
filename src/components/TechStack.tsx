"use client";

import { useEffect, useRef, useState } from "react";
import type { IconType } from "react-icons";
import {
  SiC, SiPython, SiJavascript, SiTypescript, SiHtml5, SiTailwindcss, SiOpenjdk,
  SiReact, SiNextdotjs, SiSupabase, SiVercel, SiGit, SiGnubash, SiGithub, SiClaude, SiFigma,
  SiNotion, SiJira,
} from "react-icons/si";
// Logos Simple Icons doesn't have (or only has in a different style) come from other sets
import { BsOpenai } from "react-icons/bs";
import { DiIllustrator, DiPhotoshop } from "react-icons/di";
import { FaCss3Alt } from "react-icons/fa";
import { VscVscode } from "react-icons/vsc";
import styles from "./TechStack.module.css";

// Four-colour Microsoft squares, standing in for Word / Excel / PowerPoint / Teams
const MicrosoftLogo: IconType = (props) => (
  <svg viewBox="0 0 23 23" width="1em" height="1em" aria-hidden={props["aria-hidden"]}>
    <path fill="#F25022" d="M1 1h10v10H1z" />
    <path fill="#7FBA00" d="M12 1h10v10H12z" />
    <path fill="#00A4EF" d="M1 12h10v10H1z" />
    <path fill="#FFB900" d="M12 12h10v10H12z" />
  </svg>
);

// color: brand color, or "currentColor" for near-black logos so they work in dark mode
type Tech = { name: string; Icon: IconType; color: string };

const STACK: Tech[] = [
  // languages
  { name: "Python",       Icon: SiPython,      color: "#3776AB" },
  { name: "C",            Icon: SiC,           color: "#A8B9CC" },
  { name: "JavaScript",   Icon: SiJavascript,  color: "#F7DF1E" },
  { name: "TypeScript",   Icon: SiTypescript,  color: "#3178C6" },
  { name: "HTML",         Icon: SiHtml5,       color: "#E34F26" },
  { name: "CSS",          Icon: FaCss3Alt,     color: "#1572B6" },
  { name: "Tailwind CSS", Icon: SiTailwindcss, color: "#06B6D4" },
  { name: "Java",         Icon: SiOpenjdk,     color: "currentColor" },
  // frameworks & platforms
  { name: "React",        Icon: SiReact,       color: "#61DAFB" },
  { name: "Next.js",      Icon: SiNextdotjs,   color: "currentColor" },
  { name: "Supabase",     Icon: SiSupabase,    color: "#3FCF8E" },
  { name: "Vercel",       Icon: SiVercel,      color: "currentColor" },
  // tools
  { name: "VS Code",      Icon: VscVscode,     color: "#007ACC" },
  { name: "Git",          Icon: SiGit,         color: "#F05032" },
  { name: "Bash",         Icon: SiGnubash,     color: "#4EAA25" },
  { name: "GitHub",       Icon: SiGithub,      color: "currentColor" },
  { name: "Jira",         Icon: SiJira,        color: "#0052CC" },
  { name: "Notion",       Icon: SiNotion,      color: "currentColor" },
  { name: "Microsoft 365", Icon: MicrosoftLogo, color: "" },
  // AI
  { name: "Claude Code",  Icon: SiClaude,      color: "#D97757" },
  { name: "Codex",        Icon: BsOpenai,      color: "currentColor" },
  // design
  { name: "Figma",        Icon: SiFigma,       color: "#F24E1E" },
  { name: "Illustrator",  Icon: DiIllustrator, color: "#FF9A00" },
  { name: "Photoshop",    Icon: DiPhotoshop,   color: "#31A8FF" },
];

const IDLE_SIZE  = 26;   // bracket box size when not on an icon
const PAD        = -6;   // bracket inset from the hit area (negative = tighter)
const FRAME_PULL = 0.08; // how much the snapped frame leans toward the pointer
const HOVER_PULL = 0.25; // how strongly the hovered icon follows the pointer
const NEAR_PULL  = 0.14; // how strongly nearby icons lean toward the pointer
const RADIUS     = 200;  // px — icons closer than this react

export default function TechStack() {
  const sectionRef = useRef<HTMLElement>(null);
  const cursorRef = useRef<HTMLDivElement>(null);
  const dotRef = useRef<HTMLDivElement>(null);
  const tileRefs = useRef<(HTMLDivElement | null)[]>([]);
  const activeRef = useRef<HTMLDivElement | null>(null);
  const resetBoxRef = useRef<(x: number, y: number) => void>(() => {});
  const shownRef = useRef(false);

  const [label, setLabel] = useState("");
  const [snapped, setSnapped] = useState(false);
  const [visible, setVisible] = useState(false);
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    // Only on mouse devices — touch keeps the plain grid
    if (!matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    setEnabled(true);

    const section = sectionRef.current!;
    const cursor = cursorRef.current!;
    const dot = dotRef.current!;
    const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const EASE = reduced ? 1 : 0.2;
    const ICON_EASE = reduced ? 1 : 0.12;

    const mouse = { x: 0, y: 0 };
    const box = { x: 0, y: 0, w: IDLE_SIZE, h: IDLE_SIZE };
    const offsets = STACK.map(() => ({ x: 0, y: 0 }));
    let inside = false;
    let raf = 0;

    const onMove = (e: MouseEvent) => { mouse.x = e.clientX; mouse.y = e.clientY; };
    // Section: only drives the magnetic icons, the system cursor stays
    const onEnter = () => { inside = true; };
    const onLeave = () => {
      inside = false;
      activeRef.current = null;
      setVisible(false);
      setSnapped(false);
    };
    // Called when the pointer lands on an icon from outside the icons
    resetBoxRef.current = (x: number, y: number) => {
      box.x = x - IDLE_SIZE / 2; // grow the brackets out from the pointer
      box.y = y - IDLE_SIZE / 2;
      box.w = box.h = IDLE_SIZE;
    };

    const frame = () => {
      // 1) Icons: hovered one follows strongly, nearby ones lean in, far ones rest
      tileRefs.current.forEach((tile, i) => {
        if (!tile) return;
        const r = tile.getBoundingClientRect();
        const dx = mouse.x - (r.left + r.width / 2);
        const dy = mouse.y - (r.top + r.height / 2);
        const dist = Math.hypot(dx, dy);
        let k = 0;
        if (inside) {
          if (tile === activeRef.current) k = HOVER_PULL;
          else if (dist < RADIUS) k = NEAR_PULL * (1 - dist / RADIUS);
        }
        const o = offsets[i];
        o.x += (dx * k - o.x) * ICON_EASE;
        o.y += (dy * k - o.y) * ICON_EASE;
        (tile.firstElementChild as HTMLElement).style.transform =
          `translate(${o.x}px, ${o.y}px)`;
      });

      // 2) Brackets: snap to the hovered tile, otherwise a small box on the pointer
      let tx: number, ty: number, tw: number, th: number;
      const active = activeRef.current;
      if (active) {
        const r = active.getBoundingClientRect(); // re-read each frame so scroll works
        const dx = mouse.x - (r.left + r.width / 2);
        const dy = mouse.y - (r.top + r.height / 2);
        tx = r.left - PAD + dx * FRAME_PULL;
        ty = r.top - PAD + dy * FRAME_PULL;
        tw = r.width + PAD * 2;
        th = r.height + PAD * 2;
      } else {
        tx = mouse.x - IDLE_SIZE / 2;
        ty = mouse.y - IDLE_SIZE / 2;
        tw = th = IDLE_SIZE;
      }
      box.x += (tx - box.x) * EASE;
      box.y += (ty - box.y) * EASE;
      box.w += (tw - box.w) * EASE;
      box.h += (th - box.h) * EASE;

      if (active) {
        cursor.style.transform = `translate3d(${box.x}px, ${box.y}px, 0)`;
        cursor.style.width = `${box.w}px`;
        cursor.style.height = `${box.h}px`;
        dot.style.transform = `translate3d(${mouse.x}px, ${mouse.y}px, 0)`;
      }
      raf = requestAnimationFrame(frame);
    };

    window.addEventListener("mousemove", onMove);
    section.addEventListener("mouseenter", onEnter);
    section.addEventListener("mouseleave", onLeave);
    raf = requestAnimationFrame(frame);

    return () => {
      window.removeEventListener("mousemove", onMove);
      section.removeEventListener("mouseenter", onEnter);
      section.removeEventListener("mouseleave", onLeave);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      id="tech-stack"
      className={`container ${styles.stack} ${enabled ? styles.customCursor : ""}`}
    >
      <div>
        <p className="kicker"><b>03</b><span>Tech stack</span></p>
        <div className="section-head">
          <h2 className="section-title">What I use</h2>
          <span className="chip">{STACK.length} tools</span>
        </div>
      </div>

      <div className={styles.grid}>
        {STACK.map(({ name, Icon, color }, i) => (
          <div
            key={name}
            ref={(el) => { tileRefs.current[i] = el; }}
            tabIndex={0}
            aria-label={name}
            className={styles.tile}
            onMouseEnter={(e) => {
              if (!shownRef.current) resetBoxRef.current(e.clientX, e.clientY);
              shownRef.current = true;
              activeRef.current = e.currentTarget;
              setLabel(name);
              setSnapped(true);
              setVisible(true);
            }}
            onMouseLeave={(e) => {
              if (activeRef.current === e.currentTarget) activeRef.current = null;
              // React batches this with the next icon's enter, so no flicker
              shownRef.current = false;
              setSnapped(false);
              setVisible(false);
            }}
          >
            <span className={styles.glyph}>
              <Icon color={color} aria-hidden />
            </span>
          </div>
        ))}
      </div>

      {/* Cursor pieces — position: fixed, so they can sit anywhere in the tree */}
      <div
        ref={cursorRef}
        aria-hidden="true"
        className={`${styles.cursor} ${visible ? styles.show : ""} ${snapped ? styles.snapped : ""}`}
      >
        <span className={`${styles.corner} ${styles.tl}`} />
        <span className={`${styles.corner} ${styles.tr}`} />
        <span className={`${styles.corner} ${styles.bl}`} />
        <span className={`${styles.corner} ${styles.br}`} />
        <span className={styles.label}>{label}</span>
      </div>
      <div
        ref={dotRef}
        aria-hidden="true"
        className={`${styles.dot} ${visible ? styles.show : ""}`}
      />
    </section>
  );
}
