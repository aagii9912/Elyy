import { NextResponse } from "next/server";
import { getStore } from "@/lib/store";

export const runtime = "nodejs";

/** Бүртгэлийн жагсаалт. ?eventId=… → зөвхөн тухайн эвентийнх. */
export async function GET(req: Request) {
  try {
    const eventId = new URL(req.url).searchParams.get("eventId") || undefined;
    const leads = await getStore().listLeads(eventId);
    return NextResponse.json({ ok: true, leads });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    // event_leads хүснэгт үүсгээгүй бол ойлгомжтой заавар буцаана.
    const missingTable = message.includes("event_leads") && message.includes("schema cache");
    console.error("[admin] listLeads:", err);
    return NextResponse.json(
      {
        ok: false,
        error: missingTable
          ? "event_leads хүснэгт үүсээгүй байна. docs/supabase-init.sql-ийг Supabase дээр ажиллуулна уу."
          : "Бүртгэл ачаалахад алдаа гарлаа.",
      },
      { status: 500 }
    );
  }
}
