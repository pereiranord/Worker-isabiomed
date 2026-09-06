// Wrapper server-only da API do Cal.com. A CAL_API_KEY nunca chega ao
// navegador: o widget de agendamento no site fala com nossas próprias rotas
// (/api/cal/availability e /api/cal/book), que chamam o Cal.com por aqui.
// Não usamos o embed do Cal.com — a interface é construída em
// components/BookingWidget.tsx.

const CAL_API_KEY = process.env.CAL_API_KEY as string;
const CALCOM_BASE = "https://api.cal.com/v2";

async function calFetch(path: string, init?: RequestInit) {
  const res = await fetch(`${CALCOM_BASE}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${CAL_API_KEY}`,
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
    cache: "no-store",
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Cal.com ${path} ${res.status}: ${body}`);
  }
  return res.json();
}

export async function getAvailability(eventTypeId: string, start: string, end: string) {
  const params = new URLSearchParams({
    eventTypeId,
    start,
    end,
    timeZone: "America/Sao_Paulo",
  });
  const json = await calFetch(`/slots?${params.toString()}`);
  return json.data as Record<string, { start: string }[]>;
}

export async function createBooking(input: {
  eventTypeId: number;
  start: string;
  name: string;
  email: string;
  phone?: string;
  notes?: string;
}) {
  return calFetch("/bookings", {
    method: "POST",
    body: JSON.stringify({
      eventTypeId: input.eventTypeId,
      start: input.start,
      attendee: {
        name: input.name,
        email: input.email,
        phoneNumber: input.phone,
        timeZone: "America/Sao_Paulo",
        language: "pt-BR",
      },
      bookingFieldsResponses: input.notes ? { notes: input.notes } : undefined,
    }),
  });
}
