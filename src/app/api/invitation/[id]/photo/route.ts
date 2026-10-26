import { NextResponse } from "next/server";
import { notFound, serverError, sessionPhone, unauthorized } from "@/lib/invitation/api";
import { GALLERY_MAX } from "@/lib/invitation/content";
import { countPhotos, getOwned, photoUrl, uploadPhoto } from "@/lib/invitation/store";

export const dynamic = "force-dynamic";

const MAX_BYTES = 3 * 1024 * 1024; // 브라우저가 미리 줄여서 보내므로 보통 훨씬 작다

// 사진 한 장 올리기. 브라우저가 긴 변 1600px JPEG/WebP로 줄여서 보낸다. 형식은 파일 내용(첫 바이트)으로 확인한다.
export async function POST(req: Request, { params }: { params: { id: string } }) {
  const phone = sessionPhone();
  if (!phone) return unauthorized();
  try {
    const row = await getOwned(params.id, phone);
    if (!row) return notFound();
    const bytes = await req.arrayBuffer();
    if (bytes.byteLength === 0 || bytes.byteLength > MAX_BYTES) return NextResponse.json({ error: "too_large" }, { status: 413 });
    const b = new Uint8Array(bytes.slice(0, 12));
    const isJpeg = b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff;
    const isWebp = b[0] === 0x52 && b[1] === 0x49 && b[2] === 0x46 && b[3] === 0x46 && b[8] === 0x57 && b[9] === 0x45 && b[10] === 0x42 && b[11] === 0x50;
    if (!isJpeg && !isWebp) return NextResponse.json({ error: "bad_type" }, { status: 415 });
    if ((await countPhotos(row.id)) >= GALLERY_MAX + 4) return NextResponse.json({ error: "photo_limit" }, { status: 409 });
    const path = await uploadPhoto(row.id, bytes, isWebp ? "image/webp" : "image/jpeg");
    return NextResponse.json({ path, url: photoUrl(path) });
  } catch (err) {
    return serverError("photo", err);
  }
}
