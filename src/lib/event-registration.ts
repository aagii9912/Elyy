/** Shared options and server validation for landing-page appointment requests. */
export const APARTMENT_TYPES = ["3 Өрөө", "4 Өрөө", "5 Өрөө", "Duplex 4-6 Өрөө", "Үйлчилгээний талбай"] as const;
export const AREA_RANGES = ["161-182 м.кв", "201-230 м.кв", "253-370 м.кв"] as const;

export type RegistrationOptions = {
  apartmentTypes: readonly string[];
  areaRanges: readonly string[];
  apartmentLabel?: string;
  areaLabel?: string;
};

export function registrationOptions(form: Partial<RegistrationOptions>) {
  return {
    apartmentTypes: form.apartmentTypes ?? APARTMENT_TYPES,
    areaRanges: form.areaRanges ?? AREA_RANGES,
    apartmentLabel: form.apartmentLabel?.trim() || "Сонирхож буй орон сууц",
    areaLabel: form.areaLabel?.trim() || "Сонирхож буй талбайн хэмжээ",
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
  const date = body.appointmentDate;
  if (
    typeof date !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(date) ||
    Number.isNaN(Date.parse(date)) || new Date(date).toISOString().slice(0, 10) !== date || date < today
  ) {
    return { ok: false, error: "Өнөөдөр эсвэл түүнээс хойших өдрийг сонгоно уу." };
  }

  const config = registrationOptions(options);
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
      `Цаг товлох өдөр: ${date}`,
      `${config.apartmentLabel}: ${selections[0].join(", ")}`,
      `${config.areaLabel}: ${selections[1].join(", ")}`,
    ].join("\n"),
  };
}
