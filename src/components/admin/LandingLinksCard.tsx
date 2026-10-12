"use client";

/* Хуудасны зориулалт ба суваг тус бүрийн бэлэн линк.
   Линк бүр UTM-тэй тул Vertmonhub лид эвентээс үү, сошиал зараас уу
   гэдгийг ялгана. UTM-гүй орж ирсэн лидэд зориулалтыг ашиглана. */

import { useState, useSyncExternalStore } from "react";
import QRCode from "qrcode";
import { LANDING_PURPOSES, META_URL_PARAMETERS, landingLinks, type LandingPurpose } from "@/lib/landing-attribution";
import { Button, Card } from "./ui";

const noopSubscribe = () => () => {};

export function LandingLinksCard({ slug, savedSlug, published, purpose, onPurposeChange, disabled }: {
  slug: string;
  /** Хадгалсан slug — өөрчилсөн боловч хадгалаагүй үед анхааруулна. */
  savedSlug: string;
  published: boolean;
  purpose: LandingPurpose | undefined;
  onPurposeChange: (purpose: LandingPurpose) => void;
  disabled?: boolean;
}) {
  const origin = useSyncExternalStore(noopSubscribe, () => window.location.origin, () => "");
  const pageUrl = `${origin}/${slug}`;
  const links = landingLinks(pageUrl, slug);
  const [qr, setQr] = useState<{ url: string; dataUrl: string } | null>(null);
  const [qrError, setQrError] = useState(false);

  const showQr = async () => {
    setQrError(false);
    try {
      const dataUrl = await QRCode.toDataURL(links.eventQr, { width: 1024, margin: 2, errorCorrectionLevel: "M" });
      setQr({ url: links.eventQr, dataUrl });
    } catch {
      setQrError(true);
    }
  };

  return (
    <Card title="Зориулалт ба холбоос">
      <fieldset disabled={disabled} className="grid gap-3 sm:grid-cols-3">
        <legend className="mb-3 text-sm leading-relaxed text-neutral-500">
          Vertmonhub лид бүрд аль хуудас, ямар сувгаар ирснийг харуулна. Линкэнд UTM байхгүй бол
          сувгийг энэ зориулалтаар тогтооно.
        </legend>
        {LANDING_PURPOSES.map((option) => (
          <label key={option.value} className={`cursor-pointer rounded-xl border-2 p-4 transition-colors focus-within:ring-2 focus-within:ring-ink/30 ${
            purpose === option.value ? "border-ink bg-ink/5" : "border-neutral-200 bg-white hover:border-neutral-300"
          }`}>
            <span className="flex items-center gap-2.5 text-sm font-bold text-neutral-900">
              <input type="radio" name="landing-purpose" value={option.value} checked={purpose === option.value}
                onChange={() => onPurposeChange(option.value)} className="h-4 w-4 accent-ink" />
              {option.label}
            </span>
            <span className="mt-2 block text-sm leading-relaxed text-neutral-500">{option.description}</span>
          </label>
        ))}
      </fieldset>
      {!purpose && (
        <p className="mt-3 rounded-md bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-700">
          Зориулалт сонгоогүй: UTM-гүй орж ирсэн лидийн суваг «тодорхойгүй» болно.
        </p>
      )}

      <div className="mt-6 space-y-5 border-t border-neutral-200 pt-5">
        {(slug !== savedSlug || !published) && (
          <p className="rounded-md bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-700">
            {slug !== savedSlug ? "Slug-аа хадгалсны дараа линкийг ашиглана уу." : "Хуудас ноорог байна: хэвлэсний дараа линк ажиллана."}
          </p>
        )}

        <LinkBlock
          title="Сошиал зар (Facebook, Instagram)"
          hint="Ads Manager → зар → «Website URL»-д хуудасны хаягийг, «URL parameters»-д доорх мөрийг хуулна. Meta нь кампанит ажил, зарын нэр/ID-г өөрөө бөглөнө."
        >
          <CopyField label="Website URL" value={pageUrl} />
          <CopyField label="URL parameters" value={META_URL_PARAMETERS} />
        </LinkBlock>

        <LinkBlock title="Эвентийн QR" hint="Ярмаг, экспо, нээлттэй өдөрт хэвлэх QR. Энэ линкээр орсон лид «Эвент» гэж бүртгэгдэнэ.">
          <CopyField label="QR линк" value={links.eventQr} />
          <div className="flex flex-wrap items-center gap-3">
            <Button variant="ghost" type="button" onClick={showQr} disabled={!origin}>QR үүсгэх</Button>
            {qr?.url === links.eventQr && (
              <Button variant="ghost" type="button" onClick={() => downloadDataUrl(qr.dataUrl, `${slug}-event-qr.png`)}>PNG татах</Button>
            )}
            {qrError && <span className="text-xs font-semibold text-red-600">QR үүсгэж чадсангүй.</span>}
          </div>
          {qr?.url === links.eventQr && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={qr.dataUrl} alt="Эвентийн QR код" width={192} height={192} className="h-48 w-48 rounded-lg border border-neutral-200 bg-white" />
          )}
        </LinkBlock>

        <LinkBlock title="Сошиал пост (органик)" hint="Page, Instagram-ийн энгийн пост, story-д тавих линк. Зар биш гэж ялгагдана.">
          <CopyField label="Постын линк" value={links.socialPost} />
        </LinkBlock>
      </div>
    </Card>
  );
}

function downloadDataUrl(dataUrl: string, filename: string) {
  const link = document.createElement("a");
  link.href = dataUrl;
  link.download = filename;
  link.click();
}

function LinkBlock({ title, hint, children }: { title: string; hint: string; children: React.ReactNode }) {
  return (
    <section className="space-y-2.5">
      <div>
        <h3 className="text-sm font-bold text-neutral-900">{title}</h3>
        <p className="mt-1 text-xs leading-relaxed text-neutral-500">{hint}</p>
      </div>
      {children}
    </section>
  );
}

function CopyField({ label, value }: { label: string; value: string }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* clipboard блоклогдсон бол талбараас гараар хуулна */
    }
  };
  return (
    <div className="flex items-center gap-2">
      <input readOnly aria-label={label} value={value} onFocus={(e) => e.currentTarget.select()}
        className="min-w-0 flex-1 rounded-lg border border-neutral-300 bg-neutral-50 px-3 py-2 font-mono text-xs text-neutral-700" />
      <Button variant="ghost" type="button" onClick={copy} className="shrink-0">{copied ? "Хуулагдлаа" : "Хуулах"}</Button>
    </div>
  );
}
