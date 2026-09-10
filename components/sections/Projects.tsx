"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { projects, type Project } from "@/lib/data";
import ProjectModal from "@/components/ProjectModal";

const categories = ["Todos", ...Array.from(new Set(projects.map((p) => p.category)))];

const sizeClasses: Record<Project["size"], string> = {
  lg: "col-span-6 sm:col-span-4 row-span-2",
  md: "col-span-6 sm:col-span-2 row-span-2",
  sm: "col-span-6 sm:col-span-3 row-span-1",
};

export default function Projects() {
  const [active, setActive] = useState("Todos");
  const [selected, setSelected] = useState<Project | null>(null);

  const filtered = useMemo(
    () => (active === "Todos" ? projects : projects.filter((p) => p.category === active)),
    [active]
  );

  return (
    <section id="projetos" className="relative w-full bg-ink py-24 sm:py-36">
      <div className="container-edit mb-12 flex flex-col gap-6 sm:mb-16">
        <motion.span
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.6 }}
          transition={{ duration: 0.8 }}
          className="eyebrow"
        >
          Projetos
        </motion.span>
        <motion.h2
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
          className="section-title max-w-3xl text-[10vw] sm:text-[6vw] lg:text-[4vw]"
        >
          Histórias que já transformamos.
        </motion.h2>
      </div>

      <div className="container-edit mb-10 flex flex-wrap gap-3 sm:mb-14">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActive(cat)}
            data-cursor="hover"
            className={`border px-5 py-2.5 text-[11px] uppercase tracking-widest2 transition-all duration-400 ${
              active === cat
                ? "border-bone-50 bg-bone-50 text-ink"
                : "border-bone-100/20 text-bone-100/70 hover:border-bone-100/60 hover:text-bone-50"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="container-edit grid grid-cols-6 grid-flow-dense auto-rows-[190px] gap-3 sm:auto-rows-[220px] sm:gap-4">
        {filtered.map((project, i) => (
          <motion.button
            key={project.id}
            layoutId={`project-${project.id}`}
            onClick={() => setSelected(project)}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.8, delay: (i % 4) * 0.06, ease: [0.16, 1, 0.3, 1] }}
            data-cursor="hover"
            className={`group relative overflow-hidden bg-graphite-900 text-left ${sizeClasses[project.size]}`}
          >
            {project.kind === "photo" ? (
              <>
                <Image
                  src={project.image}
                  alt={project.title}
                  fill
                  sizes="(min-width: 1024px) 45vw, 100vw"
                  className="object-cover object-center transition-transform duration-[1400ms] ease-cinematic group-hover:scale-[1.08]"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-ink/85 via-ink/10 to-transparent" />
              </>
            ) : (
              <div className="absolute inset-0 bg-gradient-to-br from-graphite-700 via-graphite-900 to-ink">
                <div className="noise-layer absolute inset-0 opacity-[0.12] mix-blend-overlay" />
                <div className="absolute inset-0 bg-gradient-to-t from-ink/90 via-transparent to-transparent" />
              </div>
            )}

            <div className="relative flex h-full flex-col justify-end p-5 sm:p-7">
              <span className="text-[10px] uppercase tracking-widest2 text-bone-100/60">
                {project.category}
              </span>
              <h3 className="mt-1 font-serif text-xl font-light text-bone-50 sm:text-2xl lg:text-3xl">
                {project.title}
              </h3>
            </div>
          </motion.button>
        ))}
      </div>

      <AnimatePresence>
        {selected && (
          <ProjectModal project={selected} onClose={() => setSelected(null)} />
        )}
      </AnimatePresence>
    </section>
  );
}
