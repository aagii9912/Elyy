"use client";

/* Нийтлэлийн агуулгын WYSIWYG засварлагч.
   Бичиж байхад тод текст ЖИНХЭНЭЭСЭЭ тод харагдана — `**`, `##` мэтийн
   тэмдэг харагдахгүй. Хадгалах хэлбэр нь хэвээрээ (мини-markdown) тул
   нийтлэлийн хуудас болон хуучин нийтлэлүүд өөрчлөгдөхгүй.

   Засварлагч зөвхөн хадгалах формат дэмждэг зүйлийг л зөвшөөрнө:
   догол мөр · дэд гарчиг (H2/H3) · жагсаалт · тод · налуу · холбоос ·
   зураг (энгийн / өргөн / дэлгэц дүүрэн). Бусад бүх зангилааг унтраасан
   тул буулгаж оруулсан агуулга ч эдгээр рүү шахагдана. */

import { useRef, useState } from "react";
import { EditorContent, useEditor, useEditorState } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import type { NewsImageSize } from "@/lib/news";
import { htmlToNewsBody, newsBodyToHtml } from "@/lib/news-html";
import { uploadFile } from "./upload";

/** Зурагт `data-size` шинж нэмнэ — өргөн / дэлгэц дүүрэн харуулах горим. */
const SizedImage = Image.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      size: {
        default: "normal" as NewsImageSize,
        parseHTML: (el: HTMLElement) => el.getAttribute("data-size") || "normal",
        renderHTML: (attrs: Record<string, unknown>) => ({ "data-size": String(attrs.size) }),
      },
    };
  },
});

const IMAGE_SIZES: { value: NewsImageSize; label: string }[] = [
  { value: "normal", label: "Энгийн" },
  { value: "wide", label: "Өргөн" },
  { value: "full", label: "Дэлгэц дүүрэн" },
];

/** Засварлагчийн бичвэрийн хэв маяг — нийтлэлийн хуудсыг ойролцоогоор дуурайна. */
const EDITOR_CLASS = [
  "min-h-[460px] w-full rounded-b-lg border border-t-0 border-neutral-300 bg-white px-5 py-4",
  "text-lead leading-relaxed text-neutral-900 outline-none",
  "[&_h2]:mt-7 [&_h2]:text-h6 [&_h2]:font-extrabold [&_h2]:leading-snug [&_h2]:tracking-tight",
  "[&_h3]:mt-6 [&_h3]:text-sub [&_h3]:font-bold [&_h3]:leading-snug",
  "[&_p]:mt-3 [&_ul]:mt-3 [&_ul]:list-disc [&_ul]:pl-6 [&_li]:mt-1 [&_li>p]:mt-0",
  "[&_strong]:font-bold [&_em]:italic",
  "[&_a]:font-semibold [&_a]:text-ink [&_a]:underline [&_a]:underline-offset-2",
  "[&_img]:mt-4 [&_img]:w-full [&_img]:rounded-lg [&_img]:border [&_img]:border-neutral-200",
  "[&_img.ProseMirror-selectednode]:border-ink [&_img.ProseMirror-selectednode]:ring-2",
  "[&_img.ProseMirror-selectednode]:ring-ink/25",
  "[&>*:first-child]:mt-0",
].join(" ");

function Tool({
  label,
  hint,
  active = false,
  disabled = false,
  onClick,
  className = "",
}: {
  label: React.ReactNode;
  hint: string;
  active?: boolean;
  disabled?: boolean;
  onClick: () => void;
  className?: string;
}) {
  return (
    <button
      type="button"
      title={hint}
      disabled={disabled}
      /* Товч дарахад засварлагчийн сонголт алдагдахгүй байх — фокус хөдлөхгүй. */
      onMouseDown={(e) => e.preventDefault()}
      onClick={onClick}
      className={`rounded-md px-2.5 py-1.5 text-body font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${
        active
          ? "bg-ink text-white"
          : "border border-neutral-300 bg-white text-neutral-700 hover:bg-neutral-100"
      } ${className}`}
    >
      {label}
    </button>
  );
}

const Divider = () => <span aria-hidden className="mx-0.5 h-5 w-px shrink-0 bg-neutral-200" />;

export function NewsBodyEditor({
  initialBody,
  onChange,
}: {
  /** Зөвхөн эхлэхэд уншина — цаашид засварлагч өөрөө эзэн нь. */
  initialBody: string;
  onChange: (body: string) => void;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const pendingSize = useRef<NewsImageSize>("normal");
  const [imgBusy, setImgBusy] = useState(false);
  const [imgErr, setImgErr] = useState<string | null>(null);

  const editor = useEditor({
    // SSR үед hydration зөрөхөөс сэргийлнэ.
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3] },
        // Хадгалах формат дэмждэггүй зангилаанууд.
        blockquote: false,
        code: false,
        codeBlock: false,
        horizontalRule: false,
        orderedList: false,
        strike: false,
        underline: false,
        link: {
          openOnClick: false,
          autolink: true,
          protocols: ["http", "https", "mailto", "tel"],
          HTMLAttributes: { rel: "noreferrer" },
        },
      }),
      SizedImage.configure({ inline: false, allowBase64: false }),
    ],
    content: newsBodyToHtml(initialBody),
    editorProps: { attributes: { class: EDITOR_CLASS } },
    onUpdate: ({ editor: ed }) => onChange(htmlToNewsBody(ed.getHTML())),
  });

  const state = useEditorState({
    editor,
    selector: ({ editor: ed }) => ({
      ready: Boolean(ed),
      bold: Boolean(ed?.isActive("bold")),
      italic: Boolean(ed?.isActive("italic")),
      h2: Boolean(ed?.isActive("heading", { level: 2 })),
      h3: Boolean(ed?.isActive("heading", { level: 3 })),
      list: Boolean(ed?.isActive("bulletList")),
      link: Boolean(ed?.isActive("link")),
      image: Boolean(ed?.isActive("image")),
      imageSize: (ed?.getAttributes("image").size as NewsImageSize) ?? "normal",
    }),
  });

  const addImage = async (file: File) => {
    if (!editor) return;
    setImgBusy(true);
    setImgErr(null);
    const res = await uploadFile(file);
    if (res.ok) {
      editor
        .chain()
        .focus()
        .insertContent({ type: "image", attrs: { src: res.url, size: pendingSize.current } })
        .run();
    } else {
      setImgErr(res.error);
    }
    setImgBusy(false);
  };

  /** Холбоос: сонгосон текст дээр тавина, идэвхтэй үед нь хаягийг нь засна. */
  const toggleLink = () => {
    if (!editor) return;
    const current = (editor.getAttributes("link").href as string) ?? "";
    const input = window.prompt(
      "Холбоосын хаяг (хоосон үлдээвэл холбоосыг арилгана):",
      current || "https://"
    );
    if (input === null) return;
    const href = input.trim();
    if (!href) {
      editor.chain().focus().unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange("link").setLink({ href }).run();
  };

  /* `EditorContent`-ийг үргэлж рендерлэнэ — засварлагч түүн дээр холбогддог.
     Бэлэн болтол зөвхөн самбарыг нь идэвхгүй болгоно. */
  const ui = state ?? {
    ready: false,
    bold: false,
    italic: false,
    h2: false,
    h3: false,
    list: false,
    link: false,
    image: false,
    imageSize: "normal" as NewsImageSize,
  };

  return (
    <div>
      <div
        className={`flex flex-wrap items-center gap-1.5 rounded-t-lg border border-neutral-300 bg-neutral-50 px-2.5 py-2 ${
          ui.ready ? "" : "pointer-events-none opacity-50"
        }`}
      >
        <Tool
          label="Дэд гарчиг"
          hint="Том дэд гарчиг"
          active={ui.h2}
          onClick={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()}
        />
        <Tool
          label="Жижиг гарчиг"
          hint="Жижиг дэд гарчиг"
          active={ui.h3}
          onClick={() => editor?.chain().focus().toggleHeading({ level: 3 }).run()}
        />
        <Divider />
        <Tool
          label={<span className="font-extrabold">Тод</span>}
          hint="Тод бичих (Cmd/Ctrl + B)"
          active={ui.bold}
          onClick={() => editor?.chain().focus().toggleBold().run()}
        />
        <Tool
          label={<span className="italic">Налуу</span>}
          hint="Налуу (Cmd/Ctrl + I)"
          active={ui.italic}
          onClick={() => editor?.chain().focus().toggleItalic().run()}
        />
        <Tool
          label="Холбоос"
          hint="Сонгосон текстийг холбоос болгох"
          active={ui.link}
          onClick={toggleLink}
        />
        <Tool
          label="Жагсаалт"
          hint="Цэгтэй жагсаалт"
          active={ui.list}
          onClick={() => editor?.chain().focus().toggleBulletList().run()}
        />
        <Divider />
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) addImage(f);
            e.target.value = "";
          }}
        />
        <Tool
          label={imgBusy ? "Байршуулж байна…" : "＋ Зураг"}
          hint="Курсорын байрлалд зураг нэмнэ"
          disabled={imgBusy}
          onClick={() => {
            pendingSize.current = "normal";
            fileRef.current?.click();
          }}
        />

        {/* Зураг сонгосон үед — түүний өргөнийг эндээс сольно. */}
        {ui.image && (
          <>
            <Divider />
            <span className="text-xs font-semibold text-neutral-500">Зургийн өргөн:</span>
            {IMAGE_SIZES.map((s) => (
              <Tool
                key={s.value}
                label={s.label}
                hint={`Зургийг “${s.label}” болгоно`}
                active={ui.imageSize === s.value}
                onClick={() => editor?.chain().focus().updateAttributes("image", { size: s.value }).run()}
              />
            ))}
          </>
        )}
      </div>

      <EditorContent editor={editor} />

      <p className="mt-1.5 text-xs text-neutral-400">
        Текстээ сонгоод дээрх товчийг дарна. Enter — шинэ догол мөр. Зургийг дарж сонгоод өргөнийг нь
        солино. Гаднаас буулгасан бичвэрийн хэлбэр автоматаар цэгцэрнэ.
      </p>
      {imgErr && <p className="mt-2 text-xs text-red-500">{imgErr}</p>}
    </div>
  );
}
