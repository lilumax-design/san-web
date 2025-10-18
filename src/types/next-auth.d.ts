import "next-auth";
import "next-auth/jwt";

declare module "next-auth" {
  interface User {
    role?: "ADMIN" | "TEACHER" | "STUDENT";
  }
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      role?: "ADMIN" | "TEACHER" | "STUDENT";
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role?: "ADMIN" | "TEACHER" | "STUDENT";
  }
}
