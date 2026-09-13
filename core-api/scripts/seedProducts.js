
const mongoose = require('mongoose');
const Product = require('../src/models/Product');
const User = require('../src/models/User');

const sampleProducts = [
  // Electronics
  {
    title: "QuantumX Pro 15-inch Laptop",
    description: "Ultra-fast processor, 16GB RAM, 512GB SSD. Perfect for professionals and gamers.",
    price: 89999,
    category: "electronics",
    images: ["https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=800&q=80"],
    stock: 45
  },
  {
    title: "Aura 4K OLED Smart TV - 55 inch",
    description: "Immersive viewing experience with deep blacks and vibrant colors. Built-in smart features.",
    price: 54999,
    category: "electronics",
    images: ["https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=800&q=80"],
    stock: 20
  },
  {
    title: "Noise-Cancelling Wireless Headphones",
    description: "Over-ear bluetooth headphones with active noise cancellation and 30-hour battery life.",
    price: 12999,
    category: "electronics",
    images: ["https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80"],
    stock: 120
  },
  {
    title: "Smartwatch Series 8 with Health Tracking",
    description: "Track your heart rate, sleep, and workouts. Water-resistant up to 50m.",
    price: 18500,
    category: "electronics",
    images: ["https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=800&q=80"],
    stock: 75
  },
  {
    title: "Ergonomic Wireless Mouse",
    description: "Designed for comfort during long working hours. Adjustable DPI settings.",
    price: 1999,
    category: "electronics",
    images: ["https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=800&q=80"],
    stock: 200
  },
  {
    title: "Mechanical Gaming Keyboard RGB",
    description: "Tactile switches, customizable RGB lighting, and anti-ghosting keys.",
    price: 4500,
    category: "electronics",
    images: ["https://images.unsplash.com/photo-1595225476474-87563907a212?w=800&q=80"],
    stock: 80
  },
  {
    title: "Portable Bluetooth Speaker 20W",
    description: "Deep bass, IPX7 waterproof, and 12 hours of playtime.",
    price: 3499,
    category: "electronics",
    images: ["https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=800&q=80"],
    stock: 150
  },
  {
    title: "27-inch 144Hz Gaming Monitor",
    description: "1ms response time, AMD FreeSync, and ultra-thin bezels for immersive gaming.",
    price: 24999,
    category: "electronics",
    images: ["https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=800&q=80"],
    stock: 30
  },

  // Clothing
  {
    title: "Classic White Cotton T-Shirt",
    description: "100% pure premium cotton. Breathable and comfortable for everyday wear.",
    price: 799,
    category: "clothing",
    images: ["https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&q=80"],
    stock: 300
  },
  {
    title: "Men's Slim Fit Denim Jeans",
    description: "Stretchable blue denim, classic 5-pocket styling. Perfect for casual outings.",
    price: 1899,
    category: "clothing",
    images: ["https://images.unsplash.com/photo-1542272604-787c3835535d?w=800&q=80"],
    stock: 150
  },
  {
    title: "Women's Floral Summer Dress",
    description: "Lightweight, knee-length floral print dress perfect for warm days.",
    price: 2199,
    category: "clothing",
    images: ["https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=800&q=80"],
    stock: 85
  },
  {
    title: "Unisex Winter Pullover Hoodie",
    description: "Fleece-lined interior, adjustable drawstring hood, front kangaroo pocket.",
    price: 1499,
    category: "clothing",
    images: ["https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=800&q=80"],
    stock: 200
  },
  {
    title: "Athletic Running Shoes",
    description: "Lightweight mesh upper, shock-absorbing sole, designed for long-distance comfort.",
    price: 3499,
    category: "clothing",
    images: ["https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&q=80"],
    stock: 110
  },
  {
    title: "Premium Leather Jacket",
    description: "Genuine lambskin leather, biker style, durable zippers.",
    price: 5999,
    category: "clothing",
    images: ["https://images.unsplash.com/photo-1551028719-00167b16eac5?w=800&q=80"],
    stock: 40
  },

  // Home
  {
    title: "Modern Ceramic Coffee Mug Set",
    description: "Set of 4 matte finish ceramic mugs. Microwave and dishwasher safe.",
    price: 899,
    category: "home",
    images: ["https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?w=800&q=80"],
    stock: 200
  },
  {
    title: "Ergonomic Office Chair with Lumbar Support",
    description: "Breathable mesh back, adjustable height and armrests. Prevent back pain.",
    price: 8500,
    category: "home",
    images: ["https://images.unsplash.com/photo-1505843490538-5133c6c7d0e1?w=800&q=80"],
    stock: 45
  },
  {
    title: "Soft Microfiber Bed Sheet Set",
    description: "Includes 1 flat sheet, 1 fitted sheet, and 2 pillowcases. Wrinkle-resistant.",
    price: 1299,
    category: "home",
    images: ["https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=800&q=80"],
    stock: 120
  },
  {
    title: "Minimalist Table Lamp",
    description: "Warm LED light, touch control, wooden base. Perfect for nightstands.",
    price: 1599,
    category: "home",
    images: ["https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=800&q=80"],
    stock: 90
  },
  {
    title: "Indoor Potted Succulent Set",
    description: "3 real live succulents in decorative ceramic pots. Low maintenance.",
    price: 599,
    category: "home",
    images: ["https://images.unsplash.com/photo-1485955900006-10f4d324d411?w=800&q=80"],
    stock: 150
  },

  // Books
  {
    title: "The Silent Echo - Mystery Novel",
    description: "A gripping psychological thriller that will keep you on the edge of your seat.",
    price: 499,
    category: "books",
    images: ["https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=800&q=80"],
    stock: 300
  },
  {
    title: "Mastering React & Node.js",
    description: "Comprehensive guide to building full-stack applications.",
    price: 1299,
    category: "books",
    images: ["https://images.unsplash.com/photo-1532012197267-da84d127e765?w=800&q=80"],
    stock: 80
  },

  // Toys
  {
    title: "Remote Control Racing Car",
    description: "High-speed off-road RC car. 4WD with shock absorbers.",
    price: 2499,
    category: "toys",
    images: ["https://images.unsplash.com/photo-1594787318286-3d835c1d207f?w=800&q=80"],
    stock: 60
  },
  {
    title: "1000-Piece Landscape Puzzle",
    description: "Beautiful mountain landscape. Premium quality pieces that fit perfectly.",
    price: 799,
    category: "toys",
    images: ["https://images.unsplash.com/photo-1590237731737-cb5de6a2b89d?w=800&q=80"],
    stock: 200
  },

  // Sports
  {
    title: "Non-Slip Yoga Mat (6mm)",
    description: "Eco-friendly TPE material, alignment lines, carrying strap included.",
    price: 1199,
    category: "sports",
    images: ["https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=800&q=80"],
    stock: 180
  },
  {
    title: "Adjustable Dumbbell Set (20kg)",
    description: "Space-saving home gym equipment. Change weights with a simple dial.",
    price: 4500,
    category: "sports",
    images: ["https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?w=800&q=80"],
    stock: 45
  }
];

async function seed() {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error('MONGO_URI is missing in .env');
    }

    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    // Find any vendor user to own these products
    let vendor = await User.findOne({ role: 'vendor' });
    if (!vendor) {
      console.log('No vendor found. Creating a default vendor...');
      vendor = await User.create({
        name: 'Aethel Official Vendor',
        email: 'vendor@aethel.com',
        password: 'password123', // Just a dummy password hash wouldn't work for login, but this is fine for reference
        role: 'vendor',
        vendorProfile: {
          storeName: 'Aethel Mega Store',
          description: 'Official Aethel seed data store'
        }
      });
    }

    console.log(`Using vendor: ${vendor.name} (${vendor._id})`);

    // Assign vendor ID to all products
    const productsToInsert = sampleProducts.map(p => ({
      ...p,
      vendor: vendor._id
    }));

    // Insert all
    const result = await Product.insertMany(productsToInsert);
    console.log(`Successfully added ${result.length} new products to the database!`);

  } catch (error) {
    console.error('Error seeding data:', error);
  } finally {
    mongoose.disconnect();
    console.log('Disconnected from MongoDB');
    process.exit(0);
  }
}

seed();
