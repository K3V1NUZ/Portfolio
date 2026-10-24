import Hero from "@/components/Hero";
import Projects from "@/components/Projects";
import Experience from "@/components/Experience";
import TechStack from "@/components/TechStack";
import About from "@/components/About";
import BackToTop from "@/components/BackToTop";

export default function Home() {
  return (
    <main>
      <Hero />
      <Projects />
      <Experience />
      <TechStack />
      <About />
      <BackToTop />
    </main>
  );
}
