// src/app/courses/page.tsx
"use client";

import { useMemo, useState } from "react";
import CourseCard from "../../components/CourseCard";
import { mockCourses, type Course } from "../../lib/courses";

// Вспомогательная функция для классов (активные кнопки)
function btn(active: boolean) {
  const base =
    "rounded-lg border px-3 py-1.5 text-sm transition";
  return active ? base + " bg-gray-900 text-white border-gray-900"
                : base + " hover:bg-gray-50";
}

export default function CoursesPage() {
  // Состояния фильтров/поиска/сортировки
  const [query, setQuery] = useState("");
  const [level, setLevel] = useState<"ALL" | Course["level"]>("ALL");
  const [lang, setLang] = useState<"ALL" | Course["language"]>("ALL");
  const [sort, setSort] = useState<"relevance" | "price-asc" | "price-desc" | "lessons-desc">("relevance");

  // Основная выборка с мемоизацией
  const results = useMemo(() => {
    let list = [...mockCourses];

    // Поиск по названию
    const q = query.trim().toLowerCase();
    if (q) {
      list = list.filter(c => c.title.toLowerCase().includes(q));
    }

    // Фильтр по уровню
    if (level !== "ALL") {
      list = list.filter(c => c.level === level);
    }

    // Фильтр по языку
    if (lang !== "ALL") {
      list = list.filter(c => c.language === lang);
    }

    // Сортировка
    switch (sort) {
      case "price-asc":
        list.sort((a,b) => a.price - b.price);
        break;
      case "price-desc":
        list.sort((a,b) => b.price - a.price);
        break;
      case "lessons-desc":
        list.sort((a,b) => b.lessons - a.lessons);
        break;
      case "relevance":
      default:
        // «умная» релевантность позже (сейчас оставим исходный порядок)
        break;
    }

    return list;
  }, [query, level, lang, sort]);

  return (
    <section className="space-y-6">
      <h1 className="text-2xl font-semibold">Курсы</h1>

      {/* Панель поиска и сортировки */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        {/* Поиск */}
        <label className="relative block sm:w-1/2">
          <span className="sr-only">Поиск</span>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Поиск по названию…"
            className="w-full rounded-lg border px-3 py-2 pr-9"
          />
          <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">⌘K</span>
        </label>

        {/* Сортировка */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500">Сортировать:</span>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as any)}
            className="rounded-lg border px-3 py-2 text-sm"
          >
            <option value="relevance">по релевантности</option>
            <option value="price-asc">цена ↑</option>
            <option value="price-desc">цена ↓</option>
            <option value="lessons-desc">уроков больше</option>
          </select>
        </div>
      </div>

      {/* Фильтры */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500">Уровень:</span>
          <button className={btn(level === "ALL")} onClick={() => setLevel("ALL")}>Все</button>
          <button className={btn(level === "Kids")} onClick={() => setLevel("Kids")}>Kids</button>
          <button className={btn(level === "Teens")} onClick={() => setLevel("Teens")}>Teens</button>
          <button className={btn(level === "Adults")} onClick={() => setLevel("Adults")}>Adults</button>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500">Язык:</span>
          <button className={btn(lang === "ALL")} onClick={() => setLang("ALL")}>Все</button>
          <button className={btn(lang === "RU")} onClick={() => setLang("RU")}>RU</button>
          <button className={btn(lang === "EN")} onClick={() => setLang("EN")}>EN</button>
        </div>
      </div>

      {/* Результаты */}
      {results.length === 0 ? (
        <div className="rounded-2xl border p-6 text-center text-gray-600">
          Ничего не найдено. Попробуйте изменить запрос или снять фильтры.
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {results.map((c) => (
            <CourseCard key={c.id} course={c} />
          ))}
        </div>
      )}
    </section>
  );
}
