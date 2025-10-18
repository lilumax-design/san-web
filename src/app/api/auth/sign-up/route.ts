import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/crypto";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const { email, password, name } = await req.json().catch(() => ({} as any));

  const normalizedEmail =
    typeof email === "string" ? email.trim().toLowerCase() : "";

  if (!normalizedEmail || typeof password !== "string" || password.length < 6) {
    return NextResponse.json({ ok: false, error: "Invalid payload" }, { status: 400 });
  }

  const existing = await prisma.user.findUnique({ where: { email: normalizedEmail } });
  const passwordHash = await hashPassword(password);

  if (!existing) {
    await prisma.user.create({
      data: {
        email: normalizedEmail,
        name: typeof name === "string" ? name : null,
        passwordHash,
        role: "STUDENT", 
      },
    });
    return NextResponse.json({ ok: true }, { status: 201 });
  }

  if (!existing.passwordHash) {
    await prisma.user.update({
      where: { id: existing.id },
      data: { passwordHash },
    });
    return NextResponse.json({ ok: true }, { status: 200 });
  }

  return NextResponse.json({ ok: false, error: "User already exists" }, { status: 409 });
}
