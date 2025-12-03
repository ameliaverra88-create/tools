import { DataTypes } from 'sequelize';
import sequelize from '../config.js';

const Loyalty = sequelize.define('Loyalty', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  customer_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  points: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  points_used: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  expiry_date: {
    type: DataTypes.DATE,
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
  tableName: 'crm_loyalty',
  timestamps: false,
});

export default Loyalty;