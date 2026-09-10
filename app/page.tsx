import Hero from "@/components/sections/Hero";
import ScrollStory from "@/components/sections/ScrollStory";
import BeforeAfter from "@/components/sections/BeforeAfter";
import Materials from "@/components/sections/Materials";
import Process from "@/components/sections/Process";
import Projects from "@/components/sections/Projects";
import Impact from "@/components/sections/Impact";
import About from "@/components/sections/About";
import Quote from "@/components/sections/Quote";

export default function Home() {
  return (
    <main className="relative w-full bg-ink">
      <Hero />
      <ScrollStory />
      <BeforeAfter />
      <Materials />
      <Process />
      <Projects />
      <Impact />
      <About />
      <Quote />
    </main>
  );
}
