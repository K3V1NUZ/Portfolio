"use client";

import { useEffect, useState } from "react";
import { FiArrowUp } from "react-icons/fi";
import styles from "./BackToTop.module.css";

// Fixed bottom-right; hidden while the hero (#top) is on screen.
// It's an in-page link, so Projects' click handler gives it the same smooth scroll.
export default function BackToTop() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const hero = document.getElementById("top");
    if (!hero) return;
    const io = new IntersectionObserver(([e]) => setShow(!e.isIntersecting));
    io.observe(hero);
    return () => io.disconnect();
  }, []);

  return (
    <a
      href="#top"
      aria-label="Back to top"
      className={`${styles.btn} ${show ? styles.show : ""}`}
      tabIndex={show ? 0 : -1}
    >
      <FiArrowUp aria-hidden />
    </a>
  );
}
