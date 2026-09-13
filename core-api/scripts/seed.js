const mongoose = require('mongoose');
const User = require('../src/models/User');
const Product = require('../src/models/Product');
const MONGO_URI = 'mongodb+srv://keralagdg_db_user:3imgzc7Qgw4VaqrV@cluster0.wfjwz4k.mongodb.net/aethel?retryWrites=true&w=majority';

async function seed() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGO_URI);
    console.log('Connected.');

    // Clear existing products and vendors (optional, let's just clear for a fresh start or just add new ones)
    // We will just add new ones to avoid deleting user's stuff, but wait, the prompt says "add some fake vender and products"
    
    // Create Fake Vendors
    const vendor1 = await User.create({
      name: 'John Doe',
      email: `techhaven_${Date.now()}@test.com`,
      password: 'password123',
      role: 'vendor',
      vendorProfile: {
        storeName: 'Tech Haven Electronics',
        storeDescription: 'Premium electronics and gadgets.',
        businessAddress: '123 Tech Lane, Silicon Valley',
        isApproved: true,
      }
    });

    const vendor2 = await User.create({
      name: 'Jane Smith',
      email: `styleboutique_${Date.now()}@test.com`,
      password: 'password123',
      role: 'vendor',
      vendorProfile: {
        storeName: 'Style Boutique',
        storeDescription: 'Fashion and apparel for modern lifestyle.',
        businessAddress: '456 Fashion Ave, NY',
        isApproved: true,
      }
    });

    console.log('Vendors created.');

    // Create Fake Products
    const products = [
      {
        title: 'Sony WH-1000XM5 Wireless Headphones',
        description: 'Industry leading noise cancellation, two processors control 8 microphones for unprecedented noise cancellation.',
        price: 29990,
        compareAtPrice: 34990,
        category: 'electronics',
        stock: 50,
        images: ['https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?q=80&w=600&auto=format&fit=crop'],
        vendor: vendor1._id,
        averageRating: 4.8,
        totalReviews: 124
      },
      {
        title: 'Apple MacBook Pro M3 14-inch',
        description: 'Supercharged by M3 Pro or M3 Max, MacBook Pro takes its power and efficiency further than ever.',
        price: 169900,
        compareAtPrice: 175000,
        category: 'electronics',
        stock: 20,
        images: ['https://images.unsplash.com/photo-1517336714731-489689fd1ca8?q=80&w=600&auto=format&fit=crop'],
        vendor: vendor1._id,
        averageRating: 4.9,
        totalReviews: 89
      },
      {
        title: 'Canon EOS R6 Mark II Mirrorless Camera',
        description: 'High-performance hybrid camera featuring a 24.2 MP full-frame CMOS sensor.',
        price: 214990,
        compareAtPrice: 229990,
        category: 'electronics',
        stock: 15,
        images: ['https://images.unsplash.com/photo-1516035069371-29a1b244cc32?q=80&w=600&auto=format&fit=crop'],
        vendor: vendor1._id,
        averageRating: 4.7,
        totalReviews: 45
      },
      {
        title: 'Premium Leather Crossbody Bag',
        description: 'Handcrafted genuine leather crossbody bag with adjustable strap and brass hardware.',
        price: 4999,
        compareAtPrice: 6500,
        category: 'clothing',
        stock: 100,
        images: ['https://images.unsplash.com/photo-1590874103328-eac38a683ce7?q=80&w=600&auto=format&fit=crop'],
        vendor: vendor2._id,
        averageRating: 4.5,
        totalReviews: 32
      },
      {
        title: 'Classic White Sneakers',
        description: 'Minimalist white sneakers made with premium materials for everyday comfort.',
        price: 2999,
        compareAtPrice: 3999,
        category: 'clothing',
        stock: 200,
        images: ['https://images.unsplash.com/photo-1549298916-b41d501d3772?q=80&w=600&auto=format&fit=crop'],
        vendor: vendor2._id,
        averageRating: 4.6,
        totalReviews: 210
      },
      {
        title: 'Ceramic Coffee Mug Set',
        description: 'Set of 4 artisan ceramic coffee mugs in earthy tones.',
        price: 1499,
        compareAtPrice: 1999,
        category: 'home',
        stock: 80,
        images: ['https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?q=80&w=600&auto=format&fit=crop'],
        vendor: vendor2._id,
        averageRating: 4.9,
        totalReviews: 56
      }
    ];

    await Product.insertMany(products);
    console.log('Fake products inserted successfully!');

    process.exit(0);
  } catch (err) {
    console.error('Error seeding data:', err);
    process.exit(1);
  }
}

seed();
