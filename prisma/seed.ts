import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const email = process.env.SEED_ADMIN_EMAIL ?? "admin@shreejienterprise.com";
  const password = process.env.SEED_ADMIN_PASSWORD ?? "ChangeMe123!";
  const name = process.env.SEED_ADMIN_NAME ?? "Admin";

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    console.log(`Admin user already exists: ${email}`);
  } else {
    const hashed = await bcrypt.hash(password, 10);

    await prisma.user.create({
      data: {
        name,
        email,
        password: hashed,
        role: "ADMIN",
      },
    });

    console.log(`Created admin user: ${email} (password: ${password})`);
    console.log("Log in and change this password immediately.");
  }

  // --- Sample portfolio categories + items (Our Work section) ---
  const categories = [
    { name: "Brackets", slug: "brackets" },
    { name: "Enclosures", slug: "enclosures" },
    { name: "Panels", slug: "panels" },
    { name: "Signage", slug: "signage" },
  ];

  const categoryRecords: Record<string, { id: string }> = {};
  for (const cat of categories) {
    const record = await prisma.portfolioCategory.upsert({
      where: { slug: cat.slug },
      update: {},
      create: cat,
    });
    categoryRecords[cat.slug] = record;
  }

  const sampleItems = [
    { name: "Control Panel Bracket", slug: "brackets", material: "MS 3mm" },
    { name: "Junction Box Enclosure", slug: "enclosures", material: "SS 2mm" },
    { name: "Machine Base Panel", slug: "panels", material: "MS 6mm" },
    { name: "Storefront Signage Frame", slug: "signage", material: "AL 4mm" },
    { name: "Mounting Bracket Set", slug: "brackets", material: "MS 4mm" },
    { name: "Electrical Enclosure", slug: "enclosures", material: "SS 3mm" },
    { name: "Chassis Side Panel", slug: "panels", material: "MS 2mm" },
    { name: "Wayfinding Sign Panel", slug: "signage", material: "AL 3mm" },
    { name: "L-Bracket Batch", slug: "brackets", material: "MS 5mm" },
  ];

  const existingItemCount = await prisma.portfolioItem.count();
  if (existingItemCount === 0) {
    for (const item of sampleItems) {
      await prisma.portfolioItem.create({
        data: {
          name: item.name,
          material: item.material,
          categoryId: categoryRecords[item.slug].id,
        },
      });
    }
    console.log(`Seeded ${sampleItems.length} sample portfolio items across ${categories.length} categories.`);
  } else {
    console.log("Portfolio items already exist, skipping sample data.");
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
