import sequelize from './database';
import { User } from '../models/User';

export const initDatabase = async () => {
  try {
    await sequelize.authenticate();
    console.log('Database connection has been established successfully.');

    await sequelize.sync({ alter: true }); 
    console.log('Database synchronized successfully.');

    const adminExists = await User.findOne({ where: { email: 'admin@example.com' } });
    if (!adminExists) {
      await User.create({
        name: 'Admin',
        email: 'admin@example.com',
        password: 'admin123',
        role: 'admin',
        isActive: true,
        isConnected: true
      });
      console.log('Admin user created successfully.');
    }

  } catch (error) {
    console.error('Unable to initialize database:', error);
    throw error;
  }
}; 