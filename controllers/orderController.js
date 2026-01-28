const { Order, OrderItem, Product, ProductImage, Category, sequelize } = require('../models');

// Simulate payment gateway
const simulatePayment = (cardNumber, amount) => {
  return new Promise((resolve) => {
    // Simulate network delay (1-2 seconds)
    const delay = Math.random() * 1000 + 1000;
    
    setTimeout(() => {
      // Success if card number is the test card
      if (cardNumber === '4242424242424242') {
        resolve({
          success: true,
          transactionId: 'TXN-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9),
          message: 'Pago procesado exitosamente'
        });
      } else {
        resolve({
          success: false,
          message: 'Tarjeta rechazada. Use 4242424242424242 para pruebas.'
        });
      }
    }, delay);
  });
};

// Get checkout page
const getCheckout = async (req, res) => {
  try {
    const cart = req.session.cart || [];
    
    // Validate cart is not empty
    if (cart.length === 0) {
      return res.redirect('/cart');
    }
    
    // Fetch product details for cart items
    const productIds = cart.map(item => item.productId);
    const products = await Product.findAll({
      where: { id: productIds },
      include: [
        {
          model: Category,
          as: 'category',
          attributes: ['name']
        },
        {
          model: ProductImage,
          as: 'images',
          attributes: ['imageUrl', 'isMain']
        }
      ]
    });
    
    // Build cart items with product details
    const cartItems = cart.map(cartItem => {
      const product = products.find(p => String(p.id) === String(cartItem.productId));
      if (!product) return null;
      
      const mainImage = product.images.find(img => img.isMain) || product.images[0];
      
      return {
        productId: String(product.id),
        name: product.name,
        price: parseFloat(product.price),
        quantity: cartItem.quantity,
        stock: product.stock,
        imageUrl: mainImage ? mainImage.imageUrl : null,
        subtotal: parseFloat(product.price) * cartItem.quantity
      };
    }).filter(item => item !== null);
    
    // Calculate totals
    const subtotal = cartItems.reduce((sum, item) => sum + item.subtotal, 0);
    const total = subtotal;
    
    res.render('public/checkout', {
      title: 'Checkout',
      cart: cartItems,
      subtotal: subtotal.toFixed(2),
      total: total.toFixed(2),
      user: { id: req.session.userId, name: req.session.userName }
    });
    
  } catch (error) {
    console.error('Get checkout error:', error);
    res.status(500).render('errors/500', {
      title: 'Error',
      message: 'Error al cargar el checkout'
    });
  }
};

// Process checkout
const processCheckout = async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    const { shippingAddress, city, postalCode, cardNumber, cardName, cardExpiry, cardCVV } = req.body;
    const userId = req.session.userId;
    const cart = req.session.cart || [];
    
    // Validate cart is not empty
    if (cart.length === 0) {
      await transaction.rollback();
      return res.status(400).json({ success: false, error: 'El carrito está vacío' });
    }
    
    // Validate form data
    if (!shippingAddress || !city || !postalCode || !cardNumber || !cardName || !cardExpiry || !cardCVV) {
      await transaction.rollback();
      return res.status(400).json({ success: false, error: 'Todos los campos son requeridos' });
    }
    
    // Fetch products and validate stock
    const productIds = cart.map(item => item.productId);
    const products = await Product.findAll({
      where: { id: productIds },
      transaction
    });
    
    // Validate all products exist and have sufficient stock
    for (const cartItem of cart) {
      const product = products.find(p => String(p.id) === String(cartItem.productId));
      
      if (!product) {
        await transaction.rollback();
        return res.status(404).json({ 
          success: false, 
          error: `Producto con ID ${cartItem.productId} no encontrado` 
        });
      }
      
      if (product.stock < cartItem.quantity) {
        await transaction.rollback();
        return res.status(400).json({ 
          success: false, 
          error: `Stock insuficiente para ${product.name}. Solo hay ${product.stock} unidades disponibles` 
        });
      }
    }
    
    // Calculate total
    let total = 0;
    for (const cartItem of cart) {
      const product = products.find(p => String(p.id) === String(cartItem.productId));
      total += parseFloat(product.price) * cartItem.quantity;
    }
    
    // Simulate payment processing
    const paymentResult = await simulatePayment(cardNumber, total);
    
    if (!paymentResult.success) {
      await transaction.rollback();
      return res.status(400).json({ 
        success: false, 
        error: paymentResult.message 
      });
    }
    
    // Create order
    const order = await Order.create({
      userId,
      total: total.toFixed(2),
      status: 'pending',
      paymentMethod: 'credit_card',
      shippingAddress: `${shippingAddress}, ${city}, ${postalCode}`
    }, { transaction });
    
    // Create order items and decrement stock
    for (const cartItem of cart) {
      const product = products.find(p => String(p.id) === String(cartItem.productId));
      
      // Create order item
      await OrderItem.create({
        orderId: order.id,
        productId: product.id,
        quantity: cartItem.quantity,
        price: product.price
      }, { transaction });
      
      // Decrement stock
      await product.decrement('stock', { 
        by: cartItem.quantity,
        transaction 
      });
    }
    
    // Commit transaction
    await transaction.commit();
    
    // Clear cart
    req.session.cart = [];
    req.session.save();
    
    res.json({ 
      success: true, 
      message: 'Orden creada exitosamente',
      orderId: order.id,
      transactionId: paymentResult.transactionId
    });
    
  } catch (error) {
    await transaction.rollback();
    console.error('Process checkout error:', error);
    res.status(500).json({ success: false, error: 'Error al procesar el pago' });
  }
};

// Get client orders
const getClientOrders = async (req, res) => {
  try {
    const userId = req.session.userId;
    
    const orders = await Order.findAll({
      where: { userId },
      include: [
        {
          model: OrderItem,
          as: 'items',
          include: [
            {
              model: Product,
              as: 'product',
              attributes: ['id', 'name', 'price'],
              include: [
                {
                  model: ProductImage,
                  as: 'images',
                  attributes: ['imageUrl', 'isMain'],
                  required: false
                }
              ]
            }
          ]
        }
      ],
      order: [['createdAt', 'DESC']]
    });
    
    res.render('client/orders', {
      title: 'Mis Pedidos',
      layout: 'layouts/client-layout',
      orders,
      user: { id: req.session.userId, name: req.session.userName }
    });
    
  } catch (error) {
    console.error('Get client orders error:', error);
    res.status(500).render('errors/500', {
      title: 'Error',
      message: 'Error al cargar los pedidos',
      layout: 'layouts/client-layout'
    });
  }
};

// Get order detail
const getOrderDetail = async (req, res) => {
  try {
    const orderId = req.params.id;
    const userId = req.session.userId;
    
    const order = await Order.findOne({
      where: { id: orderId },
      include: [
        {
          model: OrderItem,
          as: 'items',
          include: [
            {
              model: Product,
              as: 'product',
              attributes: ['name'],
              include: [
                {
                  model: ProductImage,
                  as: 'images',
                  attributes: ['imageUrl', 'isMain']
                }
              ]
            }
          ]
        }
      ]
    });
    
    if (!order) {
      return res.status(404).render('errors/404', {
        title: 'Pedido no encontrado',
        layout: 'layouts/client-layout'
      });
    }
    
    // Verify ownership
    if (order.userId !== userId) {
      return res.status(403).render('errors/403', {
        title: 'Acceso denegado',
        message: 'No tienes permiso para ver este pedido',
        layout: 'layouts/client-layout'
      });
    }
    
    res.render('client/order-detail', {
      title: `Pedido #${order.id}`,
      layout: 'layouts/client-layout',
      order,
      user: { id: req.session.userId, name: req.session.userName }
    });
    
  } catch (error) {
    console.error('Get order detail error:', error);
    res.status(500).render('errors/500', {
      title: 'Error',
      message: 'Error al cargar el detalle del pedido',
      layout: 'layouts/client-layout'
    });
  }
};

module.exports = {
  simulatePayment,
  getCheckout,
  processCheckout,
  getClientOrders,
  getOrderDetail
};
