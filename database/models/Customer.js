import { DataTypes } from 'sequelize';
import sequelize from '../config.js';

const Customer = sequelize.define('Customer', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING(100),
    unique: true,
  },
  phone: {
    type: DataTypes.STRING(20),
  },
  membership_tier: {
    type: DataTypes.ENUM('bronze', 'silver', 'gold', 'vip'),
    defaultValue: 'bronze',
  },
  total_spent: {
    type: DataTypes.DECIMAL(12, 2),
    defaultValue: 0.00,
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
  tableName: 'crm_customers',
  timestamps: false,
});

export default Customer;