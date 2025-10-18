import { auth } from "@/auth";

export default async function TeacherPage() {
  const session = await auth();
  return (
    <main className="p-6">
      <h1 className="text-2xl font-semibold mb-2">Кабинет преподавателя</h1>
      <p>Вы вошли как: {session?.user.email} (роль: {session?.user.role})</p>
    </main>
  );
}
