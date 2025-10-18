import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";

export default async function TeacherCoursesPage() {
  const session = await auth();
  if (!session?.user) return null;

  // @ts-expect-error custom
  const role = session.user.role as string;
  if (!["ADMIN", "TEACHER"].includes(role)) return null;

  // @ts-expect-error custom
  const authorId = session.user.id as string;

  const courses = await prisma.course.findMany({
    where: { authorId },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      title: true,
      slug: true,
      visibility: true,
      createdAt: true,
    },
  });

  return (
    <div className="mx-auto max-w-4xl p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Мои курсы</h1>
        <Link
          href="/teacher/courses/new"
          className="rounded-lg bg-black px-4 py-2 text-white"
        >
          + Новый курс
        </Link>
      </div>

      {courses.length === 0 ? (
        <p className="text-gray-600">Пока нет курсов. Создай первый.</p>
      ) : (
        <ul className="space-y-3">
          {courses.map((c) => (
            <li
              key={c.id}
              className="rounded-lg border p-4 flex items-center justify-between"
            >
              <div>
                <div className="font-semibold">{c.title}</div>
                <div className="text-xs text-gray-500">
                  slug: {c.slug} · {c.visibility}
                </div>
              </div>
              <Link
                href={`/teacher/courses/${c.id}/edit`}
                className="text-sm underline"
              >
                Редактировать
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
