import { auth } from "@/auth";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const session = await auth();            // Проверяем сессию на сервере
  if (!session) redirect("/auth/sign-in"); // Если гость — отправляем на страницу входа

  return (
    <main className="p-6">
      <h1 className="text-2xl font-semibold mb-2">Личный кабинет</h1>
      <p>Здравствуйте, {session.user.name ?? session.user.email}</p>
    </main>
  );
}