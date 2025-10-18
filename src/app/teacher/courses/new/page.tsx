"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function NewCoursePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    title: "",
    description: "",
    language: "ru",
    level: "",
    priceCents: "",
    currency: "RUB",
    visibility: "PRIVATE",
  });

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/courses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          priceCents: form.priceCents ? Number(form.priceCents) : null,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        alert(data?.error || "Ошибка при создании курса");
        setLoading(false);
        return;
      }

      const data = await res.json();
      // после создания — обратно к списку
      router.push("/teacher/courses");
    } catch (err) {
      console.error(err);
      alert("Сетевая ошибка");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl p-6">
      <h1 className="text-2xl font-bold mb-4">Новый курс</h1>

      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label className="block text-sm mb-1">Название*</label>
          <input
            className="w-full rounded border px-3 py-2"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            required
            placeholder="Напр., Spotlight 8 — Unit 2D"
          />
        </div>

        <div>
          <label className="block text-sm mb-1">Описание</label>
          <textarea
            className="w-full rounded border px-3 py-2"
            value={form.description}
            onChange={(e) =>
              setForm({ ...form, description: e.target.value })
            }
            rows={4}
            placeholder="Краткое описание курса"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-sm mb-1">Язык</label>
            <input
              className="w-full rounded border px-3 py-2"
              value={form.language}
              onChange={(e) => setForm({ ...form, language: e.target.value })}
              placeholder="ru"
            />
          </div>
          <div>
            <label className="block text-sm mb-1">Уровень</label>
            <input
              className="w-full rounded border px-3 py-2"
              value={form.level}
              onChange={(e) => setForm({ ...form, level: e.target.value })}
              placeholder="A2 / B1 / C1 / Beginner"
            />
          </div>
          <div>
            <label className="block text-sm mb-1">Видимость</label>
            <select
              className="w-full rounded border px-3 py-2"
              value={form.visibility}
              onChange={(e) =>
                setForm({ ...form, visibility: e.target.value })
              }
            >
              <option value="PRIVATE">PRIVATE</option>
              <option value="UNLISTED">UNLISTED</option>
              <option value="PUBLIC">PUBLIC</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-sm mb-1">Цена (в копейках)</label>
            <input
              className="w-full rounded border px-3 py-2"
              type="number"
              min={0}
              placeholder="например 99000 → 990 ₽"
              value={form.priceCents}
              onChange={(e) =>
                setForm({ ...form, priceCents: e.target.value })
              }
            />
          </div>
          <div>
            <label className="block text-sm mb-1">Валюта</label>
            <input
              className="w-full rounded border px-3 py-2"
              value={form.currency}
              onChange={(e) => setForm({ ...form, currency: e.target.value })}
              placeholder="RUB"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="rounded-lg bg-black px-4 py-2 text-white disabled:opacity-60"
        >
          {loading ? "Создаём..." : "Создать курс"}
        </button>
      </form>
    </div>
  );
}
