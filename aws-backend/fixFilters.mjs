import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const products = await prisma.product.findMany();
  
  for (const p of products) {
    let newCategory = "Ambient Range";
    let newStorage = "Shelf-Stable";
    
    const nameLower = p.name.toLowerCase();
    
    if (nameLower.includes("frozen") || nameLower.includes("cookie") || nameLower.includes("biscotti")) {
       newCategory = "Frozen Ready-to-Eat";
       newStorage = "Frozen";
    } else if (nameLower.includes("curry") || nameLower.includes("gravy") || nameLower.includes("saag") || nameLower.includes("masala")) {
       newCategory = "MVD/FD Ready-to-Use";
       newStorage = "Shelf-Stable";
    }

    await prisma.product.update({
      where: { id: p.id },
      data: {
        category: newCategory,
        storage: newStorage
      }
    });
  }
  
  console.log("Updated categories for all products.");
  await prisma.$disconnect();
}
main();
