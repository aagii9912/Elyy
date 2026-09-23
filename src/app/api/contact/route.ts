import { NextResponse } from "next/server";
import { JWT } from "google-auth-library";
import { randomUUID } from "node:crypto";
import { getStore } from "@/lib/store";

/* ============================================================
   LEAD CAPTURE → Vertmonhub CRM + Google Sheet + Supabase
   Vertmonhub баталгаажуулбал л маягт амжилттай болно. Google Sheet,
   Supabase хоёр нөөц бүртгэл хэвээр үлдэнэ. Service account-ын env-үүд:
     GOOGLE_SHEETS_SPREADSHEET_ID — Sheet URL-ийн /d/.../ хэсэг
     GOOGLE_SHEETS_CLIENT_EMAIL   — service account и-мэйл
     GOOGLE_SHEETS_PRIVATE_KEY    — private key (\n-тэй)
     GOOGLE_SHEETS_TAB            — sheet tab нэр (default "Leads")
   Тохируулгын заавар: docs/lead-integration.md
   ============================================================ */

export const runtime = "nodejs";

const SHEET_ID = process.env.GOOGLE_SHEETS_SPREADSHEET_ID;
const CLIENT_EMAIL = process.env.GOOGLE_SHEETS_CLIENT_EMAIL;
// Vercel/CI env-д private key-ийн мөр шилжилт "\n" текстээр ордог
const PRIVATE_KEY = process.env.GOOGLE_SHEETS_PRIVATE_KEY?.replace(/\\n/g, "\n");
const SHEET_TAB = process.env.GOOGLE_SHEETS_TAB || "Leads";

const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

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

async function forwardToVertmonhub(lead: {
  requestId: string;
  name: string;
  phone: string;
  email: string;
  message: string;
  source: string;
  event: string;
}) {
  const url = process.env.VERTMONHUB_LEADS_URL;
  const secret = process.env.VERTMONHUB_LEADS_SECRET;
  if (!url || !secret) throw new Error("Vertmonhub lead intake is not configured");

  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${secret}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      requestId: lead.requestId,
      name: lead.name,
      ...(lead.phone && { phone: lead.phone }),
      ...(lead.email && { email: lead.email }),
      ...(lead.message && { message: lead.message }),
      ...(lead.source && { source: lead.source }),
      ...(lead.event && { event: lead.event }),
    }),
    signal: AbortSignal.timeout(8000),
  });
  const result = await res.json().catch(() => null);
  if (!res.ok || result?.ok !== true) {
    throw new Error(`Vertmonhub lead intake failed (${res.status})`);
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
    if (
      name.length > 255 || phone.length > 50 || email.length > 255 ||
      message.length > 2000 || source.length > 500 || event.length > 255
    ) {
      return NextResponse.json(
        { ok: false, error: "One or more fields are too long." },
        { status: 400 }
      );
    }

    const suppliedId = String(body?.requestId ?? "").trim();
    const requestId = UUID_RE.test(suppliedId) ? suppliedId : randomUUID();
    const lead = { requestId, name, phone, email, message, source, event };

    /* Vertmonhub бол үндсэн CRM. Google Sheet ба Supabase-д зэрэг нөөцөлнө.
       CRM баталгаажаагүй үед маягтад амжилт буцаахгүй. */
    const delivered: string[] = [];
    const failures: string[] = [];

    // Эвентийн slug-ийг source-оос салгаж (event/<slug>), эвентийг олно.
    const slug = source.startsWith("event/") ? source.slice("event/".length) : null;

    const [sheetResult, storeResult, crmResult] = await Promise.allSettled([
      sheetsConfigured() ? appendToSheet(leadRow(lead)) : Promise.reject(new Error("not-configured")),
      (async () => {
        const store = getStore();
        const doc = slug ? await store.getEventBySlug(slug).catch(() => null) : null;
        await store.createLead({
          eventId: doc?.id ?? null,
          eventSlug: doc?.slug ?? slug,
          eventName: doc?.name ?? (event || null),
          name,
          phone,
          email,
          message,
          source,
        });
      })(),
      forwardToVertmonhub(lead),
    ]);

    if (sheetResult.status === "fulfilled") delivered.push("sheets");
    else if (sheetResult.reason?.message === "not-configured") failures.push("sheets:тохируулаагүй");
    else {
      failures.push("sheets");
      console.error("[leads] Sheets append failed:", sheetResult.reason);
    }

    if (storeResult.status === "fulfilled") delivered.push("store");
    else {
      failures.push("store");
      console.error("[leads] Store write failed:", storeResult.reason);
    }

    if (crmResult.status === "rejected") {
      console.error("[leads] Vertmonhub delivery failed:", requestId, crmResult.reason);
      return NextResponse.json(
        { ok: false, requestId, error: "Could not deliver your request. Please try again." },
        { status: 502 }
      );
    }

    if (failures.length) console.warn("[leads] Backup delivery failed:", requestId, failures);
    return NextResponse.json({ ok: true, requestId, delivered: ["vertmonhub", ...delivered].join("+") });
  } catch (err) {
    console.error("[leads] Delivery failed:", err);
    return NextResponse.json(
      { ok: false, error: "Could not deliver your request. Please try again." },
      { status: 502 }
    );
  }
}
