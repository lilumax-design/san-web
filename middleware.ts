import { NextResponse } from "next/server";
import { auth } from "./auth";

export async function middleware(req: Request) {
  const url = new URL(req.url);
  const pathname = url.pathname;

  
  const protectedPaths = [
    "/admin",
    "/teacher",
    "/dashboard",
    "/course/create",
    "/course/edit",
  ];

  const isProtected =
    protectedPaths.some((p) => pathname.startsWith(p)) ||
    pathname.startsWith("/api/courses");

  if (!isProtected) return NextResponse.next();

  const session = await auth();
  if (!session?.user) {
    return NextResponse.redirect(new URL("/auth/sign-in", url.origin));
  }

  
  const role: string = session.user.role || "STUDENT";
  if (pathname.startsWith("/admin") && role !== "ADMIN") {
    return NextResponse.redirect(new URL("/403", url.origin));
  }

  
  const teacherOnly = ["/teacher", "/course/create", "/course/edit", "/api/courses"];
  if (teacherOnly.some((p) => pathname.startsWith(p)) && !["ADMIN", "TEACHER"].includes(role)) {
    return NextResponse.redirect(new URL("/403", url.origin));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/teacher/:path*",
    "/dashboard/:path*",
    "/course/:path*",
    "/api/courses/:path*",
  ],
};