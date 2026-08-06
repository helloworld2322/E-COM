import { getProducts, bulkReplaceProducts, isFreshDB } from "./db.js";

const img = (id) =>
  `https://images.unsplash.com/${id}?w=900&q=80&auto=format&fit=crop`;

export function seedIfEmpty() {
  // Seed only on a genuinely fresh database (never overwrite an emptied one)
  if (!isFreshDB()) return;
  if (getProducts().length > 0) return;

  const products = [
    // ================= ELECTRONICS =================
    {
      name: "Sony WH-1000XM5 Wireless Headphones",
      category: "electronics",
      price: 399.99,
      image: img("photo-1505740420928-5e560c06d30e"),
      badge: "Bestseller",
      featured: true,
      rating: 4.8,
      reviews: 2431,
      stock: 45,
      description:
        "Industry-leading noise cancellation with two processors and eight microphones. Crystal-clear hands-free calling and up to 30 hours of battery life in a featherweight, comfortable design.",
      specs: ["30h battery", "Bluetooth 5.2", "Noise cancelling", "USB-C fast charge"],
    },
    {
      name: "Apple AirPods Pro (2nd Generation)",
      category: "electronics",
      price: 249.0,
      image: img("photo-1600294037681-c80b4cb5b434"),
      badge: "New",
      featured: true,
      rating: 4.7,
      reviews: 1840,
      stock: 120,
      description:
        "Up to 2x more Active Noise Cancellation, adaptive transparency, and personalized Spatial Audio. Sweat and water resistant with a MagSafe charging case.",
      specs: ["ANC + Adaptive", "Spatial Audio", "IPX4 rated", "MagSafe case"],
    },
    {
      name: 'Apple MacBook Air 13" (M3, 2024)',
      category: "electronics",
      price: 1099.0,
      oldPrice: 1249.0,
      image: img("photo-1517336714731-489689fd1ca8"),
      badge: "Sale",
      featured: true,
      rating: 4.9,
      reviews: 920,
      stock: 25,
      description:
        "The incredibly fast M3 chip, up to 18 hours of battery life, a brilliant Liquid Retina display, and a fanless silent design in a thin, light aluminum body.",
      specs: ["M3 chip", "18h battery", "8GB / 256GB", "Liquid Retina"],
    },
    {
      name: "Apple iPhone 15 Pro Max",
      category: "electronics",
      price: 1199.0,
      image: img("photo-1592750475338-74b7b21085ab"),
      badge: "Bestseller",
      rating: 4.8,
      reviews: 3120,
      stock: 60,
      description:
        "Titanium design with the A17 Pro chip, a 48MP main camera, and all-day battery. The most powerful iPhone ever, now with USB-C.",
      specs: ["A17 Pro", "48MP camera", "Titanium", "USB-C"],
    },
    {
      name: "Canon EOS R50 Mirrorless Camera",
      category: "electronics",
      price: 679.0,
      image: img("photo-1526170375885-4d8ecf77b99f"),
      rating: 4.6,
      reviews: 410,
      stock: 18,
      description:
        "A compact vlogging and photography hybrid with a 24.2MP APS-C sensor, 4K video, and fast Dual Pixel autofocus. Perfect for creators on the move.",
      specs: ["24.2MP APS-C", "4K 30p video", "Dual Pixel AF", "Compact body"],
    },
    {
      name: "Apple Watch Series 9",
      category: "electronics",
      price: 399.0,
      image: img("photo-1546868871-7041f2a55e12"),
      badge: "New",
      rating: 4.7,
      reviews: 1520,
      stock: 75,
      description:
        "Advanced health insights, a brighter Always-On Retina display, and the double tap gesture — all powered by the new S9 SiP.",
      specs: ["S9 chip", "Bright display", "Health sensors", "Fast charging"],
    },
    {
      name: "JBL Flip 6 Portable Bluetooth Speaker",
      category: "electronics",
      price: 129.95,
      image: img("photo-1608043152269-423dbba4e7e1"),
      rating: 4.6,
      reviews: 880,
      stock: 90,
      description:
        "Big, bold JBL Original Pro Sound in a rugged, waterproof body. 12 hours of playtime and a built-in power bank to charge your devices.",
      specs: ["12h playtime", "IP67 waterproof", "Bluetooth 5.1", "Power bank"],
    },

    // ================= FASHION =================
    {
      name: "Nike Air Max 270 Sneakers",
      category: "fashion",
      price: 160.0,
      image: img("photo-1542291026-7eec264c27ff"),
      badge: "Bestseller",
      featured: true,
      rating: 4.7,
      reviews: 2140,
      stock: 85,
      description:
        "The Nike Air Max 270 delivers an airy feel with the biggest heel Air unit yet, inspired by the classic Air Max 180.",
      specs: ["Air Max unit", "Breathable mesh", "Rubber sole", "Classic style"],
    },
    {
      name: "Classic White Essential Tee",
      category: "fashion",
      price: 29.99,
      image: img("photo-1521572163474-6864f9cf17ab"),
      rating: 4.5,
      reviews: 760,
      stock: 300,
      description:
        "A wardrobe staple made from 100% organic combed cotton. Soft, breathable, and cut to a relaxed modern fit that never loses shape.",
      specs: ["100% organic cotton", "Pre-shrunk", "Relaxed fit", "Machine washable"],
    },
    {
      name: "Levi's 501 Original Jeans",
      category: "fashion",
      price: 79.5,
      image: img("photo-1542272604-787c3835535d"),
      rating: 4.6,
      reviews: 1350,
      stock: 140,
      description:
        "The original blue jean since 1873. Button fly, signature straight fit, and durable denim that only gets better with age.",
      specs: ["100% cotton denim", "Button fly", "Straight fit", "Classic blue"],
    },
    {
      name: "Adidas Ultraboost 22 Running Shoes",
      category: "fashion",
      price: 190.0,
      image: img("photo-1560769629-975ec94e6a86"),
      rating: 4.8,
      reviews: 980,
      stock: 55,
      description:
        "Responsive BOOST midsole and a Primeknit+ upper wrap your foot in comfort for the perfect energy return on every stride.",
      specs: ["BOOST midsole", "Primeknit+ upper", "Continental rubber", "Reflective"],
    },
    {
      name: "Ray-Ban Aviator Classic Sunglasses",
      category: "fashion",
      price: 163.0,
      image: img("photo-1511499767150-a48a237f0083"),
      rating: 4.7,
      reviews: 640,
      stock: 70,
      description:
        "The timeless Aviator with legendary G-15 green lenses and 100% UV protection. Made with lightweight, corrosion-resistant metal frames.",
      specs: ["G-15 lenses", "100% UV protection", "Metal frame", "Unisex"],
    },
    {
      name: "Premium Genuine Leather Jacket",
      category: "fashion",
      price: 249.0,
      oldPrice: 329.0,
      image: img("photo-1551028719-00167b16eac5"),
      badge: "Sale",
      rating: 4.8,
      reviews: 310,
      stock: 22,
      description:
        "A timeless moto-style jacket in full-grain leather. Asymmetric zip, quilted lining, and a fit that molds perfectly to you over time.",
      specs: ["Full-grain leather", "Asymmetric zip", "Quilted lining", "Vintage finish"],
    },
    {
      name: "Converse Chuck Taylor All Star High Top",
      category: "fashion",
      price: 65.0,
      image: img("photo-1606107557195-0e29a4b5b4aa"),
      rating: 4.6,
      reviews: 1720,
      stock: 160,
      description:
        "The icon of street style. Canvas upper, vulcanized rubber sole, and that unmistakable star patch — as classic as it gets.",
      specs: ["Canvas upper", "Vulcanized sole", "Iconic patch", "Unisex"],
    },

    // ================= HOME =================
    {
      name: "Pour-Over Ceramic Coffee Set",
      category: "home",
      price: 48.0,
      image: img("photo-1495474472287-4d71bcdd2085"),
      rating: 4.7,
      reviews: 530,
      stock: 64,
      description:
        "A complete single-cup brewing ritual: handmade ceramic dripper and matching carafe with a natural wood collar. Slow coffee, beautiful mornings.",
      specs: ["Ceramic dripper", "400ml carafe", "Wood collar", "Hand-glazed"],
    },
    {
      name: "Handmade Ceramic Mug (Set of 2)",
      category: "home",
      price: 34.0,
      image: img("photo-1514228742587-6b1558fcca3d"),
      rating: 4.8,
      reviews: 290,
      stock: 40,
      description:
        "Wheel-thrown stoneware mugs with a speckled glaze. Each pair is unique — just like your morning routine.",
      specs: ["Stoneware", "Speckled glaze", "350ml each", "Dishwasher safe"],
    },
    {
      name: "Nordic Minimalist Table Lamp",
      category: "home",
      price: 89.0,
      image: img("photo-1507473885765-e6ed057f782c"),
      rating: 4.6,
      reviews: 380,
      stock: 33,
      description:
        "A soft, sculptural glow in matte ceramic and warm wood. Dimmable LED included — instant hygge for any desk or nightstand.",
      specs: ["Matte ceramic", "Warm wood base", "Dimmable LED", "E26 socket"],
    },
    {
      name: "Monstera Deliciosa in Ceramic Pot",
      category: "home",
      price: 59.99,
      image: img("photo-1485955900006-10f4d324d411"),
      badge: "New",
      rating: 4.9,
      reviews: 210,
      stock: 27,
      description:
        "A lush, healthy Monstera delivered in a minimalist matte ceramic pot with drainage. The statement plant your living room deserves.",
      specs: ["~60cm tall", "Matte pot 20cm", "Pet friendly tip", "Care card"],
    },
    {
      name: "Hand-Glazed Ceramic Vase",
      category: "home",
      price: 42.0,
      image: img("photo-1578500494198-246f612d3b3d"),
      rating: 4.7,
      reviews: 150,
      stock: 52,
      description:
        "An organic silhouette with a soft matte glaze. Beautiful on its own or as the vessel for your favorite seasonal stems.",
      specs: ["Matte glaze", "25cm tall", "Watertight", "Unique finish"],
    },

    // ================= BEAUTY =================
    {
      name: "Dior Sauvage Eau de Parfum 100ml",
      category: "beauty",
      price: 135.0,
      image: img("photo-1547887537-6158d64c35b3"),
      badge: "Bestseller",
      featured: true,
      rating: 4.8,
      reviews: 1980,
      stock: 66,
      description:
        "A raw, fresh and powerful scent inspired by open spaces. Notes of Calabrian bergamot, Sichuan pepper and ambroxan.",
      specs: ["100ml EDT/EDP", "Bergamot & pepper", "All-day wear", "Men's fragrance"],
    },
    {
      name: "Chanel N°5 Eau de Parfum",
      category: "beauty",
      price: 140.0,
      image: img("photo-1585386959984-a4155224a1ad"),
      rating: 4.7,
      reviews: 1120,
      stock: 58,
      description:
        "The world's most iconic fragrance. A floral bouquet of May rose and jasmine over a warm, powdery base.",
      specs: ["50ml EDP", "Iconic floral", "Day & night", "Women's fragrance"],
    },
    {
      name: "Vitamin C Brightening Serum 30ml",
      category: "beauty",
      price: 32.0,
      image: img("photo-1620916566398-39f1143ab7be"),
      rating: 4.5,
      reviews: 840,
      stock: 200,
      description:
        "15% stabilized Vitamin C, hyaluronic acid and ferulic acid to brighten, even tone, and defend against daily environmental stress.",
      specs: ["15% Vitamin C", "Hyaluronic acid", "Vegan & cruelty-free", "All skin types"],
    },
    {
      name: "Hydra Boost Face Cream 50ml",
      category: "beauty",
      price: 28.5,
      image: img("photo-1556228578-8c89e6adf883"),
      rating: 4.6,
      reviews: 620,
      stock: 180,
      description:
        "A weightless gel-cream with squalane and ceramides that locks in moisture for 72 hours — no grease, just glow.",
      specs: ["72h hydration", "Squalane + ceramides", "Fragrance free", "50ml jar"],
    },
    {
      name: "Velvet Matte Lipstick (Set of 3)",
      category: "beauty",
      price: 45.0,
      image: img("photo-1596462502278-27bfdc403348"),
      badge: "New",
      rating: 4.7,
      reviews: 430,
      stock: 95,
      description:
        "Three universally flattering velvet-matte shades that stay put for 8 hours. Enriched with vitamin E for comfortable wear.",
      specs: ["3 shades", "8h wear", "Vitamin E", "Transfer resistant"],
    },

    // ================= SPORTS =================
    {
      name: "Eco-Friendly Premium Yoga Mat",
      category: "sports",
      price: 39.99,
      image: img("photo-1592432678016-e910b452f9a2"),
      rating: 4.7,
      reviews: 980,
      stock: 150,
      description:
        "Extra-thick 6mm natural rubber mat with superior grip for hot yoga and daily practice. Includes a carry strap.",
      specs: ["6mm thick", "Natural rubber", "Non-slip grip", "Carry strap"],
    },
    {
      name: "Adjustable Dumbbell Set (2 x 12kg)",
      category: "sports",
      price: 149.0,
      image: img("photo-1638536532686-d610adfc8e5c"),
      rating: 4.8,
      reviews: 260,
      stock: 35,
      description:
        "Replace an entire rack with this space-saving set — dial from 2.5kg to 12kg per dumbbell in seconds.",
      specs: ["2.5–12kg each", "Quick dial system", "Non-slip grip", "Compact tray"],
    },
    {
      name: "Insulated Steel Water Bottle 750ml",
      category: "sports",
      price: 28.0,
      image: img("photo-1602143407151-7111542de6e8"),
      rating: 4.6,
      reviews: 540,
      stock: 210,
      description:
        "Double-wall vacuum insulation keeps drinks cold 24h or hot 12h. Leak-proof lid and powder-coat finish in sage green.",
      specs: ["750ml", "Cold 24h / Hot 12h", "Leak-proof", "BPA free"],
    },
    {
      name: "Performance Running Sneakers",
      category: "sports",
      price: 120.0,
      image: img("photo-1595950653106-6c9ebd614d3a"),
      rating: 4.7,
      reviews: 760,
      stock: 110,
      description:
        "Featherlight knit upper with responsive foam cushioning. Built for tempo runs, park runs, and everything in between.",
      specs: ["Responsive foam", "Knit upper", "265g light", "All-surface grip"],
    },

    // ================= ACCESSORIES =================
    {
      name: "Minimalist Chronograph Watch",
      category: "accessories",
      price: 199.0,
      image: img("photo-1523275335684-37898b6baf30"),
      badge: "Bestseller",
      featured: true,
      rating: 4.8,
      reviews: 1430,
      stock: 48,
      description:
        "A precision Japanese quartz movement in a 40mm stainless case with sapphire glass and a genuine leather strap.",
      specs: ["Japanese quartz", "Sapphire glass", "40mm steel case", "Leather strap"],
    },
    {
      name: "18K Gold-Plated Chain Necklace",
      category: "accessories",
      price: 159.0,
      image: img("photo-1594633312681-425c7b97ccd1"),
      rating: 4.7,
      reviews: 390,
      stock: 70,
      description:
        "A delicate 18K gold-plated chain with a 2mm Cuban link and secure lobster clasp. Hypoallergenic and tarnish-resistant.",
      specs: ["18K gold plate", "45cm length", "Lobster clasp", "Hypoallergenic"],
    },
    {
      name: "Polarized Retro Sunglasses",
      category: "accessories",
      price: 85.0,
      image: img("photo-1572635196237-14b3f281503f"),
      rating: 4.5,
      reviews: 310,
      stock: 88,
      description:
        "Full UV400 protection with true polarized lenses to cut glare. A lightweight retro frame that suits every face.",
      specs: ["UV400", "Polarized", "Retro frame", "Hard case included"],
    },
    {
      name: "Sterling Silver Stud Earrings",
      category: "accessories",
      price: 69.0,
      image: img("photo-1611591437281-460bfbe1220a"),
      badge: "New",
      rating: 4.6,
      reviews: 220,
      stock: 65,
      description:
        "Hand-finished 925 sterling silver studs with a mirror polish. Minimal enough for everyday, refined enough for anything.",
      specs: ["925 sterling", "Mirror polish", "Hypoallergenic", "Gift box"],
    },
  ];

  const withIds = products.map((p, i) => ({ id: i + 1, ...p }));
  bulkReplaceProducts(withIds);
  console.log(`✅ Seeded ${withIds.length} products into the store.`);
}
