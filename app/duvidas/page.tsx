import { getFaqs, getConfig } from "@/lib/airtable";
import { FaqAccordion } from "@/components/FaqAccordion";
import { WhatsappCta } from "@/components/WhatsappCta";

export const metadata = { title: "Dúvidas" };

export default async function DuvidasPage() {
  const [faqs, config] = await Promise.all([getFaqs(), getConfig()]);
  const categorias = Array.from(new Set(faqs.map((f) => f.fields.Categoria).filter(Boolean)));

  return (
    <main>
      <header className="bg-noir px-5 pb-14 pt-28 text-center">
        <p className="eyebrow">Perguntas frequentes</p>
        <h1 className="mt-2 font-display text-4xl font-light text-ivory md:text-5xl">Dúvidas</h1>
      </header>

      <div className="mx-auto max-w-2xl px-5 pb-8">
        {categorias.map((cat) => (
          <section key={cat} className="mt-12">
            <h2 className="font-display text-xl font-medium text-brass">{cat}</h2>
            <div className="mt-3">
              <FaqAccordion
                itens={faqs
                  .filter((f) => f.fields.Categoria === cat)
                  .map((f) => ({
                    id: f.id,
                    pergunta: f.fields.Pergunta,
                    resposta: f.fields.Resposta,
                  }))}
              />
            </div>
          </section>
        ))}

        {config?.WhatsApp && (
          <div className="mt-16 rounded-2xl bg-champagne/45 p-8 text-center">
            <p className="font-display text-2xl font-light text-ink">
              Não encontrou sua resposta?
            </p>
            <p className="mx-auto mt-2 max-w-prose text-sm text-ink/60">
              Fale direto com a Isabel — é rápido.
            </p>
            <WhatsappCta
              phone={config.WhatsApp}
              message="Olá! Tenho uma dúvida que não encontrei no site."
              variant="primary"
              className="mt-6"
            >
              Falar pelo WhatsApp
            </WhatsappCta>
          </div>
        )}
      </div>
    </main>
  );
}
