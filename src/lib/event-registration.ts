/** Shared options and server validation for landing-page appointment requests. */
export const APARTMENT_TYPES = ["3 Өрөө", "4 Өрөө", "5 Өрөө", "Duplex 4-6 Өрөө", "Үйлчилгээний талбай"] as const;
export const AREA_RANGES = ["161-182 м.кв", "201-230 м.кв", "253-370 м.кв"] as const;

export type RegistrationOptions = {
  apartmentTypes: readonly string[];
  areaRanges: readonly string[];
  apartmentLabel?: string;
  areaLabel?: string;
  /** false: өдөрлөг/арга хэмжээний бүртгэл — зочин өдөр сонгохгүй. Хуучин хуудсанд байхгүй (= асууна). */
  askDate?: boolean;
};

export function registrationOptions(form: Partial<RegistrationOptions>) {
  return {
    apartmentTypes: form.apartmentTypes ?? APARTMENT_TYPES,
    areaRanges: form.areaRanges ?? AREA_RANGES,
    apartmentLabel: form.apartmentLabel?.trim() || "Сонирхож буй орон сууц",
    areaLabel: form.areaLabel?.trim() || "Сонирхож буй талбайн хэмжээ",
    askDate: form.askDate !== false,
  };
}

export function validRegistrationOptions(value: unknown): value is string[] {
  return Array.isArray(value) && value.length > 0 && value.length <= 20 &&
    value.every((item) => typeof item === "string" && item.trim() === item && item.length > 0 && item.length <= 60) &&
    new Set(value).size === value.length;
}

export function ulaanbaatarToday(now = new Date()): string {
  return now.toLocaleDateString("sv-SE", { timeZone: "Asia/Ulaanbaatar" });
}

/** Keep all three existing destinations compatible by storing a readable message. */
export function eventRegistrationMessage(
  body: Record<string, unknown>, today = ulaanbaatarToday(), options: Partial<RegistrationOptions> = {},
):
  { ok: true; message: string } | { ok: false; error: string } {
  const config = registrationOptions(options);
  const date = body.appointmentDate;
  if (config.askDate && (
    typeof date !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(date) ||
    Number.isNaN(Date.parse(date)) || new Date(date).toISOString().slice(0, 10) !== date || date < today
  )) {
    return { ok: false, error: "Өнөөдөр эсвэл түүнээс хойших өдрийг сонгоно уу." };
  }

  const selections: string[][] = [];
  for (const [key, allowed, label] of [
    ["apartmentTypes", config.apartmentTypes, config.apartmentLabel],
    ["areaRanges", config.areaRanges, config.areaLabel],
  ] as const) {
    const values = body[key];
    if (
      !Array.isArray(values) || values.length === 0 || values.length > allowed.length ||
      values.some((value) => typeof value !== "string" || !allowed.includes(value)) ||
      new Set(values).size !== values.length
    ) {
      return { ok: false, error: `“${label}” хэсгээс сонгоно уу.` };
    }
    selections.push(values);
  }

  return {
    ok: true,
    message: [
      ...(config.askDate ? [`Цаг товлох өдөр: ${date}`] : []),
      `${config.apartmentLabel}: ${selections[0].join(", ")}`,
      `${config.areaLabel}: ${selections[1].join(", ")}`,
    ].join("\n"),
  };
}

/** Lines other forms write; never the two selection lines of a registration page. */
const OTHER_FORM_LINE = /^(Зочдын тоо|Тэмдэглэл|Сонирхсон тип|Уулзалтын хүссэн огноо): /;

/** Read the submitted values, never the landing page's current editable options.
 * Keep multiple selections together so commas inside custom options are preserved.
 * Pages that do not ask for a date start directly with the two selection lines. */
export function leadSelections(message: string) {
  const lines = message.split(/\r?\n/);
  const date = /^Цаг товлох өдөр: (\d{4}-\d{2}-\d{2})$/.exec(lines[0]);
  const [apartment, area] = lines.slice(date ? 1 : 0, date ? 3 : 2)
    .map((line) => (line.includes(": ") && !OTHER_FORM_LINE.test(line) ? line.slice(line.indexOf(": ") + 2) : null));
  if (apartment != null && area != null) {
    return { appointmentDate: date?.[1] ?? "", apartmentTypes: apartment, areaRanges: area };
  }

  // The main site's existing apartment form also records the chosen area.
  const unit = /^Сонирхсон тип: .+? · .+? · ([^·\r\n]+) · ([^\r\n]+?)(?: — |$)/.exec(message);
  return {
    appointmentDate: /^Уулзалтын хүссэн огноо: (\d{4}-\d{2}-\d{2})(?:\s|$)/.exec(message)?.[1] ?? "",
    apartmentTypes: unit?.[1].trim() ?? "",
    areaRanges: unit && /^\d+(?:[.,]\d+)?\s*м(?:²|2|\.кв)\.?$/i.test(unit[2].trim())
      ? unit[2].trim() : "",
  };
}

export function matchesLeadArea(areaRanges: string, query: string): boolean {
  const normalize = (value: string) => value.toLowerCase().replace(/[–—−]/g, "-").replace(/\s+/g, "");
  return normalize(areaRanges).includes(normalize(query));
}
