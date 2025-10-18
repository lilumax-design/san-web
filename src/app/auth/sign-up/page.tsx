"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react"; 

export default function SignUpPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);

    if (name.trim().length < 2) return setErr("Имя минимум 2 символа");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return setErr("Некорректный email");
    if (pass.length < 8) return setErr("Пароль минимум 8 символов");

    const res = await fetch("/api/auth/sign-up", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password: pass }),
    });

    const data = await res.json();
    if (!res.ok) return setErr(data.error || "Ошибка регистрации");

    router.push("/dashboard");
  }

  return (
    <section className="max-w-md mx-auto p-6">
      <h1 className="text-2xl font-semibold mb-4">Регистрация</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        {err && <p className="text-sm text-red-600">{err}</p>}

        <label className="block">
          <span className="text-sm">Имя</span>
          <input
            className="mt-1 w-full rounded-md border px-3 py-2"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Зухра"
          />
        </label>

        <label className="block">
          <span className="text-sm">Email</span>
          <input
            className="mt-1 w-full rounded-md border px-3 py-2"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
          />
        </label>

        <label className="block">
          <span className="text-sm">Пароль</span>
          <input
            className="mt-1 w-full rounded-md border px-3 py-2"
            type="password"
            value={pass}
            onChange={(e) => setPass(e.target.value)}
            placeholder="минимум 8 символов"
          />
        </label>

        <button className="rounded-lg bg-black px-4 py-2 text-white w-full">
          Зарегистрироваться
        </button>
      </form>

      <div className="my-6 h-px bg-gray-200" />

      <div className="flex flex-col gap-3">
        <button
          onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
          className="border rounded px-3 py-2"
        >
          Продолжить с Google
        </button>

        <button
          onClick={() => signIn("apple", { callbackUrl: "/dashboard" })}
          className="border rounded px-3 py-2"
          title="Для Apple нужен https-домен (не localhost)"
        >
          Продолжить с Apple
        </button>
      </div>
    </section>
  );
}
