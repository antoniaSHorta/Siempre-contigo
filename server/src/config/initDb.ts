import sequelize from './database';
import { User } from '../models/User';
import { Activity } from '../models/Activity';
import { Resident } from '../models/Resident';
import { Alimentacion } from '../models/Alimentacion';

export const initDatabase = async () => {
  try {
    await sequelize.authenticate();
    console.log('Database connection has been established successfully.');

    // Desactivar temporalmente las restricciones de clave foránea
    await sequelize.query('SET FOREIGN_KEY_CHECKS = 0;');

    // Sincronizar la base de datos
    await sequelize.sync({ force: true });
    console.log('Database synchronized successfully.');

    // Reactivar las restricciones de clave foránea
    await sequelize.query('SET FOREIGN_KEY_CHECKS = 1;');

    const adminExists = await User.findOne({ where: { email: 'admin@example.com' } });
    if (!adminExists) {
      await User.create({
        name: 'Admin',
        email: 'admin@example.com',
        password: 'admin123',
        role: 'admin',
        phone: '123-456-7890',
        location: 'Oficina Principal'
      });
      console.log('Admin user created successfully.');
    }
  } catch (error) {
    console.error('Unable to initialize database:', error);
    throw error;
  }
}; 