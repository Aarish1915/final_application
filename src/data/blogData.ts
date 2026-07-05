export type BlogPostItem = {
  _id: string;
  title: string;
  slug: string;
  excerpt: string;
  content?: string;
  coverImage: string;
  category: string;
  tags: string[];
  author: string;
  publishedAt: string;
  featured: boolean;
  readTime?: string;
};

export const HARDCODED_POSTS: BlogPostItem[] = [
  {
    _id: "1",
    title: "The Renaissance of Seasonal Roots: A Culinary Journey Through History",
    slug: "seasonal-baking-france",
    excerpt:
      "Discover how classical artworks from the 16th century inspire our modern approach to vegetable-centric dishes, blending historical techniques with contemporary plating.",
    content: `French baking is more than just a culinary practice—it's a celebration of seasons, tradition, and the art of patience. From the golden croissants of Paris to the rustic sourdough of Provence, each region tells its story through flour, butter, and time.

**The Philosophy of Seasonal Baking**

At Ingri, we embrace the French philosophy that great baking begins with understanding your ingredients. Winter calls for hearty whole grains and warming spices, while summer invites delicate fruit tarts and light pastries.

**Essential Techniques**

Master bakers know that temperature, timing, and touch are everything. The perfect croissant requires 27 layers of butter and dough, each fold a meditation in precision. Our chefs have spent years perfecting these techniques, bringing authentic French methods to every creation.

**Seasonal Ingredients**

We source our flour from heritage mills, our butter from local dairies, and our fruits from farmers who understand that flavor comes from patience. Each season brings new possibilities—spring's tender rhubarb, summer's stone fruits, autumn's apples, and winter's citrus.`,
    coverImage: "/images/FOOD/Screenshot 2026-02-13 193211.png",
    category: "Museum Stories",
    tags: ["baking", "france", "seasonal"],
    author: "Eleanor Vance",
    publishedAt: "2024-11-14",
    featured: true,
    readTime: "8 min read",
  },
  {
    _id: "2",
    title: "Ingri: Where Art Meets Gastronomy",
    slug: "our-story-museo",
    excerpt:
      "The story of how a photography gallery and culinary passion came together to create a unique dining experience in the heart of the city.",
    content: `Ingri was born from a simple belief: that food, like photography, is an art form that captures moments and tells stories.

**The Beginning**

Founded at the intersection of culinary passion and photographic heritage, Ingri is more than a cafe—it is an extension of the Museo Camera Centre for the Photographic Arts' soul.

**Our Philosophy**

We don't just serve coffee; we provide a pause. A moment to reflect on the art you've just seen, or to prepare for the beauty you're about to witness.

**The Space**

Located within the hallowed halls of Museo Camera, we serve as a transition point between the external world and the world of curated light and shadow.`,
    coverImage: "/images/AMBIANCE/Screenshot 2026-02-13 192830.png",
    category: "Behind the Scenes",
    tags: ["story", "museum", "philosophy"],
    author: "INGRI Team",
    publishedAt: "2024-02-14",
    featured: true,
    readTime: "6 min read",
  },
  {
    _id: "3",
    title: "Abstract Expressionism in Pastry Design",
    slug: "artisanal-products",
    excerpt:
      "Chef Lucas explores the fluid movements of Pollock through citrus glazes and sculptural chocolate elements.",
    content: `At INGRI, we believe that exceptional food should be accessible beyond our cafe walls. That's why we've created a line of artisanal products that capture the essence of our culinary philosophy.

**Zero Preservatives, Pure Flavor**

Every product in our collection is made with 100% pure ingredients—no thickeners, no flavor enhancers, no acidity regulators. What you taste is what nature intended, enhanced only by our chefs' expertise and time-honored techniques.

**Our Product Range**

From signature gravies and spice blends to gourmet condiments and frozen ready-to-cook meals, each product is crafted in small batches to ensure quality and freshness.`,
    coverImage: "/images/FOOD/Screenshot 2026-02-13 193238.png",
    category: "Culinary",
    tags: ["products", "artisan", "quality"],
    author: "Lucas Thorne",
    publishedAt: "2024-11-10",
    featured: false,
    readTime: "5 min read",
  },
  {
    _id: "4",
    title: "The Architecture of a Wine Cellar",
    slug: "b2b-partnerships",
    excerpt:
      "Delving into the subterranean history of the museum's wing and the curation of our vintage collection.",
    content: `In an industry where scale often means compromise, INGRI has proven that it's possible to grow while maintaining uncompromising quality standards.

**Our B2B Philosophy**

Whether you're a restaurant, hotel, corporate, or retailer, we believe you deserve the same quality we serve in our cafe.

**Services We Offer**

Corporate Catering: Elevate your events with curated menus crafted by our executive chefs. From breakfast briefings to gala dinners, we deliver excellence.`,
    coverImage: "/images/AMBIANCE/Screenshot 2026-02-13 193045.png",
    category: "Behind the Scenes",
    tags: ["business", "partnership", "wholesale"],
    author: "Vincent Miller",
    publishedAt: "2024-11-08",
    featured: false,
    readTime: "6 min read",
  },
  {
    _id: "5",
    title: "Winter Solstice: A Gala Review",
    slug: "coffee-culture-world",
    excerpt:
      "Highlights from our most recent black tie event celebrating the shortest day with the brightest flavors.",
    content: `Coffee is more than a beverage—it's a ritual, a social connector, and a cultural touchstone that varies beautifully across the globe.

**Italy: The Espresso Tradition**

In Italy, coffee is an art form. The perfect espresso is consumed standing at the bar, a quick moment of pleasure before continuing the day.

**Ethiopia: The Coffee Ceremony**

In Ethiopia, where coffee originated, the traditional coffee ceremony is a sacred ritual.`,
    coverImage: "/images/AMBIANCE/Screenshot 2026-02-13 192722.png",
    category: "Events",
    tags: ["coffee", "culture", "travel"],
    author: "Julian Gray",
    publishedAt: "2024-11-05",
    featured: false,
    readTime: "4 min read",
  },
  {
    _id: "6",
    title: "Farm to Table: Our Sustainable Sourcing Journey",
    slug: "farm-to-table-sustainable",
    excerpt:
      "Discover how we partner with local farms to bring the freshest, most sustainable ingredients to your plate.",
    content: `Sustainability isn't a trend at INGRI—it's a fundamental principle that guides every decision we make, from sourcing to service.

**Our Farming Partners**

We work directly with over 30 local farms, building relationships that go beyond transactions.

**Seasonal Menus**

Our menu changes with the seasons because we believe in cooking with what's naturally available.`,
    coverImage: "/images/AMBIANCE/Screenshot 2026-02-13 192813.png",
    category: "Sustainability",
    tags: ["farm", "sustainable", "local"],
    author: "Sarah Green",
    publishedAt: "2024-02-08",
    featured: false,
    readTime: "6 min read",
  },
  {
    _id: "7",
    title: "Mastering the Art of Plating",
    slug: "art-of-plating",
    excerpt:
      "Transform your dishes into works of art with professional plating techniques and presentation tips from our culinary team.",
    content: `At INGRI, we believe that a meal is a sensory exhibition. The visual presentation of food is as important as its taste, aroma, and texture.

**The Philosophy of Plating**

Great plating tells a story. It guides the diner's eye, creates anticipation, and enhances the eating experience.`,
    coverImage: "/images/FOOD/Screenshot 2026-02-13 193238.png",
    category: "Culinary",
    tags: ["plating", "presentation", "techniques"],
    author: "Chef Marie Laurent",
    publishedAt: "2024-02-05",
    featured: false,
    readTime: "6 min read",
  },
  {
    _id: "8",
    title: "Heritage Grains: Rediscovering Ancient Flavors",
    slug: "heritage-grains",
    excerpt:
      "Journey through time as we explore ancient grains and their place in modern cuisine, from spelt to einkorn.",
    content: `In our quest for convenience, we've forgotten the rich diversity of grains that sustained civilizations for millennia.

**What Are Heritage Grains?**

Heritage grains are ancient varieties that have been cultivated for thousands of years without modern genetic modification.`,
    coverImage: "/images/FOOD/Screenshot 2026-02-13 193251.png",
    category: "Chef's Table",
    tags: ["grains", "heritage", "history"],
    author: "Emma Wilson",
    publishedAt: "2024-02-03",
    featured: false,
    readTime: "8 min read",
  },
  {
    _id: "9",
    title: "The Science of Fermentation",
    slug: "science-fermentation",
    excerpt:
      "Unlock the secrets of fermentation and learn how this ancient technique enhances flavor and nutrition in modern cooking.",
    content: `Fermentation is one of humanity's oldest food preservation techniques, and it's experiencing a renaissance in modern kitchens.

**Understanding Fermentation**

Fermentation is the process by which microorganisms transform food, creating new compounds that add flavor and preserve food.`,
    coverImage: "/images/FOOD/Screenshot 2026-02-13 193307.png",
    category: "Culinary",
    tags: ["fermentation", "science", "preservation"],
    author: "David Chen",
    publishedAt: "2024-02-01",
    featured: false,
    readTime: "9 min read",
  },
  {
    _id: "10",
    title: "Creating Ambiance: The Art of Dining Spaces",
    slug: "creating-ambiance",
    excerpt:
      "Explore how lighting, music, and design come together to create unforgettable dining experiences at Ingri.",
    content: `A great meal is more than just food—it's an experience that engages all the senses.

**The Power of Lighting**

Lighting sets the mood. We use warm, layered lighting that creates intimacy without darkness.`,
    coverImage: "/images/AMBIANCE/Screenshot 2026-02-13 192909.png",
    category: "Culinary",
    tags: ["ambiance", "design", "experience"],
    author: "Ilisha Chauhan",
    publishedAt: "2024-01-28",
    featured: false,
    readTime: "5 min read",
  },
  {
    _id: "11",
    title: "Wood-Fired Cooking: Ancient Technique, Modern Application",
    slug: "wood-fired-cooking",
    excerpt:
      "Discover how our wood-fired oven brings smoky depth and artisanal quality to pizzas, breads, and roasted dishes.",
    content: `There's something primal and magical about cooking with fire. At INGRI, our wood-fired oven is the heart of our kitchen.

**The Wood-Fired Difference**

Wood-fired ovens reach temperatures of 800-900°F, far hotter than conventional ovens.`,
    coverImage: "/images/FOOD/Screenshot 2026-02-13 193426.png",
    category: "Chef's Table",
    tags: ["wood-fired", "pizza", "cooking"],
    author: "Chef Marie Laurent",
    publishedAt: "2024-01-25",
    featured: false,
    readTime: "7 min read",
  },
  {
    _id: "12",
    title: "The INGRI Breakfast Philosophy",
    slug: "breakfast-philosophy",
    excerpt:
      "Why we believe breakfast is the most important meal, and how we've created a morning menu that fuels creativity and connection.",
    content: `Breakfast at INGRI isn't just about fueling your body—it's about setting the tone for your entire day.

**Breaking the Fast**

After hours of sleep, your body needs quality nutrition.`,
    coverImage: "/images/FOOD/Screenshot 2026-02-13 193405.png",
    category: "Chef's Table",
    tags: ["breakfast", "morning", "philosophy"],
    author: "Chef Sunil Chauhan",
    publishedAt: "2024-01-22",
    featured: false,
    readTime: "6 min read",
  },
];
