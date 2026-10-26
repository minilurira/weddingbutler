import { NextResponse } from "next/server";
import { notFound, serverError, sessionPhone, unauthorized } from "@/lib/invitation/api";
import { AUDIO_MAX_BYTES } from "@/lib/invitation/content";
import { countAudio, getOwned, uploadAudio } from "@/lib/invitation/store";

export const dynamic = "force-dynamic";

// 배경음악 직접 올리기: 3MB 이하 mp3 또는 m4a 한 곡. 형식은 확장자나 신고된 형식이 아니라 파일 내용(첫 바이트)으로 확인한다.
export async function POST(req: Request, { params }: { params: { id: string } }) {
  const phone = sessionPhone();
  if (!phone) return unauthorized();
  try {
    const row = await getOwned(params.id, phone);
    if (!row) return notFound();
    const bytes = await req.arrayBuffer();
    if (bytes.byteLength < 1024 || bytes.byteLength > AUDIO_MAX_BYTES) return NextResponse.json({ error: "too_large" }, { status: 413 });
    const b = new Uint8Array(bytes.slice(0, 12));
    const isId3 = b[0] === 0x49 && b[1] === 0x44 && b[2] === 0x33;
    const isMp3Frame = b[0] === 0xff && (b[1] & 0xe0) === 0xe0 && (b[1] & 0x06) !== 0;
    const isM4a = b[4] === 0x66 && b[5] === 0x74 && b[6] === 0x79 && b[7] === 0x70; // "ftyp"
    if (!isId3 && !isMp3Frame && !isM4a) return NextResponse.json({ error: "bad_type" }, { status: 415 });
    if ((await countAudio(row.id)) >= 4) return NextResponse.json({ error: "audio_limit" }, { status: 409 });
    const path = await uploadAudio(row.id, bytes, isM4a ? "audio/mp4" : "audio/mpeg");
    return NextResponse.json({ path });
  } catch (err) {
    return serverError("music", err);
  }
}
