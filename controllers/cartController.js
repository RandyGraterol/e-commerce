const { Product, ProductImage, Category } = require('../models');

// Get cart from session
const getCart = async (req, res) => {
  try {
    const cart = req.session.cart || [];
    
    // If cart is empty, render empty cart
    if (cart.length === 0) {
      return res.render('public/cart', {
        title: 'Carrito de Compras',
        cart: [],
        subtotal: 0,
        total: 0,
        user: req.session.userId ? { id: req.session.userId, name: req.session.userName } : null
      });
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
        category: product.category.name,
        subtotal: parseFloat(product.price) * cartItem.quantity
      };
    }).filter(item => item !== null);
    
    // Calculate totals
    const subtotal = cartItems.reduce((sum, item) => sum + item.subtotal, 0);
    const total = subtotal; // Could add shipping, taxes, etc.
    
    res.render('public/cart', {
      title: 'Carrito de Compras',
      cart: cartItems,
      subtotal: subtotal.toFixed(2),
      total: total.toFixed(2),
      user: req.session.userId ? { id: req.session.userId, name: req.session.userName } : null
    });
    
  } catch (error) {
    console.error('Get cart error:', error);
    res.status(500).render('errors/500', {
      title: 'Error',
      message: 'Error al cargar el carrito'
    });
  }
};

// Add product to cart
const addToCart = async (req, res) => {
  try {
    const { productId, quantity } = req.body;
    const qty = parseInt(quantity) || 1;
    
    // Convertir productId a string para consistencia
    const prodId = String(productId);
    
    // Validate product exists
    const product = await Product.findByPk(prodId);
    if (!product) {
      return res.status(404).json({ success: false, error: 'Producto no encontrado' });
    }
    
    // Validate stock
    if (product.stock < qty) {
      return res.status(400).json({ 
        success: false, 
        error: `Stock insuficiente. Solo hay ${product.stock} unidades disponibles` 
      });
    }
    
    // Initialize cart if doesn't exist
    if (!req.session.cart) {
      req.session.cart = [];
    }
    
    // Check if product already in cart (comparar como strings)
    const existingItem = req.session.cart.find(item => String(item.productId) === prodId);
    
    if (existingItem) {
      // Update quantity
      const newQuantity = existingItem.quantity + qty;
      
      // Validate stock for new quantity
      if (product.stock < newQuantity) {
        return res.status(400).json({ 
          success: false, 
          error: `Stock insuficiente. Solo hay ${product.stock} unidades disponibles` 
        });
      }
      
      existingItem.quantity = newQuantity;
    } else {
      // Add new item (guardar como string)
      req.session.cart.push({
        productId: prodId,
        quantity: qty
      });
    }
    
    // Save session
    req.session.save((err) => {
      if (err) {
        console.error('Session save error:', err);
        return res.status(500).json({ success: false, error: 'Error al guardar el carrito' });
      }
      
      res.json({ 
        success: true, 
        message: 'Producto agregado al carrito',
        cartCount: req.session.cart.reduce((sum, item) => sum + item.quantity, 0)
      });
    });
    
  } catch (error) {
    console.error('Add to cart error:', error);
    res.status(500).json({ success: false, error: 'Error al agregar al carrito' });
  }
};

// Update cart item quantity
const updateCartItem = async (req, res) => {
  try {
    const prodId = String(req.params.productId);
    const { quantity } = req.body;
    const qty = parseInt(quantity);
    
    if (!qty || qty < 1) {
      return res.status(400).json({ success: false, error: 'Cantidad inválida' });
    }
    
    // Validate product exists and check stock
    const product = await Product.findByPk(prodId);
    if (!product) {
      return res.status(404).json({ success: false, error: 'Producto no encontrado' });
    }
    
    if (product.stock < qty) {
      return res.status(400).json({ 
        success: false, 
        error: `Stock insuficiente. Solo hay ${product.stock} unidades disponibles` 
      });
    }
    
    // Find item in cart
    if (!req.session.cart) {
      return res.status(404).json({ success: false, error: 'Carrito vacío' });
    }
    
    const cartItem = req.session.cart.find(item => String(item.productId) === prodId);
    if (!cartItem) {
      return res.status(404).json({ success: false, error: 'Producto no encontrado en el carrito' });
    }
    
    // Update quantity
    cartItem.quantity = qty;
    
    // Save session
    req.session.save((err) => {
      if (err) {
        console.error('Session save error:', err);
        return res.status(500).json({ success: false, error: 'Error al actualizar el carrito' });
      }
      
      res.json({ 
        success: true, 
        message: 'Cantidad actualizada',
        cartCount: req.session.cart.reduce((sum, item) => sum + item.quantity, 0)
      });
    });
    
  } catch (error) {
    console.error('Update cart error:', error);
    res.status(500).json({ success: false, error: 'Error al actualizar el carrito' });
  }
};

// Remove item from cart
const removeFromCart = async (req, res) => {
  try {
    const prodId = String(req.params.productId);
    
    if (!req.session.cart) {
      return res.status(404).json({ success: false, error: 'Carrito vacío' });
    }
    
    // Filter out the item (comparar como strings)
    const initialLength = req.session.cart.length;
    req.session.cart = req.session.cart.filter(item => String(item.productId) !== prodId);
    
    if (req.session.cart.length === initialLength) {
      return res.status(404).json({ success: false, error: 'Producto no encontrado en el carrito' });
    }
    
    // Save session
    req.session.save((err) => {
      if (err) {
        console.error('Session save error:', err);
        return res.status(500).json({ success: false, error: 'Error al actualizar el carrito' });
      }
      
      res.json({ 
        success: true, 
        message: 'Producto eliminado del carrito',
        cartCount: req.session.cart.reduce((sum, item) => sum + item.quantity, 0)
      });
    });
    
  } catch (error) {
    console.error('Remove from cart error:', error);
    res.status(500).json({ success: false, error: 'Error al eliminar del carrito' });
  }
};

// Clear cart
const clearCart = async (req, res) => {
  try {
    req.session.cart = [];
    
    req.session.save((err) => {
      if (err) {
        console.error('Session save error:', err);
        return res.status(500).json({ success: false, error: 'Error al vaciar el carrito' });
      }
      
      res.json({ 
        success: true, 
        message: 'Carrito vaciado',
        cartCount: 0
      });
    });
    
  } catch (error) {
    console.error('Clear cart error:', error);
    res.status(500).json({ success: false, error: 'Error al vaciar el carrito' });
  }
};

module.exports = {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart
};
