"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { navLinks, whatsappLink } from "@/lib/data";

export default function Header() {
  const [hidden, setHidden] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const lastY = useRef(0);

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      setScrolled(y > 40);
      if (y > lastY.current && y > 160) {
        setHidden(true);
      } else {
        setHidden(false);
      }
      lastY.current = y;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
  }, [menuOpen]);

  return (
    <>
      <header
        className={`fixed inset-x-0 top-0 z-[70] transition-transform duration-700 ease-cinematic ${
          hidden ? "-translate-y-full" : "translate-y-0"
        }`}
      >
        <div
          className={`transition-colors duration-500 ${
            scrolled ? "bg-ink/70 backdrop-blur-md" : "bg-transparent"
          }`}
        >
          <div className="container-edit flex h-20 items-center justify-between sm:h-24">
            <a
              href="#inicio"
              data-cursor="hover"
              className="font-serif text-lg tracking-[0.28em] text-bone-50 sm:text-xl"
            >
              HORIZONTEX
            </a>

            <nav className="hidden items-center gap-9 lg:flex">
              {navLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  data-cursor="hover"
                  className="link-underline text-[11px] uppercase tracking-widest2 text-bone-100/80 transition-colors hover:text-bone-50"
                >
                  {link.label}
                </a>
              ))}
            </nav>

            <a
              href={whatsappLink("Olá! Quero solicitar um orçamento para o meu móvel.")}
              target="_blank"
              rel="noopener noreferrer"
              data-cursor="hover"
              className="hidden border border-bone-100/30 px-6 py-3 text-[11px] uppercase tracking-widest2 text-bone-50 transition-all duration-500 ease-cinematic hover:border-bone-50 hover:bg-bone-50 hover:text-ink lg:inline-flex"
            >
              Solicitar Orçamento
            </a>

            <button
              aria-label="Abrir menu"
              data-cursor="hover"
              onClick={() => setMenuOpen(true)}
              className="flex flex-col gap-[5px] lg:hidden"
            >
              <span className="h-px w-7 bg-bone-50" />
              <span className="h-px w-7 bg-bone-50" />
            </button>
          </div>
        </div>
      </header>

      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="fixed inset-0 z-[95] flex flex-col bg-ink lg:hidden"
          >
            <div className="container-edit flex h-20 items-center justify-between sm:h-24">
              <span className="font-serif text-lg tracking-[0.28em] text-bone-50">
                HORIZONTEX
              </span>
              <button
                aria-label="Fechar menu"
                onClick={() => setMenuOpen(false)}
                className="relative h-6 w-6"
              >
                <span className="absolute left-0 top-1/2 h-px w-7 -translate-x-1 rotate-45 bg-bone-50" />
                <span className="absolute left-0 top-1/2 h-px w-7 -translate-x-1 -rotate-45 bg-bone-50" />
              </button>
            </div>

            <nav className="container-edit flex flex-1 flex-col justify-center gap-2">
              {navLinks.map((link, i) => (
                <motion.a
                  key={link.href}
                  href={link.href}
                  onClick={() => setMenuOpen(false)}
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 + i * 0.06, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                  className="border-b border-bone-100/10 py-5 font-serif text-4xl font-light text-bone-50 sm:text-6xl"
                >
                  {link.label}
                </motion.a>
              ))}
            </nav>

            <div className="container-edit pb-12">
              <a
                href={whatsappLink("Olá! Quero solicitar um orçamento para o meu móvel.")}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-solid w-full justify-center"
              >
                Solicitar Orçamento
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
