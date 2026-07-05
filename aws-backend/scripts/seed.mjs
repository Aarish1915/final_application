import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const seedData = async () => {
  try {
    console.log('Clearing old product and banner data...');
    await prisma.product.deleteMany({});
    await prisma.banner.deleteMany({});

    console.log('Seeding Products...');
    const products = [
      {
        id: '1978c342-daf9-46aa-be88-515b9485687e',
        name: 'almond biscotti',
        price: 399,
        category: 'Cookies',
        description: 'Premium almond biscotti.',
        image: 'https://ingri-museo-uploads.s3.ap-south-1.amazonaws.com/uploads/1779254246670-rpacgw-ChatGPT Image May 20, 2026, 10_33_19 AM.png',
        inStock: true
      },
      {
        id: '280f5809-5d62-4da4-9113-7bac590edd2e',
        name: 'choco chip cookies',
        price: 299,
        category: 'Cookies',
        description: 'Classic choco chip cookies.',
        image: 'https://ingri-museo-uploads.s3.ap-south-1.amazonaws.com/uploads/1779255127729-1byaf8-ChatGPT Image May 20, 2026, 10_57_35 AM.png',
        inStock: true
      },
      {
        id: '559d5587-f777-424c-a801-ba3885e02ec3',
        name: 'fresh chili pickle',
        price: 159,
        category: 'Condiments',
        description: 'Authentic fresh chili pickle.',
        image: 'https://ingri-museo-uploads.s3.ap-south-1.amazonaws.com/uploads/1779256035233-3ic8th-1.png',
        inStock: true
      },
      {
        id: 'b2b5a5f4-f9db-4071-891a-76da81047e7a',
        name: 'almond makhana granola',
        price: 239,
        category: 'Breakfast',
        description: 'Healthy and crunchy almond makhana granola.',
        image: 'https://ingri-museo-uploads.s3.ap-south-1.amazonaws.com/uploads/1779256176473-ad0fek-1.png',
        inStock: true
      }
    ];

    for (const p of products) {
      await prisma.product.create({ data: p });
    }
    console.log('✅ 4 Products seeded successfully!');

    console.log('Seeding Banners...');
    const banners = [
      {
        title: 'Hero Desktop',
        image: 'https://www.ingri.world/images/hero-des.jpeg',
        link: '/products',
        displayOrder: 1
      },
      {
        title: 'Hero Mobile',
        image: 'https://www.ingri.world/images/hero-mobile.png',
        link: '/products',
        displayOrder: 2
      },
      {
        title: 'Ambiance 1',
        image: 'https://www.ingri.world/images/AMBIANCE/Screenshot%202026-02-13%20193128.png',
        link: '/about',
        displayOrder: 3
      },
      {
        title: 'Ambiance 2',
        image: 'https://www.ingri.world/images/AMBIANCE/Screenshot%202026-02-13%20192731.png',
        link: '/contact',
        displayOrder: 4
      }
    ];

    for (const b of banners) {
      await prisma.banner.create({ data: b });
    }
    console.log('✅ 4 Banners seeded successfully!');

  } catch (error) {
    console.error('Error seeding data:', error);
  } finally {
    await prisma.$disconnect();
  }
};

seedData();
