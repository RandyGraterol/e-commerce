const { Favorite, Product, ProductImage, Category } = require('../models');

// Get user favorites
const getFavorites = async (req, res) => {
  try {
    const favorites = await Favorite.findAll({
      where: { userId: req.session.userId },
      include: [
        {
          model: Product,
          as: 'product',
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
        }
      ],
      order: [['createdAt', 'DESC']]
    });
    
    res.render('client/favorites', {
      title: 'Mis Favoritos',
      layout: 'layouts/client-layout',
      favorites,
      user: { id: req.session.userId, name: req.session.userName }
    });
    
  } catch (error) {
    console.error('Get favorites error:', error);
    res.status(500).render('errors/500', {
      title: 'Error',
      message: 'Error al cargar favoritos',
      layout: 'layouts/client-layout'
    });
  }
};

// Add product to favorites
const addFavorite = async (req, res) => {
  try {
    const { productId } = req.body;
    const userId = req.session.userId;
    
    // Validate product exists
    const product = await Product.findByPk(productId);
    if (!product) {
      return res.status(404).json({ success: false, error: 'Producto no encontrado' });
    }
    
    // Check if already in favorites
    const existing = await Favorite.findOne({
      where: { userId, productId }
    });
    
    if (existing) {
      return res.json({ 
        success: true, 
        message: 'El producto ya está en tus favoritos',
        alreadyExists: true
      });
    }
    
    // Create favorite
    await Favorite.create({ userId, productId });
    
    res.json({ 
      success: true, 
      message: 'Producto agregado a favoritos',
      alreadyExists: false
    });
    
  } catch (error) {
    console.error('Add favorite error:', error);
    res.status(500).json({ success: false, error: 'Error al agregar a favoritos' });
  }
};

// Remove product from favorites
const removeFavorite = async (req, res) => {
  try {
    const favoriteId = parseInt(req.params.id);
    const userId = req.session.userId;
    
    const favorite = await Favorite.findByPk(favoriteId);
    
    if (!favorite) {
      return res.status(404).json({ success: false, error: 'Favorito no encontrado' });
    }
    
    // Verify ownership
    if (favorite.userId !== userId) {
      return res.status(403).json({ success: false, error: 'No tienes permiso para eliminar este favorito' });
    }
    
    // Delete favorite
    await favorite.destroy();
    
    res.json({ success: true, message: 'Producto eliminado de favoritos' });
    
  } catch (error) {
    console.error('Remove favorite error:', error);
    res.status(500).json({ success: false, error: 'Error al eliminar de favoritos' });
  }
};

module.exports = {
  getFavorites,
  addFavorite,
  removeFavorite
};
