import { Request, Response, NextFunction } from 'express';
import { Activity } from '../models/Activity';
import { User } from '../models/User';
import { Resident } from '../models/Resident';
import { Alimentacion } from '../models/Alimentacion';
import { Medicacion } from '../models/Medicacion';
import { AppError } from '../utils/errorHandler';
import { createNotification, updateNotification } from './notificationController'

export const createActivity = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { fecha, titulo, descripcion, tipo, residente_id, lugar, estado } = req.body;
    const requestWithUser = req as Request & { user?: any };

    if (!requestWithUser.user?.id) {
      return next(new AppError('No autenticado', 401));
    }

    const resident = await Resident.findByPk(residente_id, { include: ['familiares'] });
    if (!resident) {
      return next(new AppError('Residente no existe', 404));
    }

    const familiares = await resident.$get('familiares');
    const newNotif = await createNotification(`Actividad realizada: ${titulo}`, descripcion || '', familiares, new Date(fecha));

    const activity = await Activity.create({
      fecha: new Date(fecha),
      titulo,
      descripcion,
      tipo,
      residente_id,
      lugar,
      estado: estado || 'Pendiente',
      cuidador_id: requestWithUser.user.id,
      notificacion_id: newNotif.id,
    });

    // Si es una actividad de alimentación, crear también el registro en la tabla alimentacion
    if (tipo === 'Alimentacion') {
      const fechaActividad = new Date(fecha);
      await Alimentacion.create({
        tipo: titulo || 'Alimentación programada',
        descripcion: descripcion || '',
        hora: fechaActividad.toTimeString().slice(0, 8), // HH:MM:SS
        fecha_hora: fechaActividad,
        residente_id,
        cuidador_id: requestWithUser.user.id
      });
    }

    if (tipo === 'Medicamento') {
      const fechaActividad = new Date(fecha);
      await Medicacion.create({
        nombre: titulo || 'Medicamento programado',
        dosis: descripcion || '',
        horario: fechaActividad.toTimeString().slice(0, 8),
        fecha_hora: fechaActividad,
        residente_id,
        cuidador_id: requestWithUser.user.id,
        estado: 'Pendiente'
      });
    }

    res.status(201).json({
      success: true,
      data: activity
    });
  } catch (error) {
    next(error);
  }
};

export const getActivities = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const activities = await Activity.findAll({
      include: [
        {
          model: User,
          as: 'cuidador',
          attributes: ['id', 'name']
        },
        {
          model: Resident,
          as: 'residente',
          attributes: ['id', 'nombre']
        }
      ],
      order: [['fecha', 'ASC']]
    });

    res.status(200).json({
      success: true,
      data: activities
    });
  } catch (error) {
    next(error);
  }
};

export const getActivityById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const activity = await Activity.findByPk(req.params.id, {
      include: [
        {
          model: User,
          as: 'cuidador',
          attributes: ['id', 'name']
        },
        {
          model: Resident,
          as: 'residente',
          attributes: ['id', 'nombre']
        }
      ]
    });

    if (!activity) {
      return next(new AppError('Actividad no encontrada', 404));
    }

    res.status(200).json({
      success: true,
      data: activity
    });
  } catch (error) {
    next(error);
  }
};

const notifyActivityUpdate = async (original: Activity, updated: Activity) => {
  let body: string = "Se han cambiado los siguientes elementos:\n";

  for (const key of Object.keys(updated)) {
    const oldValue = (original as Record<string, any>)[key];
    const newValue = (updated as Record<string, any>)[key];

    const hasChanged =
      oldValue !== newValue &&
      !(Number.isNaN(oldValue) && Number.isNaN(newValue));

    if (hasChanged) {
      body += `  • "${key}": ${oldValue} → ${newValue}\n`;
    }
  }

  const originalResidente = await (original as any).$get('residente');
  const updatedResidente = await (updated as any).$get('residente');

  const originalFamiliares = await originalResidente.$get('familiares');
  const updatedFamiliares = await updatedResidente.$get('familiares');

  createNotification(`Cambio en actividad ${original.fecha} ${original.tipo}`, body, originalFamiliares);
  updateNotification(original.notificacion_id, `Actividad realizada: ${updated.titulo}`, updated.descripcion || '', updatedFamiliares, new Date(updated.fecha));
}

export const updateActivity = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { fecha, titulo, descripcion, tipo, residente_id, lugar, estado } = req.body;
    const requestWithUser = req as Request & { user?: any };

    if (!requestWithUser.user?.id) {
      return next(new AppError('No autenticado', 401));
    }

    const activity = await Activity.findByPk(req.params.id);

    if (!activity) {
      return next(new AppError('Actividad no encontrada', 404));
    }

    const oldTipo = activity.tipo;

    const updated = await activity.update({
      fecha: fecha ? new Date(fecha) : activity.fecha,
      titulo: titulo || activity.titulo,
      descripcion: descripcion || activity.descripcion,
      tipo: tipo || activity.tipo,
      residente_id: residente_id || activity.residente_id,
      lugar: lugar || activity.lugar,
      estado: estado || activity.estado
    });

    // Si cambió el tipo, manejar las tablas relacionadas
    if (tipo && tipo !== oldTipo) {
      // Eliminar registro anterior si existía
      if (oldTipo === 'Alimentacion') {
        await Alimentacion.destroy({
          where: {
            residente_id: activity.residente_id,
            cuidador_id: activity.cuidador_id,
            fecha_hora: activity.fecha
          }
        });
      } else if (oldTipo === 'Medicamento') {
        await Medicacion.destroy({
          where: {
            residente_id: activity.residente_id,
            cuidador_id: activity.cuidador_id,
            fecha_hora: activity.fecha
          }
        });
      }

      // Crear nuevo registro según el nuevo tipo
      if (tipo === 'Alimentacion') {
        const fechaActividad = activity.fecha;
        await Alimentacion.create({
          tipo: activity.titulo || 'Alimentación programada',
          descripcion: activity.descripcion || '',
          hora: fechaActividad.toTimeString().slice(0, 8),
          fecha_hora: fechaActividad,
          residente_id: activity.residente_id,
          cuidador_id: activity.cuidador_id
        });
      } else if (tipo === 'Medicamento') {
        const fechaActividad = activity.fecha;
        await Medicacion.create({
          nombre: activity.titulo || 'Medicamento programado',
          dosis: activity.descripcion || '',
          horario: fechaActividad.toTimeString().slice(0, 8),
          fecha_hora: fechaActividad,
          residente_id: activity.residente_id,
          cuidador_id: activity.cuidador_id,
          estado: 'Pendiente'
        });
      }
    } else {
      // Si no cambió el tipo, actualizar el registro existente
      if (activity.tipo === 'Alimentacion') {
        await Alimentacion.update(
          {
            tipo: activity.titulo || 'Alimentación programada',
            descripcion: activity.descripcion || '',
            hora: activity.fecha.toTimeString().slice(0, 8),
            fecha_hora: activity.fecha
          },
          {
            where: {
              residente_id: activity.residente_id,
              cuidador_id: activity.cuidador_id,
              fecha_hora: activity.fecha
            }
          }
        );
      } else if (activity.tipo === 'Medicamento') {
        await Medicacion.update(
          {
            nombre: activity.titulo || 'Medicamento programado',
            dosis: activity.descripcion || '',
            horario: activity.fecha.toTimeString().slice(0, 8),
            fecha_hora: activity.fecha
          },
          {
            where: {
              residente_id: activity.residente_id,
              cuidador_id: activity.cuidador_id,
              fecha_hora: activity.fecha
            }
          }
        );
      }
    }

    notifyActivityUpdate(activity, updated);

    res.status(200).json({
      success: true,
      data: activity
    });
  } catch (error) {
    next(error);
  }
};

export const deleteActivity = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const requestWithUser = req as Request & { user?: any };

    if (!requestWithUser.user?.id) {
      return next(new AppError('No autenticado', 401));
    }

    const activity = await Activity.findByPk(req.params.id);

    if (!activity) {
      return next(new AppError('Actividad no encontrada', 404));
    }

    // Eliminar registros relacionados antes de eliminar la actividad
    if (activity.tipo === 'Alimentacion') {
      await Alimentacion.destroy({
        where: {
          residente_id: activity.residente_id,
          cuidador_id: activity.cuidador_id,
          fecha_hora: activity.fecha
        }
      });
    } else if (activity.tipo === 'Medicamento') {
      await Medicacion.destroy({
        where: {
          residente_id: activity.residente_id,
          cuidador_id: activity.cuidador_id,
          fecha_hora: activity.fecha
        }
      });
    }

    await activity.destroy();

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    next(error);
  }
}; 