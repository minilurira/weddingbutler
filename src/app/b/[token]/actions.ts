"use server";

import { respondInvite, type InviteState } from "@/lib/butler-invite";

export async function respondAction(token: string, action: "accept" | "decline"): Promise<{ state: InviteState } | null> {
  return respondInvite(token, action);
}
