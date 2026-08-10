/* ============================================================
   ELYSIUM — Storage abstraction (Event CMS)
   Хоёр driver:
     • SupabaseStore — production (SUPABASE_URL + SERVICE_ROLE_KEY
       тохируулагдсан үед). Postgres `events` хүснэгт + Storage bucket.
     • LocalStore — dev fallback (Supabase env байхгүй үед). .data/
       фолдерт JSON, public/uploads/-д зураг. Локалд Supabase-гүйгээр
       шууд туршиж болно. Production (Vercel) дээр read-only тул
       заавал Supabase-г тохируулна.
   Бүх дуудалт зөвхөн server талд (service role key нууц).
   ============================================================ */

import "server-only";
import { promises as fs } from "fs";
import path from "path";
import { randomUUID } from "crypto";
import type { EventDoc } from "./events";

export type UploadInput = { buffer: Buffer; filename: string; contentType: string };

export interface Store {
  listEvents(): Promise<EventDoc[]>;
  getEvent(id: string): Promise<EventDoc | null>;
  getEventBySlug(slug: string): Promise<EventDoc | null>;
  createEvent(doc: EventDoc): Promise<EventDoc>;
  updateEvent(id: string, patch: Partial<Omit<EventDoc, "id">>): Promise<EventDoc | null>;
  deleteEvent(id: string): Promise<void>;
  uploadImage(input: UploadInput): Promise<string>;
}

/* ------------------------------------------------------------ */
/* Supabase driver                                              */
/* ------------------------------------------------------------ */

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const MEDIA_BUCKET = process.env.SUPABASE_MEDIA_BUCKET || "elysium-media";

export function isSupabaseConfigured(): boolean {
  return Boolean(SUPABASE_URL && SERVICE_ROLE_KEY);
}

// Дотоод хүснэгтийн мөрийг EventDoc болгон хөрвүүлнэ (snake_case → camelCase).
type Row = {
  id: string;
  slug: string;
  name: string;
  status: string;
  content: EventDoc["content"];
  created_at: string;
  updated_at: string;
};
function rowToDoc(r: Row): EventDoc {
  return {
    id: r.id,
    slug: r.slug,
    name: r.name,
    status: r.status === "published" ? "published" : "draft",
    content: r.content,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
  };
}

async function sb() {
  // Dynamic import — Supabase тохируулаагүй локалд энэ модуль ачаалагдахгүй.
  const { createClient } = await import("@supabase/supabase-js");
  return createClient(SUPABASE_URL!, SERVICE_ROLE_KEY!, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

class SupabaseStore implements Store {
  async listEvents(): Promise<EventDoc[]> {
    const client = await sb();
    const { data, error } = await client
      .from("events")
      .select("*")
      .order("updated_at", { ascending: false });
    if (error) throw new Error(`Supabase listEvents: ${error.message}`);
    return (data as Row[]).map(rowToDoc);
  }

  async getEvent(id: string): Promise<EventDoc | null> {
    const client = await sb();
    const { data, error } = await client.from("events").select("*").eq("id", id).maybeSingle();
    if (error) throw new Error(`Supabase getEvent: ${error.message}`);
    return data ? rowToDoc(data as Row) : null;
  }

  async getEventBySlug(slug: string): Promise<EventDoc | null> {
    const client = await sb();
    const { data, error } = await client.from("events").select("*").eq("slug", slug).maybeSingle();
    if (error) throw new Error(`Supabase getEventBySlug: ${error.message}`);
    return data ? rowToDoc(data as Row) : null;
  }

  async createEvent(doc: EventDoc): Promise<EventDoc> {
    const client = await sb();
    const { data, error } = await client
      .from("events")
      .insert({
        id: doc.id,
        slug: doc.slug,
        name: doc.name,
        status: doc.status,
        content: doc.content,
        created_at: doc.createdAt,
        updated_at: doc.updatedAt,
      })
      .select("*")
      .single();
    if (error) throw new Error(`Supabase createEvent: ${error.message}`);
    return rowToDoc(data as Row);
  }

  async updateEvent(id: string, patch: Partial<Omit<EventDoc, "id">>): Promise<EventDoc | null> {
    const client = await sb();
    const update: Record<string, unknown> = { updated_at: new Date().toISOString() };
    if (patch.slug !== undefined) update.slug = patch.slug;
    if (patch.name !== undefined) update.name = patch.name;
    if (patch.status !== undefined) update.status = patch.status;
    if (patch.content !== undefined) update.content = patch.content;
    const { data, error } = await client
      .from("events")
      .update(update)
      .eq("id", id)
      .select("*")
      .maybeSingle();
    if (error) throw new Error(`Supabase updateEvent: ${error.message}`);
    return data ? rowToDoc(data as Row) : null;
  }

  async deleteEvent(id: string): Promise<void> {
    const client = await sb();
    const { error } = await client.from("events").delete().eq("id", id);
    if (error) throw new Error(`Supabase deleteEvent: ${error.message}`);
  }

  async uploadImage(input: UploadInput): Promise<string> {
    const client = await sb();
    const key = `${new Date().toISOString().slice(0, 10)}/${randomUUID()}-${safeName(input.filename)}`;
    const { error } = await client.storage
      .from(MEDIA_BUCKET)
      .upload(key, input.buffer, { contentType: input.contentType, upsert: false });
    if (error) throw new Error(`Supabase upload: ${error.message}`);
    const { data } = client.storage.from(MEDIA_BUCKET).getPublicUrl(key);
    return data.publicUrl;
  }
}

/* ------------------------------------------------------------ */
/* Local driver (dev fallback)                                  */
/* ------------------------------------------------------------ */

const DATA_DIR = path.join(process.cwd(), ".data");
const DATA_FILE = path.join(DATA_DIR, "events.json");
const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads");

class LocalStore implements Store {
  private async readAll(): Promise<EventDoc[]> {
    try {
      const raw = await fs.readFile(DATA_FILE, "utf8");
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? (parsed as EventDoc[]) : [];
    } catch {
      return [];
    }
  }

  private async writeAll(docs: EventDoc[]): Promise<void> {
    await fs.mkdir(DATA_DIR, { recursive: true });
    await fs.writeFile(DATA_FILE, JSON.stringify(docs, null, 2), "utf8");
  }

  async listEvents(): Promise<EventDoc[]> {
    const docs = await this.readAll();
    return docs.sort((a, b) => (a.updatedAt < b.updatedAt ? 1 : -1));
  }

  async getEvent(id: string): Promise<EventDoc | null> {
    return (await this.readAll()).find((d) => d.id === id) ?? null;
  }

  async getEventBySlug(slug: string): Promise<EventDoc | null> {
    return (await this.readAll()).find((d) => d.slug === slug) ?? null;
  }

  async createEvent(doc: EventDoc): Promise<EventDoc> {
    const docs = await this.readAll();
    if (docs.some((d) => d.slug === doc.slug)) throw new Error("slug-taken");
    docs.push(doc);
    await this.writeAll(docs);
    return doc;
  }

  async updateEvent(id: string, patch: Partial<Omit<EventDoc, "id">>): Promise<EventDoc | null> {
    const docs = await this.readAll();
    const i = docs.findIndex((d) => d.id === id);
    if (i === -1) return null;
    if (patch.slug && docs.some((d) => d.slug === patch.slug && d.id !== id)) {
      throw new Error("slug-taken");
    }
    docs[i] = { ...docs[i], ...patch, updatedAt: new Date().toISOString() };
    await this.writeAll(docs);
    return docs[i];
  }

  async deleteEvent(id: string): Promise<void> {
    const docs = await this.readAll();
    await this.writeAll(docs.filter((d) => d.id !== id));
  }

  async uploadImage(input: UploadInput): Promise<string> {
    await fs.mkdir(UPLOAD_DIR, { recursive: true });
    const name = `${Date.now()}-${randomUUID().slice(0, 8)}-${safeName(input.filename)}`;
    await fs.writeFile(path.join(UPLOAD_DIR, name), input.buffer);
    return `/uploads/${name}`;
  }
}

/* ------------------------------------------------------------ */

function safeName(filename: string): string {
  const base = filename.split(/[\\/]/).pop() || "file";
  return base.replace(/[^a-zA-Z0-9._-]/g, "_").slice(-80);
}

let cached: Store | null = null;
export function getStore(): Store {
  if (cached) return cached;
  cached = isSupabaseConfigured() ? new SupabaseStore() : new LocalStore();
  return cached;
}

/** UI-д харуулах: одоо аль driver ажиллаж байгаа. */
export function storeMode(): "supabase" | "local" {
  return isSupabaseConfigured() ? "supabase" : "local";
}
