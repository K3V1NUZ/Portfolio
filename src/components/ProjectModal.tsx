"use client";

import { useEffect, useRef } from "react";
import { FiX } from "react-icons/fi";
import styles from "./ProjectModal.module.css";

type Props = {
  title: string;
  kind: string;
  year: string;
  role: string;
  tags: string[];
  link?: { href: string; label: string }; // shown at the top, next to the title
  color: string;          // the card's pastel colour, reused for the header
  onClose: () => void;
  children: React.ReactNode;
};

// Case-study window. A native <dialog> opened with showModal(): focus is trapped inside,
// Esc closes it, and clicking the dimmed backdrop closes it too.
export default function ProjectModal({ title, kind, year, role, tags, link, color, onClose, children }: Props) {
  const ref = useRef<HTMLDialogElement>(null);
  const openerRef = useRef<HTMLElement | null>(null); // focus goes back here on close

  useEffect(() => {
    const dialog = ref.current!;
    // Only the first run sees the real opener; after showModal() focus is already inside the window
    openerRef.current ??= document.activeElement as HTMLElement | null;
    const opener = openerRef.current;
    if (!dialog.open) dialog.showModal();
    // Stop the page behind from scrolling while the window is open
    const html = document.documentElement;
    const prev = html.style.overflow;
    html.style.overflow = "hidden";
    // No dialog.close() here: it fires "close" -> onClose, which would immediately unmount the window
    // again in React's dev double-run. Unmounting removes the dialog anyway.
    return () => {
      html.style.overflow = prev;
      if (opener && opener !== document.body) opener.focus({ preventScroll: true });
    };
  }, []);

  return (
    <dialog
      ref={ref}
      className={styles.dialog}
      aria-labelledby="case-title"
      onClose={onClose}
      // The panel fills the dialog, so a click that lands on the dialog itself came from the backdrop
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className={styles.scroll}>
        <header className={styles.head} style={{ "--c": color } as React.CSSProperties}>
          <button type="button" className={styles.close} onClick={onClose} aria-label="Close">
            <FiX aria-hidden />
          </button>
          <div className={styles.top}><span>{kind}</span><span>{year}</span></div>
          <div className={styles.titleRow}>
            <h2 id="case-title">{title}</h2>
            {link && (
              <a href={link.href} className={`pill ${styles.link}`} {...(link.href.startsWith("http") && { target: "_blank", rel: "noopener" })}>
                {link.label}
              </a>
            )}
          </div>
          <p className={styles.role}><small>My role</small><b>{role}</b></p>
          <div className={styles.tags}>{tags.map((t) => <span key={t} className="pill">{t}</span>)}</div>
        </header>
        <div className={styles.body}>{children}</div>
      </div>
    </dialog>
  );
}
