const mongoose = require('mongoose');
require('./src/models/Product');
require('./src/models/User');

const MONGO_URI = 'mongodb+srv://keralagdg_db_user:3imgzc7Qgw4VaqrV@cluster0.wfjwz4k.mongodb.net/aethel?retryWrites=true&w=majority';

const products = [
  // Electronics
  {
    title: "Aethel Pro Smartphone 5G",
    description: "The latest smartphone with incredible camera and battery life.",
    price: 69999,
    compareAtPrice: 79999,
    category: "electronics",
    images: ["https://images.unsplash.com/photo-1598327105666-5b89351cb315?auto=format&fit=crop&q=80&w=800"],
    stock: 50,
  },
  {
    title: "Noise Cancelling Headphones X-100",
    description: "Industry leading noise cancellation with premium sound.",
    price: 24999,
    compareAtPrice: 29999,
    category: "electronics",
    images: ["https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&q=80&w=800"],
    stock: 100,
  },
  {
    title: "UltraSlim 4K Monitor",
    description: "27-inch 4K UHD monitor for creators.",
    price: 35000,
    compareAtPrice: 42000,
    category: "electronics",
    images: ["https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&q=80&w=800"],
    stock: 30,
  },
  {
    title: "SmartWatch Series 9",
    description: "Track your fitness and stay connected.",
    price: 19999,
    compareAtPrice: 22999,
    category: "electronics",
    images: ["https://images.unsplash.com/photo-1546868871-7041f2a55e12?auto=format&fit=crop&q=80&w=800"],
    stock: 80,
  },

  // Clothing / Fashion
  {
    title: "Men's Classic Denim Jacket",
    description: "Timeless style and comfort in every stitch.",
    price: 3499,
    compareAtPrice: 4999,
    category: "clothing",
    images: ["https://images.unsplash.com/photo-1516826957135-700ede19c6ce?auto=format&fit=crop&q=80&w=800"],
    stock: 200,
  },
  {
    title: "Women's Summer Flowy Dress",
    description: "Perfect for the beach or a sunny afternoon.",
    price: 2499,
    compareAtPrice: 3299,
    category: "clothing",
    images: ["https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?auto=format&fit=crop&q=80&w=800"],
    stock: 150,
  },
  {
    title: "Premium Leather Sneakers",
    description: "Comfort meets everyday style.",
    price: 4999,
    compareAtPrice: 6599,
    category: "clothing",
    images: ["https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&q=80&w=800"],
    stock: 120,
  },
  {
    title: "Unisex Cotton Hoodie",
    description: "Cozy, warm, and perfect for layering.",
    price: 1999,
    compareAtPrice: 2499,
    category: "clothing",
    images: ["https://images.unsplash.com/photo-1556821840-3a63f95609a7?auto=format&fit=crop&q=80&w=800"],
    stock: 300,
  },

  // Home
  {
    title: "Ceramic Coffee Mug Set",
    description: "Set of 4 artisan crafted mugs.",
    price: 1299,
    compareAtPrice: 1899,
    category: "home",
    images: ["https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?auto=format&fit=crop&q=80&w=800"],
    stock: 60,
  },
  {
    title: "Modern Minimalist Desk Lamp",
    description: "Brighten your workspace in style.",
    price: 2999,
    compareAtPrice: 3999,
    category: "home",
    images: ["https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&q=80&w=800"],
    stock: 45,
  },
  {
    title: "Luxury Cotton Bedsheets",
    description: "Experience 1000 thread count comfort.",
    price: 5999,
    compareAtPrice: 8999,
    category: "home",
    images: ["https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&q=80&w=800"],
    stock: 40,
  },
  {
    title: "Ergonomic Office Chair",
    description: "Support your back during long hours of work.",
    price: 12999,
    compareAtPrice: 15999,
    category: "home",
    images: ["https://images.unsplash.com/photo-1505843490538-5133c6c7d0e1?auto=format&fit=crop&q=80&w=800"],
    stock: 25,
  },

  // Toys
  {
    title: "Educational Wooden Blocks Set",
    description: "100 piece set for creative building.",
    price: 1499,
    compareAtPrice: 2099,
    category: "toys",
    images: ["https://images.unsplash.com/photo-1587654780291-39c9404d746b?auto=format&fit=crop&q=80&w=800"],
    stock: 80,
  },
  {
    title: "RC Off-Road Buggy",
    description: "High speed remote control car.",
    price: 3999,
    compareAtPrice: 5499,
    category: "toys",
    images: ["https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?auto=format&fit=crop&q=80&w=800"],
    stock: 60,
  },
  {
    title: "Giant Plush Bear",
    description: "A soft, 4-foot tall hugging companion.",
    price: 2999,
    compareAtPrice: 3999,
    category: "toys",
    images: ["https://images.unsplash.com/photo-1559454403-b8fb88521f11?auto=format&fit=crop&q=80&w=800"],
    stock: 15,
  },
  {
    title: "Interactive Robot Dog",
    description: "Responds to voice and touch commands.",
    price: 4999,
    compareAtPrice: 6599,
    category: "toys",
    images: ["https://images.unsplash.com/photo-1584905066893-7d5c142ba4e1?auto=format&fit=crop&q=80&w=800"],
    stock: 30,
  },
];

async function seed() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGO_URI);
    console.log('Connected!');

    const User = mongoose.model('User');
    const Product = mongoose.model('Product');

    // Create a dummy vendor
    let vendor = await User.findOne({ email: 'seed_vendor@aethel.in' });
    if (!vendor) {
      vendor = await User.create({
        name: 'Aethel Official Store',
        email: 'seed_vendor@aethel.in',
        password: 'password123',
        role: 'vendor',
      });
      console.log('Created dummy vendor');
    }

    console.log('Clearing old products...');
    await Product.deleteMany({});

    console.log('Inserting products...');
    const productsWithVendor = products.map(p => ({ ...p, vendor: vendor._id }));
    await Product.insertMany(productsWithVendor);

    console.log('Successfully seeded database!');
    process.exit(0);
  } catch (error) {
    console.error('Seeding failed:', error);
    process.exit(1);
  }
}

seed();
