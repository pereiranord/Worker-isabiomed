"use client";

import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, Check, Clock3, Loader2 } from "lucide-react";
import { formatDuration } from "@/lib/format";

type Procedimento = {
  slug: string;
  nome: string;
  duracaoMin?: number;
  calEventTypeId?: string;
};

type Step = "procedimento" | "data" | "horario" | "dados" | "confirmado";

const DIAS = ["dom", "seg", "ter", "qua", "qui", "sex", "sáb"];
const PASSOS: Step[] = ["procedimento", "data", "horario", "dados"];

export function BookingWidget({
  procedimentos,
  procedimentoInicial,
}: {
  procedimentos: Procedimento[];
  procedimentoInicial?: string;
}) {
  const [procedimento, setProcedimento] = useState<Procedimento | undefined>(
    procedimentos.find((p) => p.slug === procedimentoInicial)
  );
  const [step, setStep] = useState<Step>(procedimento ? "data" : "procedimento");
  const [diaSelecionado, setDiaSelecionado] = useState<string | null>(null);
  const [slots, setSlots] = useState<Record<string, { start: string }[]>>({});
  const [carregandoSlots, setCarregandoSlots] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [horarioSelecionado, setHorarioSelecionado] = useState<string | null>(null);
  const [form, setForm] = useState({ name: "", email: "", phone: "", notes: "" });
  const [enviando, setEnviando] = useState(false);

  const dias = useMemo(() => proximosDias(14), []);

  useEffect(() => {
    if (!procedimento || step !== "data") return;
    setCarregandoSlots(true);
    setErro(null);
    fetch(
      `/api/cal/availability?eventTypeId=${procedimento.calEventTypeId}&start=${dias[0]}&end=${
        dias[dias.length - 1]
      }`
    )
      .then((r) => r.json())
      .then((json) => {
        if (json.error) throw new Error(json.error);
        setSlots(json.slots ?? {});
      })
      .catch((e) => setErro(e.message))
      .finally(() => setCarregandoSlots(false));
  }, [procedimento, step, dias]);

  async function confirmar() {
    if (!procedimento || !horarioSelecionado) return;
    setEnviando(true);
    setErro(null);
    try {
      const res = await fetch("/api/cal/book", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          eventTypeId: Number(procedimento.calEventTypeId),
          start: horarioSelecionado,
          ...form,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      setStep("confirmado");
    } catch (e: any) {
      setErro(e.message ?? "Não foi possível confirmar. Tente novamente.");
    } finally {
      setEnviando(false);
    }
  }

  const indiceAtual = PASSOS.indexOf(step);

  return (
    <div className="overflow-hidden rounded-2xl border border-ink/10 bg-white/70 shadow-lift">
      {/* indicador de progresso */}
      {step !== "confirmado" && (
        <div className="flex gap-1 bg-ink/[0.04] p-1.5">
          {PASSOS.map((p, i) => (
            <span
              key={p}
              className={`h-1 flex-1 rounded-full transition-colors duration-300 ${
                i <= indiceAtual ? "bg-brass" : "bg-ink/12"
              }`}
            />
          ))}
        </div>
      )}

      <div className="p-6 md:p-8">
        {step === "procedimento" && (
          <div>
            <h2 className="font-display text-2xl font-light text-ink">Escolha o procedimento</h2>
            <div className="mt-5">
              {procedimentos.map((p) => (
                <button
                  key={p.slug}
                  onClick={() => {
                    setProcedimento(p);
                    setStep("data");
                  }}
                  className="focus-ring rule flex w-full items-center justify-between gap-4 py-4 text-left transition-colors hover:bg-brass/[0.05]"
                >
                  <span className="text-ink">{p.nome}</span>
                  {p.duracaoMin && (
                    <span className="inline-flex shrink-0 items-center gap-1 text-xs text-ink/45">
                      <Clock3 size={12} />
                      {formatDuration(p.duracaoMin)}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}

        {step === "data" && procedimento && (
          <div>
            <Voltar onClick={() => setStep("procedimento")} label="Trocar procedimento" />
            <h2 className="mt-3 font-display text-2xl font-light text-ink">Escolha o dia</h2>
            <p className="mt-1 text-sm text-ink/50">{procedimento.nome}</p>

            {carregandoSlots && (
              <p className="mt-8 flex items-center gap-2 text-sm text-ink/50">
                <Loader2 size={15} className="animate-spin" />
                Carregando horários…
              </p>
            )}
            {erro && <p className="mt-6 text-sm text-red-700">{erro}</p>}

            <div className="mt-6 grid grid-cols-4 gap-2 sm:grid-cols-7">
              {dias.map((iso) => {
                const disponivel = (slots[iso]?.length ?? 0) > 0;
                const d = new Date(iso + "T12:00:00");
                return (
                  <button
                    key={iso}
                    disabled={!disponivel}
                    onClick={() => {
                      setDiaSelecionado(iso);
                      setStep("horario");
                    }}
                    className="focus-ring rounded-xl border border-ink/10 py-2.5 text-center transition-all disabled:cursor-not-allowed disabled:opacity-25 enabled:hover:border-brass enabled:hover:bg-brass/5 enabled:active:scale-95"
                  >
                    <span className="block text-[0.62rem] uppercase tracking-wide text-ink/45">
                      {DIAS[d.getDay()]}
                    </span>
                    <span className="mt-0.5 block font-display text-lg text-ink">
                      {d.getDate()}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {step === "horario" && diaSelecionado && (
          <div>
            <Voltar onClick={() => setStep("data")} label="Trocar dia" />
            <h2 className="mt-3 font-display text-2xl font-light text-ink">Escolha o horário</h2>
            <p className="mt-1 text-sm capitalize text-ink/50">
              {new Date(diaSelecionado + "T12:00:00").toLocaleDateString("pt-BR", {
                weekday: "long",
                day: "numeric",
                month: "long",
              })}
            </p>
            <div className="mt-6 grid grid-cols-3 gap-2 sm:grid-cols-4">
              {(slots[diaSelecionado] ?? []).map((s) => (
                <button
                  key={s.start}
                  onClick={() => {
                    setHorarioSelecionado(s.start);
                    setStep("dados");
                  }}
                  className="focus-ring rounded-xl border border-ink/10 py-2.5 text-sm text-ink transition-all hover:border-brass hover:bg-brass/5 active:scale-95"
                >
                  {new Date(s.start).toLocaleTimeString("pt-BR", {
                    hour: "2-digit",
                    minute: "2-digit",
                    timeZone: "America/Sao_Paulo",
                  })}
                </button>
              ))}
            </div>
          </div>
        )}

        {step === "dados" && horarioSelecionado && procedimento && (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              confirmar();
            }}
          >
            <Voltar onClick={() => setStep("horario")} label="Trocar horário" />
            <h2 className="mt-3 font-display text-2xl font-light text-ink">Seus dados</h2>

            <div className="mt-4 rounded-xl bg-champagne/40 px-4 py-3 text-sm text-ink/75">
              <p className="font-medium">{procedimento.nome}</p>
              <p className="mt-0.5 capitalize text-ink/60">
                {new Date(horarioSelecionado).toLocaleString("pt-BR", {
                  dateStyle: "long",
                  timeStyle: "short",
                  timeZone: "America/Sao_Paulo",
                })}
              </p>
            </div>

            <div className="mt-6 grid gap-4">
              <Campo label="Nome completo">
                <input
                  required
                  className="input"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
              </Campo>
              <Campo label="WhatsApp" hint="com DDD, ex: +5511999999999">
                <input
                  required
                  inputMode="tel"
                  pattern="^\+?[0-9]{10,15}$"
                  className="input"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                />
              </Campo>
              <Campo label="E-mail" hint="opcional">
                <input
                  type="email"
                  inputMode="email"
                  className="input"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                />
              </Campo>
            </div>

            {erro && <p className="mt-4 text-sm text-red-700">{erro}</p>}

            <button type="submit" disabled={enviando} className="btn-primary mt-7 w-full">
              {enviando ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Confirmando…
                </>
              ) : (
                "Confirmar agendamento"
              )}
            </button>
          </form>
        )}

        {step === "confirmado" && (
          <div className="py-6 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-brass/15 text-brass">
              <Check size={26} strokeWidth={2.2} />
            </div>
            <h2 className="mt-5 font-display text-2xl font-light text-ink">
              Agendamento confirmado
            </h2>
            <p className="mx-auto mt-2 max-w-prose text-sm text-ink/60">
              Te esperamos! Se você informou um e-mail, a confirmação também chegou por lá.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

function Voltar({ onClick, label }: { onClick: () => void; label: string }) {
  return (
    <button
      onClick={onClick}
      type="button"
      className="focus-ring inline-flex items-center gap-1.5 text-sm text-ink/50 transition-colors hover:text-brass"
    >
      <ArrowLeft size={15} />
      {label}
    </button>
  );
}

function Campo({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 flex items-baseline gap-2">
        <span className="text-sm font-medium text-ink/80">{label}</span>
        {hint && <span className="text-xs text-ink/40">{hint}</span>}
      </span>
      {children}
    </label>
  );
}

function proximosDias(quantos: number) {
  const out: string[] = [];
  const d = new Date();
  while (out.length < quantos) {
    d.setDate(d.getDate() + 1);
    out.push(d.toISOString().slice(0, 10));
  }
  return out;
}
