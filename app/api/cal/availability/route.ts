import { NextRequest, NextResponse } from "next/server";
import { getAvailability } from "@/lib/calcom";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const eventTypeId = searchParams.get("eventTypeId");
  const start = searchParams.get("start");
  const end = searchParams.get("end");

  if (!eventTypeId || !start || !end) {
    return NextResponse.json(
      { error: "eventTypeId, start e end são obrigatórios" },
      { status: 400 }
    );
  }

  try {
    const slots = await getAvailability(eventTypeId, start, end);
    return NextResponse.json({ slots });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Não foi possível carregar os horários agora. Tente novamente." },
      { status: 502 }
    );
  }
}
