import { DataTypes } from 'sequelize';
import sequelize from '../config.js';

const Order = sequelize.define('Order', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  order_number: {
    type: DataTypes.STRING(20),
    unique: true,
    allowNull: false,
  },
  outlet_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  staff_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  customer_id: {
    type: DataTypes.INTEGER,
  },
  table_number: {
    type: DataTypes.STRING(10),
  },
  order_type: {
    type: DataTypes.ENUM('dine_in', 'takeaway', 'delivery'),
    defaultValue: 'dine_in',
  },
  status: {
    type: DataTypes.ENUM('pending', 'confirmed', 'preparing', 'ready', 'served', 'cancelled'),
    defaultValue: 'pending',
  },
  subtotal: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: false,
  },
  tax: {
    type: DataTypes.DECIMAL(12, 2),
    defaultValue: 0.00,
  },
  service_charge: {
    type: DataTypes.DECIMAL(12, 2),
    defaultValue: 0.00,
  },
  discount: {
    type: DataTypes.DECIMAL(12, 2),
    defaultValue: 0.00,
  },
  total: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: false,
  },
  promo_id: {
    type: DataTypes.INTEGER,
  },
  notes: {
    type: DataTypes.TEXT,
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
  tableName: 'orders',
  timestamps: false,
});

export default Order;