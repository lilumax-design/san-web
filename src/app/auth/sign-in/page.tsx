"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import Link from "next/link";

export default function SignInPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);
    setLoading(true);
    try {
      const res = await signIn("credentials", {
        email: email.trim().toLowerCase(),
        password,
        redirect: false
      });
      if (!res) {
        setMsg("❌ Не удалось выполнить вход");
        return;
      }
      if (res.error) {
        setMsg("❌ Неверные данные");
        return;
      }
      router.push("/dashboard");
    } catch {
      setMsg("❌ Сбой сети или сервера");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="p-6 max-w-md mx-auto">
      <h1 className="text-2xl font-semibold mb-6">Вход</h1>
      <form onSubmit={onSubmit} className="flex flex-col gap-3">
        {msg && <div className="text-red-600 text-sm">{msg}</div>}
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e)=>setEmail(e.target.value)}
          className="border rounded px-3 py-2"
          required
        />
        <input
          type="password"
          placeholder="Пароль"
          value={password}
          onChange={(e)=>setPassword(e.target.value)}
          className="border rounded px-3 py-2"
          required
          minLength={6}
        />
        <button disabled={loading} className="border rounded px-3 py-2 disabled:opacity-60">
          {loading ? "Входим..." : "Войти"}
        </button>
      </form>

      <div className="my-6 h-px bg-gray-200" />

      <div className="flex flex-col gap-3">
        <button onClick={() => signIn("google", { callbackUrl: "/dashboard" })} className="border rounded px-3 py-2">
          Войти через Google
        </button>
        <button
          onClick={() => signIn("apple", { callbackUrl: "/dashboard" })}
          className="border rounded px-3 py-2"
          title="Для Apple нужен https-домен"
        >
          Войти через Apple
        </button>
      </div>

      <p className="mt-6 text-sm">
        Нет аккаунта? <Link className="underline" href="/auth/sign-up">Зарегистрироваться</Link>
      </p>
    </main>
  );
}
