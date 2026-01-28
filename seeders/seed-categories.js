const { Category } = require('../models');

const seedCategories = async () => {
  try {
    console.log('🌱 Seeding categories...');
    
    const categories = [
      { name: 'Electrónica', description: 'Dispositivos electrónicos y gadgets' },
      { name: 'Ropa', description: 'Ropa y accesorios de moda' },
      { name: 'Hogar', description: 'Artículos para el hogar' },
      { name: 'Deportes', description: 'Equipamiento deportivo' },
      { name: 'Libros', description: 'Libros y material de lectura' },
      { name: 'Juguetes', description: 'Juguetes y juegos' },
      { name: 'Alimentos', description: 'Alimentos y bebidas' },
      { name: 'Belleza', description: 'Productos de belleza y cuidado personal' }
    ];
    
    let createdCount = 0;
    for (const category of categories) {
      const existing = await Category.findOne({ where: { name: category.name } });
      if (!existing) {
        await Category.create(category);
        createdCount++;
      }
    }
    
    if (createdCount > 0) {
      console.log(`✓ Created ${createdCount} categories`);
    }
    console.log('✓ Categories seeded successfully\n');
  } catch (error) {
    console.error('✗ Error seeding categories:', error);
    throw error;
  }
};

module.exports = seedCategories;
