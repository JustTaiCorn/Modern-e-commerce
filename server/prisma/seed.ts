import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../generated/prisma/client';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
  const roles = ['admin', 'user'];

  for (const name of roles) {
    await prisma.role.upsert({
      where: { name },
      update: {},
      create: { name },
    });
  }

  console.log(`Seeded roles: ${roles.join(', ')}`);

  // Gán role 'admin' cho user đầu tiên trong DB (nếu tồn tại và chưa có).
  // Bỏ qua bước này nếu bạn muốn tự gán thủ công.
  const adminRole = await prisma.role.findUnique({ where: { name: 'admin' } });
  const firstUser = await prisma.user.findFirst({ orderBy: { id: 'asc' } });

  if (adminRole && firstUser) {
    await prisma.userRole.upsert({
      where: {
        userId_roleId: { userId: firstUser.id, roleId: adminRole.id },
      },
      update: {},
      create: { userId: firstUser.id, roleId: adminRole.id },
    });
    console.log(
      `Assigned role 'admin' to first user: #${firstUser.id} (${firstUser.email})`,
    );
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => {
    void prisma.$disconnect();
  });
