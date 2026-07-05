import prisma from '../utils/prisma.mjs';

// GET /sitemap.xml
export const getSitemap = async (req, res, next) => {
  try {
    const products = await prisma.product.findMany({
      where: { inStock: true },
      select: { id: true, name: true, updatedAt: true }
    });

    const baseUrl = 'https://ingri-world-test.vercel.app'; // Replace with production frontend URL

    let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${baseUrl}/</loc>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>${baseUrl}/products</loc>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>`;

    products.forEach(product => {
      xml += `
  <url>
    <loc>${baseUrl}/product/${product.id}</loc>
    <lastmod>${product.updatedAt.toISOString().split('T')[0]}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`;
    });

    xml += `\n</urlset>`;

    res.header('Content-Type', 'application/xml');
    res.send(xml);
  } catch (error) {
    next(error);
  }
};
