import { redirect } from "next/navigation";

import { auth } from "@/auth";

export default async function AfterLoginPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/auth/sign-in");
  }

  const role = session.user.role;

  if (role === "ADMIN") {
    redirect("/admin");
  }

  if (role === "TEACHER") {
    redirect("/teacher/courses");
  }

  redirect("/dashboard");
}