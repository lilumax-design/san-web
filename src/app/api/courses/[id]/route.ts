import { CourseVisibility } from "@prisma/client";
import { NextResponse } from "next/server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

type CourseRequestBody = {
  title?: unknown;
  description?: unknown;
  language?: unknown;
  level?: unknown;
  visibility?: unknown;
  priceCents?: unknown;
  currency?: unknown;
};

function normalizeOptionalString(value: unknown): string | null {
  if (typeof value !== "string") {
    return null;
  }

  const normalized = value.trim();

  return normalized.length > 0 ? normalized : null;
}

function parseVisibility(value: unknown): CourseVisibility | null {
  if (
    value === CourseVisibility.PRIVATE ||
    value === CourseVisibility.UNLISTED ||
    value === CourseVisibility.PUBLIC
  ) {
    return value;
  }

  return null;
}

function parsePrice(value: unknown): number | null | undefined {
  if (value === "" || value === null || value === undefined) {
    return null;
  }

  const parsed = Number(value);

  if (!Number.isInteger(parsed) || parsed < 0) {
    return undefined;
  }

  return parsed;
}

export async function GET(
  _request: Request,
  context: RouteContext
) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json(
        { error: "Необходимо войти в систему." },
        { status: 401 }
      );
    }

    if (
      session.user.role !== "ADMIN" &&
      session.user.role !== "TEACHER"
    ) {
      return NextResponse.json(
        { error: "Доступ запрещён." },
        { status: 403 }
      );
    }

    const { id } = await context.params;

    const course = await prisma.course.findUnique({
      where: { id },
      select: {
        id: true,
        title: true,
        slug: true,
        description: true,
        language: true,
        level: true,
        visibility: true,
        priceCents: true,
        currency: true,
        authorId: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!course) {
      return NextResponse.json(
        { error: "Курс не найден." },
        { status: 404 }
      );
    }

    const mayManageCourse =
      session.user.role === "ADMIN" ||
      course.authorId === session.user.id;

    if (!mayManageCourse) {
      return NextResponse.json(
        { error: "У вас нет доступа к этому курсу." },
        { status: 403 }
      );
    }

    return NextResponse.json({ course });
  } catch (error) {
    console.error("GET /api/courses/[id]:", error);

    return NextResponse.json(
      { error: "Не удалось получить данные курса." },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: Request,
  context: RouteContext
) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json(
        { error: "Необходимо войти в систему." },
        { status: 401 }
      );
    }

    if (
      session.user.role !== "ADMIN" &&
      session.user.role !== "TEACHER"
    ) {
      return NextResponse.json(
        { error: "Доступ запрещён." },
        { status: 403 }
      );
    }

    const { id } = await context.params;

    const existingCourse = await prisma.course.findUnique({
      where: { id },
      select: {
        id: true,
        authorId: true,
      },
    });

    if (!existingCourse) {
      return NextResponse.json(
        { error: "Курс не найден." },
        { status: 404 }
      );
    }

    const mayManageCourse =
      session.user.role === "ADMIN" ||
      existingCourse.authorId === session.user.id;

    if (!mayManageCourse) {
      return NextResponse.json(
        { error: "У вас нет доступа к этому курсу." },
        { status: 403 }
      );
    }

    const body = (await request.json()) as CourseRequestBody;

    const title =
      typeof body.title === "string" ? body.title.trim() : "";

    if (!title) {
      return NextResponse.json(
        { error: "Название курса обязательно." },
        { status: 400 }
      );
    }

    const visibility = parseVisibility(body.visibility);

    if (!visibility) {
      return NextResponse.json(
        { error: "Некорректная видимость курса." },
        { status: 400 }
      );
    }

    const priceCents = parsePrice(body.priceCents);

    if (priceCents === undefined) {
      return NextResponse.json(
        {
          error:
            "Цена должна быть целым числом, равным нулю или больше.",
        },
        { status: 400 }
      );
    }

    const course = await prisma.course.update({
      where: { id },
      data: {
        title,
        description: normalizeOptionalString(body.description),
        language: normalizeOptionalString(body.language),
        level: normalizeOptionalString(body.level),
        visibility,
        priceCents,
        currency:
          normalizeOptionalString(body.currency)?.toUpperCase() ?? null,
      },
      select: {
        id: true,
        title: true,
        slug: true,
        description: true,
        language: true,
        level: true,
        visibility: true,
        priceCents: true,
        currency: true,
        updatedAt: true,
      },
    });

    return NextResponse.json({ course });
  } catch (error) {
    console.error("PATCH /api/courses/[id]:", error);

    return NextResponse.json(
      { error: "Не удалось сохранить изменения курса." },
      { status: 500 }
    );
  }
}