"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

type CourseVisibility = "PRIVATE" | "UNLISTED" | "PUBLIC";

type CourseForm = {
  title: string;
  description: string;
  language: string;
  level: string;
  visibility: CourseVisibility;
  priceCents: string;
  currency: string;
};

type CourseResponse = {
  course?: {
    id: string;
    title: string;
    description: string | null;
    language: string | null;
    level: string | null;
    visibility: CourseVisibility;
    priceCents: number | null;
    currency: string | null;
  };
  error?: string;
};

const initialForm: CourseForm = {
  title: "",
  description: "",
  language: "ru",
  level: "",
  visibility: "PRIVATE",
  priceCents: "",
  currency: "RUB",
};

export default function EditCoursePage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();

  const courseId = params.id;

  const [form, setForm] = useState<CourseForm>(initialForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadCourse() {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(`/api/courses/${courseId}`, {
          method: "GET",
          cache: "no-store",
        });

        const data = (await response.json()) as CourseResponse;

        if (!response.ok || !data.course) {
          throw new Error(
            data.error ?? "Не удалось загрузить данные курса."
          );
        }

        if (cancelled) {
          return;
        }

        setForm({
          title: data.course.title,
          description: data.course.description ?? "",
          language: data.course.language ?? "ru",
          level: data.course.level ?? "",
          visibility: data.course.visibility,
          priceCents:
            data.course.priceCents === null
              ? ""
              : String(data.course.priceCents),
          currency: data.course.currency ?? "RUB",
        });
      } catch (caughtError) {
        if (!cancelled) {
          setError(
            caughtError instanceof Error
              ? caughtError.message
              : "Не удалось загрузить курс."
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void loadCourse();

    return () => {
      cancelled = true;
    };
  }, [courseId]);

  function updateForm<K extends keyof CourseForm>(
    field: K,
    value: CourseForm[K]
  ) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    try {
      setSaving(true);
      setError(null);

      const response = await fetch(`/api/courses/${courseId}`, {
        method: "PATCH",
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

      const data = (await response.json()) as CourseResponse;

      if (!response.ok) {
        throw new Error(
          data.error ?? "Не удалось сохранить изменения."
        );
      }

      router.push("/teacher/courses");
      router.refresh();
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Произошла ошибка при сохранении."
      );
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-2xl p-6">
        <p className="text-gray-600">Загружаем курс…</p>
      </div>
    );
  }

  if (error && !form.title) {
    return (
      <div className="mx-auto max-w-2xl p-6">
        <h1 className="mb-4 text-2xl font-bold">
          Не удалось открыть курс
        </h1>

        <p className="mb-4 text-red-600">{error}</p>

        <button
          type="button"
          onClick={() => router.push("/teacher/courses")}
          className="rounded-lg border px-4 py-2"
        >
          Вернуться к курсам
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl p-6">
      <h1 className="mb-6 text-2xl font-bold">
        Редактирование курса
      </h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <div>
          <label
            htmlFor="title"
            className="mb-1 block text-sm font-medium"
          >
            Название курса
          </label>

          <input
            id="title"
            required
            value={form.title}
            onChange={(event) =>
              updateForm("title", event.target.value)
            }
            className="w-full rounded-lg border px-3 py-2"
          />
        </div>

        <div>
          <label
            htmlFor="description"
            className="mb-1 block text-sm font-medium"
          >
            Описание
          </label>

          <textarea
            id="description"
            rows={5}
            value={form.description}
            onChange={(event) =>
              updateForm("description", event.target.value)
            }
            className="w-full rounded-lg border px-3 py-2"
          />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label
              htmlFor="language"
              className="mb-1 block text-sm font-medium"
            >
              Язык
            </label>

            <input
              id="language"
              value={form.language}
              onChange={(event) =>
                updateForm("language", event.target.value)
              }
              className="w-full rounded-lg border px-3 py-2"
            />
          </div>

          <div>
            <label
              htmlFor="level"
              className="mb-1 block text-sm font-medium"
            >
              Уровень
            </label>

            <input
              id="level"
              value={form.level}
              onChange={(event) =>
                updateForm("level", event.target.value)
              }
              className="w-full rounded-lg border px-3 py-2"
            />
          </div>
        </div>

        <div>
          <label
            htmlFor="visibility"
            className="mb-1 block text-sm font-medium"
          >
            Видимость
          </label>

          <select
            id="visibility"
            value={form.visibility}
            onChange={(event) =>
              updateForm(
                "visibility",
                event.target.value as CourseVisibility
              )
            }
            className="w-full rounded-lg border px-3 py-2"
          >
            <option value="PRIVATE">Приватный</option>
            <option value="UNLISTED">По прямой ссылке</option>
            <option value="PUBLIC">Публичный</option>
          </select>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label
              htmlFor="priceCents"
              className="mb-1 block text-sm font-medium"
            >
              Цена в копейках
            </label>

            <input
              id="priceCents"
              type="number"
              min="0"
              step="1"
              value={form.priceCents}
              onChange={(event) =>
                updateForm("priceCents", event.target.value)
              }
              className="w-full rounded-lg border px-3 py-2"
            />
          </div>

          <div>
            <label
              htmlFor="currency"
              className="mb-1 block text-sm font-medium"
            >
              Валюта
            </label>

            <input
              id="currency"
              maxLength={3}
              value={form.currency}
              onChange={(event) =>
                updateForm(
                  "currency",
                  event.target.value.toUpperCase()
                )
              }
              className="w-full rounded-lg border px-3 py-2"
            />
          </div>
        </div>

        <div className="flex flex-wrap gap-3 pt-2">
          <button
            type="submit"
            disabled={saving}
            className="rounded-lg bg-black px-4 py-2 text-white disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saving ? "Сохраняем…" : "Сохранить изменения"}
          </button>

          <button
            type="button"
            onClick={() => router.push("/teacher/courses")}
            className="rounded-lg border px-4 py-2"
          >
            Отмена
          </button>
        </div>
      </form>
    </div>
  );
}