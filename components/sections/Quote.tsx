"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { whatsappLink } from "@/lib/data";

const furnitureTypes = [
  "Poltrona",
  "Sofá",
  "Cadeira",
  "Cabeceira",
  "Móvel clássico",
  "Outro",
];

const services = [
  "Restauração completa",
  "Troca de tecido",
  "Reforço de estrutura",
  "Troca de espuma",
  "Projeto personalizado",
];

export default function Quote() {
  const [name, setName] = useState("");
  const [furniture, setFurniture] = useState(furnitureTypes[0]);
  const [service, setService] = useState(services[0]);
  const [city, setCity] = useState("");
  const [notes, setNotes] = useState("");
  const [fileNames, setFileNames] = useState<string[]>([]);

  const buildMessage = () => {
    const lines = [
      "Olá! Gostaria de solicitar um orçamento.",
      name ? `Nome: ${name}` : null,
      `Tipo de móvel: ${furniture}`,
      `Serviço desejado: ${service}`,
      city ? `Cidade: ${city}` : null,
      notes ? `Observações: ${notes}` : null,
      fileNames.length
        ? `Fotos em anexo: ${fileNames.length} arquivo(s) (enviarei na conversa).`
        : null,
    ].filter(Boolean);
    return lines.join("\n");
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    window.open(whatsappLink(buildMessage()), "_blank", "noopener,noreferrer");
  };

  return (
    <section id="orcamento" className="relative w-full bg-graphite-950 py-24 sm:py-36">
      <div className="container-edit flex flex-col items-center text-center">
        <motion.span
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.6 }}
          transition={{ duration: 0.8 }}
          className="eyebrow"
        >
          Orçamento
        </motion.span>
        <motion.h2
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
          className="section-title mt-4 max-w-3xl text-[10vw] sm:text-[6vw] lg:text-[3.6vw]"
        >
          Qual é a próxima história do seu móvel?
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.6 }}
          transition={{ duration: 0.8, delay: 0.15 }}
          className="mt-6 max-w-md text-sm text-bone-100/70 sm:text-base"
        >
          Envie uma foto do seu móvel e conte o que você deseja transformar.
        </motion.p>

        <motion.a
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.6 }}
          transition={{ duration: 0.8, delay: 0.25 }}
          href={whatsappLink("Olá! Quero solicitar um orçamento para o meu móvel.")}
          target="_blank"
          rel="noopener noreferrer"
          data-cursor="hover"
          className="btn-solid mt-10"
        >
          Solicitar Orçamento
        </motion.a>
      </div>

      <div className="container-edit mt-24 sm:mt-28">
        <motion.form
          onSubmit={onSubmit}
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
          className="mx-auto grid max-w-3xl grid-cols-1 gap-8 border-t border-bone-100/10 pt-16 sm:grid-cols-2"
        >
          <div className="sm:col-span-2">
            <p className="eyebrow mb-2">Formulário opcional</p>
            <p className="text-sm text-bone-100/60">
              Preencha os campos abaixo — vamos abrir o WhatsApp com sua
              mensagem pronta para envio.
            </p>
          </div>

          <label className="flex flex-col gap-2">
            <span className="text-[11px] uppercase tracking-widest2 text-bone-100/50">
              Nome
            </span>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              type="text"
              placeholder="Seu nome"
              className="border-b border-bone-100/20 bg-transparent py-3 text-bone-50 outline-none transition-colors placeholder:text-bone-100/30 focus:border-bone-50"
            />
          </label>

          <label className="flex flex-col gap-2">
            <span className="text-[11px] uppercase tracking-widest2 text-bone-100/50">
              Cidade
            </span>
            <input
              value={city}
              onChange={(e) => setCity(e.target.value)}
              type="text"
              placeholder="Sua cidade"
              className="border-b border-bone-100/20 bg-transparent py-3 text-bone-50 outline-none transition-colors placeholder:text-bone-100/30 focus:border-bone-50"
            />
          </label>

          <label className="flex flex-col gap-2">
            <span className="text-[11px] uppercase tracking-widest2 text-bone-100/50">
              Tipo de móvel
            </span>
            <select
              value={furniture}
              onChange={(e) => setFurniture(e.target.value)}
              className="border-b border-bone-100/20 bg-transparent py-3 text-bone-50 outline-none transition-colors focus:border-bone-50"
            >
              {furnitureTypes.map((f) => (
                <option key={f} value={f} className="bg-graphite-900">
                  {f}
                </option>
              ))}
            </select>
          </label>

          <label className="flex flex-col gap-2">
            <span className="text-[11px] uppercase tracking-widest2 text-bone-100/50">
              Serviço desejado
            </span>
            <select
              value={service}
              onChange={(e) => setService(e.target.value)}
              className="border-b border-bone-100/20 bg-transparent py-3 text-bone-50 outline-none transition-colors focus:border-bone-50"
            >
              {services.map((s) => (
                <option key={s} value={s} className="bg-graphite-900">
                  {s}
                </option>
              ))}
            </select>
          </label>

          <label className="flex flex-col gap-2 sm:col-span-2">
            <span className="text-[11px] uppercase tracking-widest2 text-bone-100/50">
              Fotos do móvel
            </span>
            <div className="flex flex-col gap-3 border border-dashed border-bone-100/20 p-5 sm:flex-row sm:items-center sm:justify-between">
              <span className="text-sm text-bone-100/50">
                {fileNames.length
                  ? `${fileNames.length} arquivo(s) selecionado(s)`
                  : "Nenhum arquivo selecionado"}
              </span>
              <label
                data-cursor="hover"
                className="btn-line w-fit cursor-pointer !py-2.5 !text-[10px]"
              >
                Escolher arquivos
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={(e) =>
                    setFileNames(Array.from(e.target.files ?? []).map((f) => f.name))
                  }
                />
              </label>
            </div>
            <span className="text-xs text-bone-100/35">
              As fotos são anexadas diretamente na conversa do WhatsApp após o
              envio deste formulário.
            </span>
          </label>

          <label className="flex flex-col gap-2 sm:col-span-2">
            <span className="text-[11px] uppercase tracking-widest2 text-bone-100/50">
              Observações
            </span>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              placeholder="Conte um pouco mais sobre o seu móvel..."
              className="resize-none border-b border-bone-100/20 bg-transparent py-3 text-bone-50 outline-none transition-colors placeholder:text-bone-100/30 focus:border-bone-50"
            />
          </label>

          <div className="sm:col-span-2">
            <button type="submit" data-cursor="hover" className="btn-solid w-full sm:w-fit">
              Enviar via WhatsApp
            </button>
          </div>
        </motion.form>
      </div>
    </section>
  );
}
