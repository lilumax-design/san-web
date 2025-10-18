import { auth } from "@/auth";
import { redirect } from "next/navigation";

export default async function AfterLogin() {
  const session = await auth();

  if (!session?.user) redirect("/auth/sign-in");

  // @ts-expect-error custom
  const role = session.user.role as string;

  if (role === "ADMIN") redirect("/admin");
  if (role === "TEACHER") redirect("/teacher/courses");

  // STUDENT / PARENT или прочие — в общий кабинет
  redirect("/dashboard");
}
