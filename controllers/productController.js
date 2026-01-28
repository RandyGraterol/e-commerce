const { Product, Category, ProductImage, sequelize } = require('../models');
const { Op } = require('sequelize');

// Landing page
const getLanding = async (req, res) => {
  try {
    // Get featured categories (first 6)
    const categories = await Category.findAll({
      limit: 6,
      order: [['name', 'ASC']]
    });
    
    // Get featured products
    const featuredProducts = await Product.findAll({
      where: { 
        featured: true,
        active: true
      },
      limit: 8,
      include: [
        {
          model: Category,
          as: 'category',
          attributes: ['name', 'slug']
        },
        {
          model: ProductImage,
          as: 'images',
          attributes: ['imageUrl', 'isMain']
        }
      ],
      order: [['createdAt', 'DESC']]
    });
    
    res.render('public/landing', {
      title: 'Bienvenido',
      layout: 'layouts/main-layout',
      categories,
      featuredProducts,
      user: req.session.userId ? { id: req.session.userId, name: req.session.userName } : null
    });
    
  } catch (error) {
    console.error('Landing page error:', error);
    res.status(500).render('errors/500', {
      title: 'Error',
      message: 'Error al cargar la página',
      layout: 'layouts/main-layout'
    });
  }
};

// Get products with filters
const getProducts = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = 12;
    const offset = (page - 1) * limit;
    const search = req.query.search || '';
    const categoryId = req.query.category || '';
    const sort = req.query.sort || 'newest';
    
    // Build where clause
    const where = { active: true };
    if (search) {
      where[Op.or] = [
        { name: { [Op.like]: `%${search}%` } },
        { description: { [Op.like]: `%${search}%` } }
      ];
    }
    if (categoryId) {
      where.categoryId = categoryId;
    }
    
    // Build order clause
    let order = [['createdAt', 'DESC']]; // default: newest
    if (sort === 'price-asc') {
      order = [['price', 'ASC']];
    } else if (sort === 'price-desc') {
      order = [['price', 'DESC']];
    } else if (sort === 'name') {
      order = [['name', 'ASC']];
    }
    
    // Get products
    const { count, rows: products } = await Product.findAndCountAll({
      where,
      include: [
        {
          model: Category,
          as: 'category',
          attributes: ['id', 'name', 'slug']
        },
        {
          model: ProductImage,
          as: 'images',
          attributes: ['imageUrl', 'isMain']
        }
      ],
      limit,
      offset,
      order
    });
    
    // Get all categories for filter
    const categories = await Category.findAll({
      attributes: ['id', 'name', 'slug'],
      order: [['name', 'ASC']]
    });
    
    const totalPages = Math.ceil(count / limit);
    
    res.render('public/products', {
      title: 'Productos',
      layout: 'layouts/main-layout',
      products,
      categories,
      currentPage: page,
      totalPages,
      search,
      categoryId,
      sort,
      user: req.session.userId ? { id: req.session.userId, name: req.session.userName } : null
    });
    
  } catch (error) {
    console.error('Get products error:', error);
    res.status(500).render('errors/500', {
      title: 'Error',
      message: 'Error al cargar productos',
      layout: 'layouts/main-layout'
    });
  }
};

// Get product detail
const getProductDetail = async (req, res) => {
  try {
    const product = await Product.findOne({
      where: { 
        id: req.params.id,
        active: true 
      },
      include: [
        {
          model: Category,
          as: 'category',
          attributes: ['id', 'name', 'slug']
        },
        {
          model: ProductImage,
          as: 'images',
          attributes: ['id', 'imageUrl', 'isMain'],
          order: [['isMain', 'DESC']]
        }
      ]
    });
    
    if (!product) {
      return res.status(404).render('errors/404', {
        title: 'Producto no encontrado',
        message: 'El producto no existe',
        layout: 'layouts/main-layout'
      });
    }
    
    // Get related products (same category, excluding current)
    const relatedProducts = await Product.findAll({
      where: {
        categoryId: product.categoryId,
        id: { [Op.ne]: product.id },
        active: true
      },
      limit: 4,
      include: [
        {
          model: ProductImage,
          as: 'images',
          attributes: ['imageUrl', 'isMain']
        }
      ],
      order: sequelize.random()
    });
    
    res.render('public/product-detail', {
      title: product.name,
      layout: 'layouts/main-layout',
      product,
      relatedProducts,
      user: req.session.userId ? { id: req.session.userId, name: req.session.userName } : null
    });
    
  } catch (error) {
    console.error('Get product detail error:', error);
    res.status(500).render('errors/500', {
      title: 'Error',
      message: 'Error al cargar el producto',
      layout: 'layouts/main-layout'
    });
  }
};

// Search products (AJAX)
const searchProducts = async (req, res) => {
  try {
    const query = req.query.q || '';
    
    if (query.length < 2) {
      return res.json({ products: [] });
    }
    
    const products = await Product.findAll({
      where: {
        active: true,
        [Op.or]: [
          { name: { [Op.like]: `%${query}%` } },
          { description: { [Op.like]: `%${query}%` } }
        ]
      },
      limit: 10,
      attributes: ['id', 'name', 'price'],
      include: [
        {
          model: ProductImage,
          as: 'images',
          attributes: ['imageUrl', 'isMain'],
          limit: 1
        }
      ]
    });
    
    res.json({ products });
    
  } catch (error) {
    console.error('Search products error:', error);
    res.status(500).json({ error: 'Error al buscar productos' });
  }
};

module.exports = {
  getLanding,
  getProducts,
  getProductDetail,
  searchProducts
};
