// prisma/seed.ts
import { PrismaClient, Role } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@san.local';

  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: { role: Role.ADMIN },
    create: {
      email: adminEmail,
      name: 'SAN Admin',
      role: Role.ADMIN,
      profile: {
        create: { locale: 'ru', timezone: 'Europe/Moscow' },
      },
    },
    include: { profile: true },
  });

  console.log('✅ Admin upserted:', admin.email);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
