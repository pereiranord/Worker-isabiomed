import { getProcedimentos } from "@/lib/airtable";
import { BookingWidget } from "@/components/BookingWidget";

export const metadata = { title: "Agendar" };

export default async function AgendarPage({
  searchParams,
}: {
  searchParams: { procedimento?: string };
}) {
  const procedimentos = await getProcedimentos();
  const lista = procedimentos
    .filter((p) => p.fields["Cal.com Event ID"])
    .map((p) => ({
      slug: p.fields.Slug,
      nome: p.fields.Nome,
      duracaoMin: p.fields["Duração (min)"],
      calEventTypeId: p.fields["Cal.com Event ID"],
    }));

  return (
    <main>
      <header className="bg-noir px-5 pb-16 pt-28 text-center">
        <p className="eyebrow">Reserve seu momento</p>
        <h1 className="mt-2 font-display text-4xl font-light text-ivory md:text-5xl">
          Agendar horário
        </h1>
        <p className="mx-auto mt-4 max-w-prose text-sm text-ivory/60">
          Escolha o procedimento, o dia e o horário. A confirmação é imediata.
        </p>
      </header>

      <div className="mx-auto -mt-8 max-w-2xl px-5 pb-20">
        <BookingWidget procedimentos={lista} procedimentoInicial={searchParams.procedimento} />
      </div>
    </main>
  );
}
