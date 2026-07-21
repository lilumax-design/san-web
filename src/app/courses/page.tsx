"use client";

import { useMemo, useState } from "react";

import CourseCard from "../../components/CourseCard";
import { mockCourses, type Course } from "../../lib/courses";

type SortOption =
  | "relevance"
  | "price-asc"
  | "price-desc"
  | "lessons-desc";

function buttonClass(active: boolean) {
  const base =
    "rounded-lg border px-3 py-1.5 text-sm transition";

  return active
    ? `${base} border-gray-900 bg-gray-900 text-white`
    : `${base} hover:bg-gray-50`;
}

export default function CoursesPage() {
  const [query, setQuery] = useState("");
  const [level, setLevel] = useState<
    "ALL" | Course["level"]
  >("ALL");
  const [language, setLanguage] = useState<
    "ALL" | Course["language"]
  >("ALL");
  const [sort, setSort] =
    useState<SortOption>("relevance");

  const results = useMemo(() => {
    let list = [...mockCourses];

    const normalizedQuery = query.trim().toLowerCase();

    if (normalizedQuery) {
      list = list.filter((course) =>
        course.title.toLowerCase().includes(normalizedQuery)
      );
    }

    if (level !== "ALL") {
      list = list.filter(
        (course) => course.level === level
      );
    }

    if (language !== "ALL") {
      list = list.filter(
        (course) => course.language === language
      );
    }

    switch (sort) {
      case "price-asc":
        list.sort(
          (firstCourse, secondCourse) =>
            firstCourse.price - secondCourse.price
        );
        break;

      case "price-desc":
        list.sort(
          (firstCourse, secondCourse) =>
            secondCourse.price - firstCourse.price
        );
        break;

      case "lessons-desc":
        list.sort(
          (firstCourse, secondCourse) =>
            secondCourse.lessons - firstCourse.lessons
        );
        break;

      case "relevance":
      default:
        break;
    }

    return list;
  }, [query, level, language, sort]);

  return (
    <section className="space-y-6">
      <h1 className="text-2xl font-semibold">
        Курсы
      </h1>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <label className="relative block sm:w-1/2">
          <span className="sr-only">Поиск</span>

          <input
            value={query}
            onChange={(event) =>
              setQuery(event.target.value)
            }
            placeholder="Поиск по названию…"
            className="w-full rounded-lg border px-3 py-2 pr-9"
          />

          <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
            ⌘K
          </span>
        </label>

        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500">
            Сортировать:
          </span>

          <select
            value={sort}
            onChange={(event) =>
              setSort(event.target.value as SortOption)
            }
            className="rounded-lg border px-3 py-2 text-sm"
          >
            <option value="relevance">
              по релевантности
            </option>
            <option value="price-asc">
              цена ↑
            </option>
            <option value="price-desc">
              цена ↓
            </option>
            <option value="lessons-desc">
              уроков больше
            </option>
          </select>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500">
            Уровень:
          </span>

          <button
            type="button"
            className={buttonClass(level === "ALL")}
            onClick={() => setLevel("ALL")}
          >
            Все
          </button>

          <button
            type="button"
            className={buttonClass(level === "Kids")}
            onClick={() => setLevel("Kids")}
          >
            Kids
          </button>

          <button
            type="button"
            className={buttonClass(level === "Teens")}
            onClick={() => setLevel("Teens")}
          >
            Teens
          </button>

          <button
            type="button"
            className={buttonClass(level === "Adults")}
            onClick={() => setLevel("Adults")}
          >
            Adults
          </button>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500">
            Язык:
          </span>

          <button
            type="button"
            className={buttonClass(language === "ALL")}
            onClick={() => setLanguage("ALL")}
          >
            Все
          </button>

          <button
            type="button"
            className={buttonClass(language === "RU")}
            onClick={() => setLanguage("RU")}
          >
            RU
          </button>

          <button
            type="button"
            className={buttonClass(language === "EN")}
            onClick={() => setLanguage("EN")}
          >
            EN
          </button>
        </div>
      </div>

      {results.length === 0 ? (
        <div className="rounded-2xl border p-6 text-center text-gray-600">
          Ничего не найдено. Попробуйте изменить запрос
          или снять фильтры.
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {results.map((course) => (
            <CourseCard
              key={course.id}
              course={course}
            />
          ))}
        </div>
      )}
    </section>
  );
}