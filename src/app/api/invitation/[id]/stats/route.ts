import { NextResponse } from "next/server";
import { notFound, serverError, sessionPhone, unauthorized } from "@/lib/invitation/api";
import { isPremium } from "@/lib/invitation/content";
import { getOwned, getStats, isPaid } from "@/lib/invitation/store";

export const dynamic = "force-dynamic";

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const phone = sessionPhone();
  if (!phone) return unauthorized();
  try {
    const row = await getOwned(params.id, phone);
    if (!row) return notFound();
    if (!isPremium(row.template) || !isPaid(row)) return NextResponse.json({ error: "premium_only" }, { status: 403 });
    return NextResponse.json({ stats: await getStats(row.id), status: row.status });
  } catch (err) {
    return serverError("stats", err);
  }
}
