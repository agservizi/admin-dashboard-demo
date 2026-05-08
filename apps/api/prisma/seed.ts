import { PrismaClient, ResourceStatus } from "@prisma/client";

const prisma = new PrismaClient();

const statuses: ResourceStatus[] = ["active", "inactive", "pending"];

function pick<T>(arr: T[], i: number): T {
  return arr[i % arr.length]!;
}

async function main() {
  await prisma.resource.deleteMany();

  const rows = Array.from({ length: 50 }, (_, i) => ({
    name: `Risorsa demo ${String(i + 1).padStart(2, "0")}`,
    status: pick(statuses, i),
  }));

  await prisma.resource.createMany({ data: rows });
  console.log(`Seeded ${rows.length} resources.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
