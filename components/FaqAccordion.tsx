"use client";

import { useState } from "react";
import { Plus } from "lucide-react";

export function FaqAccordion({
  itens,
}: {
  itens: { id: string; pergunta: string; resposta: string }[];
}) {
  const [aberto, setAberto] = useState<string | null>(null);

  return (
    <div>
      {itens.map((item) => {
        const isOpen = aberto === item.id;
        return (
          <div key={item.id} className="rule">
            <button
              onClick={() => setAberto(isOpen ? null : item.id)}
              aria-expanded={isOpen}
              className="focus-ring flex w-full items-start justify-between gap-5 py-5 text-left"
            >
              <span className="text-[0.97rem] font-medium leading-snug text-ink">
                {item.pergunta}
              </span>
              <Plus
                size={17}
                strokeWidth={1.6}
                className={`mt-0.5 shrink-0 text-brass transition-transform duration-300 ${
                  isOpen ? "rotate-45" : ""
                }`}
              />
            </button>
            <div
              className={`grid transition-all duration-300 ease-out ${
                isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
              }`}
            >
              <div className="overflow-hidden">
                <p className="max-w-prose pb-5 text-sm leading-relaxed text-ink/65">
                  {item.resposta}
                </p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
