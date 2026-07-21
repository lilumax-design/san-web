import { Role } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

import { hashPassword } from "@/lib/crypto";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

type SignUpRequestBody = {
  email?: unknown;
  password?: unknown;
  name?: unknown;
};

export async function POST(request: NextRequest) {
  let body: SignUpRequestBody;

  try {
    body = (await request.json()) as SignUpRequestBody;
  } catch {
    return NextResponse.json(
      {
        ok: false,
        error: "Некорректный формат запроса.",
      },
      {
        status: 400,
      }
    );
  }

  const normalizedEmail =
    typeof body.email === "string"
      ? body.email.trim().toLowerCase()
      : "";

  const password =
    typeof body.password === "string" ? body.password : "";

  const normalizedName =
    typeof body.name === "string" && body.name.trim().length > 0
      ? body.name.trim()
      : null;

  if (!normalizedEmail || password.length < 6) {
    return NextResponse.json(
      {
        ok: false,
        error:
          "Укажите корректный email и пароль длиной не менее 6 символов.",
      },
      {
        status: 400,
      }
    );
  }

  const existingUser = await prisma.user.findUnique({
    where: {
      email: normalizedEmail,
    },
  });

  const passwordHash = await hashPassword(password);

  if (!existingUser) {
    await prisma.user.create({
      data: {
        email: normalizedEmail,
        name: normalizedName,
        passwordHash,
        role: Role.STUDENT,
      },
    });

    return NextResponse.json(
      {
        ok: true,
      },
      {
        status: 201,
      }
    );
  }

  if (!existingUser.passwordHash) {
    await prisma.user.update({
      where: {
        id: existingUser.id,
      },
      data: {
        name: existingUser.name ?? normalizedName,
        passwordHash,
      },
    });

    return NextResponse.json(
      {
        ok: true,
      },
      {
        status: 200,
      }
    );
  }

  return NextResponse.json(
    {
      ok: false,
      error: "Пользователь с таким email уже существует.",
    },
    {
      status: 409,
    }
  );
}