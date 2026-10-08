"use client";

import { emptyManager, type RegistrationPageContent } from "@/lib/registration-page";
import { Button, Card, Field, ImageField, Select, TextArea, TextInput } from "./ui";

type Props = { value: RegistrationPageContent; onChange: (update: (current: RegistrationPageContent) => RegistrationPageContent) => void };

function ColorField({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return <div>
    <span className="mb-2 block text-body font-semibold text-[#33483a]">{label}</span>
    <div className="flex items-center gap-2">
      <input aria-label={`${label} сонгох`} type="color" value={/^#[\da-f]{6}$/i.test(value) ? value : "#ffffff"} onChange={(e) => onChange(e.target.value)} className="h-11 w-12 shrink-0 cursor-pointer rounded border border-neutral-300" />
      <TextInput aria-label={label} maxLength={7} value={value} onChange={(e) => onChange(e.target.value)} />
    </div>
  </div>;
}

export function RegistrationHeaderFields({ value, onChange }: Props) {
  const patch = (next: Partial<RegistrationPageContent["header"]>) => onChange((current) => ({ ...current, header: { ...current.header, ...next } }));
  const h = value.header;
  return <Card title="Header — баннер, лого, танилцуулга">
    <div className="space-y-5">
      <p className="text-sm text-neutral-500">Хоосон зураг, текстийн оронд placeholder харагдана. Зургаа бэлдэх хэмжээг талбар бүрийн доор харуулав.</p>
      <ImageField label="Header зураг — компьютер" value={h.desktopImage} onChange={(desktopImage) => patch({ desktopImage })} ratio="24/5" maxEdge={1920} />
      <div className="grid items-start gap-5 sm:grid-cols-2">
        <ImageField label="Header зураг — гар утас" value={h.mobileImage} onChange={(mobileImage) => patch({ mobileImage })} ratio="3/2" maxEdge={1080} hint="Хоосон бол компьютерийн зургийг тайрч харуулна." />
        <ImageField label="Header лого" value={h.logo} onChange={(logo) => patch({ logo })} ratio="2/1" maxEdge={640} fit="contain" hint="SVG эсвэл тунгалаг PNG; зургийн хаяг оруулж болно." />
      </div>
      <Field label="Логоны тайлбар" hint="Дэлгэц уншигчид уншигдах брэндийн нэр."><TextInput maxLength={200} value={h.logoAlt} onChange={(e) => patch({ logoAlt: e.target.value })} /></Field>
      <Field label="Header уриа, гарчиг"><TextInput maxLength={200} value={h.title} placeholder="Уриа, гарчиг" onChange={(e) => patch({ title: e.target.value })} /></Field>
      <Field label="Цаг товлохын зорилго, танилцуулга"><TextArea rows={3} maxLength={3000} value={h.body} onChange={(e) => patch({ body: e.target.value })} /></Field>
    </div>
  </Card>;
}

export function RegistrationSupportingFields({ value, onChange }: Props) {
  const { links, managers, footer } = value;
  const patchLinks = (next: Partial<RegistrationPageContent["links"]>) => onChange((current) => ({ ...current, links: { ...current.links, ...next } }));
  const patchSocial = (index: number, next: Partial<typeof links.social[number]>) => onChange((current) => ({ ...current, links: { ...current.links, social: current.links.social.map((item, i) => i === index ? { ...item, ...next } : item) } }));
  const patchManagers = (next: Partial<RegistrationPageContent["managers"]>) => onChange((current) => ({ ...current, managers: { ...current.managers, ...next } }));
  const patchFooter = (next: Partial<RegistrationPageContent["footer"]>) => onChange((current) => ({ ...current, footer: { ...current.footer, ...next } }));
  return <>
    <Card title="Вэбсайт, сошиал холбоос">
      <div className="space-y-4">
        <p className="text-sm text-neutral-500">Энэ landing page-ийн хажуугийн мэдээлэл болон footer-т ашиглана. Хоосон сошиал холбоос харагдахгүй.</p>
        <Field label="Вэбсайтын холбоос"><TextInput value={links.website} maxLength={2000} placeholder="https://…" onChange={(e) => patchLinks({ website: e.target.value })} /></Field>
        {links.social.map((item, i) => <div key={i} className="space-y-3 rounded-xl border border-neutral-200 p-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label={`Сошиал ${i + 1} — нэр`}><TextInput maxLength={60} value={item.label} onChange={(e) => patchSocial(i, { label: e.target.value })} /></Field>
            <Field label={`Сошиал ${i + 1} — дүрс`}><Select value={item.icon} onChange={(e) => patchSocial(i, { icon: e.target.value })}>
              {["facebook", "instagram", "youtube", "tiktok", "linkedin", "twitter", "link"].map((icon) => <option key={icon} value={icon}>{icon}</option>)}
            </Select></Field>
          </div>
          <Field label={`Сошиал ${i + 1} — холбоос`}><TextInput value={item.href} maxLength={2000} placeholder="https://…" onChange={(e) => patchSocial(i, { href: e.target.value })} /></Field>
          <Button type="button" variant="ghost" onClick={() => patchLinks({ social: links.social.filter((_, j) => j !== i) })}>Холбоос хасах</Button>
        </div>)}
        <Button type="button" variant="ghost" disabled={links.social.length >= 8} onClick={() => patchLinks({ social: [...links.social, { label: "", icon: "link", href: "" }] })}>+ Сошиал холбоос нэмэх</Button>
      </div>
    </Card>
    <Card title="Амжилтын дэлгэц — борлуулалтын менежерүүд">
      <div className="space-y-4">
        <p className="text-sm text-neutral-500">Хүсэлт амжилттай илгээгдсэний дараа гарна. Компьютерт 3, гар утсанд 1 карт харагдаж, үлдсэн картуудыг гүйлгэнэ.</p>
        <Field label="Менежерүүдийн хэсгийн гарчиг"><TextInput maxLength={200} value={managers.title} onChange={(e) => patchManagers({ title: e.target.value })} /></Field>
        <Field label="Менежерүүдийн хэсгийн тайлбар"><TextArea rows={2} maxLength={1000} value={managers.subtitle} onChange={(e) => patchManagers({ subtitle: e.target.value })} /></Field>
        {managers.items.map((manager, i) => {
          const patch = (next: Partial<typeof manager>) => onChange((current) => ({ ...current, managers: { ...current.managers, items: current.managers.items.map((m) => m.id === manager.id ? { ...m, ...next } : m) } }));
          const move = (direction: number) => {
            const items = [...managers.items];
            [items[i], items[i + direction]] = [items[i + direction], items[i]];
            patchManagers({ items });
          };
          return <details key={manager.id} className="rounded-xl border border-neutral-200 p-4">
            <summary className="cursor-pointer font-semibold text-neutral-700">{i + 1}. {manager.name || "Менежерийн мэдээлэл"}</summary>
            <div className="mt-4 space-y-4">
              <div className="grid items-start gap-4 sm:grid-cols-[180px_1fr]">
                <ImageField label={`Менежер ${i + 1} — зураг`} value={manager.image} onChange={(image) => patch({ image })} ratio="4/5" maxEdge={1000} />
                <div className="space-y-4">
                  <Field label={`Менежер ${i + 1} — нэр`}><TextInput maxLength={200} value={manager.name} onChange={(e) => patch({ name: e.target.value })} /></Field>
                  <Field label={`Менежер ${i + 1} — албан тушаал`}><TextInput maxLength={200} value={manager.role} onChange={(e) => patch({ role: e.target.value })} /></Field>
                  <Field label={`Менежер ${i + 1} — утас`}><TextInput type="tel" maxLength={40} value={manager.phone} onChange={(e) => patch({ phone: e.target.value })} /></Field>
                  <Field label={`Менежер ${i + 1} — и-мэйл`}><TextInput type="email" maxLength={255} value={manager.email} onChange={(e) => patch({ email: e.target.value })} /></Field>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button type="button" variant="ghost" disabled={i === 0} onClick={() => move(-1)}>↑ Урагш</Button>
                <Button type="button" variant="ghost" disabled={i === managers.items.length - 1} onClick={() => move(1)}>↓ Хойш</Button>
                <Button type="button" variant="danger" onClick={() => patchManagers({ items: managers.items.filter((m) => m.id !== manager.id) })}>Менежер хасах</Button>
              </div>
            </div>
          </details>;
        })}
        <Button type="button" variant="ghost" disabled={managers.items.length >= 12} onClick={() => patchManagers({ items: [...managers.items, emptyManager(crypto.randomUUID())] })}>+ Менежер нэмэх</Button>
      </div>
    </Card>
    <Card title="Footer — компанийн мэдээлэл">
      <div className="space-y-4">
        <p className="text-sm text-neutral-500">Маягт болон амжилтын дэлгэцийн доор харагдана. Хоосон талбарууд placeholder хэвээр байна.</p>
        <div className="max-w-xs"><ImageField label="Footer лого" value={footer.logo} onChange={(logo) => patchFooter({ logo })} ratio="2/1" maxEdge={640} fit="contain" hint="SVG эсвэл тунгалаг PNG." /></div>
        <div className="grid gap-4 sm:grid-cols-2">
          <ColorField label="Footer дэвсгэрийн өнгө" value={footer.background} onChange={(background) => patchFooter({ background })} />
          <ColorField label="Footer бичгийн өнгө" value={footer.textColor} onChange={(textColor) => patchFooter({ textColor })} />
        </div>
        <Field label="Компанийн нэр"><TextInput maxLength={200} value={footer.company} onChange={(e) => patchFooter({ company: e.target.value })} /></Field>
        <Field label="Компанийн товч мэдээлэл"><TextArea rows={3} maxLength={3000} value={footer.description} onChange={(e) => patchFooter({ description: e.target.value })} /></Field>
        <Field label="Footer хаяг"><TextArea rows={2} maxLength={1000} value={footer.address} onChange={(e) => patchFooter({ address: e.target.value })} /></Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Footer утас"><TextInput type="tel" maxLength={40} value={footer.phone} onChange={(e) => patchFooter({ phone: e.target.value })} /></Field>
          <Field label="Footer и-мэйл"><TextInput type="email" maxLength={255} value={footer.email} onChange={(e) => patchFooter({ email: e.target.value })} /></Field>
        </div>
        <Field label="Footer Google Maps холбоос"><TextInput maxLength={2000} value={footer.mapUrl} placeholder="https://…" onChange={(e) => patchFooter({ mapUrl: e.target.value })} /></Field>
        <Field label="Зохиогчийн эрхийн мэдээлэл"><TextInput maxLength={200} value={footer.copyright} onChange={(e) => patchFooter({ copyright: e.target.value })} /></Field>
      </div>
    </Card>
  </>;
}
