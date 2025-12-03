import { sequelize } from './models/index.js';

async function migrate() {
  try {
    await sequelize.authenticate();
    console.log('Database connection established.');

    await sequelize.sync({ force: true }); // Use force: true to drop and recreate tables
    console.log('Database synchronized successfully.');
  } catch (error) {
    console.error('Error migrating database:', error);
  } finally {
    await sequelize.close();
  }
}

migrate();