const { Order, OrderItem, User, Product } = require('../models');

async function seedOrders() {
  try {
    console.log('🌱 Seeding orders...');
    
    // Get users (customers only)
    const customers = await User.findAll({
      where: { role: 'customer' }
    });
    
    if (customers.length === 0) {
      console.log('⚠️  No customers found. Please run seed-users first.');
      return;
    }
    
    // Get products
    const products = await Product.findAll();
    
    if (products.length === 0) {
      console.log('⚠️  No products found. Please run seed-products first.');
      return;
    }
    
    // Helper to get random items
    const getRandomProducts = (count) => {
      const shuffled = [...products].sort(() => 0.5 - Math.random());
      return shuffled.slice(0, count);
    };
    
    const getRandomCustomer = () => customers[Math.floor(Math.random() * customers.length)];
    const getRandomStatus = () => {
      const statuses = ['pending', 'completed', 'completed', 'completed', 'cancelled']; // More completed orders
      return statuses[Math.floor(Math.random() * statuses.length)];
    };
    
    // Sample addresses
    const addresses = [
      'Calle Principal 123, Ciudad, Estado 12345',
      'Avenida Secundaria 456, Ciudad, Estado 67890',
      'Plaza Central 789, Ciudad, Estado 11111',
      'Calle Norte 321, Ciudad, Estado 22222',
      'Avenida Sur 654, Ciudad, Estado 33333',
      'Boulevard Este 987, Ciudad, Estado 44444',
      'Calle Oeste 147, Ciudad, Estado 55555'
    ];
    
    // Create 10-15 orders
    const orderCount = 12;
    let createdCount = 0;
    
    for (let i = 0; i < orderCount; i++) {
      const customer = getRandomCustomer();
      const status = getRandomStatus();
      const itemCount = Math.floor(Math.random() * 3) + 1; // 1-3 items per order
      const orderProducts = getRandomProducts(itemCount);
      
      // Calculate total
      let total = 0;
      const items = orderProducts.map(product => {
        const quantity = Math.floor(Math.random() * 3) + 1; // 1-3 quantity
        const subtotal = parseFloat(product.price) * quantity;
        total += subtotal;
        
        return {
          productId: product.id,
          quantity,
          price: product.price
        };
      });
      
      // Create order
      const order = await Order.create({
        userId: customer.id,
        total: total.toFixed(2),
        status,
        paymentMethod: 'credit_card',
        shippingAddress: addresses[Math.floor(Math.random() * addresses.length)]
      });
      
      // Create order items
      for (const item of items) {
        await OrderItem.create({
          orderId: order.id,
          productId: item.productId,
          quantity: item.quantity,
          price: item.price
        });
      }
      
      createdCount++;
    }
    
    console.log(`✓ Created ${createdCount} orders with items`);
    console.log('✓ Orders seeded successfully\n');
    
  } catch (error) {
    console.error('✗ Error seeding orders:', error);
    throw error;
  }
}

module.exports = seedOrders;
