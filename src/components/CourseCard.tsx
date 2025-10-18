import Link from "next/link";
import type { Course } from "../lib/courses"; // путь без алиаса, чтобы не путаться

export default function CourseCard({ course }: { course: Course }) {
  return (
    <div className="overflow-hidden rounded-2xl border shadow-sm hover:shadow-md transition">
      <div className="aspect-video w-full bg-gray-100">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={course.cover} alt={course.title} className="h-full w-full object-cover" />
      </div>
      <div className="p-4 space-y-2">
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span className="inline-flex items-center gap-2">
            <span className="rounded-full border px-2 py-0.5">{course.level}</span>
            <span className="rounded-full border px-2 py-0.5">{course.language}</span>
          </span>
          <span>{course.lessons} урок(ов) · {course.durationHours} ч</span>
        </div>
        <h3 className="text-base font-semibold leading-snug">{course.title}</h3>
        <div className="flex items-center justify-between">
          <div className="text-lg font-bold">{course.price.toLocaleString("ru-RU")} ₽</div>
          <Link href={`/courses/${course.id}`} className="text-sm underline underline-offset-4 hover:no-underline">
            Подробнее
          </Link>
        </div>
      </div>
    </div>
  );
}
