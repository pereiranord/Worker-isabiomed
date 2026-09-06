import Link from "next/link";
import { ArrowUpRight, Clock3, Star } from "lucide-react";
import {
  getConfig,
  getProcedimentos,
  getBanners,
  getDepoimentos,
  getEquipe,
} from "@/lib/airtable";
import { SmartImage } from "@/components/SmartImage";
import { WhatsappCta } from "@/components/WhatsappCta";
import { formatBRL, formatDuration } from "@/lib/format";

export default async function HomePage() {
  const [config, procedimentos, banners, depoimentos, equipe] = await Promise.all([
    getConfig(),
    getProcedimentos(),
    getBanners(),
    getDepoimentos(),
    getEquipe(),
  ]);

  const destaques = procedimentos.filter((p) => p.fields.Destaque).slice(0, 4);
  const banner = banners[0];
  const isabel = equipe[0];

  return (
    <main>
      {/* ── HERO ──────────────────────────────────────────────────────
          Banner 16:9 (formato de thumb do YouTube) com as bordas
          dissolvendo em névoa contra o fundo espresso. O texto vem
          abaixo, respirando, em vez de sobreposto e ilegível. */}
      <section className="relative overflow-hidden bg-noir pb-14 pt-24 md:pb-20 md:pt-28">
        <div className="mx-auto max-w-5xl px-5">
          <div className="fog-glow relative">
            <SmartImage
              cloudinaryUrls={banner?.fields["Imagem (URL)"]}
              rawAttachments={banner?.fields.Imagem}
              alt={banner?.fields.Título ?? config?.["Nome da Clínica"] ?? "Isaesteticca"}
              className="aspect-video w-full"
              sizes="(min-width: 1024px) 960px, 100vw"
              priority
              fog
            />
          </div>

          <div className="relative mx-auto -mt-6 max-w-2xl text-center md:-mt-10">
            <p className="eyebrow">{config?.["Nome da Clínica"]}</p>
            <h1 className="mt-3 font-display text-[2.6rem] font-light leading-[1.08] text-ivory md:text-6xl">
              {banner?.fields.Título ?? "Beleza que nasce do cuidado"}
            </h1>
            <p className="mx-auto mt-4 max-w-prose text-[0.95rem] leading-relaxed text-ivory/65">
              {banner?.fields.Subtítulo ??
                config?.["SEO Description padrão"] ??
                "Cuidados personalizados para valorizar sua beleza, autoestima e bem-estar."}
            </p>

            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link href="/agendar" className="btn-primary w-full sm:w-auto">
                {banner?.fields["Texto do botão"] ?? "Agendar horário"}
              </Link>
              {config?.WhatsApp && (
                <WhatsappCta
                  phone={config.WhatsApp}
                  message="Olá! Vim pelo site da Isaesteticca."
                  variant="outline"
                  className="w-full sm:w-auto"
                >
                  Falar no WhatsApp
                </WhatsappCta>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ── DESTAQUES ─────────────────────────────────────────────── */}
      {destaques.length > 0 && (
        <section className="mx-auto max-w-5xl px-5 py-16 md:py-24">
          <p className="eyebrow">Selecionados</p>
          <h2 className="mt-2 font-display text-3xl font-light text-ink md:text-4xl">
            Procedimentos em destaque
          </h2>

          <div className="mt-8">
            {destaques.map((p) => (
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

          <Link href="/procedimentos" className="btn-quiet mt-8">
            Ver todos os procedimentos
          </Link>
        </section>
      )}

      {/* ── SOBRE ─────────────────────────────────────────────────── */}
      {isabel && (
        <section className="bg-champagne/35 py-16 md:py-24">
          <div className="mx-auto grid max-w-5xl gap-10 px-5 md:grid-cols-[0.85fr_1fr] md:items-center">
            <SmartImage
              cloudinaryUrls={isabel.fields["Foto (URL)"]}
              rawAttachments={isabel.fields.Foto}
              alt={isabel.fields.Nome}
              className="aspect-[4/5] w-full rounded-2xl shadow-lift"
              sizes="(min-width: 768px) 40vw, 100vw"
            />
            <div>
              <p className="eyebrow">{isabel.fields.Cargo}</p>
              <h2 className="mt-2 font-display text-3xl font-light text-ink md:text-4xl">
                {isabel.fields.Nome}
              </h2>
              {isabel.fields.Biografia && (
                <p className="mt-5 max-w-prose leading-relaxed text-ink/70">
                  {isabel.fields.Biografia}
                </p>
              )}
            </div>
          </div>
        </section>
      )}

      {/* ── DEPOIMENTOS ───────────────────────────────────────────── */}
      {depoimentos.length > 0 && (
        <section className="bg-noir py-16 md:py-24">
          <div className="mx-auto max-w-5xl px-5">
            <p className="eyebrow">Depoimentos</p>
            <h2 className="mt-2 font-display text-3xl font-light text-ivory md:text-4xl">
              Quem já passou por aqui
            </h2>
            <div className="mt-10 grid gap-8 md:grid-cols-3">
              {depoimentos.slice(0, 3).map((d) => (
                <blockquote key={d.id} className="border-t border-ivory/12 pt-5">
                  {d.fields.Nota && (
                    <div className="mb-3 flex gap-0.5 text-brassLight">
                      {Array.from({ length: d.fields.Nota }).map((_, i) => (
                        <Star key={i} size={13} fill="currentColor" strokeWidth={0} />
                      ))}
                    </div>
                  )}
                  <p className="text-sm leading-relaxed text-ivory/75">{d.fields.Texto}</p>
                  <footer className="mt-4 font-display text-base text-brassLight">
                    {d.fields.Nome}
                  </footer>
                </blockquote>
              ))}
            </div>
          </div>
        </section>
      )}
    </main>
  );
}
