require('dotenv').config();
const { syncDatabase, sequelize } = require('../models');
const seedUsers = require('./seed-users');
const seedCategories = require('./seed-categories');
const seedProducts = require('./seed-products');
const seedOrders = require('./seed-orders');

const runSeeders = async () => {
  try {
    console.log('🚀 Starting database seeding...\n');
    
    // Check environment
    if (process.env.NODE_ENV === 'production') {
      console.log('⚠️  Warning: Running seeds in production environment!');
      console.log('Press Ctrl+C to cancel or wait 5 seconds to continue...');
      await new Promise(resolve => setTimeout(resolve, 5000));
    }
    
    // Sync database (without alter to avoid issues)
    console.log('📦 Synchronizing database...');
    await syncDatabase();
    console.log('✓ Database synchronized\n');
    
    // Optional: Clear existing data (uncomment if needed)
    // console.log('🗑️  Clearing existing data...');
    // await sequelize.query('DELETE FROM order_items');
    // await sequelize.query('DELETE FROM orders');
    // await sequelize.query('DELETE FROM favorites');
    // await sequelize.query('DELETE FROM product_images');
    // await sequelize.query('DELETE FROM products');
    // await sequelize.query('DELETE FROM categories');
    // await sequelize.query('DELETE FROM users');
    // console.log('✓ Data cleared\n');
    
    // Run seeders in order
    await seedUsers();
    await seedCategories();
    await seedProducts();
    await seedOrders();
    
    console.log('✅ All seeds completed successfully!');
    console.log('\n📝 Default credentials:');
    console.log('   Admin:');
    console.log('     Email: admin@example.com');
    console.log('     Password: admin123');
    console.log('\n   Customer (example):');
    console.log('     Email: juan@example.com');
    console.log('     Password: password123\n');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error running seeders:', error);
    process.exit(1);
  }
};

runSeeders();
