"use client";

import { useEffect } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import type { Project } from "@/lib/data";
import { whatsappLink } from "@/lib/data";

export default function ProjectModal({
  project,
  onClose,
}: {
  project: Project;
  onClose: () => void;
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
      onClick={onClose}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-ink/90 backdrop-blur-sm p-4 sm:p-8"
    >
      <motion.div
        layoutId={`project-${project.id}`}
        onClick={(e) => e.stopPropagation()}
        className="relative flex max-h-[90vh] w-full max-w-5xl flex-col overflow-y-auto bg-graphite-950 sm:flex-row"
      >
        <button
          onClick={onClose}
          aria-label="Fechar"
          data-cursor="hover"
          className="absolute right-5 top-5 z-20 flex h-10 w-10 items-center justify-center rounded-full border border-bone-100/30 bg-ink/50 text-bone-50 backdrop-blur transition hover:border-bone-50"
        >
          <span className="relative block h-4 w-4">
            <span className="absolute left-1/2 top-1/2 h-px w-4 -translate-x-1/2 -translate-y-1/2 rotate-45 bg-bone-50" />
            <span className="absolute left-1/2 top-1/2 h-px w-4 -translate-x-1/2 -translate-y-1/2 -rotate-45 bg-bone-50" />
          </span>
        </button>

        <div className="relative h-64 w-full sm:h-auto sm:w-3/5">
          {project.kind === "photo" ? (
            <Image
              src={project.image}
              alt={project.title}
              fill
              sizes="60vw"
              className="object-cover object-center"
            />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-graphite-700 via-graphite-900 to-ink">
              <div className="noise-layer absolute inset-0 opacity-[0.14] mix-blend-overlay" />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-ink/60 via-transparent to-transparent sm:hidden" />
        </div>

        <div className="flex w-full flex-col justify-center gap-6 p-8 sm:w-2/5 sm:p-12">
          <div>
            <span className="eyebrow">{project.category} — {project.year}</span>
            <h3 className="section-title mt-3 text-4xl sm:text-5xl">
              {project.title}
            </h3>
          </div>

          <p className="text-sm text-bone-100/75 sm:text-base">
            {project.description}
          </p>

          <div className="flex flex-col gap-3 border-t border-bone-100/10 pt-6 text-sm">
            <div className="flex justify-between text-bone-100/60">
              <span>Material</span>
              <span className="text-bone-50">{project.material}</span>
            </div>
            <div className="flex justify-between text-bone-100/60">
              <span>Categoria</span>
              <span className="text-bone-50">{project.category}</span>
            </div>
            {project.before && (
              <div className="flex justify-between text-bone-100/60">
                <span>Registro</span>
                <span className="text-bone-50">Antes &amp; Depois</span>
              </div>
            )}
          </div>

          <a
            href={whatsappLink(
              `Olá! Vi o projeto "${project.title}" e quero um orçamento parecido.`
            )}
            target="_blank"
            rel="noopener noreferrer"
            data-cursor="hover"
            className="btn-solid justify-center"
          >
            Quero um projeto assim
          </a>
        </div>
      </motion.div>
    </motion.div>
  );
}
