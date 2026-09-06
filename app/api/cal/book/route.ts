import { NextRequest, NextResponse } from "next/server";
import { createBooking } from "@/lib/calcom";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { eventTypeId, start, name, email, phone, notes } = body ?? {};

  // E-mail é opcional no formulário do site (o WhatsApp é o contato
  // principal). A API do Cal.com, porém, exige um e-mail válido no
  // attendee — por isso, quando o cliente não informa e-mail, geramos um
  // e-mail técnico a partir do telefone só para satisfazer o Cal.com; ele
  // nunca é mostrado para a cliente nem usado para contato real.
  if (!eventTypeId || !start || !name || (!email && !phone)) {
    return NextResponse.json(
      { error: "Informe nome e WhatsApp (ou e-mail) para agendar." },
      { status: 400 }
    );
  }
  const emailFinal = email || `${String(phone).replace(/\D/g, "")}@sem-email.isaesteticca.com.br`;

  try {
    const booking = await createBooking({ eventTypeId, start, name, email: emailFinal, phone, notes });
    return NextResponse.json({ booking });
  } catch (err: any) {
    console.error(err);
    const conflict = String(err?.message ?? "").includes("409");
    return NextResponse.json(
      {
        error: conflict
          ? "Esse horário acabou de ser reservado por outra pessoa. Escolha outro horário."
          : "Não foi possível confirmar o agendamento. Tente novamente.",
      },
      { status: conflict ? 409 : 502 }
    );
  }
}
