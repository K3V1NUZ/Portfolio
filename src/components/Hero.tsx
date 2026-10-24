"use client";

import { useEffect, useState } from "react";
import { FiFile, FiBriefcase, FiBarChart2, FiUser, FiClipboard, FiMapPin, FiMail, FiArrowUpRight, FiMoon, FiSun } from "react-icons/fi";
import { FaLinkedin, FaGithub } from "react-icons/fa";
import { useLang } from "@/lib/i18n";
import DotGrid from "./DotGrid";
import styles from "./Hero.module.css";

// TODO: real profile links
const EMAIL = "Daniel.keves.135@gmail.com";
const LINKEDIN = "https://www.linkedin.com/";
const GITHUB = "https://github.com/";

type Theme = "light" | "dark";

const TILT = 16; // max hover tilt of the hero buttons, in degrees
const NAME = "Daniel";

// Name letters swing along a short arc away from the side the cursor came in from.
// --side (1 = right, -1 = left) picks which side the pivot sits on (see .glyph in the CSS).
function setArcSide(e: React.PointerEvent<HTMLSpanElement>) {
  const r = e.currentTarget.getBoundingClientRect();
  const fromLeft = e.clientX < r.left + r.width / 2;
  e.currentTarget.style.setProperty("--side", fromLeft ? "1" : "-1");
}

function FlagSK() {
  return (
    <svg viewBox="0 0 900 600" aria-hidden>
      <rect width="900" height="600" fill="#ee1c25" />
      <rect width="900" height="400" fill="#0b4ea2" />
      <rect width="900" height="200" fill="#fff" />
      <path d="M232 128h208v186c0 92-58 136-104 160-46-24-104-68-104-160z" fill="#fff" />
      <path d="M248 144h176v170c0 78-48 116-88 138-40-22-88-60-88-138z" fill="#ee1c25" />
      <path d="M324 190h24v36h44v24h-44v26h56v24h-56v58h-24v-58h-56v-24h56v-26h-44v-24h44z" fill="#fff" />
      <path d="M262 392c20-34 50-36 74-12 24-24 54-22 74 12-20 34-48 50-74 62-26-12-54-28-74-62z" fill="#0b4ea2" />
    </svg>
  );
}

function FlagUK() {
  return (
    <svg viewBox="0 0 60 30" aria-hidden>
      <clipPath id="uk-s"><path d="M0 0v30h60V0z" /></clipPath>
      <clipPath id="uk-t"><path d="M30 15h30v15zv15H0zH0V0zV0h30z" /></clipPath>
      <g clipPath="url(#uk-s)">
        <path d="M0 0v30h60V0z" fill="#012169" />
        <path d="M0 0l60 30m0-30L0 30" stroke="#fff" strokeWidth="6" />
        <path d="M0 0l60 30m0-30L0 30" clipPath="url(#uk-t)" stroke="#C8102E" strokeWidth="4" />
        <path d="M30 0v30M0 15h60" stroke="#fff" strokeWidth="10" />
        <path d="M30 0v30M0 15h60" stroke="#C8102E" strokeWidth="6" />
      </g>
    </svg>
  );
}

export default function Hero() {
  const { lang, setLang, t } = useLang();
  const [theme, setTheme] = useState<Theme>("light");

  // The inline script in layout.tsx already applied the theme; just read it back
  useEffect(() => {
    setTheme(document.documentElement.dataset.theme === "dark" ? "dark" : "light");
  }, []);

  const applyTheme = (next: Theme) => {
    setTheme(next);
    document.documentElement.dataset.theme = next;
    try { localStorage.setItem("theme", next); } catch {}
  };

  // Hover tilt: the side of the button under the cursor dips toward it (mouse only)
  const tilt = (e: React.PointerEvent<HTMLAnchorElement>) => {
    if (e.pointerType !== "mouse" || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const el = e.currentTarget, r = el.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5;  // -0.5 … 0.5
    const y = (e.clientY - r.top) / r.height - 0.5;
    el.style.setProperty("--ry", `${(x * TILT).toFixed(2)}deg`);
    el.style.setProperty("--rx", `${(-y * TILT).toFixed(2)}deg`);
  };
  const untilt = (e: React.PointerEvent<HTMLAnchorElement>) => {
    e.currentTarget.style.setProperty("--rx", "0deg");
    e.currentTarget.style.setProperty("--ry", "0deg");
  };
  // GPU layer on before the tilt starts, off only once the button is flat again (see .live in the CSS)
  const goLive = (e: React.PointerEvent<HTMLAnchorElement>) => e.currentTarget.classList.add(styles.live);
  const settle = (e: React.TransitionEvent<HTMLAnchorElement>) => {
    // ignore the icon's own transform transition bubbling up
    if (e.target === e.currentTarget && e.propertyName === "transform" && !e.currentTarget.matches(":hover")) {
      e.currentTarget.classList.remove(styles.live);
    }
  };

  const nav = [
    { href: "#projects",   label: t.navProjects,   Icon: FiFile,      color: "#eab308" },
    { href: "#experience", label: t.navExperience, Icon: FiBriefcase, color: "#ea580c" },
    { href: "#tech-stack", label: t.navSkills,     Icon: FiBarChart2, color: "#ec4899" },
    { href: "#about",      label: t.navAbout,      Icon: FiUser,      color: "#9333ea" },
    // CV in the selected language (files in public/cv)
    { href: `/cv/Daniel_Keves_CV_${lang.toUpperCase()}.pdf`, label: t.navCv, Icon: FiClipboard, color: "#3b82f6", external: true },
  ];

  return (
    <section id="top" className={styles.hero}>
      <DotGrid />
      <header className={styles.top}>
        <span className={`chip ${styles.status}`}><i aria-hidden />{t.openToWork}</span>

        <div className={styles.toggles}>
          <div className="seg" role="group" aria-label="Language">
            <button type="button" aria-pressed={lang === "sk"} aria-label="Slovenčina" onClick={() => setLang("sk")}>
              <span className={styles.flag}><FlagSK /></span>
            </button>
            <button type="button" aria-pressed={lang === "en"} aria-label="English" onClick={() => setLang("en")}>
              <span className={styles.flag}><FlagUK /></span>
            </button>
          </div>
          <div className="seg" role="group" aria-label="Theme">
            <button type="button" aria-pressed={theme === "dark"} aria-label="Dark theme" onClick={() => applyTheme("dark")}>
              <FiMoon />
            </button>
            <button type="button" aria-pressed={theme === "light"} aria-label="Light theme" onClick={() => applyTheme("light")}>
              <FiSun />
            </button>
          </div>
        </div>
      </header>

      <div className={styles.center}>
        <p className={styles.hey}>{t.hey}</p>
        <h1 className={styles.name} aria-label={NAME}>
          {[...NAME].map((ch, i) => (
            // outer span = fixed hover area, inner .glyph is what moves (so it can't slip out from under the cursor)
            <span key={i} className={styles.letter} aria-hidden="true" onPointerEnter={setArcSide}>
              <span className={styles.glyph}>{ch}</span>
            </span>
          ))}
        </h1>
        <p className={styles.intro}>
          {t.introA}<b>{t.faculty}</b>{t.introB}<b>{t.uni}</b>{t.introC}<b>{t.field}</b>{t.introD}
        </p>

        <nav className={styles.nav} aria-label="Sections">
          {nav.map(({ href, label, Icon, color, external }) => (
            <a
              key={href}
              href={href}
              className={styles.navBtn}
              style={{ "--c": color } as React.CSSProperties}
              onPointerEnter={goLive}
              onPointerMove={tilt}
              onPointerLeave={untilt}
              onTransitionEnd={settle}
              {...(external ? { target: "_blank", rel: "noopener" } : {})}
            >
              <Icon aria-hidden />
              <span>{label}</span>
            </a>
          ))}
        </nav>
      </div>

      <a href="#projects" className={styles.mouse} aria-label={t.scroll}><span /></a>

      <footer className={styles.contact}>
        <span><FiMapPin aria-hidden />{t.location}</span>
        <a href={`mailto:${EMAIL}`}><FiMail aria-hidden />{EMAIL}</a>
        <a href={LINKEDIN} target="_blank" rel="noopener"><FaLinkedin aria-hidden />LinkedIn<FiArrowUpRight aria-hidden /></a>
        <a href={GITHUB} target="_blank" rel="noopener"><FaGithub aria-hidden />GitHub<FiArrowUpRight aria-hidden /></a>
      </footer>
    </section>
  );
}
