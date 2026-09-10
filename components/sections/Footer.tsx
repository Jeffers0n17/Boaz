import { navLinks, whatsappLink } from "@/lib/data";

const socials = [
  { label: "WhatsApp", href: whatsappLink("Olá! Encontrei a HORIZONTEX e gostaria de saber mais.") },
  { label: "Instagram", href: "https://instagram.com" },
  { label: "Localização", href: "https://maps.google.com" },
];

export default function Footer() {
  return (
    <footer className="relative w-full border-t border-bone-100/10 bg-ink pb-10 pt-20 sm:pt-28">
      <div className="container-edit flex flex-col gap-16 sm:gap-20">
        <div className="flex flex-col gap-8 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="font-serif text-2xl tracking-[0.28em] text-bone-50 sm:text-3xl">
              HORIZONTEX
            </p>
            <p className="mt-3 font-serif text-lg italic text-bone-100/60">
              Seu móvel. Uma nova história.
            </p>
          </div>

          <a
            href={whatsappLink("Olá! Quero solicitar um orçamento para o meu móvel.")}
            target="_blank"
            rel="noopener noreferrer"
            data-cursor="hover"
            className="btn-line w-fit"
          >
            Solicitar Orçamento
          </a>
        </div>

        <div className="grid grid-cols-2 gap-10 border-t border-bone-100/10 pt-12 sm:grid-cols-4">
          <div className="col-span-2 flex flex-col gap-3 sm:col-span-1">
            <span className="text-[11px] uppercase tracking-widest2 text-bone-100/40">
              Navegação
            </span>
            {navLinks.map((l) => (
              <a
                key={l.href}
                href={l.href}
                className="link-underline w-fit text-sm text-bone-100/70 hover:text-bone-50"
              >
                {l.label}
              </a>
            ))}
          </div>

          <div className="flex flex-col gap-3">
            <span className="text-[11px] uppercase tracking-widest2 text-bone-100/40">
              Conecte-se
            </span>
            {socials.map((s) => (
              <a
                key={s.label}
                href={s.href}
                target="_blank"
                rel="noopener noreferrer"
                className="link-underline w-fit text-sm text-bone-100/70 hover:text-bone-50"
              >
                {s.label}
              </a>
            ))}
          </div>

          <div className="col-span-2 flex flex-col gap-3 sm:col-span-2">
            <span className="text-[11px] uppercase tracking-widest2 text-bone-100/40">
              Atelier
            </span>
            <p className="text-sm text-bone-100/70">
              Atendimento sob agendamento.
              <br />
              São Paulo — SP, Brasil
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-4 border-t border-bone-100/10 pt-8 text-[11px] uppercase tracking-widest2 text-bone-100/35 sm:flex-row sm:items-center sm:justify-between">
          <span>© {new Date().getFullYear()} HORIZONTEX. Todos os direitos reservados.</span>
          <span>Tapeçaria, restauração e transformação de móveis.</span>
        </div>
      </div>
    </footer>
  );
}
