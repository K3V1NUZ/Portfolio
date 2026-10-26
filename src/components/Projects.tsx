"use client";

import { useEffect, useRef, useState } from "react";
import ProjectModal from "./ProjectModal";
import PartyGames from "./projects/PartyGames";
import styles from "./Projects.module.css";

type Project = {
  id: string;
  title: string;
  kind: string;          // small label top-left, e.g. "Web app · 4 parts"
  year: string;
  role: string;
  description: string;
  tags: string[];
  link?: { href: string; label: string };
  url?: string;          // shown in the browser bar; omit for an app-only card
  desktop?: string;      // browser screenshot in /public (16:10, e.g. 1600 × 1000)
  phones: 0 | 1 | 2;
  phone?: string;        // phone screenshot in /public (9:19.5, or 19.5:9 when landscape)
  landscape?: boolean;   // phones turned sideways (video mode)
  details?: React.ReactNode; // case study; when set, clicking the card opens it in a window
};

// Draft content: edit freely. Screenshots will replace the striped placeholders.
const PROJECTS: Project[] = [
  {
    id: "one", title: "Project one", kind: "Web app · 4 parts", year: "2026",
    role: "Your role on this project",
    description: "One or two sentences about what this project does and who it is for.",
    tags: ["Next.js", "TypeScript", "Supabase"], link: { href: "#", label: "Visit site ↗" },
    url: "project-one.com", phones: 2,
  },
  {
    id: "two", title: "Project two", kind: "Website · 2 parts", year: "2025",
    role: "Your role on this project",
    description: "A website-only card. With no phones, the browser window takes the full width of the picture area.",
    tags: ["React", "Tailwind CSS"], link: { href: "#", label: "Visit site ↗" },
    url: "project-two.sk", phones: 0,
  },
  {
    id: "three", title: "Project three", kind: "Mobile app · 3 parts", year: "2025",
    role: "Your role on this project",
    description: "An app-only card. With no browser, the phones are centred and use the full height.",
    tags: ["React Native", "Expo"], link: { href: "#", label: "Store page ↗" },
    phones: 2,
  },
  {
    id: "party-games", title: "Party Games", kind: "Multiplayer web game · 3 games", year: "2026",
    role: "Solo project · design, front end and game server",
    description: "A Jackbox-style party platform: the TV shows the game and everyone's phone becomes the controller. No apps, no accounts, just scan the QR code.",
    tags: ["TypeScript", "React", "Socket.IO", "Node.js", "Zod"],
    link: { href: "https://github.com/K3V1NUZ/party-game", label: "View code on GitHub ↗" },
    url: "192.168.2.207:5173/host/GSXS", desktop: "/projects/project-four-desktop.webp",
    phones: 1, phone: "/projects/project-four-phone.png", landscape: true,
    details: <PartyGames />,
  },
  {
    id: "five", title: "Project five", kind: "Dashboard · 2 parts", year: "2024",
    role: "Your role on this project",
    description: "The last card never shrinks, because nothing scrolls over it.",
    tags: ["Python", "FastAPI"], link: { href: "#", label: "Visit site ↗" },
    url: "dashboard.project-five.io", phones: 2,
  },
];

const COLORS = ["var(--c1)", "var(--c2)", "var(--c3)", "var(--c4)", "var(--c5)"];

// Wheel "charge" needed before snapping. One mouse-wheel notch is ~100px, so 250 ≈ 3 notches.
const SNAP_DISTANCE = 250;
const RESET_AFTER = 600; // ms of no scrolling before the charge drains to 0

export default function Projects() {
  const sectionRef = useRef<HTMLElement>(null);
  const stackRef = useRef<HTMLDivElement>(null);
  const [openId, setOpenId] = useState<string | null>(null);
  const openIndex = PROJECTS.findIndex((p) => p.id === openId);
  const open = openIndex >= 0 ? PROJECTS[openIndex] : null;

  useEffect(() => {
    const section = sectionRef.current!;
    const stack = stackRef.current!;
    const cards = [...stack.querySelectorAll<HTMLElement>("article")];
    const reduce = matchMedia("(prefers-reduced-motion: reduce)");

    // ---- shrink + darken the card being covered ----
    let queued = false;
    const stackFx = () => {
      queued = false;
      cards.forEach((c, i) => {
        const next = cards[i + 1];
        if (!next || reduce.matches) { c.style.transform = ""; c.style.setProperty("--dim", "0"); return; }
        // k: 0 when the next card is far below, 1 when it has covered this one
        const k = Math.min(1, Math.max(0, 1 - (next.getBoundingClientRect().top - 80) / (innerHeight * 0.7)));
        c.style.transform = `scale(${1 - k * 0.07})`;
        c.style.setProperty("--dim", (k * 0.4).toFixed(3));
      });
    };
    const onScroll = () => { if (!queued) { queued = true; requestAnimationFrame(stackFx); } };

    // ---- snapping (paged scrolling) ----
    // Cards are sticky, so their live position is useless. Add up card heights
    // to find where each card *lands* at its sticky offset.
    const docTop = (el: Element) => el.getBoundingClientRect().top + scrollY;
    const cardStops = () => {
      const gap = parseFloat(getComputedStyle(stack).rowGap) || 0;
      const base = docTop(stack);
      let y = 0;
      const s = cards.map((c) => {
        const top = base + y - (parseFloat(getComputedStyle(c).top) || 0);
        y += c.offsetHeight + gap;
        return top;
      });
      return [0, docTop(section), ...s];
    };
    // Going down, the last stop is the top of the next section, so the stack hands
    // off cleanly instead of free-scrolling past it. Going up there is no such stop:
    // the page scrolls normally until it is back at the last card.
    const nextSectionTop = () => {
      const after = section.nextElementSibling;
      return after ? docTop(after) : null;
    };
    const stops = (dir: number) => {
      const next = dir > 0 ? nextSectionTop() : null;
      return [...cardStops(), ...(next != null ? [next] : [])]
        .map(Math.round).filter((v, i, a) => a.indexOf(v) === i).sort((a, b) => a - b);
    };
    const lastCardStop = () => Math.round(cardStops().at(-1)!);

    // Own smooth scroll, so we control speed and easing
    const ease = (x: number) => 1 - Math.pow(1 - x, 4);
    let anim: { to: number; k: number; raf: number } | null = null;
    const animateTo = (target: number) => {
      const from = scrollY;
      const to = Math.max(0, Math.min(target, document.documentElement.scrollHeight - innerHeight));
      const dur = reduce.matches ? 0 : Math.min(760, 480 + Math.abs(to - from) * 0.12);
      const t0 = performance.now();
      if (anim) cancelAnimationFrame(anim.raf);
      const a = (anim = { to, k: 0, raf: 0 });
      const step = (now: number) => {
        const k = dur ? Math.min(1, (now - t0) / dur) : 1;
        a.k = k;
        scrollTo({ top: from + (to - from) * ease(k), behavior: "instant" });
        if (k < 1) a.raf = requestAnimationFrame(step); else if (anim === a) anim = null;
      };
      a.raf = requestAnimationFrame(step);
    };

    // Down: paged until the next section's top. Up: paged only from the last card upward.
    const paged = (dir: number) => {
      if (dir < 0) return scrollY <= lastCardStop() + 2;
      const next = nextSectionTop();
      return scrollY < (next != null ? Math.round(next) : lastCardStop()) - 2;
    };
    const page = (dir: number) => {
      const y = anim ? anim.to : scrollY, s = stops(dir);
      const next = dir > 0 ? s.find((v) => v > y + 4) : [...s].reverse().find((v) => v < y - 4);
      if (next != null) animateTo(next);
    };

    // Wheel / trackpad: scrolling builds a "charge"; snap once it passes SNAP_DISTANCE
    // While a case-study window is open, leave scrolling and keys to it
    const modalOpen = () => document.querySelector("dialog[open]") !== null;

    let charge = 0, lastWheel = 0, lastAbs = 0, lastDir = 0, locked = false;
    const onWheel = (e: WheelEvent) => {
      if (e.ctrlKey || modalOpen()) return; // let pinch-zoom / the open window through
      const dir = Math.sign(e.deltaY);
      if (!dir) return;

      const now = performance.now();
      // Firefox can report lines (deltaMode 1) instead of pixels
      const abs = Math.abs(e.deltaY) * (e.deltaMode === 1 ? 40 : e.deltaMode === 2 ? innerHeight : 1);
      // "Fresh" = a new gesture. Trackpad inertia is a steady fade, so it never counts as fresh.
      const fresh = now - lastWheel > 180 || dir !== lastDir || abs > lastAbs * 1.4 + 4;
      if (now - lastWheel > RESET_AFTER || dir !== lastDir) charge = 0;
      lastWheel = now; lastAbs = abs; lastDir = dir;

      // After a snap, swallow the rest of that gesture (inertia) until a fresh one starts.
      // Checked before paged(), so landing on the last stop doesn't let momentum carry past it.
      if (locked) {
        if (fresh && !(anim && anim.k < 0.6)) locked = false;
        else { e.preventDefault(); return; }
      }
      if (!paged(dir)) return;
      e.preventDefault();

      charge += abs;
      if (charge >= SNAP_DISTANCE) { charge = 0; locked = true; page(dir); }
    };

    // Keyboard: arrows, Page Up/Down, space
    const onKey = (e: KeyboardEvent) => {
      const dir = ({ ArrowDown: 1, PageDown: 1, " ": e.shiftKey ? -1 : 1, ArrowUp: -1, PageUp: -1 } as Record<string, number>)[e.key];
      if (!dir || modalOpen() || !paged(dir)) return;
      if (e.key === " " && (document.activeElement as HTMLElement | null)?.closest("a, button, [role='button']")) return;
      e.preventDefault(); page(dir);
    };

    // Touch: a proper swipe turns one page
    let touch: { y: number; mode: "page" | "free" | null } | null = null;
    const onTouchStart = (e: TouchEvent) => { touch = modalOpen() ? null : { y: e.touches[0].clientY, mode: null }; };
    const onTouchMove = (e: TouchEvent) => {
      if (!touch) return;
      const dy = touch.y - e.touches[0].clientY;
      if (touch.mode == null && Math.abs(dy) > 6) touch.mode = paged(Math.sign(dy)) ? "page" : "free";
      if (touch.mode === "page") e.preventDefault();
    };
    const onTouchEnd = (e: TouchEvent) => {
      if (touch?.mode === "page") {
        const dy = touch.y - e.changedTouches[0].clientY;
        if (Math.abs(dy) > 90) page(Math.sign(dy));
      }
      touch = null;
    };

    // In-page links (hero buttons etc.) use the same animation
    const onClick = (e: MouseEvent) => {
      const a = (e.target as Element).closest('a[href^="#"]');
      if (!a) return;
      const el = document.getElementById(a.getAttribute("href")!.slice(1));
      if (el) { e.preventDefault(); animateTo(docTop(el)); }
    };

    addEventListener("scroll", onScroll, { passive: true });
    addEventListener("resize", onScroll);
    addEventListener("wheel", onWheel, { passive: false });
    addEventListener("keydown", onKey);
    addEventListener("touchstart", onTouchStart, { passive: true });
    addEventListener("touchmove", onTouchMove, { passive: false });
    addEventListener("touchend", onTouchEnd);
    document.addEventListener("click", onClick);
    stackFx();

    return () => {
      removeEventListener("scroll", onScroll);
      removeEventListener("resize", onScroll);
      removeEventListener("wheel", onWheel);
      removeEventListener("keydown", onKey);
      removeEventListener("touchstart", onTouchStart);
      removeEventListener("touchmove", onTouchMove);
      removeEventListener("touchend", onTouchEnd);
      document.removeEventListener("click", onClick);
      if (anim) cancelAnimationFrame(anim.raf);
    };
  }, []);

  return (
    <section ref={sectionRef} id="projects" className={styles.projects}>
      <p className="kicker"><b>01</b><span>Projects</span></p>
      <div className="section-head">
        <h2 className="section-title">Selected work</h2>
        <span className="chip">{PROJECTS.length} projects</span>
      </div>


      <div ref={stackRef} className={styles.stack}>
        {PROJECTS.map((p, i) => (
          <article
            key={p.id}
            tabIndex={0}
            className={`${styles.card} ${p.details ? styles.clickable : ""}`}
            style={{ "--c": COLORS[i % COLORS.length], "--i": i } as React.CSSProperties}
            {...(p.details && {
              role: "button",
              "aria-haspopup": "dialog" as const,
              "aria-label": `${p.title}: open case study`,
              onClick: (e: React.MouseEvent) => { if (!(e.target as Element).closest("a")) setOpenId(p.id); },
              onKeyDown: (e: React.KeyboardEvent) => {
                if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setOpenId(p.id); }
              },
            })}
          >
            <div className={styles.info}>
              <div className={styles.top}><span>{p.kind}</span><span>{p.year}</span></div>
              <h3>{p.title}</h3>
              <p className={styles.role}><small>My role</small><b>{p.role}</b></p>
              <p className={styles.tag}>{p.description}</p>
              <div className={styles.meta}>
                {p.tags.map((t) => <span key={t} className="pill">{t}</span>)}
                {p.link && (
                  <a href={p.link.href} className="pill" {...(p.link.href.startsWith("http") && { target: "_blank", rel: "noopener" })}>
                    {p.link.label}
                  </a>
                )}
                {p.details && <span className={`pill ${styles.more}`} aria-hidden="true">Read case study →</span>}
              </div>
            </div>

            <div className={`${styles.dev} ${p.url ? styles.web : ""} ${p.phones ? styles.app : ""} ${p.landscape ? styles.landscape : ""}`} aria-hidden="true">
              {p.url && (
                <figure className={styles.browser}>
                  <span className={styles.bar}><i /><i /><i /><em>{p.url}</em></span>
                  {p.desktop
                    // eslint-disable-next-line @next/next/no-img-element -- plain img keeps the frame's aspect-ratio sizing simple
                    ? <img src={p.desktop} alt="" className={styles.shot} />
                    : <div className={styles.ph}>Desktop screenshot<br />1600 × 1000</div>}
                </figure>
              )}
              {p.phones > 0 && (
                <div className={styles.phones}>
                  {Array.from({ length: p.phones }, (_, n) => (
                    <figure key={n} className={styles.phone}>
                      {p.phone
                        // eslint-disable-next-line @next/next/no-img-element -- sized by the phone frame
                        ? <img src={p.phone} alt="" className={`${styles.ph} ${styles.screen}`} />
                        : <div className={styles.ph}>Phone<br />{p.landscape ? "1950 × 900" : "900 × 1950"}</div>}
                    </figure>
                  ))}
                </div>
              )}
            </div>
          </article>
        ))}
      </div>

      {open && (
        <ProjectModal
          title={open.title} kind={open.kind} year={open.year} role={open.role} tags={open.tags} link={open.link}
          color={COLORS[openIndex % COLORS.length]}
          onClose={() => setOpenId(null)}
        >
          {open.details}
        </ProjectModal>
      )}
    </section>
  );
}
