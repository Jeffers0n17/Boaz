"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { processSteps } from "@/lib/data";

export default function Process() {
  return (
    <section id="processo" className="relative w-full bg-graphite-950 py-24 sm:py-36">
      <div className="container-edit mb-20 flex flex-col gap-6 sm:mb-28">
        <motion.span
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.6 }}
          transition={{ duration: 0.8 }}
          className="eyebrow"
        >
          Processo
        </motion.span>
        <div className="max-w-3xl">
          <motion.h2
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
            className="section-title text-[10vw] sm:text-[6vw] lg:text-[4vw]"
          >
            Não é apenas reformar.
          </motion.h2>
          <motion.h2
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ duration: 0.9, delay: 0.12, ease: [0.16, 1, 0.3, 1] }}
            className="section-title text-[10vw] text-bone-100/40 sm:text-[6vw] lg:text-[4vw]"
          >
            É reconstruir cada detalhe.
          </motion.h2>
        </div>
      </div>

      <div className="container-edit flex flex-col">
        {processSteps.map((step, i) => {
          const reverse = i % 2 === 1;
          return (
            <div
              key={step.number}
              className={`flex flex-col gap-8 border-t border-bone-100/10 py-14 sm:py-20 lg:flex-row lg:items-center lg:gap-16 ${
                reverse ? "lg:flex-row-reverse" : ""
              }`}
            >
              <div className="lg:w-1/2">
                <motion.div
                  initial={{ clipPath: "inset(0 0 100% 0)" }}
                  whileInView={{ clipPath: "inset(0 0 0% 0)" }}
                  viewport={{ once: true, amount: 0.3 }}
                  transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1] }}
                  className="relative aspect-[4/3] w-full overflow-hidden bg-graphite-900"
                >
                  <Image
                    src={step.image}
                    alt={`Etapa ${step.number} — ${step.title}`}
                    fill
                    sizes="(min-width: 1024px) 50vw, 100vw"
                    className="object-cover object-center"
                  />
                </motion.div>
              </div>

              <div className="flex flex-col gap-4 lg:w-1/2">
                <motion.span
                  initial={{ opacity: 0, x: reverse ? 20 : -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, amount: 0.6 }}
                  transition={{ duration: 0.8 }}
                  className="font-serif text-xl italic text-brass-400"
                >
                  {step.number}
                </motion.span>
                <motion.h3
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.6 }}
                  transition={{ duration: 0.8, delay: 0.08 }}
                  className="font-serif text-4xl font-light text-bone-50 sm:text-5xl"
                >
                  {step.title}
                </motion.h3>
                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.6 }}
                  transition={{ duration: 0.8, delay: 0.16 }}
                  className="max-w-md text-sm text-bone-100/70 sm:text-base"
                >
                  {step.description}
                </motion.p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
