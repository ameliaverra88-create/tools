import sequelize from '../config.js';

// Import all models
import User from './User.js';
import Outlet from './Outlet.js';
import Category from './Category.js';
import Product from './Product.js';
import Recipe from './Recipe.js';
import Stock from './Stock.js';
import Order from './Order.js';
import OrderItem from './OrderItem.js';
import Payment from './Payment.js';
import Staff from './Staff.js';
import Shift from './Shift.js';
import Customer from './Customer.js';
import Loyalty from './Loyalty.js';
import Promo from './Promo.js';

// Define associations
User.hasMany(Staff, { foreignKey: 'user_id' });
Staff.belongsTo(User, { foreignKey: 'user_id' });

Outlet.hasMany(Product, { foreignKey: 'outlet_id' });
Product.belongsTo(Outlet, { foreignKey: 'outlet_id' });

Category.hasMany(Product, { foreignKey: 'category_id' });
Product.belongsTo(Category, { foreignKey: 'category_id' });

Product.hasMany(Recipe, { foreignKey: 'product_id' });
Recipe.belongsTo(Product, { foreignKey: 'product_id' });

Product.hasMany(Stock, { foreignKey: 'product_id' });
Stock.belongsTo(Product, { foreignKey: 'product_id' });

Order.hasMany(OrderItem, { foreignKey: 'order_id' });
OrderItem.belongsTo(Order, { foreignKey: 'order_id' });

Product.hasMany(OrderItem, { foreignKey: 'product_id' });
OrderItem.belongsTo(Product, { foreignKey: 'product_id' });

Order.hasMany(Payment, { foreignKey: 'order_id' });
Payment.belongsTo(Order, { foreignKey: 'order_id' });

Staff.hasMany(Order, { foreignKey: 'staff_id' });
Order.belongsTo(Staff, { foreignKey: 'staff_id' });

Staff.hasMany(Shift, { foreignKey: 'staff_id' });
Shift.belongsTo(Staff, { foreignKey: 'staff_id' });

Customer.hasMany(Order, { foreignKey: 'customer_id' });
Order.belongsTo(Customer, { foreignKey: 'customer_id' });

Customer.hasMany(Loyalty, { foreignKey: 'customer_id' });
Loyalty.belongsTo(Customer, { foreignKey: 'customer_id' });

Promo.hasMany(Order, { foreignKey: 'promo_id' });
Order.belongsTo(Promo, { foreignKey: 'promo_id' });

export {
  sequelize,
  User,
  Outlet,
  Category,
  Product,
  Recipe,
  Stock,
  Order,
  OrderItem,
  Payment,
  Staff,
  Shift,
  Customer,
  Loyalty,
  Promo,
};