import sequelize from '../config/database';
import { Activity } from '../models/Activity';
import { User } from '../models/User';
import { Resident } from '../models/Resident';
import { Alimentacion } from '../models/Alimentacion';
import { Medicacion } from '../models/Medicacion';
import { addDays, setHours, setMinutes, addWeeks } from 'date-fns';

async function seedActivities() {
  try {
    // Desactivar temporalmente las restricciones de clave foránea
    await sequelize.query('SET FOREIGN_KEY_CHECKS = 0;');

    await sequelize.sync({ force: true });

    await sequelize.query('SET FOREIGN_KEY_CHECKS = 1;');

    // Crear usuario administrador
    const admin = await User.create({
      name: 'Admin',
      email: 'admin@example.com',
      password: 'admin123',
      role: 'admin',
      phone: '123-456-7890',
      location: 'Oficina Principal'
    });

    // Crear usuarios de prueba (cuidadores)
    const cuidadores = await User.bulkCreate([
      {
        name: 'Juan Pérez',
        email: 'juan@example.com',
        password: 'password123',
        role: 'user',
        phone: '123-456-7891',
        location: 'Piso 1'
      },
      {
        name: 'María García',
        email: 'maria@example.com',
        password: 'password123',
        role: 'user',
        phone: '123-456-7892',
        location: 'Piso 2'
      },
      {
        name: 'Carlos Rodríguez',
        email: 'carlos@example.com',
        password: 'password123',
        role: 'user',
        phone: '123-456-7893',
        location: 'Piso 3'
      }
    ]);

    const residentes = await Resident.bulkCreate([
      {
        nombre: 'Joaquín Martínez',
        nacimiento: new Date('1940-05-15'),
        estado_salud: 'Estable',
        habitacion: '101',
        ingreso: new Date('2023-01-01'),
        activo: true
      },
      {
        nombre: 'Carmen López',
        nacimiento: new Date('1945-08-22'),
        estado_salud: 'Requiere atención especial',
        habitacion: '102',
        ingreso: new Date('2023-02-15'),
        activo: true
      },
      {
        nombre: 'Antonio García',
        nacimiento: new Date('1938-11-30'),
        estado_salud: 'Estable',
        habitacion: '103',
        ingreso: new Date('2023-03-10'),
        activo: true
      },
      {
        nombre: 'Isabel Sánchez',
        nacimiento: new Date('1942-03-18'),
        estado_salud: 'Requiere terapia física',
        habitacion: '104',
        ingreso: new Date('2023-04-05'),
        activo: true
      },
      {
        nombre: 'Manuel Torres',
        nacimiento: new Date('1935-07-25'),
        estado_salud: 'Estable',
        habitacion: '105',
        ingreso: new Date('2023-05-20'),
        activo: true
      }
    ]);

    const today = new Date();
    const activities = [];
    const alimentacionRecords = [];
    const medicacionRecords = [];

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
      cuidador_id
    });

    // Actividades regulares
    activities.push(
      createActivity(
        'Cita Oftalmológica',
        'Revisión anual de la vista',
        setHours(setMinutes(addDays(today, 1), 30), 10),
        'Cita',
        residentes[0].id,
        'Hospital',
        'Pendiente',
        cuidadores[0].id
      ),
      createActivity(
        'Almuerzo Familiar',
        'Visita de hijos y nietos',
        setHours(setMinutes(addDays(today, 1), 0), 13),
        'Recreacional',
        residentes[0].id,
        'Interno',
        'Pendiente',
        cuidadores[0].id
      ),
      createActivity(
        'Paseo por el Jardín',
        'Actividad física suave',
        setHours(setMinutes(addDays(today, 3), 0), 16),
        'Paseo',
        residentes[0].id,
        'Exterior',
        'Pendiente',
        cuidadores[1].id
      )
    );

    // Actividades de alimentación
    const desayunoFecha = setHours(setMinutes(addDays(today, 1), 0), 8);
    activities.push(
      createActivity(
        'Desayuno',
        'Avena con frutas y leche',
        desayunoFecha,
        'Alimentacion',
        residentes[0].id,
        'Comedor',
        'Pendiente',
        cuidadores[0].id
      )
    );

    alimentacionRecords.push({
      tipo: 'Desayuno',
      descripcion: 'Avena con frutas y leche',
      hora: desayunoFecha.toTimeString().slice(0, 8),
      fecha_hora: desayunoFecha,
      residente_id: residentes[0].id,
      cuidador_id: cuidadores[0].id
    });

    const almuerzoFecha = setHours(setMinutes(addDays(today, 1), 0), 12);
    activities.push(
      createActivity(
        'Almuerzo',
        'Pollo con verduras',
        almuerzoFecha,
        'Alimentacion',
        residentes[1].id,
        'Comedor',
        'Pendiente',
        cuidadores[1].id
      )
    );

    alimentacionRecords.push({
      tipo: 'Almuerzo',
      descripcion: 'Pollo con verduras',
      hora: almuerzoFecha.toTimeString().slice(0, 8),
      fecha_hora: almuerzoFecha,
      residente_id: residentes[1].id,
      cuidador_id: cuidadores[1].id
    });

    // Actividades de medicación
    const aspirina1Fecha = setHours(setMinutes(addDays(today, 1), 0), 9);
    activities.push(
      createActivity(
        'Aspirina Matutina',
        '100mg después del desayuno',
        aspirina1Fecha,
        'Medicamento',
        residentes[0].id,
        'Habitación',
        'Pendiente',
        cuidadores[0].id
      )
    );

    medicacionRecords.push({
      nombre: 'Aspirina Matutina',
      dosis: '100mg después del desayuno',
      horario: aspirina1Fecha.toTimeString().slice(0, 8),
      fecha_hora: aspirina1Fecha,
      residente_id: residentes[0].id,
      cuidador_id: cuidadores[0].id,
      estado: 'Pendiente'
    });

    const vitamina1Fecha = setHours(setMinutes(addDays(today, 1), 0), 14);
    activities.push(
      createActivity(
        'Vitaminas',
        'Complejo B después del almuerzo',
        vitamina1Fecha,
        'Medicamento',
        residentes[1].id,
        'Habitación',
        'Pendiente',
        cuidadores[1].id
      )
    );

    medicacionRecords.push({
      nombre: 'Vitaminas',
      dosis: 'Complejo B después del almuerzo',
      horario: vitamina1Fecha.toTimeString().slice(0, 8),
      fecha_hora: vitamina1Fecha,
      residente_id: residentes[1].id,
      cuidador_id: cuidadores[1].id,
      estado: 'Pendiente'
    });

    // Más actividades regulares
    activities.push(
      createActivity(
        'Terapia Física',
        'Sesión de rehabilitación de rodilla',
        setHours(setMinutes(addDays(today, 2), 0), 11),
        'Terapia',
        residentes[1].id,
        'Gimnasio',
        'Pendiente',
        cuidadores[1].id
      ),
      createActivity(
        'Visita Médica',
        'Control de medicación',
        setHours(setMinutes(addDays(today, 4), 0), 9),
        'Cita',
        residentes[1].id,
        'Interno',
        'Pendiente',
        cuidadores[0].id
      ),
      createActivity(
        'Actividad Grupal',
        'Juegos de memoria',
        setHours(setMinutes(addDays(today, 5), 0), 15),
        'Recreacional',
        residentes[1].id,
        'Sala de estar',
        'Pendiente',
        cuidadores[2].id
      )
    );

    activities.push(
      createActivity(
        'Visita Familiar',
        'Visita de hijos',
        setHours(setMinutes(addDays(today, 3), 0), 15),
        'Recreacional',
        residentes[2].id,
        'Interno',
        'Pendiente',
        cuidadores[0].id
      ),
      createActivity(
        'Paseo Terapéutico',
        'Ejercicio al aire libre',
        setHours(setMinutes(addDays(today, 6), 0), 17),
        'Paseo',
        residentes[2].id,
        'Exterior',
        'Pendiente',
        cuidadores[2].id
      )
    );

    activities.push(
      createActivity(
        'Terapia Ocupacional',
        'Ejercicios de motricidad fina',
        setHours(setMinutes(addDays(today, 2), 0), 10),
        'Terapia',
        residentes[3].id,
        'Gimnasio',
        'Pendiente',
        cuidadores[1].id
      ),
      createActivity(
        'Cita Médica',
        'Control de tensión arterial',
        setHours(setMinutes(addDays(today, 5), 0), 11),
        'Cita',
        residentes[3].id,
        'Interno',
        'Pendiente',
        cuidadores[0].id
      )
    );

    activities.push(
      createActivity(
        'Visita de Familia',
        'Visita de nietos',
        setHours(setMinutes(addDays(today, 1), 0), 16),
        'Recreacional',
        residentes[4].id,
        'Interno',
        'Pendiente',
        cuidadores[2].id
      ),
      createActivity(
        'Paseo Matutino',
        'Ejercicio suave',
        setHours(setMinutes(addDays(today, 4), 0), 8),
        'Paseo',
        residentes[4].id,
        'Exterior',
        'Pendiente',
        cuidadores[0].id
      ),
      createActivity(
        'Actividad Cultural',
        'Lectura grupal',
        setHours(setMinutes(addDays(today, 6), 0), 10),
        'Recreacional',
        residentes[4].id,
        'Sala de estar',
        'Pendiente',
        cuidadores[1].id
      )
    );

    // Actividades completadas (pasadas)
    activities.push(
      createActivity(
        'Control Médico',
        'Control de presión arterial',
        setHours(setMinutes(addDays(today, -1), 0), 9),
        'Cita',
        residentes[0].id,
        'Interno',
        'Completado',
        cuidadores[0].id
      ),
      createActivity(
        'Ejercicios Matutinos',
        'Rutina de ejercicios',
        setHours(setMinutes(addDays(today, -2), 0), 8),
        'Terapia',
        residentes[1].id,
        'Gimnasio',
        'Completado',
        cuidadores[1].id
      ),
      createActivity(
        'Visita Familiar',
        'Visita de hijos',
        setHours(setMinutes(addDays(today, -3), 0), 15),
        'Recreacional',
        residentes[2].id,
        'Interno',
        'Completado',
        cuidadores[2].id
      )
    );

    // Crear todas las actividades
    await Activity.bulkCreate(activities);

    // Crear registros de alimentación
    await Alimentacion.bulkCreate(alimentacionRecords);

    // Crear registros de medicación
    await Medicacion.bulkCreate(medicacionRecords);

    console.log('Seeder ejecutado exitosamente');
    console.log(`Creado 1 administrador`);
    console.log(`Creados ${cuidadores.length} cuidadores`);
    console.log(`Creados ${residentes.length} residentes`);
    console.log(`Creadas ${activities.length} actividades`);
    console.log(`Creados ${alimentacionRecords.length} registros de alimentación`);
    console.log(`Creados ${medicacionRecords.length} registros de medicación`);

    process.exit(0);
  } catch (error) {
    console.error('Error ejecutando el seeder:', error);
    process.exit(1);
  }
}

seedActivities(); 