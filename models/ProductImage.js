const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const ProductImage = sequelize.define('ProductImage', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  productId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'products',
      key: 'id'
    },
    onDelete: 'CASCADE'
  },
  imageUrl: {
    type: DataTypes.STRING,
    allowNull: false
  },
  isMain: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  }
}, {
  tableName: 'product_images',
  timestamps: true
});

module.exports = ProductImage;
