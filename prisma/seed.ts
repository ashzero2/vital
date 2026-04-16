import { PrismaClient } from "../lib/generated/prisma/client";
import { PrismaLibSql } from "@prisma/adapter-libsql";
import { hash } from "bcryptjs";

const adapter = new PrismaLibSql({ url: process.env.DATABASE_URL! });
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const prisma = new PrismaClient({ adapter } as any);

async function main() {
  const users = [
    { email: "admin@vital.app", name: "Admin", password: "Admin@123", role: "admin" },
    { email: "user1@vital.app", name: "User One", password: "User@123", role: "user" },
    { email: "user2@vital.app", name: "User Two", password: "User@123", role: "user" },
  ];

  for (const u of users) {
    const hashed = await hash(u.password, 12);
    await prisma.user.upsert({
      where: { email: u.email },
      update: {},
      create: { email: u.email, name: u.name, password: hashed, role: u.role },
    });
    console.log(`Seeded: ${u.email}`);
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
