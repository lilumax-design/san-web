import { Role } from "@prisma/client";
import Link from "next/link";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export default async function TeacherCoursesPage() {
  const session = await auth();

  if (!session?.user) {
    return (
      <div className="p-6">
        <p>Необходимо войти в систему.</p>
      </div>
    );
  }

  const { id: authorId, role } = session.user;

  if (role !== Role.ADMIN && role !== Role.TEACHER) {
    return (
      <div className="p-6">
        <p>Доступ запрещён.</p>
      </div>
    );
  }

  const courses = await prisma.course.findMany({
    where: {
      authorId,
    },
    orderBy: {
      createdAt: "desc",
    },
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
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Мои курсы</h1>

        <Link
          href="/teacher/courses/new"
          className="rounded-lg bg-black px-4 py-2 text-white"
        >
          + Новый курс
        </Link>
      </div>

      {courses.length === 0 ? (
        <p className="text-gray-600">
          Пока нет курсов. Создайте первый.
        </p>
      ) : (
        <ul className="space-y-3">
          {courses.map((course) => (
            <li
              key={course.id}
              className="flex items-center justify-between rounded-lg border p-4"
            >
              <div>
                <div className="font-semibold">
                  {course.title}
                </div>

                <div className="text-xs text-gray-500">
                  slug: {course.slug} · {course.visibility}
                </div>
              </div>

              <Link
                href={`/teacher/courses/${course.id}/edit`}
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