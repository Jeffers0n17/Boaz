"use client";

import { motion } from "framer-motion";
import { materials } from "@/lib/data";
import MaterialSwatch from "@/components/MaterialSwatch";

export default function Materials() {
  return (
    <section id="materiais" className="relative w-full bg-ink py-24 sm:py-36">
      <div className="container-edit mb-16 flex flex-col gap-4 sm:mb-20">
        <motion.span
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.6 }}
          transition={{ duration: 0.8 }}
          className="eyebrow"
        >
          Materiais
        </motion.span>
        <motion.h2
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
          className="section-title max-w-3xl text-[10vw] sm:text-[6vw] lg:text-[4vw]"
        >
          Toque. Textura. Personalidade.
        </motion.h2>
      </div>

      <div className="container-edit grid grid-cols-1 gap-px overflow-hidden bg-bone-100/10 sm:grid-cols-2 lg:grid-cols-3">
        {materials.map((material, i) => (
          <motion.div
            key={material.id}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.8, delay: (i % 3) * 0.08, ease: [0.16, 1, 0.3, 1] }}
            data-cursor="hover"
            className="group relative aspect-[4/5] overflow-hidden bg-ink"
          >
            <div className="absolute inset-0 transition-transform duration-[1400ms] ease-cinematic group-hover:scale-[1.12]">
              <MaterialSwatch material={material} />
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-ink/90 via-ink/10 to-ink/20 transition-opacity duration-700 group-hover:from-ink/95" />

            <div className="relative flex h-full flex-col justify-end p-6 sm:p-8">
              <span className="text-[10px] uppercase tracking-widest2 text-bone-100/50">
                0{i + 1}
              </span>
              <h3 className="mt-2 font-serif text-2xl font-light text-bone-50 sm:text-3xl">
                {material.name}
              </h3>
              <p className="mt-2 max-h-0 overflow-hidden text-sm text-bone-100/75 opacity-0 transition-all duration-700 ease-cinematic group-hover:mt-3 group-hover:max-h-20 group-hover:opacity-100">
                {material.description}
              </p>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
