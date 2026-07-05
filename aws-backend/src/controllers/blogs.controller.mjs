import prisma from '../utils/prisma.mjs';

// GET /api/blogs (Public)
export const getPublicBlogs = async (req, res, next) => {
  try {
    const { category, page = 1, limit = 12 } = req.query;
    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 12;

    const where = { status: "published" };
    if (category && category !== "All") where.category = category;

    const [blogs, total] = await Promise.all([
      prisma.blog.findMany({
        where,
        orderBy: { publishedAt: 'desc' },
        skip: (pageNum - 1) * limitNum,
        take: limitNum
      }),
      prisma.blog.count({ where })
    ]);

    // Prisma distinct trick for fetching unique categories among published blogs
    const distinctCategories = await prisma.blog.findMany({
      where: { status: "published" },
      distinct: ['category'],
      select: { category: true }
    });
    const categories = distinctCategories.map(c => c.category);

    res.json({
      blogs,
      categories,
      pagination: { page: pageNum, limit: limitNum, total, pages: Math.ceil(total / limitNum) }
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/blogs/:slug (Public)
export const getBlogBySlug = async (req, res, next) => {
  try {
    const { slug } = req.params;
    const blog = await prisma.blog.findUnique({ where: { slug } });
    if (!blog || blog.status !== "published") return res.status(404).json({ error: "Blog not found" });

    const related = await prisma.blog.findMany({
      where: { category: blog.category, status: "published", id: { not: blog.id } },
      take: 3
    });

    res.json({ blog, related });
  } catch (error) {
    next(error);
  }
};

// GET /admin/blogs (Admin)
export const getAdminBlogs = async (req, res, next) => {
  try {
    const { page = 1, limit = 50, search, status, category } = req.query;
    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 50;

    const where = {};
    if (search) where.title = { contains: search, mode: 'insensitive' };
    if (status) where.status = status;
    if (category) where.category = category;

    const [blogs, total] = await Promise.all([
      prisma.blog.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (pageNum - 1) * limitNum,
        take: limitNum
      }),
      prisma.blog.count({ where })
    ]);

    res.json({
      blogs,
      pagination: { page: pageNum, limit: limitNum, total, pages: Math.ceil(total / limitNum) }
    });
  } catch (error) {
    next(error);
  }
};

// POST /admin/blogs (Admin)
export const createBlog = async (req, res, next) => {
  try {
    const { title, slug, excerpt, content, coverImage, category, tags, author, seoTitle, seoDescription, seoKeywords, status, featured } = req.body;
    if (!title || !slug) return res.status(400).json({ error: "Title and slug are required" });

    // Handle tags (if it comes as a string or array)
    let parsedTags = [];
    if (Array.isArray(tags)) parsedTags = tags;
    else if (typeof tags === 'string') parsedTags = tags.split(',').map(t => t.trim());

    const blog = await prisma.blog.create({
      data: {
        title, slug, excerpt, content, coverImage, category, 
        tags: parsedTags, 
        author, seoTitle, seoDescription, 
        seoKeywords: Array.isArray(seoKeywords) ? seoKeywords.join(", ") : seoKeywords,
        status, featured,
        publishedAt: status === "published" ? new Date() : null
      }
    });

    res.status(201).json({ blog });
  } catch (error) {
    if (error.code === 'P2002') return res.status(400).json({ error: "Blog with this slug already exists" });
    next(error);
  }
};

// PATCH /admin/blogs/:id (Admin)
export const updateBlog = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { _id, id: bodyId, createdAt, updatedAt, ...updateData } = req.body;

    if (updateData.status === "published" && !updateData.publishedAt) {
      updateData.publishedAt = new Date();
    }
    
    if (updateData.tags !== undefined) {
      if (Array.isArray(updateData.tags)) updateData.tags = updateData.tags;
      else if (typeof updateData.tags === 'string') updateData.tags = updateData.tags.split(',').map(t => t.trim());
    }

    if (Array.isArray(updateData.seoKeywords)) {
      updateData.seoKeywords = updateData.seoKeywords.join(", ");
    }

    const blog = await prisma.blog.update({
      where: { id },
      data: updateData
    });

    res.json({ blog });
  } catch (error) {
    if (error.code === 'P2002') return res.status(400).json({ error: "Blog with this slug already exists" });
    if (error.code === 'P2025') return res.status(404).json({ error: "Blog not found" });
    next(error);
  }
};

// DELETE /admin/blogs/:id (Admin)
export const deleteBlog = async (req, res, next) => {
  try {
    const { id } = req.params;
    await prisma.blog.delete({ where: { id } });
    res.json({ message: "Blog deleted" });
  } catch (error) {
    if (error.code === 'P2025') return res.status(404).json({ error: "Blog not found" });
    next(error);
  }
};
