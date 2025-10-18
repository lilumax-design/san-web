import Link from "next/link";
import { auth } from "@/auth";
import { redirect } from "next/navigation";

export default async function AdminHome() {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") redirect("/auth/sign-in");

  return (
    <main className="p-6">
      <h1 className="text-2xl font-semibold mb-4">Админ-панель</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Link href="/admin/users" className="border rounded-lg p-4 hover:bg-gray-50">
          <div className="text-lg font-medium">Пользователи</div>
          <div className="text-sm text-gray-500">Список и роли</div>
        </Link>
        {/* позже добавим: /admin/courses, /admin/orders и т.д. */}
      </div>
    </main>
  );
}
