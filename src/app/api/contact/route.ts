import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import type { ContactInput } from "@/lib/reservation-types";

export async function POST(req: NextRequest) {
  let body: ContactInput;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, message: "Invalid JSON body." }, { status: 400 });
  }

  const { name, phone, date, area, topic, message, agree } = body;

  if (!name?.trim() || !phone?.trim() || !message?.trim() || !agree) {
    return NextResponse.json(
      { ok: false, message: "필수 항목을 입력해 주세요." },
      { status: 400 }
    );
  }

  try {
    const db = supabaseAdmin();
    const { error } = await db.from("contact_messages").insert({
      name: name.trim(),
      phone: phone.trim(),
      ceremony_date: date?.trim() || null,
      area: area?.trim() || null,
      topic: topic || "기타",
      message: message.trim(),
      agreed: true,
    });

    if (error) throw error;

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[contact] insert failed", err);
    return NextResponse.json(
      { ok: false, message: "문의를 접수하지 못했습니다. 잠시 후 다시 시도해 주세요." },
      { status: 500 }
    );
  }
}
