import { CourseVisibility, Role } from "@prisma/client";
import { NextResponse } from "next/server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

type CreateCourseRequestBody = {
  title?: unknown;
  description?: unknown;
  language?: unknown;
  level?: unknown;
  priceCents?: unknown;
  currency?: unknown;
  visibility?: unknown;
};

function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9а-яё\s-]/gi, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

function normalizeOptionalString(value: unknown): string | null {
  if (typeof value !== "string") {
    return null;
  }

  const normalized = value.trim();

  return normalized.length > 0 ? normalized : null;
}

function parseVisibility(
  value: unknown
): CourseVisibility | null {
  if (
    value === CourseVisibility.PRIVATE ||
    value === CourseVisibility.UNLISTED ||
    value === CourseVisibility.PUBLIC
  ) {
    return value;
  }

  return null;
}

function parsePrice(
  value: unknown
): number | null | undefined {
  if (value === "" || value === null || value === undefined) {
    return null;
  }

  const parsed = Number(value);

  if (!Number.isInteger(parsed) || parsed < 0) {
    return undefined;
  }

  return parsed;
}

export async function POST(request: Request) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json(
        {
          error: "Необходимо войти в систему.",
        },
        {
          status: 401,
        }
      );
    }

    if (
      session.user.role !== Role.ADMIN &&
      session.user.role !== Role.TEACHER
    ) {
      return NextResponse.json(
        {
          error: "У вас нет прав для создания курса.",
        },
        {
          status: 403,
        }
      );
    }

    const authorId = session.user.id;

    if (!authorId) {
      return NextResponse.json(
        {
          error: "Не удалось определить пользователя.",
        },
        {
          status: 400,
        }
      );
    }

    let body: CreateCourseRequestBody;

    try {
      body = (await request.json()) as CreateCourseRequestBody;
    } catch {
      return NextResponse.json(
        {
          error: "Некорректный формат запроса.",
        },
        {
          status: 400,
        }
      );
    }

    const title =
      typeof body.title === "string"
        ? body.title.trim()
        : "";

    if (!title) {
      return NextResponse.json(
        {
          error: "Название курса обязательно.",
        },
        {
          status: 400,
        }
      );
    }

    const visibility =
      body.visibility === undefined
        ? CourseVisibility.PRIVATE
        : parseVisibility(body.visibility);

    if (!visibility) {
      return NextResponse.json(
        {
          error: "Некорректная видимость курса.",
        },
        {
          status: 400,
        }
      );
    }

    const priceCents = parsePrice(body.priceCents);

    if (priceCents === undefined) {
      return NextResponse.json(
        {
          error:
            "Цена должна быть целым числом, равным нулю или больше.",
        },
        {
          status: 400,
        }
      );
    }

    const description = normalizeOptionalString(
      body.description
    );

    const language = normalizeOptionalString(body.language);
    const level = normalizeOptionalString(body.level);

    const currency =
      normalizeOptionalString(body.currency)?.toUpperCase() ??
      null;

    const baseSlug = slugify(title) || "course";

    let slug = baseSlug;
    let suffix = 1;

    while (
      await prisma.course.findUnique({
        where: {
          slug,
        },
        select: {
          id: true,
        },
      })
    ) {
      suffix += 1;
      slug = `${baseSlug}-${suffix}`;
    }

    const course = await prisma.course.create({
      data: {
        title,
        slug,
        description,
        language,
        level,
        visibility,
        priceCents,
        currency,
        authorId,
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
        createdAt: true,
      },
    });

    return NextResponse.json(
      {
        course,
      },
      {
        status: 201,
      }
    );
  } catch (error) {
    console.error("POST /api/courses:", error);

    return NextResponse.json(
      {
        error: "Не удалось создать курс.",
      },
      {
        status: 500,
      }
    );
  }
}