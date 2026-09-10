"use client";

import Image from "next/image";
import { motion } from "framer-motion";

export default function About() {
  return (
    <section id="sobre" className="relative w-full bg-ink py-24 sm:py-36">
      <div className="container-edit grid grid-cols-1 gap-14 lg:grid-cols-12 lg:gap-8">
        <div className="lg:col-span-5">
          <motion.span
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.6 }}
            transition={{ duration: 0.8 }}
            className="eyebrow"
          >
            Sobre
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
            className="section-title mt-4 text-[10vw] sm:text-[6vw] lg:text-[3.4vw]"
          >
            Artesanato que atravessa gerações.
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ duration: 0.9, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
            className="mt-8 max-w-md font-serif text-xl italic leading-relaxed text-bone-100/85 sm:text-2xl"
          >
            &ldquo;Cada móvel possui uma história. Nosso trabalho é preservar
            sua essência enquanto damos a ele uma nova presença.&rdquo;
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ duration: 0.9, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="mt-10 grid max-w-md grid-cols-2 gap-8 border-t border-bone-100/10 pt-8"
          >
            <div>
              <p className="font-serif text-3xl font-light text-bone-50">15+</p>
              <p className="mt-1 text-[11px] uppercase tracking-widest2 text-bone-100/50">
                Anos de ofício
              </p>
            </div>
            <div>
              <p className="font-serif text-3xl font-light text-bone-50">7</p>
              <p className="mt-1 text-[11px] uppercase tracking-widest2 text-bone-100/50">
                Etapas artesanais
              </p>
            </div>
          </motion.div>
        </div>

        <div className="grid grid-cols-2 gap-4 lg:col-span-7">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
            className="relative col-span-2 aspect-[16/9] overflow-hidden bg-graphite-900 sm:col-span-1 sm:aspect-[4/5]"
          >
            <Image
              src="/images/chair/stitch-macro.jpg"
              alt="Detalhe de costura artesanal"
              fill
              sizes="(min-width: 1024px) 30vw, 100vw"
              className="object-cover object-center"
            />
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.9, delay: 0.12, ease: [0.16, 1, 0.3, 1] }}
            className="relative col-span-1 aspect-square overflow-hidden bg-graphite-900 sm:mt-16"
          >
            <Image
              src="/images/chair/chair-explode-struct.jpg"
              alt="Estrutura de madeira exposta durante a reconstrução"
              fill
              sizes="(min-width: 1024px) 20vw, 50vw"
              className="object-cover object-center"
            />
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.9, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="relative col-span-1 aspect-square overflow-hidden bg-graphite-900"
          >
            <Image
              src="/images/chair/fabric-macro.jpg"
              alt="Textura macro do tecido premium"
              fill
              sizes="(min-width: 1024px) 20vw, 50vw"
              className="object-cover object-center"
            />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
