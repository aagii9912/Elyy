import { NextResponse } from "next/server";
import { JWT } from "google-auth-library";

/* ============================================================
   LEAD CAPTURE → Google Sheet
   Борлуулалтын менежерүүд формын датаг Google Sheet-ээр
   шууд хүлээн авдаг. Service account-ын env-үүд:
     GOOGLE_SHEETS_SPREADSHEET_ID — Sheet URL-ийн /d/.../ хэсэг
     GOOGLE_SHEETS_CLIENT_EMAIL   — service account и-мэйл
     GOOGLE_SHEETS_PRIVATE_KEY    — private key (\n-тэй)
     GOOGLE_SHEETS_TAB            — sheet tab нэр (default "Leads")
   Env байхгүй бол lead-ыг server log-д хадгалж ok:true буцаана
   (dev/preview горимд форм ажиллах боломжийг хадгална).
   Тохируулгын заавар: docs/lead-integration.md
   ============================================================ */

export const runtime = "nodejs";

const SHEET_ID = process.env.GOOGLE_SHEETS_SPREADSHEET_ID;
const CLIENT_EMAIL = process.env.GOOGLE_SHEETS_CLIENT_EMAIL;
// Vercel/CI env-д private key-ийн мөр шилжилт "\n" текстээр ордог
const PRIVATE_KEY = process.env.GOOGLE_SHEETS_PRIVATE_KEY?.replace(/\\n/g, "\n");
const SHEET_TAB = process.env.GOOGLE_SHEETS_TAB || "Leads";

const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

function sheetsConfigured() {
  return Boolean(SHEET_ID && CLIENT_EMAIL && PRIVATE_KEY);
}

/** Sheet мөр: Огноо (UB) | Нэр | Утас | И-мэйл | Мессеж | Эх сурвалж | Эвент */
function leadRow(lead: {
  name: string;
  phone: string;
  email: string;
  message: string;
  source: string;
  event: string;
}) {
  const timestamp = new Date().toLocaleString("sv-SE", {
    timeZone: "Asia/Ulaanbaatar",
  });
  return [timestamp, lead.name, lead.phone, lead.email, lead.message, lead.source, lead.event];
}

async function appendToSheet(row: string[]) {
  const jwt = new JWT({
    email: CLIENT_EMAIL,
    key: PRIVATE_KEY,
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });
  await jwt.authorize();
  const token = jwt.credentials.access_token;
  if (!token) throw new Error("Could not obtain Google access token");

  const url = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/${encodeURIComponent(
    SHEET_TAB
  )}:append?valueInputOption=USER_ENTERED&insertDataOption=INSERT_ROWS`;

  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ values: [row] }),
  });

  if (!res.ok) {
    const detail = await res.text();
    throw new Error(`Sheets append failed (${res.status}): ${detail}`);
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const name = String(body?.name ?? "").trim();
    const email = String(body?.email ?? "").trim();
    const phone = String(body?.phone ?? "").trim();
    const message = String(body?.message ?? "").trim();
    const source = String(body?.source ?? request.headers.get("referer") ?? "unknown").trim();
    // Эвентийн landing page-аас ирсэн бол аль эвент болохыг тэмдэглэнэ.
    const event = String(body?.event ?? "").trim();

    // Honeypot: bot бөглөдөг нуугдсан талбар — чимээгүйхэн амжилттай мэт хариулна
    if (String(body?.website ?? "").trim()) {
      return NextResponse.json({ ok: true });
    }

    if (!name || (!phone && !email) || (email && !EMAIL_RE.test(email))) {
      return NextResponse.json(
        { ok: false, error: "Please provide your name and a phone or email." },
        { status: 400 }
      );
    }

    const lead = { name, phone, email, message, source, event };

    if (!sheetsConfigured()) {
      console.warn(
        "[leads] Google Sheets ТОХИРУУЛАГААГҮЙ — lead зөвхөн log-д хадгалагдлаа. docs/lead-integration.md"
      );
      console.log("[leads] New lead:", JSON.stringify(lead));
      return NextResponse.json({ ok: true, delivered: "log" });
    }

    await appendToSheet(leadRow(lead));
    return NextResponse.json({ ok: true, delivered: "sheets" });
  } catch (err) {
    console.error("[leads] Delivery failed:", err);
    return NextResponse.json(
      { ok: false, error: "Could not deliver your request. Please try again." },
      { status: 502 }
    );
  }
}
