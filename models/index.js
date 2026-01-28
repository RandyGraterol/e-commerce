const sequelize = require('../config/database');
const User = require('./User');
const Category = require('./Category');
const Product = require('./Product');
const ProductImage = require('./ProductImage');
const Favorite = require('./Favorite');
const Order = require('./Order');
const OrderItem = require('./OrderItem');

// Define relationships

// User relationships
User.hasMany(Order, { foreignKey: 'userId', as: 'orders' });
User.hasMany(Favorite, { foreignKey: 'userId', as: 'favorites' });

// Category relationships
Category.hasMany(Product, { foreignKey: 'categoryId', as: 'products' });

// Product relationships
Product.belongsTo(Category, { foreignKey: 'categoryId', as: 'category' });
Product.hasMany(ProductImage, { foreignKey: 'productId', as: 'images', onDelete: 'CASCADE' });
Product.hasMany(Favorite, { foreignKey: 'productId', as: 'favorites', onDelete: 'CASCADE' });
Product.hasMany(OrderItem, { foreignKey: 'productId', as: 'orderItems' });

// ProductImage relationships
ProductImage.belongsTo(Product, { foreignKey: 'productId', as: 'product' });

// Favorite relationships
Favorite.belongsTo(User, { foreignKey: 'userId', as: 'user' });
Favorite.belongsTo(Product, { foreignKey: 'productId', as: 'product' });

// Order relationships
Order.belongsTo(User, { foreignKey: 'userId', as: 'user' });
Order.hasMany(OrderItem, { foreignKey: 'orderId', as: 'items', onDelete: 'CASCADE' });

// OrderItem relationships
OrderItem.belongsTo(Order, { foreignKey: 'orderId', as: 'order' });
OrderItem.belongsTo(Product, { foreignKey: 'productId', as: 'product' });

// Sync database
const syncDatabase = async () => {
  try {
    // Solo sincronizar sin alter para evitar conflictos con foreign keys
    // Si necesitas recrear la base de datos, elimina el archivo database.sqlite
    await sequelize.sync({ alter: false });
    console.log('✓ Database synchronized successfully.');
  } catch (error) {
    console.error('✗ Error synchronizing database:', error);
    // No lanzar el error para que el servidor pueda continuar
  }
};

module.exports = {
  sequelize,
  User,
  Category,
  Product,
  ProductImage,
  Favorite,
  Order,
  OrderItem,
  syncDatabase
};
