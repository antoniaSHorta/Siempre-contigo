import sequelize from './database';
import { User } from '../models/User';
import { Alimentacion } from '../models/Alimentacion';

export const initDatabase = async () => {
  try {
    await sequelize.authenticate();
    console.log('Database connection has been established successfully.');

    await sequelize.sync({ force: true }); 
    console.log('Database synchronized successfully.');

    const adminExists = await User.findOne({ where: { email: 'admin@example.com' } });
    if (!adminExists) {
      await User.create({
        name: 'Admin',
        email: 'admin@example.com',
        password: 'admin123',
        role: 'admin',
      });
      console.log('Admin user created successfully.');
    }

    // datos de ejemplo para alimentación
    const alimentacionCount = await Alimentacion.count();
    if (alimentacionCount === 0) {
      await Alimentacion.bulkCreate([
        {
          tipo: 'Desayuno',
          descripcion: 'Desayuno balanceado con cereales, frutas y lácteos',
          hora: '08:00:00',
        },
        {
          tipo: 'Almuerzo',
          descripcion: 'Almuerzo completo con proteínas, carbohidratos y vegetales',
          hora: '12:00:00',
        },
        {
          tipo: 'Cena',
          descripcion: 'Cena ligera con sopas, ensaladas y proteína magra',
          hora: '18:00:00',
        },
        {
          tipo: 'Merienda',
          descripcion: 'Merienda saludable con frutas y yogurt',
          hora: '15:30:00',
        },
      ]);
      console.log('Sample alimentacion data created successfully.');
    }

  } catch (error) {
    console.error('Unable to initialize database:', error);
    throw error;
  }
}; 