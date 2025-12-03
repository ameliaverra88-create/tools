import { DataTypes } from 'sequelize';
import sequelize from '../config.js';

const Product = sequelize.define('Product', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  name: {
    type: DataTypes.STRING(120),
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
  },
  category_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  outlet_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  price_buy: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: false,
  },
  price_sell: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: false,
  },
  photo: {
    type: DataTypes.STRING(255),
  },
  is_available: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
  variants: {
    type: DataTypes.JSON,
  },
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
  updated_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
}, {
  tableName: 'products',
  timestamps: false,
});

export default Product;