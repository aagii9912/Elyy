"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button, TextInput } from "@/components/admin/ui";

export default function LoginPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    setErr(null);
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const json = await res.json().catch(() => null);
      if (res.ok && json?.ok) {
        const next = new URLSearchParams(window.location.search).get("next");
        router.push(next && next.startsWith("/admin") ? next : "/admin");
        router.refresh();
      } else {
        setErr(json?.error || "Нэвтэрч чадсангүй.");
      }
    } catch {
      setErr("Сүлжээний алдаа.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex min-h-dvh items-center justify-center px-4">
      <form onSubmit={submit} className="w-full max-w-sm rounded-2xl border border-neutral-200 bg-white p-7 shadow-sm">
        <h1 className="text-xl font-extrabold tracking-tight text-neutral-900">Elysium — Админ</h1>
        <p className="mt-1 text-sm text-neutral-500">Үргэлжлүүлэхийн тулд нууц үгээ оруулна уу.</p>
        <div className="mt-6">
          <TextInput
            type="password"
            autoFocus
            placeholder="Нууц үг"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        {err && <p className="mt-3 text-sm font-semibold text-red-600">{err}</p>}
        <Button type="submit" variant="primary" disabled={busy} className="mt-5 w-full">
          {busy ? "Түр хүлээнэ үү…" : "Нэвтрэх"}
        </Button>
      </form>
    </div>
  );
}
