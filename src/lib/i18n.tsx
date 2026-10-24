"use client";

import { createContext, useContext, useEffect, useState } from "react";

export type Lang = "en" | "sk";

// Strings per language. Only the hero is translated so far; add keys as sections get Slovak copy.
const DICT = {
  en: {
    openToWork: "Open to work",
    hey: "Hey, I’m",
    introA: "I’m a Student at ",
    faculty: "Faculty of Informatics and Information Technologies",
    introB: " at ",
    uni: "Slovak Technical University",
    introC: " studying ",
    field: "Computer Science",
    introD: ".",
    navProjects: "Projects",
    navExperience: "Work & Study",
    navSkills: "Skills",
    navAbout: "About Me",
    navCv: "Show CV",
    location: "Slovakia, Bratislava",
    scroll: "Scroll to projects",
  },
  sk: {
    openToWork: "Hľadám prácu",
    hey: "Ahoj, som",
    introA: "Som študent na ",
    faculty: "Fakulte informatiky a informačných technológií",
    introB: " ",
    uni: "STU v Bratislave",
    introC: ", študujem ",
    field: "informatiku",
    introD: ".",
    navProjects: "Projekty",
    navExperience: "Práca a štúdium",
    navSkills: "Zručnosti",
    navAbout: "O mne",
    navCv: "Zobraziť CV",
    location: "Slovensko, Bratislava",
    scroll: "Posunúť na projekty",
  },
} satisfies Record<Lang, Record<string, string>>;

type Dict = (typeof DICT)["en"];

const LangContext = createContext<{ lang: Lang; setLang: (l: Lang) => void; t: Dict }>({
  lang: "en", setLang: () => {}, t: DICT.en,
});

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>("en");

  useEffect(() => {
    try {
      const saved = localStorage.getItem("lang");
      if (saved === "en" || saved === "sk") setLangState(saved);
    } catch {}
  }, []);

  useEffect(() => { document.documentElement.lang = lang; }, [lang]);

  const setLang = (l: Lang) => {
    setLangState(l);
    try { localStorage.setItem("lang", l); } catch {}
  };

  return <LangContext.Provider value={{ lang, setLang, t: DICT[lang] }}>{children}</LangContext.Provider>;
}

export const useLang = () => useContext(LangContext);
