import sequelize from './database';
import { User } from '../models/User';
import { Activity } from '../models/Activity';
import { Resident } from '../models/Resident';
import { Alimentacion } from '../models/Alimentacion';
import { Medicacion } from '../models/Medicacion';
import { ResidentesCuidadores } from '../models/ResidentesCuidadores';
import { ResidentesFamiliares } from '../models/ResidentesFamiliares';
import { setHours, setMinutes, addDays, format } from 'date-fns';

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
        isActive: true,
        isConnected: true
      });
      console.log('Admin user created successfully.');
    }
    const residentExists = await Resident.findOne({ where: { nombre: 'Joaquin' } });
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

    const medicacionExists = await Medicacion.findOne({ where: { nombre: 'Kitadol' } });
    if (!medicacionExists) {
      await Medicacion.create({
        nombre: 'Kitadol',
        dosis: '500 gr',
        horario: '08:00:00',
        fecha_hora: new Date('2025-06-04T08:00:00'),
        cuidador_id: 1,
        residente_id: 1,
        estado: 'Pendiente'
      });
      console.log('Medicacion creada exitosamente.');
    }

    const today = new Date();

    const createActivity = (
      titulo: string,
      descripcion: string,
      fecha: Date,
      tipo: string,
      residente_id: number,
      lugar: string,
      estado: string,
      cuidador_id: number
    ) => ({
      titulo,
      descripcion,
      fecha,
      tipo,
      residente_id,
      lugar,
      estado,
      cuidador_id,
    });

    

   const activities = [
      createActivity(
        "Cita Oftalmológica",
        "Revisión anual de la vista",
        setHours(setMinutes(addDays(today, 1), 30), 10),
        "Cita",
        1,
        "Hospital",
        "Pendiente",
        1
      ),
      createActivity(
        "Almuerzo Familiar",
        "Visita de hijos y nietos",
        setHours(setMinutes(addDays(today, 1), 0), 13),
        "Recreacional",
        1,
        "Interno",
        "Pendiente",
        1
      ),
      createActivity(
        "Paseo por el Jardín",
        "Actividad física suave",
        setHours(setMinutes(addDays(today, 3), 0), 16),
        "Paseo",
        1,
        "Exterior",
        "Pendiente",
        1
      ),
      createActivity(
        "Aspirina Matutina",
        "100mg después del desayuno",
        setHours(setMinutes(addDays(today, 1), 0), 9),
        "Medicamento",
        1,
        "Habitación",
        "Pendiente",
        1
      ),
    ];

    Medicacion.create(
      {
        nombre: 'Aspirina Matutina',
        dosis: '100mg después del desayuno',
        horario: format(setHours(setMinutes(addDays(today, 1), 0), 9), 'HH:mm'),
        fecha_hora: new Date('2025-06-11T08:00:00'),
        cuidador_id: 1,
        residente_id: 1,
        estado: 'Pendiente'
      }
    )

  await Activity.bulkCreate(activities);
  console.log('Activities created successfully.');

    const joaquinCuidadorExists = await User.findOne({where:{name:"Joaquin Cuidador1"}})
    if (!joaquinCuidadorExists){
      try {
        await User.create({
          name: 'Joaquin Cuidador',
          email: 'joaquin@gmail.com',
          password: 'joaquin123',
          role: 'Cuidador',
          isActive: true,
          isConnected: false
        });
        console.log('Joaquin user created successfully.');
      } catch (error) {
        console.log(error)
      }
    }
    const joaquinFamiliarExists = await User.findOne({where:{name:"Joaquin Familiar"}})
    if (!joaquinFamiliarExists){
      try {
        await User.create({
          name: 'Joaquin Familiar',
          email: 'joaquinF@gmail.com',
          password: 'joaquin123',
          role: 'Familiar',
          isActive: true,
          isConnected: false
        });
        console.log('Joaquin user created successfully.');
      } catch (error) {
        console.log(error)
      }
    }
    const relacionJRCExists = await ResidentesCuidadores.findOne({
      where:{
        residente_id: 1,
        cuidador_id: 2
      }
    })
    try {
      if(!relacionJRCExists){
        await ResidentesCuidadores.create({
          residente_id: 1,
          cuidador_id: 2
        })
      }
    } catch (error) {
      console.log(error)
    } 
    const relacionJRFExists = await ResidentesFamiliares.findOne({
      where:{
        residente_id: 1,
        familiar_id: 3
      }
    })
    try {
      if(!relacionJRFExists){
        await ResidentesFamiliares.create({
          residente_id: 1,
          familiar_id: 3
        })
      }
    } catch (error) {
      console.log(error)
    } 
  } catch (error) {
    console.error('Unable to initialize database:', error);
    throw error;
  }
}; 