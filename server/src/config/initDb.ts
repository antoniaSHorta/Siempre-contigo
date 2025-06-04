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
    const residentExists = await Resident.findOne({ where: { nombre: 'Joaquin' } });
    const alimentacionExists = await Alimentacion.findOne({ where: { tipo: 'Desayuno' } });
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
    if (!residentExists) {
      await Resident.create({
        nombre: 'Joaquin',
        nacimiento: '1945-05-10',
        estado_salud: 'Estable',
        habitacion: 'Habitación 101',
        ingreso: '2024-11-15',
        activo: true,
      });
      console.log('Resident created successfully.');
    }
    if (!alimentacionExists) {
    await Alimentacion.create({
      tipo: 'Desayuno',
      descripcion: 'Pan con mantequilla y jugo de naranja',
      hora: '08:00:00',
      fecha_hora: '2025-06-04 08:00:00',
      residente_id: 1,
      cuidador_id: 1,
    });
    console.log('Alimentación creada correctamente.');
  }
    
  } catch (error) {
    console.error('Unable to initialize database:', error);
    throw error;
  }
}; 