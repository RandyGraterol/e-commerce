const { User } = require('../models');

const seedUsers = async () => {
  try {
    console.log('🌱 Seeding users...');
    
    // Check if admin already exists
    const existingAdmin = await User.findOne({ where: { email: 'admin@example.com' } });
    
    if (!existingAdmin) {
      // Create admin user
      await User.create({
        name: 'Admin User',
        email: 'admin@example.com',
        password: 'admin123',
        role: 'admin'
      });
      console.log('✓ Admin user created (admin@example.com / admin123)');
    } else {
      console.log('ℹ Admin user already exists');
    }
    
    // Create sample customers (5-10 as per requirements)
    const customers = [
      { name: 'Juan Pérez', email: 'juan@example.com', password: 'password123', role: 'customer' },
      { name: 'María García', email: 'maria@example.com', password: 'password123', role: 'customer' },
      { name: 'Carlos López', email: 'carlos@example.com', password: 'password123', role: 'customer' },
      { name: 'Ana Martínez', email: 'ana@example.com', password: 'password123', role: 'customer' },
      { name: 'Pedro Rodríguez', email: 'pedro@example.com', password: 'password123', role: 'customer' },
      { name: 'Laura Sánchez', email: 'laura@example.com', password: 'password123', role: 'customer' },
      { name: 'Diego Torres', email: 'diego@example.com', password: 'password123', role: 'customer' },
      { name: 'Sofia Ramírez', email: 'sofia@example.com', password: 'password123', role: 'customer' }
    ];
    
    let createdCount = 0;
    for (const customer of customers) {
      const existing = await User.findOne({ where: { email: customer.email } });
      if (!existing) {
        await User.create(customer);
        createdCount++;
      }
    }
    
    if (createdCount > 0) {
      console.log(`✓ Created ${createdCount} customer users`);
    }
    console.log('✓ Users seeded successfully\n');
  } catch (error) {
    console.error('✗ Error seeding users:', error);
    throw error;
  }
};

module.exports = seedUsers;
