import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🔍 Checking Category Table...');
  
  const categoryName = 'Tutoring';
  const category = await prisma.category.findUnique({
      where: { name: categoryName }
  });

  if (category) {
      console.log(`✅ Category "${categoryName}" FOUND in DB.`);
      console.log(category);
  } else {
      console.log(`❌ Category "${categoryName}" NOT found in DB.`);
      console.log('Attemping to fix...');
      
      try {
          const newCat = await prisma.category.create({
              data: {
                  name: categoryName,
                  slug: 'tutoring',
                  description: 'Services for Tutoring',
                  icon: '📚',
                  isActive: true
              }
          });
          console.log('✅ Created Tutoring category:', newCat);
      } catch (e) {
          console.error('Failed to create:', e);
      }
  }

  // List all categories to be sure
  const all = await prisma.category.findMany({ select: { name: true } });
  console.log('All Categories:', all.map(c => c.name).join(', '));
}

main()
  .catch(e => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
