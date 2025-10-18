import { cookies } from "next/headers";
import { verifySession } from "./jwt";
import { prisma } from "./prisma";

export async function getCurrentUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get("session")?.value;
  if (!token) return null;

  try {
    const payload = await verifySession(token);
    const user = await prisma.user.findUnique({
      where: { id: payload.uid },
      select: { id: true, name: true, email: true, createdAt: true },
    });
    return user;
  } catch {
    return null;
  }
}
