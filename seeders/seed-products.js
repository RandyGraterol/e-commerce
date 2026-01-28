const { Product, ProductImage, Category } = require('../models');

async function seedProducts() {
  try {
    console.log('🌱 Seeding products...');
    
    // Get categories
    const categories = await Category.findAll();
    
    if (categories.length === 0) {
      console.log('⚠️  No categories found. Please run seed-categories first.');
      return;
    }
    
    // Default image for all products
    const defaultImage = '/assets/noImagenAvailable.svg';
    
    // Sample products (20-30 products as per requirements)
    const products = [
      // Electrónica
      {
        name: 'Laptop HP Pavilion 15',
        description: 'Laptop potente con procesador Intel Core i7, 16GB RAM, 512GB SSD. Ideal para trabajo y entretenimiento.',
        price: 899.99,
        stock: 15,
        categoryId: categories.find(c => c.name === 'Electrónica')?.id || categories[0].id,
        featured: true,
        images: [
          { imageUrl: defaultImage, isMain: true }
        ]
      },
      {
        name: 'Mouse Inalámbrico Logitech MX Master 3',
        description: 'Mouse ergonómico con conexión Bluetooth y precisión avanzada',
        price: 99.99,
        stock: 50,
        categoryId: categories.find(c => c.name === 'Electrónica')?.id || categories[0].id,
        featured: false,
        images: [
          { imageUrl: defaultImage, isMain: true }
        ]
      },
      {
        name: 'Teclado Mecánico RGB',
        description: 'Teclado gaming con switches mecánicos y retroiluminación RGB',
        price: 129.99,
        stock: 30,
        categoryId: categories.find(c => c.name === 'Electrónica')?.id || categories[0].id,
        featured: true,
        images: [
          { imageUrl: defaultImage, isMain: true }
        ]
      },
      {
        name: 'Auriculares Sony WH-1000XM4',
        description: 'Auriculares con cancelación de ruido activa y sonido premium',
        price: 349.99,
        stock: 20,
        categoryId: categories.find(c => c.name === 'Electrónica')?.id || categories[0].id,
        featured: true,
        images: [
          { imageUrl: defaultImage, isMain: true }
        ]
      },
      {
        name: 'Smartphone Samsung Galaxy S21',
        description: 'Smartphone de última generación con cámara de 64MP',
        price: 799.99,
        stock: 25,
        categoryId: categories.find(c => c.name === 'Electrónica')?.id || categories[0].id,
        featured: true,
        images: [
          { imageUrl: defaultImage, isMain: true }
        ]
      },
      
      // Ropa
      {
        name: 'Camiseta Deportiva Nike Dri-FIT',
        description: 'Camiseta de algodón transpirable para entrenamiento',
        price: 39.99,
        stock: 100,
        categoryId: categories.find(c => c.name === 'Ropa')?.id || categories[1].id,
        featured: false,
        images: [
          { imageUrl: defaultImage, isMain: true }
        ]
      },
      {
        name: 'Zapatillas Running Adidas Ultraboost',
        description: 'Zapatillas cómodas con tecnología Boost para máximo retorno de energía',
        price: 179.99,
        stock: 40,
        categoryId: categories.find(c => c.name === 'Ropa')?.id || categories[1].id,
        featured: true,
        images: [
          { imageUrl: defaultImage, isMain: true }
        ]
      },
      {
        name: 'Jeans Levi\'s 501 Original',
        description: 'Jeans clásicos de corte recto, 100% algodón',
        price: 89.99,
        stock: 60,
        categoryId: categories.find(c => c.name === 'Ropa')?.id || categories[1].id,
        featured: false,
        images: [
          { imageUrl: defaultImage, isMain: true }
        ]
      },
      {
        name: 'Chaqueta North Face',
        description: 'Chaqueta impermeable para actividades al aire libre',
        price: 199.99,
        stock: 25,
        categoryId: categories.find(c => c.name === 'Ropa')?.id || categories[1].id,
        featured: true,
        images: [
          { imageUrl: defaultImage, isMain: true }
        ]
      },
      
      // Hogar
      {
        name: 'Lámpara de Mesa LED Moderna',
        description: 'Lámpara con luz regulable y diseño minimalista',
        price: 45.99,
        stock: 35,
        categoryId: categories.find(c => c.name === 'Hogar')?.id || categories[2].id,
        featured: false,
        images: [
          { imageUrl: defaultImage, isMain: true }
        ]
      },
      {
        name: 'Cafetera Nespresso Vertuo',
        description: 'Cafetera de cápsulas con tecnología Centrifusion',
        price: 179.99,
        stock: 20,
        categoryId: categories.find(c => c.name === 'Hogar')?.id || categories[2].id,
        featured: true,
        images: [
          { imageUrl: defaultImage, isMain: true }
        ]
      },
      {
        name: 'Aspiradora Robot Roomba',
        description: 'Aspiradora inteligente con mapeo y control por app',
        price: 399.99,
        stock: 15,
        categoryId: categories.find(c => c.name === 'Hogar')?.id || categories[2].id,
        featured: true,
        images: [
          { imageUrl: defaultImage, isMain: true }
        ]
      },
      {
        name: 'Juego de Sábanas Premium',
        description: 'Sábanas de algodón egipcio 600 hilos',
        price: 89.99,
        stock: 40,
        categoryId: categories.find(c => c.name === 'Hogar')?.id || categories[2].id,
        featured: false,
        images: [
          { imageUrl: defaultImage, isMain: true }
        ]
      },
      
      // Deportes
      {
        name: 'Bicicleta de Montaña Trek',
        description: 'Bicicleta con suspensión completa y 21 velocidades',
        price: 899.99,
        stock: 10,
        categoryId: categories.find(c => c.name === 'Deportes')?.id || categories[3].id,
        featured: true,
        images: [
          { imageUrl: defaultImage, isMain: true }
        ]
      },
      {
        name: 'Pelota de Fútbol Adidas',
        description: 'Pelota oficial de competición, tamaño 5',
        price: 29.99,
        stock: 80,
        categoryId: categories.find(c => c.name === 'Deportes')?.id || categories[3].id,
        featured: false,
        images: [
          { imageUrl: defaultImage, isMain: true }
        ]
      },
      {
        name: 'Pesas Ajustables 20kg',
        description: 'Set de pesas con peso ajustable de 5 a 20kg',
        price: 149.99,
        stock: 25,
        categoryId: categories.find(c => c.name === 'Deportes')?.id || categories[3].id,
        featured: false,
        images: [
          { imageUrl: defaultImage, isMain: true }
        ]
      },
      {
        name: 'Esterilla de Yoga Premium',
        description: 'Esterilla antideslizante de 6mm de grosor',
        price: 39.99,
        stock: 50,
        categoryId: categories.find(c => c.name === 'Deportes')?.id || categories[3].id,
        featured: false,
        images: [
          { imageUrl: defaultImage, isMain: true }
        ]
      },
      
      // Libros
      {
        name: 'El Quijote - Edición Ilustrada',
        description: 'Edición especial con ilustraciones originales',
        price: 34.99,
        stock: 45,
        categoryId: categories.find(c => c.name === 'Libros')?.id || categories[4].id,
        featured: true,
        images: [
          { imageUrl: defaultImage, isMain: true }
        ]
      },
      {
        name: 'Cien Años de Soledad',
        description: 'Obra maestra de Gabriel García Márquez',
        price: 24.99,
        stock: 60,
        categoryId: categories.find(c => c.name === 'Libros')?.id || categories[4].id,
        featured: false,
        images: [
          { imageUrl: defaultImage, isMain: true }
        ]
      },
      {
        name: 'Harry Potter - Colección Completa',
        description: 'Los 7 libros de la saga en edición especial',
        price: 149.99,
        stock: 20,
        categoryId: categories.find(c => c.name === 'Libros')?.id || categories[4].id,
        featured: true,
        images: [
          { imageUrl: defaultImage, isMain: true }
        ]
      },
      
      // Juguetes
      {
        name: 'LEGO Star Wars Millennium Falcon',
        description: 'Set de construcción con 7541 piezas',
        price: 799.99,
        stock: 8,
        categoryId: categories.find(c => c.name === 'Juguetes')?.id || categories[5].id,
        featured: true,
        images: [
          { imageUrl: defaultImage, isMain: true }
        ]
      },
      {
        name: 'Muñeca Barbie Fashionista',
        description: 'Muñeca con accesorios y ropa intercambiable',
        price: 29.99,
        stock: 70,
        categoryId: categories.find(c => c.name === 'Juguetes')?.id || categories[5].id,
        featured: false,
        images: [
          { imageUrl: defaultImage, isMain: true }
        ]
      },
      {
        name: 'Hot Wheels Pista Mega',
        description: 'Pista de carreras con loopings y lanzador',
        price: 59.99,
        stock: 35,
        categoryId: categories.find(c => c.name === 'Juguetes')?.id || categories[5].id,
        featured: false,
        images: [
          { imageUrl: defaultImage, isMain: true }
        ]
      },
      {
        name: 'Puzzle 1000 Piezas - Paisaje',
        description: 'Puzzle de alta calidad con imagen de paisaje natural',
        price: 24.99,
        stock: 45,
        categoryId: categories.find(c => c.name === 'Juguetes')?.id || categories[5].id,
        featured: false,
        images: [
          { imageUrl: defaultImage, isMain: true }
        ]
      },
      
      // Productos adicionales para llegar a 25-30
      {
        name: 'Monitor Gaming 27" 144Hz',
        description: 'Monitor curvo con tasa de refresco de 144Hz',
        price: 399.99,
        stock: 18,
        categoryId: categories.find(c => c.name === 'Electrónica')?.id || categories[0].id,
        featured: true,
        images: [
          { imageUrl: defaultImage, isMain: true }
        ]
      },
      {
        name: 'Smartwatch Apple Watch Series 7',
        description: 'Reloj inteligente con monitoreo de salud',
        price: 429.99,
        stock: 22,
        categoryId: categories.find(c => c.name === 'Electrónica')?.id || categories[0].id,
        featured: true,
        images: [
          { imageUrl: defaultImage, isMain: true }
        ]
      },
      {
        name: 'Mochila Deportiva Nike',
        description: 'Mochila resistente con múltiples compartimentos',
        price: 49.99,
        stock: 55,
        categoryId: categories.find(c => c.name === 'Deportes')?.id || categories[3].id,
        featured: false,
        images: [
          { imageUrl: defaultImage, isMain: true }
        ]
      },
      {
        name: 'Licuadora Vitamix Professional',
        description: 'Licuadora de alta potencia para smoothies y más',
        price: 449.99,
        stock: 12,
        categoryId: categories.find(c => c.name === 'Hogar')?.id || categories[2].id,
        featured: true,
        images: [
          { imageUrl: defaultImage, isMain: true }
        ]
      },
      {
        name: 'Cámara Canon EOS R6',
        description: 'Cámara mirrorless profesional de 20MP',
        price: 2499.99,
        stock: 5,
        categoryId: categories.find(c => c.name === 'Electrónica')?.id || categories[0].id,
        featured: true,
        images: [
          { imageUrl: defaultImage, isMain: true }
        ]
      }
    ];
    
    let createdCount = 0;
    for (const productData of products) {
      // Check if product already exists
      const existing = await Product.findOne({ where: { name: productData.name } });
      
      if (!existing) {
        const { images, ...productInfo } = productData;
        
        // Create product
        const product = await Product.create(productInfo);
        
        // Create product images
        if (images && images.length > 0) {
          for (const image of images) {
            await ProductImage.create({
              productId: product.id,
              imageUrl: image.imageUrl,
              isMain: image.isMain
            });
          }
        }
        
        createdCount++;
      }
    }
    
    if (createdCount > 0) {
      console.log(`✓ Created ${createdCount} products with default image (noImagenAvailable.svg)`);
    }
    console.log('✓ Products seeded successfully\n');
    
  } catch (error) {
    console.error('✗ Error seeding products:', error);
    throw error;
  }
}

module.exports = seedProducts;
