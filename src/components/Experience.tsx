"use client";

import { useEffect, useRef, useState } from "react";
import type { IconType } from "react-icons";
import { LuBriefcase, LuGraduationCap } from "react-icons/lu";
import styles from "./Experience.module.css";

type Kind = "work" | "school";
type Entry = {
  id: string;
  kind: Kind;
  date: string;
  title: string;
  org: string;
  bullets: string[];
  skills: string[];
};

// Draft content: the points are generic placeholders, replace them with what you actually did
const ENTRIES: Entry[] = [
  {
    id: "sporitelna", kind: "work", date: "Aug 2026 - Present",
    title: "IT Helpdesk / End-User Support", org: "Slovenská sporiteľňa · Bratislava",
    bullets: [
      "Help employees with their tech issues via email, phone and Jira tickets, and escalate complex problems to second-line teams with documented solutions",
      "Troubleshoot hardware, software, accounts and access issues",
      "Make sure offices and meeting rooms always have working, ready-to-use tech",
      "Refurbish older hardware to give computers a second life and keep tech out of the trash",
    ],
    skills: ["IT support", "Ticketing", "Troubleshooting", "Hardware", "Communication"],
  },
  {
    id: "fiit", kind: "school", date: "Sep 2026 - Present",
    title: "Applied Informatics, Bc.", org: "FIIT STU · Bratislava",
    bullets: [
      "Second year of the bachelor's programme in computer science",
      "Design and build end-to-end software projects in Java, C and Python, applying OOP principles and design patterns to write clean, maintainable code",
      "Implement and benchmark data structures and algorithms, focusing on performance and efficiency",
      "Collaborate in team projects, splitting tasks, reviewing each other's work and delivering on deadlines",
    ],
    skills: ["Analytical thinking", "Time management", "Adaptability", "Teamwork"],
  },
  {
    id: "freelance", kind: "work", date: "June 2025 - March 2026",
    title: "Freelance Web Developer", org: "Self-employed · Remote",
    bullets: [
      "Worked directly with clients to understand their needs and turn them into clear website concepts",
      "Designed UI/UX in Figma, from wireframes to polished, responsive layouts",
      "Built websites from first design to deployment, including hosting, domains and updates after launch",
      "Managed client communication, quotes and invoicing on my own",
    ],
    skills: ["UI/UX design", "Prototyping", "Client communication", "Project management"],
  },
];

const FILTERS: { key: "all" | Kind; label: string }[] = [
  { key: "all", label: "All" },
  { key: "work", label: "Work" },
  { key: "school", label: "School" },
];

const KIND: Record<Kind, { label: string; Icon: IconType }> = {
  work: { label: "Work", Icon: LuBriefcase },
  school: { label: "School", Icon: LuGraduationCap },
};

const pad = (n: number) => String(n).padStart(2, "0");

export default function Experience() {
  const [filter, setFilter] = useState<"all" | Kind>("all");
  const [reached, setReached] = useState<Set<string>>(new Set());
  const timelineRef = useRef<HTMLDivElement>(null);
  const beamRef = useRef<HTMLDivElement>(null);
  const markerRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const visible = ENTRIES.filter((e) => filter === "all" || e.kind === filter);

  useEffect(() => {
    const timeline = timelineRef.current!;
    const beam = beamRef.current!;

    // The line always ends at the spot where dots pin, so it reaches each dot
    // exactly when that entry's date starts sticking
    const update = () => {
      const marker = Object.values(markerRefs.current).find(Boolean);
      if (!marker) return;
      const pinLine =
        parseFloat(getComputedStyle(marker.parentElement!).top) +
        marker.offsetTop + marker.offsetHeight / 2;

      const r = timeline.getBoundingClientRect();
      const h = Math.min(r.height, Math.max(0, pinLine - r.top));
      beam.style.height = `${h}px`;
      beam.style.opacity = h > 0 ? "1" : "0";

      const next = new Set<string>();
      for (const [id, el] of Object.entries(markerRefs.current)) {
        if (!el) continue;
        const m = el.getBoundingClientRect();
        // +1px tolerance for sub-pixel rounding while pinned
        if (m.top + m.height / 2 <= pinLine + 1) next.add(id);
      }
      setReached((prev) =>
        prev.size === next.size && [...next].every((id) => prev.has(id)) ? prev : next
      );
    };

    update();
    addEventListener("scroll", update, { passive: true });
    addEventListener("resize", update);
    return () => {
      removeEventListener("scroll", update);
      removeEventListener("resize", update);
    };
  }, [filter]);

  return (
    <section id="experience" className={`container ${styles.exp}`}>
      <p className="kicker"><b>02</b><span>Experience</span></p>

      <div className="section-head">
        <h2 className="section-title">Work &amp; Education</h2>
        <div className={`seg ${styles.filters}`} role="group" aria-label="Filter entries">
          {FILTERS.map((f) => (
            <button
              key={f.key}
              type="button"
              aria-pressed={filter === f.key}
              className={f.key !== "all" ? styles[f.key] : undefined}
              onClick={() => setFilter(f.key)}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      <div ref={timelineRef} className={styles.timeline}>
        <div className={styles.track}>
          <div ref={beamRef} className={styles.beam} />
        </div>

        {visible.map((e, i) => {
          const { label, Icon } = KIND[e.kind];
          return (
          <div key={e.id} className={`${styles.item} ${styles[e.kind]} ${reached.has(e.id) ? styles.reached : ""}`}>
            {/* LEFT: sticks while this entry's card scrolls past, then moves on */}
            <div className={styles.left}>
              <div ref={(el) => { markerRefs.current[e.id] = el; }} className={styles.marker} />
              <h3 className={styles.date}>{e.date}</h3>
              <span className={styles.count}>{pad(i + 1)} / {pad(visible.length)}</span>
            </div>

            {/* RIGHT: scrolls normally */}
            <div className={styles.right}>
              <p className={styles.dateMobile}>{e.date}</p>
              <article className={styles.card}>
                <div className={styles.cardHead}>
                  <div>
                    <h3 className={styles.title}>{e.title}</h3>
                    <p className={styles.org}>{e.org}</p>
                  </div>
                  <span className={styles.kind}><Icon aria-hidden />{label}</span>
                </div>
                <ul className={styles.points}>
                  {e.bullets.map((b) => <li key={b}>{b}</li>)}
                </ul>
                <div className={styles.badges} aria-label="Skills">
                  {e.skills.map((s) => <span key={s}>{s}</span>)}
                </div>
              </article>
            </div>
          </div>
          );
        })}
      </div>
    </section>
  );
}
