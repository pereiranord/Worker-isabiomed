import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Clock3 } from "lucide-react";
import { getProcedimentos, getProcedimentoBySlug, getConfig } from "@/lib/airtable";
import { SmartImage } from "@/components/SmartImage";
import { WhatsappCta } from "@/components/WhatsappCta";
import { formatBRL, formatDuration } from "@/lib/format";

export async function generateStaticParams() {
  const procedimentos = await getProcedimentos();
  return procedimentos.map((p) => ({ slug: p.fields.Slug }));
}

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const procedimento = await getProcedimentoBySlug(params.slug);
  return {
    title: procedimento?.fields["SEO Title"] ?? procedimento?.fields.Nome,
    description:
      procedimento?.fields["SEO Description"] ?? procedimento?.fields["Descrição curta"],
  };
}

export default async function ProcedimentoPage({ params }: { params: { slug: string } }) {
  const [procedimento, config] = await Promise.all([
    getProcedimentoBySlug(params.slug),
    getConfig(),
  ]);
  if (!procedimento) return notFound();
  const f = procedimento.fields;

  return (
    <main>
      {/* imagem 16:9 em névoa, mesmo tratamento do banner da home */}
      <section className="relative overflow-hidden bg-noir pb-10 pt-24">
        <div className="mx-auto max-w-4xl px-5">
          <div className="fog-glow relative">
            <SmartImage
              cloudinaryUrls={f["Foto principal (URL)"]}
              rawAttachments={f["Foto principal"]}
              alt={f.Nome}
              className="aspect-video w-full"
              sizes="(min-width: 1024px) 768px, 100vw"
              priority
              fog
            />
          </div>

          <div className="relative -mt-4 text-center md:-mt-8">
            <h1 className="font-display text-4xl font-light text-ivory md:text-5xl">{f.Nome}</h1>
            <div className="mt-4 flex items-center justify-center gap-5 text-sm text-ivory/60">
              {f["Duração (min)"] && (
                <span className="inline-flex items-center gap-1.5">
                  <Clock3 size={14} strokeWidth={1.6} />
                  {formatDuration(f["Duração (min)"])}
                </span>
              )}
              {f["Mostrar valor"] && f.Valor && (
                <span className="font-medium text-brassLight">
                  {f["Valor a partir de"] ? "a partir de " : ""}
                  {formatBRL(f.Valor)}
                </span>
              )}
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-2xl px-5 py-12">
        {f["Descrição completa"] && (
          <p className="text-[1.02rem] leading-loose text-ink/75">{f["Descrição completa"]}</p>
        )}

        <div className="mt-10 flex flex-col gap-3 sm:flex-row">
          <Link href={`/agendar?procedimento=${f.Slug}`} className="btn-primary flex-1">
            Agendar {f.Nome}
          </Link>
          {config?.WhatsApp && (
            <WhatsappCta
              phone={config.WhatsApp}
              message={`Olá! Gostaria de saber mais sobre ${f.Nome}.`}
              className="flex-1"
            >
              Tirar dúvida
            </WhatsappCta>
          )}
        </div>

        <Link
          href="/procedimentos"
          className="focus-ring mt-10 inline-flex items-center gap-2 text-sm text-ink/50 transition-colors hover:text-brass"
        >
          <ArrowLeft size={15} />
          Todos os procedimentos
        </Link>
      </section>
    </main>
  );
}
