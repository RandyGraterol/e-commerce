const { User, Product, Order, Category, OrderItem, ProductImage, Favorite, sequelize } = require('../models');
const { Op } = require('sequelize');
const fs = require('fs');
const path = require('path');

// Dashboard - Show statistics
const getDashboard = async (req, res) => {
  try {
    // Count totals
    const totalProducts = await Product.count();
    const totalOrders = await Order.count();
    const totalUsers = await User.count();
    
    // Calculate total revenue from completed orders
    const revenueResult = await Order.sum('total', {
      where: { status: 'completed' }
    });
    const totalRevenue = revenueResult || 0;
    
    // Get recent orders (last 10)
    const recentOrders = await Order.findAll({
      limit: 10,
      order: [['createdAt', 'DESC']],
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['name', 'email']
        }
      ]
    });
    
    res.render('admin/dashboard', {
      title: 'Dashboard',
      layout: 'layouts/admin-layout',
      stats: {
        totalProducts,
        totalOrders,
        totalUsers,
        totalRevenue
      },
      recentOrders
    });
    
  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).render('errors/500', {
      title: 'Error',
      message: 'Error al cargar el dashboard',
      layout: 'layouts/admin-layout'
    });
  }
};

// Categories Management

// Get all categories
const getCategories = async (req, res) => {
  try {
    const categories = await Category.findAll({
      attributes: {
        include: [
          [sequelize.fn('COUNT', sequelize.col('products.id')), 'productCount']
        ]
      },
      include: [
        {
          model: Product,
          as: 'products',
          attributes: []
        }
      ],
      group: ['Category.id'],
      order: [['createdAt', 'DESC']]
    });
    
    res.render('admin/categories/list', {
      title: 'Gestión de Categorías',
      layout: 'layouts/admin-layout',
      categories
    });
    
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).render('errors/500', {
      title: 'Error',
      message: 'Error al cargar categorías',
      layout: 'layouts/admin-layout'
    });
  }
};

// Show create category form
const showCreateCategory = (req, res) => {
  res.render('admin/categories/form', {
    title: 'Crear Categoría',
    layout: 'layouts/admin-layout',
    category: null,
    error: null
  });
};

// Create category
const createCategory = async (req, res) => {
  try {
    const { name, description } = req.body;
    
    // Validate required fields
    if (!name) {
      return res.render('admin/categories/form', {
        title: 'Crear Categoría',
        layout: 'layouts/admin-layout',
        category: { name, description },
        error: 'El nombre es requerido'
      });
    }
    
    // Check if name already exists
    const existing = await Category.findOne({ where: { name } });
    if (existing) {
      return res.render('admin/categories/form', {
        title: 'Crear Categoría',
        layout: 'layouts/admin-layout',
        category: { name, description },
        error: 'Ya existe una categoría con ese nombre'
      });
    }
    
    // Generate slug
    const slug = name
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
    
    // Create category
    await Category.create({ name, description, slug });
    
    res.redirect('/admin/categories');
    
  } catch (error) {
    console.error('Create category error:', error);
    res.render('admin/categories/form', {
      title: 'Crear Categoría',
      layout: 'layouts/admin-layout',
      category: req.body,
      error: 'Error al crear la categoría'
    });
  }
};

// Show edit category form
const showEditCategory = async (req, res) => {
  try {
    const category = await Category.findByPk(req.params.id);
    
    if (!category) {
      return res.status(404).render('errors/404', {
        title: 'Categoría no encontrada',
        message: 'La categoría no existe',
        layout: 'layouts/admin-layout'
      });
    }
    
    res.render('admin/categories/form', {
      title: 'Editar Categoría',
      layout: 'layouts/admin-layout',
      category,
      error: null
    });
    
  } catch (error) {
    console.error('Show edit category error:', error);
    res.status(500).render('errors/500', {
      title: 'Error',
      message: 'Error al cargar la categoría',
      layout: 'layouts/admin-layout'
    });
  }
};

// Update category
const updateCategory = async (req, res) => {
  try {
    const { name, description } = req.body;
    const category = await Category.findByPk(req.params.id);
    
    if (!category) {
      return res.status(404).render('errors/404', {
        title: 'Categoría no encontrada',
        layout: 'layouts/admin-layout'
      });
    }
    
    // Validate required fields
    if (!name) {
      return res.render('admin/categories/form', {
        title: 'Editar Categoría',
        layout: 'layouts/admin-layout',
        category: { id: req.params.id, name, description },
        error: 'El nombre es requerido'
      });
    }
    
    // Check if name already exists (excluding current category)
    const existing = await Category.findOne({
      where: {
        name,
        id: { [Op.ne]: req.params.id }
      }
    });
    
    if (existing) {
      return res.render('admin/categories/form', {
        title: 'Editar Categoría',
        layout: 'layouts/admin-layout',
        category: { id: req.params.id, name, description },
        error: 'Ya existe una categoría con ese nombre'
      });
    }
    
    // Generate new slug if name changed
    let slug = category.slug;
    if (name !== category.name) {
      slug = name
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, '')
        .replace(/[\s_-]+/g, '-')
        .replace(/^-+|-+$/g, '');
    }
    
    // Update category
    await category.update({ name, description, slug });
    
    res.redirect('/admin/categories');
    
  } catch (error) {
    console.error('Update category error:', error);
    res.render('admin/categories/form', {
      title: 'Editar Categoría',
      layout: 'layouts/admin-layout',
      category: { id: req.params.id, ...req.body },
      error: 'Error al actualizar la categoría'
    });
  }
};

// Delete category
const deleteCategory = async (req, res) => {
  try {
    const category = await Category.findByPk(req.params.id);
    
    if (!category) {
      return res.status(404).json({ success: false, error: 'Categoría no encontrada' });
    }
    
    // Check if category has products
    const productCount = await Product.count({
      where: { categoryId: req.params.id }
    });
    
    if (productCount > 0) {
      return res.status(400).json({
        success: false,
        error: `No se puede eliminar la categoría porque tiene ${productCount} producto(s) asociado(s)`
      });
    }
    
    // Delete category
    await category.destroy();
    
    res.json({ success: true, message: 'Categoría eliminada exitosamente' });
    
  } catch (error) {
    console.error('Delete category error:', error);
    res.status(500).json({ success: false, error: 'Error al eliminar la categoría' });
  }
};

// Products Management

// Get all products with pagination, search, and filters
const getProducts = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = 10;
    const offset = (page - 1) * limit;
    const search = req.query.search || '';
    const categoryId = req.query.category || '';
    const showInactive = req.query.showInactive === 'true';
    
    // Build where clause
    const where = {};
    
    // Filter by active status (show all if showInactive is true, otherwise only active)
    if (!showInactive) {
      where.active = true;
    }
    
    if (search) {
      where[Op.or] = [
        { name: { [Op.like]: `%${search}%` } },
        { description: { [Op.like]: `%${search}%` } }
      ];
    }
    if (categoryId) {
      where.categoryId = categoryId;
    }
    
    // Get products with pagination
    const { count, rows: products } = await Product.findAndCountAll({
      where,
      include: [
        {
          model: Category,
          as: 'category',
          attributes: ['id', 'name']
        },
        {
          model: ProductImage,
          as: 'images',
          attributes: ['id', 'imageUrl', 'isMain']
        }
      ],
      limit,
      offset,
      order: [['createdAt', 'DESC']]
    });
    
    // Get all categories for filter
    const categories = await Category.findAll({
      attributes: ['id', 'name'],
      order: [['name', 'ASC']]
    });
    
    const totalPages = Math.ceil(count / limit);
    
    res.render('admin/products/list', {
      title: 'Gestión de Productos',
      layout: 'layouts/admin-layout',
      products,
      categories,
      currentPage: page,
      totalPages,
      search,
      categoryId,
      showInactive
    });
    
  } catch (error) {
    console.error('Get products error:', error);
    res.status(500).render('errors/500', {
      title: 'Error',
      message: 'Error al cargar productos',
      layout: 'layouts/admin-layout'
    });
  }
};

// Show create product form
const showCreateProduct = async (req, res) => {
  try {
    const categories = await Category.findAll({
      order: [['name', 'ASC']]
    });
    
    res.render('admin/products/form', {
      title: 'Crear Producto',
      layout: 'layouts/admin-layout',
      product: null,
      categories,
      error: null
    });
    
  } catch (error) {
    console.error('Show create product error:', error);
    res.status(500).render('errors/500', {
      title: 'Error',
      message: 'Error al cargar el formulario',
      layout: 'layouts/admin-layout'
    });
  }
};

// Create product with images
const createProduct = async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    const { name, description, price, stock, categoryId, featured, mainImage } = req.body;
    const categories = await Category.findAll({ order: [['name', 'ASC']] });
    
    // Validate required fields
    if (!name || !price || !categoryId) {
      // Delete uploaded files if validation fails
      if (req.files && req.files.length > 0) {
        req.files.forEach(file => {
          fs.unlinkSync(file.path);
        });
      }
      
      return res.render('admin/products/form', {
        title: 'Crear Producto',
        layout: 'layouts/admin-layout',
        product: { name, description, price, stock, categoryId, featured },
        categories,
        error: 'Nombre, precio y categoría son requeridos'
      });
    }
    
    // Validate price and stock
    if (parseFloat(price) < 0) {
      if (req.files && req.files.length > 0) {
        req.files.forEach(file => fs.unlinkSync(file.path));
      }
      
      return res.render('admin/products/form', {
        title: 'Crear Producto',
        layout: 'layouts/admin-layout',
        product: { name, description, price, stock, categoryId, featured },
        categories,
        error: 'El precio debe ser mayor o igual a 0'
      });
    }
    
    if (parseInt(stock) < 0) {
      if (req.files && req.files.length > 0) {
        req.files.forEach(file => fs.unlinkSync(file.path));
      }
      
      return res.render('admin/products/form', {
        title: 'Crear Producto',
        layout: 'layouts/admin-layout',
        product: { name, description, price, stock, categoryId, featured },
        categories,
        error: 'El stock debe ser mayor o igual a 0'
      });
    }
    
    // Create product
    const product = await Product.create({
      name,
      description,
      price: parseFloat(price),
      stock: parseInt(stock) || 0,
      categoryId: parseInt(categoryId),
      featured: featured === 'on' || featured === 'true'
    }, { transaction });
    
    // Create product images if uploaded
    if (req.files && req.files.length > 0) {
      const mainImageIndex = parseInt(mainImage) || 0;
      
      for (let i = 0; i < req.files.length; i++) {
        const file = req.files[i];
        const imageUrl = `/uploads/products/${file.filename}`;
        
        await ProductImage.create({
          productId: product.id,
          imageUrl,
          isMain: i === mainImageIndex
        }, { transaction });
      }
    }
    
    await transaction.commit();
    res.redirect('/admin/products');
    
  } catch (error) {
    await transaction.rollback();
    
    // Delete uploaded files on error
    if (req.files && req.files.length > 0) {
      req.files.forEach(file => {
        try {
          fs.unlinkSync(file.path);
        } catch (err) {
          console.error('Error deleting file:', err);
        }
      });
    }
    
    console.error('Create product error:', error);
    
    const categories = await Category.findAll({ order: [['name', 'ASC']] });
    res.render('admin/products/form', {
      title: 'Crear Producto',
      layout: 'layouts/admin-layout',
      product: req.body,
      categories,
      error: 'Error al crear el producto'
    });
  }
};

// Show edit product form
const showEditProduct = async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id, {
      include: [
        {
          model: ProductImage,
          as: 'images',
          attributes: ['id', 'imageUrl', 'isMain']
        }
      ]
    });
    
    if (!product) {
      return res.status(404).render('errors/404', {
        title: 'Producto no encontrado',
        message: 'El producto no existe',
        layout: 'layouts/admin-layout'
      });
    }
    
    const categories = await Category.findAll({
      order: [['name', 'ASC']]
    });
    
    res.render('admin/products/form', {
      title: 'Editar Producto',
      layout: 'layouts/admin-layout',
      product,
      categories,
      error: null
    });
    
  } catch (error) {
    console.error('Show edit product error:', error);
    res.status(500).render('errors/500', {
      title: 'Error',
      message: 'Error al cargar el producto',
      layout: 'layouts/admin-layout'
    });
  }
};

// Update product
const updateProduct = async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    const { name, description, price, stock, categoryId, featured, mainImage, deleteImages } = req.body;
    const product = await Product.findByPk(req.params.id, {
      include: [{ model: ProductImage, as: 'images' }],
      transaction
    });
    
    if (!product) {
      await transaction.rollback();
      
      if (req.files && req.files.length > 0) {
        req.files.forEach(file => fs.unlinkSync(file.path));
      }
      
      return res.status(404).render('errors/404', {
        title: 'Producto no encontrado',
        layout: 'layouts/admin-layout'
      });
    }
    
    const categories = await Category.findAll({ order: [['name', 'ASC']] });
    
    // Validate required fields
    if (!name || !price || !categoryId) {
      await transaction.rollback();
      
      if (req.files && req.files.length > 0) {
        req.files.forEach(file => fs.unlinkSync(file.path));
      }
      
      return res.render('admin/products/form', {
        title: 'Editar Producto',
        layout: 'layouts/admin-layout',
        product: { id: req.params.id, name, description, price, stock, categoryId, featured, images: product.images },
        categories,
        error: 'Nombre, precio y categoría son requeridos'
      });
    }
    
    // Validate price and stock
    if (parseFloat(price) < 0 || parseInt(stock) < 0) {
      await transaction.rollback();
      
      if (req.files && req.files.length > 0) {
        req.files.forEach(file => fs.unlinkSync(file.path));
      }
      
      return res.render('admin/products/form', {
        title: 'Editar Producto',
        layout: 'layouts/admin-layout',
        product: { id: req.params.id, name, description, price, stock, categoryId, featured, images: product.images },
        categories,
        error: 'El precio y stock deben ser mayores o iguales a 0'
      });
    }
    
    // Update product
    await product.update({
      name,
      description,
      price: parseFloat(price),
      stock: parseInt(stock) || 0,
      categoryId: parseInt(categoryId),
      featured: featured === 'on' || featured === 'true'
    }, { transaction });
    
    // Handle image deletions
    if (deleteImages) {
      const imagesToDelete = Array.isArray(deleteImages) ? deleteImages : [deleteImages];
      
      for (const imageId of imagesToDelete) {
        const image = await ProductImage.findByPk(imageId, { transaction });
        if (image && image.productId === product.id) {
          // Delete file from filesystem
          const filePath = path.join(__dirname, '..', 'public', image.imageUrl);
          try {
            if (fs.existsSync(filePath)) {
              fs.unlinkSync(filePath);
            }
          } catch (err) {
            console.error('Error deleting image file:', err);
          }
          
          // Delete from database
          await image.destroy({ transaction });
        }
      }
    }
    
    // Add new images if uploaded
    if (req.files && req.files.length > 0) {
      // Get current image count
      const currentImages = await ProductImage.count({
        where: { productId: product.id },
        transaction
      });
      
      const mainImageIndex = parseInt(mainImage) || currentImages;
      
      // Reset all images to not main if new main image is selected
      if (mainImageIndex >= currentImages) {
        await ProductImage.update(
          { isMain: false },
          { where: { productId: product.id }, transaction }
        );
      }
      
      for (let i = 0; i < req.files.length; i++) {
        const file = req.files[i];
        const imageUrl = `/uploads/products/${file.filename}`;
        
        await ProductImage.create({
          productId: product.id,
          imageUrl,
          isMain: (currentImages + i) === mainImageIndex
        }, { transaction });
      }
    }
    
    await transaction.commit();
    res.redirect('/admin/products');
    
  } catch (error) {
    await transaction.rollback();
    
    // Delete uploaded files on error
    if (req.files && req.files.length > 0) {
      req.files.forEach(file => {
        try {
          fs.unlinkSync(file.path);
        } catch (err) {
          console.error('Error deleting file:', err);
        }
      });
    }
    
    console.error('Update product error:', error);
    
    const categories = await Category.findAll({ order: [['name', 'ASC']] });
    const product = await Product.findByPk(req.params.id, {
      include: [{ model: ProductImage, as: 'images' }]
    });
    
    res.render('admin/products/form', {
      title: 'Editar Producto',
      layout: 'layouts/admin-layout',
      product: { id: req.params.id, ...req.body, images: product ? product.images : [] },
      categories,
      error: 'Error al actualizar el producto'
    });
  }
};

// Delete product (soft delete)
const deleteProduct = async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    const product = await Product.findByPk(req.params.id, {
      include: [
        { model: ProductImage, as: 'images' },
        { model: OrderItem, as: 'orderItems' }
      ],
      transaction
    });
    
    if (!product) {
      await transaction.rollback();
      return res.status(404).json({ success: false, error: 'Producto no encontrado' });
    }
    
    // Check if product has associated orders
    if (product.orderItems && product.orderItems.length > 0) {
      // Soft delete: mark as inactive instead of deleting
      await product.update({ active: false }, { transaction });
      await transaction.commit();
      return res.json({ 
        success: true, 
        message: 'Producto desactivado exitosamente (tiene órdenes asociadas)',
        softDeleted: true
      });
    }
    
    // If no orders, we can do a hard delete
    // Delete favorites first (if any)
    await Favorite.destroy({
      where: { productId: product.id },
      transaction
    });
    
    // Delete image files from filesystem
    if (product.images && product.images.length > 0) {
      product.images.forEach(image => {
        const filePath = path.join(__dirname, '..', 'public', image.imageUrl);
        try {
          if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
          }
        } catch (err) {
          console.error('Error deleting image file:', err);
        }
      });
    }
    
    // Hard delete product (cascade will delete images from DB)
    await product.destroy({ transaction });
    
    await transaction.commit();
    res.json({ success: true, message: 'Producto eliminado exitosamente', softDeleted: false });
    
  } catch (error) {
    await transaction.rollback();
    console.error('Delete product error:', error);
    
    // Check if it's a foreign key constraint error
    if (error.name === 'SequelizeForeignKeyConstraintError') {
      return res.status(400).json({ 
        success: false, 
        error: 'No se puede eliminar el producto porque tiene referencias en otras tablas' 
      });
    }
    
    res.status(500).json({ success: false, error: 'Error al eliminar el producto' });
  }
};

// Orders Management

// Get all orders with filters and pagination
const getOrders = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = 10;
    const offset = (page - 1) * limit;
    const status = req.query.status || '';
    
    // Build where clause
    const where = {};
    if (status) {
      where.status = status;
    }
    
    // Get orders with pagination
    const { count, rows: orders } = await Order.findAndCountAll({
      where,
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'name', 'email']
        }
      ],
      limit,
      offset,
      order: [['createdAt', 'DESC']]
    });
    
    const totalPages = Math.ceil(count / limit);
    
    res.render('admin/orders/list', {
      title: 'Gestión de Órdenes',
      layout: 'layouts/admin-layout',
      orders,
      currentPage: page,
      totalPages,
      status
    });
    
  } catch (error) {
    console.error('Get orders error:', error);
    res.status(500).render('errors/500', {
      title: 'Error',
      message: 'Error al cargar órdenes',
      layout: 'layouts/admin-layout'
    });
  }
};

// Get order detail
const getOrderDetail = async (req, res) => {
  try {
    const order = await Order.findByPk(req.params.id, {
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'name', 'email']
        },
        {
          model: OrderItem,
          as: 'items',
          include: [
            {
              model: Product,
              as: 'product',
              attributes: ['id', 'name', 'price']
            }
          ]
        }
      ]
    });
    
    if (!order) {
      return res.status(404).render('errors/404', {
        title: 'Orden no encontrada',
        message: 'La orden no existe',
        layout: 'layouts/admin-layout'
      });
    }
    
    res.render('admin/orders/detail', {
      title: `Orden #${order.id}`,
      layout: 'layouts/admin-layout',
      order
    });
    
  } catch (error) {
    console.error('Get order detail error:', error);
    res.status(500).render('errors/500', {
      title: 'Error',
      message: 'Error al cargar el detalle de la orden',
      layout: 'layouts/admin-layout'
    });
  }
};

// Update order status
const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const order = await Order.findByPk(req.params.id);
    
    if (!order) {
      return res.status(404).json({ success: false, error: 'Orden no encontrada' });
    }
    
    // Validate status
    const validStatuses = ['pending', 'completed', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ 
        success: false, 
        error: 'Estado inválido. Debe ser: pending, completed o cancelled' 
      });
    }
    
    // Update status
    await order.update({ status });
    
    res.json({ 
      success: true, 
      message: 'Estado de la orden actualizado exitosamente',
      status: order.status
    });
    
  } catch (error) {
    console.error('Update order status error:', error);
    res.status(500).json({ success: false, error: 'Error al actualizar el estado de la orden' });
  }
};

// Users Management

// Get all users with pagination
const getUsers = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = 15;
    const offset = (page - 1) * limit;
    
    // Get users with pagination
    const { count, rows: users } = await User.findAndCountAll({
      attributes: ['id', 'name', 'email', 'role', 'createdAt'],
      limit,
      offset,
      order: [['createdAt', 'DESC']]
    });
    
    const totalPages = Math.ceil(count / limit);
    
    res.render('admin/users/list', {
      title: 'Gestión de Usuarios',
      layout: 'layouts/admin-layout',
      users,
      currentPage: page,
      totalPages,
      currentUserId: req.session.userId
    });
    
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).render('errors/500', {
      title: 'Error',
      message: 'Error al cargar usuarios',
      layout: 'layouts/admin-layout'
    });
  }
};

// Update user role
const updateUserRole = async (req, res) => {
  try {
    const { role } = req.body;
    const userId = parseInt(req.params.id);
    
    // Prevent self-demotion
    if (userId === req.session.userId) {
      return res.status(400).json({ 
        success: false, 
        error: 'No puedes cambiar tu propio rol' 
      });
    }
    
    const user = await User.findByPk(userId);
    
    if (!user) {
      return res.status(404).json({ success: false, error: 'Usuario no encontrado' });
    }
    
    // Validate role
    const validRoles = ['admin', 'customer'];
    if (!validRoles.includes(role)) {
      return res.status(400).json({ 
        success: false, 
        error: 'Rol inválido. Debe ser: admin o customer' 
      });
    }
    
    // Update role
    await user.update({ role });
    
    res.json({ 
      success: true, 
      message: 'Rol de usuario actualizado exitosamente',
      role: user.role
    });
    
  } catch (error) {
    console.error('Update user role error:', error);
    res.status(500).json({ success: false, error: 'Error al actualizar el rol del usuario' });
  }
};

// Reactivate product (undo soft delete)
const reactivateProduct = async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id);
    
    if (!product) {
      return res.status(404).json({ success: false, error: 'Producto no encontrado' });
    }
    
    if (product.active) {
      return res.status(400).json({ success: false, error: 'El producto ya está activo' });
    }
    
    await product.update({ active: true });
    
    res.json({ success: true, message: 'Producto reactivado exitosamente' });
    
  } catch (error) {
    console.error('Reactivate product error:', error);
    res.status(500).json({ success: false, error: 'Error al reactivar el producto' });
  }
};

module.exports = {
  getDashboard,
  getCategories,
  showCreateCategory,
  createCategory,
  showEditCategory,
  updateCategory,
  deleteCategory,
  getProducts,
  showCreateProduct,
  createProduct,
  showEditProduct,
  updateProduct,
  deleteProduct,
  reactivateProduct,
  getOrders,
  getOrderDetail,
  updateOrderStatus,
  getUsers,
  updateUserRole
};
