import { Role } from "@prisma/client";
import { revalidatePath } from "next/cache";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

const allowedRoles: Role[] = [
  Role.STUDENT,
  Role.TEACHER,
  Role.ADMIN,
];

function isRole(value: string): value is Role {
  return allowedRoles.includes(value as Role);
}

async function updateUserRole(formData: FormData) {
  "use server";

  const session = await auth();

  if (!session || session.user.role !== Role.ADMIN) {
    throw new Error("Доступ запрещён.");
  }

  const userId = String(formData.get("userId") ?? "").trim();
  const roleValue = String(formData.get("role") ?? "").trim();

  if (!userId || !isRole(roleValue)) {
    throw new Error("Некорректные данные.");
  }

  await prisma.user.update({
    where: {
      id: userId,
    },
    data: {
      role: roleValue,
    },
  });

  revalidatePath("/admin/users");
}

export default async function AdminUsersPage() {
  const session = await auth();

  if (!session || session.user.role !== Role.ADMIN) {
    return null;
  }

  const users = await prisma.user.findMany({
    orderBy: {
      createdAt: "desc",
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
    },
  });

  return (
    <main className="p-6">
      <h1 className="mb-4 text-2xl font-semibold">
        Пользователи
      </h1>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[700px] border">
          <thead>
            <tr className="bg-gray-50 text-left">
              <th className="border-r px-3 py-2">Имя</th>
              <th className="border-r px-3 py-2">Email</th>
              <th className="border-r px-3 py-2">Роль</th>
              <th className="px-3 py-2">Создан</th>
            </tr>
          </thead>

          <tbody>
            {users.map((user) => (
              <tr key={user.id} className="border-t">
                <td className="border-r px-3 py-2">
                  {user.name ?? "—"}
                </td>

                <td className="border-r px-3 py-2">
                  {user.email ?? "—"}
                </td>

                <td className="border-r px-3 py-2">
                  <form
                    action={updateUserRole}
                    className="flex items-center gap-2"
                  >
                    <input
                      type="hidden"
                      name="userId"
                      value={user.id}
                    />

                    <select
                      name="role"
                      defaultValue={user.role}
                      className="rounded border px-2 py-1"
                    >
                      <option value={Role.STUDENT}>
                        STUDENT
                      </option>
                      <option value={Role.TEACHER}>
                        TEACHER
                      </option>
                      <option value={Role.ADMIN}>
                        ADMIN
                      </option>
                    </select>

                    <button
                      type="submit"
                      className="rounded border px-2 py-1"
                    >
                      Сохранить
                    </button>
                  </form>
                </td>

                <td className="px-3 py-2">
                  {user.createdAt.toLocaleString("ru-RU")}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}