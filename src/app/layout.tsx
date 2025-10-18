import "./globals.css";
import type { Metadata } from "next";
import Link from "next/link";
import { SessionProvider } from "next-auth/react";
import { auth } from "@/auth";

export const metadata: Metadata = {
  title: "SAN — обучение для детей и взрослых",
  description: "Онлайн-платформа SAN",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  const firstName =
    (session?.user?.name || "")
      .trim()
      .split(" ")
      .filter(Boolean)[0] || null;

  return (
    <html lang="ru">
      <body className="min-h-screen bg-white text-gray-900">
        <SessionProvider session={session as any}>
          <header className="border-b">
            <nav className="mx-auto max-w-6xl px-4 py-4 flex items-center justify-between">
              <Link href="/" className="text-xl font-bold">
                SAN
              </Link>

              <div className="flex items-center gap-3 sm:gap-6 text-sm">
                <Link href="/courses" className="hover:underline">
                  Курсы
                </Link>

                {session ? (
                  <>
                    <Link href="/dashboard" className="hover:underline">
                      Кабинет
                    </Link>

                    {(session.user.role === "TEACHER" ||
                      session.user.role === "ADMIN") && (
                      <Link href="/teacher" className="hover:underline">
                        Преподаватель
                      </Link>
                    )}

                    {session.user.role === "ADMIN" && (
                      <>
                        <Link href="/admin" className="hover:underline">
                          Админ
                        </Link>
                        <Link href="/admin/users" className="hover:underline">
                          Пользователи
                        </Link>
                      </>
                    )}

                    {firstName && (
                      <span className="hidden sm:inline text-gray-500">
                        Здравствуйте, {firstName}!
                      </span>
                    )}

                    <form action="/api/auth/signout" method="post">
                      <button className="rounded-lg border px-3 py-1.5 hover:bg-gray-50">
                        Выйти
                      </button>
                    </form>
                  </>
                ) : (
                  <>
                    <Link href="/auth/sign-in" className="hover:underline">
                      Войти
                    </Link>
                    <Link
                      href="/auth/sign-up"
                      className="rounded-lg border px-3 py-1.5 hover:bg-gray-50"
                    >
                      Регистрация
                    </Link>
                  </>
                )}
              </div>
            </nav>
          </header>

          <main className="mx-auto max-w-6xl px-4 py-8">{children}</main>

          <footer className="border-t">
            <div className="mx-auto max-w-6xl px-4 py-8 text-sm text-gray-500">
              © {new Date().getFullYear()} SAN. Все права защищены.
            </div>
          </footer>
        </SessionProvider>
      </body>
    </html>
  );
}
