# Lead холболт — Google Sheet тохируулга

Вэбийн "Уулзалт товлох" формын дата **борлуулалтын менежерүүдийн Google Sheet-д шууд нэмэгддэг**
байх тохируулгын заавар. Кодын тал бэлэн (`src/app/api/contact/route.ts`) — зөвхөн
Google талын тохируулга + env хувьсагчид хэрэгтэй.

---

## 1. Google Sheet бэлтгэх

1. Борлуулалтын багийн эзэмшилд шинэ Google Sheet үүсгэ (ж: `Elysium — Leads`).
2. Эхний sheet tab-ийн нэрийг **`Leads`** болго (өөр нэр бол `GOOGLE_SHEETS_TAB` env-д тэр нэрийг бич).
3. Эхний мөрөнд гарчиг мөр үүсгэ:

   | Огноо | Нэр | Утас | И-мэйл | Мессеж | Эх сурвалж |
   |-------|-----|------|--------|--------|------------|

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

Хариу `{ "ok": true, "delivered": "sheets" }` бол Sheet-д шинэ мөр нэмэгдсэн гэсэн үг.
`delivered: "log"` бол env дутуу — Vercel/server log-г шалгана.

---

## Ажиллах зарчим

- Форм илгээх → `POST /api/contact` → validation (нэр заавал + утас эсвэл и-мэйлийн аль нэг) → Sheet-д мөр нэмэх.
- **Env тохируулаагүй үед** (ж: локал dev) lead алдагдахгүй — server log-д бичигдэж,
  форм амжилттай мэт ажиллана. Production-д env заавал тохируулна.
- **Хүргэлт алдаатай үед** (Sheet API down г.м.) форм алдааны мессеж харуулж,
  хэрэглэгч дахин илгээх боломжтой — lead дуутахгүй.
- **Spam хамгаалалт:** формд нуугдсан `website` honeypot талбар байгаа — bot бөглөвөл
  чимээгүйхэн хаягдана.

## Дараагийн сунгалт (шаардлагатай бол)

- **HubSpot CRM:** `appendToSheet()`-ийн оронд/хамт HubSpot Forms API дуудах —
  route.ts нэг газар өөрчлөгдөнө.
- **Slack/имэйл мэдэгдэл:** шинэ lead бүрт борлуулалтын суваг руу push —
  мөн route.ts-д нэмэгдэнэ.
