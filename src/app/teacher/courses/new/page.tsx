"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type CourseVisibility = "PRIVATE" | "UNLISTED" | "PUBLIC";

type NewCourseForm = {
  title: string;
  description: string;
  language: string;
  level: string;
  priceCents: string;
  currency: string;
  visibility: CourseVisibility;
};

type ErrorResponse = {
  error?: string;
};

const initialForm: NewCourseForm = {
  title: "",
  description: "",
  language: "ru",
  level: "",
  priceCents: "",
  currency: "RUB",
  visibility: "PRIVATE",
};

export default function NewCoursePage() {
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState<NewCourseForm>(initialForm);
  const [error, setError] = useState<string | null>(null);

  function updateForm<K extends keyof NewCourseForm>(
    field: K,
    value: NewCourseForm[K]
  ) {
    setForm((currentForm) => ({
      ...currentForm,
      [field]: value,
    }));
  }

  async function onSubmit(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    try {
      setLoading(true);
      setError(null);

      const response = await fetch("/api/courses", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...form,
          priceCents:
            form.priceCents.trim() === ""
              ? null
              : Number(form.priceCents),
        }),
      });

      if (!response.ok) {
        const data = (await response
          .json()
          .catch(() => ({}))) as ErrorResponse;

        throw new Error(
          data.error ?? "Ошибка при создании курса."
        );
      }

      router.push("/teacher/courses");
      router.refresh();
    } catch (caughtError) {
      const message =
        caughtError instanceof Error
          ? caughtError.message
          : "Произошла сетевая ошибка.";

      console.error("Создание курса:", caughtError);
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl p-6">
      <h1 className="mb-4 text-2xl font-bold">
        Новый курс
      </h1>

      <form onSubmit={onSubmit} className="space-y-4">
        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <div>
          <label
            htmlFor="title"
            className="mb-1 block text-sm"
          >
            Название*
          </label>

          <input
            id="title"
            className="w-full rounded border px-3 py-2"
            value={form.title}
            onChange={(event) =>
              updateForm("title", event.target.value)
            }
            required
            placeholder="Например, Английский язык: уровень A2"
          />
        </div>

        <div>
          <label
            htmlFor="description"
            className="mb-1 block text-sm"
          >
            Описание
          </label>

          <textarea
            id="description"
            className="w-full rounded border px-3 py-2"
            value={form.description}
            onChange={(event) =>
              updateForm("description", event.target.value)
            }
            rows={4}
            placeholder="Краткое описание курса"
          />
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div>
            <label
              htmlFor="language"
              className="mb-1 block text-sm"
            >
              Язык
            </label>

            <input
              id="language"
              className="w-full rounded border px-3 py-2"
              value={form.language}
              onChange={(event) =>
                updateForm("language", event.target.value)
              }
              placeholder="ru"
            />
          </div>

          <div>
            <label
              htmlFor="level"
              className="mb-1 block text-sm"
            >
              Уровень
            </label>

            <input
              id="level"
              className="w-full rounded border px-3 py-2"
              value={form.level}
              onChange={(event) =>
                updateForm("level", event.target.value)
              }
              placeholder="A2 / B1 / C1 / Beginner"
            />
          </div>

          <div>
            <label
              htmlFor="visibility"
              className="mb-1 block text-sm"
            >
              Видимость
            </label>

            <select
              id="visibility"
              className="w-full rounded border px-3 py-2"
              value={form.visibility}
              onChange={(event) =>
                updateForm(
                  "visibility",
                  event.target.value as CourseVisibility
                )
              }
            >
              <option value="PRIVATE">
                Приватный
              </option>
              <option value="UNLISTED">
                По прямой ссылке
              </option>
              <option value="PUBLIC">
                Публичный
              </option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div>
            <label
              htmlFor="priceCents"
              className="mb-1 block text-sm"
            >
              Цена в копейках
            </label>

            <input
              id="priceCents"
              className="w-full rounded border px-3 py-2"
              type="number"
              min="0"
              step="1"
              placeholder="Например, 99000 = 990 ₽"
              value={form.priceCents}
              onChange={(event) =>
                updateForm("priceCents", event.target.value)
              }
            />
          </div>

          <div>
            <label
              htmlFor="currency"
              className="mb-1 block text-sm"
            >
              Валюта
            </label>

            <input
              id="currency"
              className="w-full rounded border px-3 py-2"
              maxLength={3}
              value={form.currency}
              onChange={(event) =>
                updateForm(
                  "currency",
                  event.target.value.toUpperCase()
                )
              }
              placeholder="RUB"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="rounded-lg bg-black px-4 py-2 text-white disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? "Создаём…" : "Создать курс"}
        </button>
      </form>
    </div>
  );
}