# Lead холболт — Vertmonhub ба Google Sheet

Сайтын бүх маягт `src/app/api/contact/route.ts`-аар Vertmonhub CRM-д бүртгэгдэнэ.
Google Sheet болон Elysium Supabase-д давхар нөөцөлнө. Vertmonhub хүлээн авснаа
батлаагүй бол маягт амжилттай гэж харагдахгүй.

---

## 0. Vertmonhub холболт

Elysium Vercel төслийн `Production` орчинд дараах хоёр env-ийг тохируулна.
`Preview` орчинд тусдаа туршилтын CRM холбох үед л тэнд мөн тохируулна:

```bash
VERTMONHUB_LEADS_URL=https://<vertmonhub-domain>/api/integrations/elysium/leads
VERTMONHUB_LEADS_SECRET=<shared-secret>
```

`VERTMONHUB_LEADS_SECRET` нь Vertmonhub-ийн хүлээн авах endpoint-ийн нууцтай
ижил байна. Elysium сервер `Authorization: Bearer ...` header ашиглан `requestId`,
`name`, `phone`, `email`, `message`, `source`, `event` талбаруудыг JSON-оор илгээнэ.
Төслийн ID-г Elysium сайт илгээхгүй; Vertmonhub сервер Elysium төслийг тогтооно.
Хариу HTTP 2xx ба `{ "ok": true }` үед л маягт амжилттай болно.

## 1. Google Sheet бэлтгэх

1. Борлуулалтын багийн эзэмшилд шинэ Google Sheet үүсгэ (ж: `Elysium — Leads`).
2. Эхний sheet tab-ийн нэрийг **`Leads`** болго (өөр нэр бол `GOOGLE_SHEETS_TAB` env-д тэр нэрийг бич).
3. Эхний мөрөнд гарчиг мөр үүсгэ:

   | Огноо | Нэр | Утас | И-мэйл | Мессеж | Эх сурвалж | Эвент |
   |-------|-----|------|--------|--------|------------|-------|

   > Огноо нь **Улаанбаатарын цагийн бүсээр** (Asia/Ulaanbaatar) бичигдэнэ.

## 2. Google Cloud service account үүсгэх

1. [console.cloud.google.com](https://console.cloud.google.com) → шинэ project үүсгэ (ж: `elysium-web`).
2. **APIs & Services → Library** → **Google Sheets API** → **Enable**.
3. **APIs & Services → Credentials → Create Credentials → Service Account**:
   - Нэр: `elysium-leads` (эсвэл дураараа)
   - Role: хэрэггүй (skip) — Sheet-ийг share хийхээр хангалттай эрхтэй болно
4. Үүссэн service account → **Keys → Add Key → Create new key → JSON** → татна.
   JSON дотроос хэрэгтэй 2 утга:
   - `client_email` → `GOOGLE_SHEETS_CLIENT_EMAIL`
   - `private_key` → `GOOGLE_SHEETS_PRIVATE_KEY`

## 3. Sheet-ийг service account-тай хуваалцах

1. Sheet дээр **Share** → service account-ын `client_email`-ийг хайрцагт бичих.
2. Эрх: **Editor** өгнө. (И-мэйл мэдэгдэл илгээх шаардлагагүй — харьцах хайрцгыг чагталж болно.)

## 4. Env хувьсагчид

`.env.example`-ийг `.env.local` болгож хуулж, утгуудыг бөглө:

```bash
GOOGLE_SHEETS_SPREADSHEET_ID=1AbC...        # Sheet URL-ийн /d/ энэ хэсэг /edit
GOOGLE_SHEETS_CLIENT_EMAIL=elysium-leads@elysium-web.iam.gserviceaccount.com
GOOGLE_SHEETS_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIE...\n-----END PRIVATE KEY-----\n"
GOOGLE_SHEETS_TAB=Leads
```

> `private_key`-ийн мөр шилжилтүүдийг `\n` текстээр нэг мөрөнд бичнэ —
> код автоматаар бодит мөр шилжилт болгож хувиргана.

**Vercel дээр:** Project → Settings → Environment Variables → дээрх 4-ийг нэмнэ
(Production + Preview хоёуланд). Дараа нь **Redeploy** хийнэ.

## 5. Шалгах

```bash
# локал (env тохируулсны дараа npm run dev)
curl -X POST http://localhost:3000/api/contact \
  -H "Content-Type: application/json" \
  -d '{"name":"Тест","email":"test@example.mn","phone":"99112233","source":"manual-test"}'
```

Vertmonhub тохируулсан үед `{ "ok": true, "delivered": "vertmonhub+sheets+store" }`
хариу гурван системд хүрснийг илэрхийлнэ. Аль нэг нөөц систем унавал
`delivered` зөвхөн амжилттай хүрсэн системүүдийг жагсаана.

---

## Ажиллах зарчим

- Форм илгээх → `POST /api/contact` → validation (нэр заавал + утас эсвэл и-мэйлийн аль нэг) → Vertmonhub, Sheet, Supabase-д зэрэг илгээх.
- **Vertmonhub env дутуу эсвэл хүргэлт алдаатай үед** маягт алдаа харуулж,
  ижил `requestId`-тай дахин илгээх боломжтой. Sheet/Supabase нөөц бүртгэлээ оролдоно.
- **Нөөц хүргэлт алдаатай үед** Vertmonhub баталгаажсан бол маягт амжилттай.
- **Spam хамгаалалт:** формд нуугдсан `website` honeypot талбар байгаа — bot бөглөвөл
  чимээгүйхэн хаягдана.

## Дараагийн сунгалт (шаардлагатай бол)

- **HubSpot CRM:** `appendToSheet()`-ийн оронд/хамт HubSpot Forms API дуудах —
  route.ts нэг газар өөрчлөгдөнө.
- **Slack/имэйл мэдэгдэл:** шинэ lead бүрт борлуулалтын суваг руу push —
  мөн route.ts-д нэмэгдэнэ.
