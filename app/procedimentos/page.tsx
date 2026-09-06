import Link from "next/link";
import { ArrowUpRight, Clock3 } from "lucide-react";
import { getCategorias, getProcedimentos } from "@/lib/airtable";
import { SmartImage } from "@/components/SmartImage";
import { formatBRL, formatDuration } from "@/lib/format";

export const metadata = { title: "Procedimentos" };

export default async function ProcedimentosPage() {
  const [categorias, procedimentos] = await Promise.all([getCategorias(), getProcedimentos()]);

  return (
    <main>
      <header className="bg-noir px-5 pb-14 pt-28 text-center">
        <p className="eyebrow">Nossos cuidados</p>
        <h1 className="mt-2 font-display text-4xl font-light text-ivory md:text-5xl">
          Procedimentos
        </h1>
        <p className="mx-auto mt-4 max-w-prose text-sm leading-relaxed text-ivory/60">
          Cada procedimento é conduzido de forma individual, considerando o que faz sentido para você.
        </p>
      </header>

      <div className="mx-auto max-w-5xl px-5 pb-20">
        {categorias.map((cat) => {
          const itens = procedimentos.filter((p) => p.fields.Categoria?.includes(cat.id));
          if (itens.length === 0) return null;
          return (
            <section key={cat.id} className="mt-14">
              <h2 className="font-display text-2xl font-medium text-brass">{cat.fields.Nome}</h2>
              <div className="mt-4">
                {itens.map((p) => (
                  <Link
                    key={p.id}
                    href={`/procedimentos/${p.fields.Slug}`}
                    className="focus-ring rule group flex items-center gap-4 py-5 transition-colors hover:bg-brass/[0.04]"
                  >
                    <SmartImage
                      cloudinaryUrls={p.fields["Foto principal (URL)"]}
                      rawAttachments={p.fields["Foto principal"]}
                      alt={p.fields.Nome}
                      className="h-16 w-16 shrink-0 rounded-xl"
                      sizes="64px"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="font-display text-xl font-medium text-ink">{p.fields.Nome}</p>
                      {p.fields["Descrição curta"] && (
                        <p className="mt-0.5 line-clamp-2 text-sm leading-snug text-ink/60">
                          {p.fields["Descrição curta"]}
                        </p>
                      )}
                      <div className="mt-1.5 flex items-center gap-3 text-xs text-ink/50">
                        {p.fields["Duração (min)"] && (
                          <span className="inline-flex items-center gap-1">
                            <Clock3 size={13} />
                            {formatDuration(p.fields["Duração (min)"])}
                          </span>
                        )}
                        {p.fields["Mostrar valor"] && p.fields.Valor && (
                          <span className="font-medium text-brass">
                            {p.fields["Valor a partir de"] ? "a partir de " : ""}
                            {formatBRL(p.fields.Valor)}
                          </span>
                        )}
                      </div>
                    </div>
                    <ArrowUpRight
                      size={18}
                      className="shrink-0 text-ink/25 transition-transform group-hover:-translate-y-0.5 group-hover:text-brass"
                    />
                  </Link>
                ))}
              </div>
            </section>
          );
        })}
      </div>
    </main>
  );
}
