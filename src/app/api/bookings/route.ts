import { handleRouteError, ok, readJson } from "@/lib/api";
import { createBooking } from "@/lib/bookings";
import { bookingRequestSchema } from "@/lib/validation";

export const dynamic = "force-dynamic";

/**
 * POST /api/bookings
 *
 * 예약을 pending 으로 만들고 결제에 필요한 값을 돌려준다.
 * 금액은 요청 본문에서 받지 않는다 — 서버가 요금제와 하객 수로 직접 계산한다.
 */
export async function POST(request: Request) {
  try {
    const body = await readJson(request);
    const input = bookingRequestSchema.parse(body);
    const created = await createBooking(input);

    return ok(created, 201);
  } catch (error) {
    return handleRouteError(error);
  }
}
