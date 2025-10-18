import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

async function updateUserRole(formData: FormData) {
  "use server";
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") throw new Error("Forbidden");

  const userId = String(formData.get("userId") || "");
  const role = String(formData.get("role") || "");
  if (!userId || !["STUDENT", "TEACHER", "ADMIN"].includes(role)) throw new Error("Invalid payload");

  await prisma.user.update({ where: { id: userId }, data: { role: role as any } });
  revalidatePath("/admin/users");
}

export default async function AdminUsersPage() {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") return null;

  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    select: { id: true, name: true, email: true, role: true, createdAt: true },
  });

  return (
    <main className="p-6">
      <h1 className="text-2xl font-semibold mb-4">Пользователи</h1>

      <div className="overflow-x-auto">
        <table className="min-w-[700px] w-full border">
          <thead>
            <tr className="bg-gray-50 text-left">
              <th className="px-3 py-2 border-r">Имя</th>
              <th className="px-3 py-2 border-r">Email</th>
              <th className="px-3 py-2 border-r">Роль</th>
              <th className="px-3 py-2">Создан</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="border-t">
                <td className="px-3 py-2 border-r">{u.name ?? "—"}</td>
                <td className="px-3 py-2 border-r">{u.email ?? "—"}</td>
                <td className="px-3 py-2 border-r">
                  <form action={updateUserRole} className="flex items-center gap-2">
                    <input type="hidden" name="userId" value={u.id} />
                    <select name="role" defaultValue={u.role} className="border rounded px-2 py-1">
                      <option value="STUDENT">STUDENT</option>
                      <option value="TEACHER">TEACHER</option>
                      <option value="ADMIN">ADMIN</option>
                    </select>
                    <button className="border rounded px-2 py-1">Сохранить</button>
                  </form>
                </td>
                <td className="px-3 py-2">{new Date(u.createdAt).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}
