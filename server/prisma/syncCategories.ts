import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🔄 Syncing Provider Categories to Global List...');
  
  const providers = await prisma.provider.findMany({
    select: { primaryCategory: true }
  });

  const categories = new Set(providers.map(p => p.primaryCategory));
  
  console.log(`Found ${categories.size} unique provider categories.`);

  for (const name of categories) {
    const slug = name.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '');
    
    // Check if slug exists to avoid collision
    const existingSlug = await prisma.category.findUnique({ where: { slug } });
    const finalSlug = existingSlug && existingSlug.name !== name ? `${slug}-${Math.floor(Math.random()*1000)}` : slug;

    try {
        // Upsert by name
        const existing = await prisma.category.findUnique({ where: { name } });
        if (!existing) {
             await prisma.category.create({
                data: { 
                    name, 
                    slug: finalSlug, 
                    description: `Services for ${name}`,
                    icon: '📦', 
                    isActive: true 
                }
            });
            console.log(`✅ Created: ${name}`);
        } else {
            console.log(`👍 Exists: ${name}`);
        }
    } catch (error) {
        console.error(`❌ Failed to sync ${name}:`, error);
    }
  }
}

main()
  .catch(e => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
