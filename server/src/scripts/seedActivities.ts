import sequelize from "../config/database";
import { Activity } from "../models/Activity";
import { User } from "../models/User";
import { Resident } from "../models/Resident";
import { addDays, setHours, setMinutes, addWeeks } from "date-fns";

async function seedActivities() {
  try {
    // Desactivar temporalmente las restricciones de clave foránea
    await sequelize.query("SET FOREIGN_KEY_CHECKS = 0;");

    await sequelize.sync({ force: true });

    await sequelize.query("SET FOREIGN_KEY_CHECKS = 1;");

    // Crear usuario administrador
    const admin = await User.create({
      name: "Admin",
      email: "admin@example.com",
      password: "admin123",
      role: "Admin",
      phone: "123-456-7890",
      location: "Oficina Principal",
    });

    const cuidador0 = await User.create({
      name: "Juan Pérez",
      email: "juan@example.com",
      password: "password123",
      role: "Cuidador",
      phone: "123-456-7891",
      location: "Piso 1",
    });

    const cuidador1 = await User.create({
      name: "María García",
      email: "maria@example.com",
      password: "password123",
      role: "Cuidador",
      phone: "123-456-7892",
      location: "Piso 2",
    });

    const cuidador2 = await User.create({
      name: "Carlos Rodríguez",
      email: "carlos@example.com",
      password: "password123",
      role: "Cuidador",
      phone: "123-456-7893",
      location: "Piso 3",
    });

    const familiar = await User.create({
      name: "Javier Figueroa",
      email: "javier777@example.com",
      password: "password",
      role: "Familiar",
      phone: "123-456-7893",
      location: "Piso 3",
    });

    const residentes = await Resident.bulkCreate(
      [
        {
          nombre: "Joaquín Martínez",
          nacimiento: new Date("1940-05-15"),
          estado_salud: "Estable",
          habitacion: "101",
          ingreso: new Date("2023-01-01"),
          activo: true,
        },
        {
          nombre: "Carmen López",
          nacimiento: new Date("1945-08-22"),
          estado_salud: "Requiere atención especial",
          habitacion: "102",
          ingreso: new Date("2023-02-15"),
          activo: true,
        },
        {
          nombre: "Antonio García",
          nacimiento: new Date("1938-11-30"),
          estado_salud: "Estable",
          habitacion: "103",
          ingreso: new Date("2023-03-10"),
          activo: true,
        },
        {
          nombre: "Isabel Sánchez",
          nacimiento: new Date("1942-03-18"),
          estado_salud: "Requiere terapia física",
          habitacion: "104",
          ingreso: new Date("2023-04-05"),
          activo: true,
        },
        {
          nombre: "Manuel Torres",
          nacimiento: new Date("1935-07-25"),
          estado_salud: "Estable",
          habitacion: "105",
          ingreso: new Date("2023-05-20"),
          activo: true,
        },
      ],
      { individualHooks: true }
    );

    for (const residente of residentes) {
      await residente.$set("familiares", [admin.id, familiar.id]);
    }

    const today = new Date();
    const activities = [];

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

    // Actividades regulares
    activities.push(
      createActivity(
        "Cita Oftalmológica",
        "Revisión anual de la vista",
        setHours(setMinutes(addDays(today, 1), 30), 10),
        "Cita",
        residentes[0].id,
        "Hospital",
        "Pendiente",
        cuidador0.id
      ),
      createActivity(
        "Almuerzo Familiar",
        "Visita de hijos y nietos",
        setHours(setMinutes(addDays(today, 1), 0), 13),
        "Recreacional",
        residentes[0].id,
        "Interno",
        "Pendiente",
        cuidador0.id
      ),
      createActivity(
        "Paseo por el Jardín",
        "Actividad física suave",
        setHours(setMinutes(addDays(today, 3), 0), 16),
        "Paseo",
        residentes[0].id,
        "Exterior",
        "Pendiente",
        cuidador1.id
      )
    );

    // Actividades de alimentación (se crearán automáticamente los registros correspondientes)
    activities.push(
      createActivity(
        "Desayuno",
        "Avena con frutas y leche",
        setHours(setMinutes(addDays(today, 1), 0), 8),
        "Alimentacion",
        residentes[0].id,
        "Comedor",
        "Pendiente",
        cuidador0.id
      ),
      createActivity(
        "Almuerzo",
        "Pollo con verduras",
        setHours(setMinutes(addDays(today, 1), 0), 12),
        "Alimentacion",
        residentes[1].id,
        "Comedor",
        "Pendiente",
        cuidador1.id
      ),
      createActivity(
        "Cena",
        "Sopa de verduras con pan integral",
        setHours(setMinutes(addDays(today, 1), 0), 19),
        "Alimentacion",
        residentes[2].id,
        "Comedor",
        "Pendiente",
        cuidador2.id
      )
    );

    // Actividades de medicación (se crearán automáticamente los registros correspondientes)
    activities.push(
      createActivity(
        "Aspirina Matutina",
        "100mg después del desayuno",
        setHours(setMinutes(addDays(today, 1), 0), 9),
        "Medicamento",
        residentes[0].id,
        "Habitación",
        "Pendiente",
        cuidador0.id
      ),
      createActivity(
        "Vitaminas",
        "Complejo B después del almuerzo",
        setHours(setMinutes(addDays(today, 1), 0), 14),
        "Medicamento",
        residentes[1].id,
        "Habitación",
        "Pendiente",
        cuidador1.id
      ),
      createActivity(
        "Medicación Nocturna",
        "Pastilla para dormir - 5mg",
        setHours(setMinutes(addDays(today, 1), 0), 21),
        "Medicamento",
        residentes[2].id,
        "Habitación",
        "Pendiente",
        cuidador0.id
      )
    );

    // Más actividades regulares
    activities.push(
      createActivity(
        "Terapia Física",
        "Sesión de rehabilitación de rodilla",
        setHours(setMinutes(addDays(today, 2), 0), 11),
        "Terapia",
        residentes[1].id,
        "Gimnasio",
        "Pendiente",
        cuidador1.id
      ),
      createActivity(
        "Visita Médica",
        "Control de medicación",
        setHours(setMinutes(addDays(today, 4), 0), 9),
        "Cita",
        residentes[1].id,
        "Interno",
        "Pendiente",
        cuidador0.id
      ),
      createActivity(
        "Actividad Grupal",
        "Juegos de memoria",
        setHours(setMinutes(addDays(today, 5), 0), 15),
        "Recreacional",
        residentes[1].id,
        "Sala de estar",
        "Pendiente",
        cuidador2.id
      )
    );

    activities.push(
      createActivity(
        "Visita Familiar",
        "Visita de hijos",
        setHours(setMinutes(addDays(today, 3), 0), 15),
        "Recreacional",
        residentes[2].id,
        "Interno",
        "Pendiente",
        cuidador0.id
      ),
      createActivity(
        "Paseo Terapéutico",
        "Ejercicio al aire libre",
        setHours(setMinutes(addDays(today, 6), 0), 17),
        "Paseo",
        residentes[2].id,
        "Exterior",
        "Pendiente",
        cuidador2.id
      )
    );

    activities.push(
      createActivity(
        "Terapia Ocupacional",
        "Ejercicios de motricidad fina",
        setHours(setMinutes(addDays(today, 2), 0), 10),
        "Terapia",
        residentes[3].id,
        "Gimnasio",
        "Pendiente",
        cuidador1.id
      ),
      createActivity(
        "Cita Médica",
        "Control de tensión arterial",
        setHours(setMinutes(addDays(today, 5), 0), 11),
        "Cita",
        residentes[3].id,
        "Interno",
        "Pendiente",
        cuidador0.id
      )
    );

    activities.push(
      createActivity(
        "Visita de Familia",
        "Visita de nietos",
        setHours(setMinutes(addDays(today, 1), 0), 16),
        "Recreacional",
        residentes[4].id,
        "Interno",
        "Pendiente",
        cuidador2.id
      ),
      createActivity(
        "Paseo Matutino",
        "Ejercicio suave",
        setHours(setMinutes(addDays(today, 4), 0), 8),
        "Paseo",
        residentes[4].id,
        "Exterior",
        "Pendiente",
        cuidador0.id
      ),
      createActivity(
        "Actividad Cultural",
        "Lectura grupal",
        setHours(setMinutes(addDays(today, 6), 0), 10),
        "Recreacional",
        residentes[4].id,
        "Sala de estar",
        "Pendiente",
        cuidador1.id
      )
    );

    // Actividades completadas (pasadas)
    activities.push(
      createActivity(
        "Control Médico",
        "Control de presión arterial",
        setHours(setMinutes(addDays(today, -1), 0), 9),
        "Cita",
        residentes[0].id,
        "Interno",
        "Completado",
        cuidador0.id
      ),
      createActivity(
        "Ejercicios Matutinos",
        "Rutina de ejercicios",
        setHours(setMinutes(addDays(today, -2), 0), 8),
        "Terapia",
        residentes[1].id,
        "Gimnasio",
        "Completado",
        cuidador1.id
      ),
      createActivity(
        "Desayuno Ayer",
        "Cereales con leche",
        setHours(setMinutes(addDays(today, -1), 0), 8),
        "Alimentacion",
        residentes[0].id,
        "Comedor",
        "Completado",
        cuidador0.id
      ),
      createActivity(
        "Medicamento Ayer",
        "Aspirina matutina",
        setHours(setMinutes(addDays(today, -1), 0), 9),
        "Medicamento",
        residentes[1].id,
        "Habitación",
        "Completado",
        cuidador1.id
      )
    );

    // Crear todas las actividades
    await Activity.bulkCreate(activities);

    console.log("Seeder ejecutado exitosamente con sincronización automática");
    console.log(`Creado 1 administrador`);
    //console.log(`Creados ${cuidadores.length} cuidadores`);
    console.log(`Creados ${residentes.length} residentes`);
    console.log(`Creadas ${activities.length} actividades`);
    console.log(
      "📌 Los registros de alimentación y medicación se crean automáticamente por sincronización"
    );

    process.exit(0);
  } catch (error) {
    console.error("Error ejecutando el seeder:", error);
    process.exit(1);
  }
}

seedActivities();
