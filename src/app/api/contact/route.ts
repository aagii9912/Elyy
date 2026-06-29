import { NextResponse } from "next/server";

// Booking enquiry endpoint.
// TODO (Phase 3): wire to email (Resend) or a CRM. For now it validates
// the payload and logs it server-side so the form works end-to-end.
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const name = String(body?.name ?? "").trim();
    const email = String(body?.email ?? "").trim();

    if (!name || !email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
      return NextResponse.json(
        { ok: false, error: "Please provide a valid name and email." },
        { status: 400 }
      );
    }

    // Placeholder: replace with real delivery (email / CRM).
    console.log("[Elysium] New visit request:", {
      name,
      email,
      phone: body?.phone ?? "",
      residence: body?.residence ?? "",
      date: body?.date ?? "",
      message: body?.message ?? "",
    });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid request." }, { status: 400 });
  }
}
