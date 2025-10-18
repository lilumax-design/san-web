// scripts/make-admin.ts
import { PrismaClient, Role } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const email = process.env.ADMIN_EMAIL || "admin@san.local";
  const rawPassword = process.env.ADMIN_PASSWORD || "123456";
  const passwordHash = await bcrypt.hash(rawPassword, 10);

  const admin = await prisma.user.upsert({
    where: { email },
    update: { role: Role.ADMIN, passwordHash },
    create: {
      email,
      name: "SAN Admin",
      role: Role.ADMIN,
      passwordHash,
      profile: { create: { locale: "ru", timezone: "Europe/Moscow" } },
    },
    include: { profile: true },
  });

  console.log("✅ Admin ready:", admin.email);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
