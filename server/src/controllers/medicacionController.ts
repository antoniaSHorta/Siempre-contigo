import { Request, Response, NextFunction } from 'express';
import { Medicacion } from '../models/Medicacion';
import { Activity } from '../models/Activity';
import { User } from '../models/User';
import { Resident } from '../models/Resident';
import { AppError } from '../utils/errorHandler';
import { Op } from 'sequelize';

import { createNotification } from './notificationController';

export const createMedicacion = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { nombre, dosis, horario, fecha_hora, cuidador_id, residente_id, estado } = req.body;
    console.log({ nombre, dosis, horario, fecha_hora, cuidador_id, residente_id, estado })
    if (cuidador_id) {
      const cuidador = await User.findByPk(cuidador_id);
      if (!cuidador) {
        return next(new AppError('Cuidador no encontrado', 404));
      }
    }

    let residente: Resident | null = null;
    if (residente_id) {
      residente = await Resident.findByPk(residente_id);
      if (!residente) {
        return next(new AppError('Residente no encontrado', 404));
      }
    }

    const medicacion = await Medicacion.create({
      nombre,
      dosis,
      horario,
      fecha_hora,
      cuidador_id,
      residente_id,
      estado: estado || 'pendiente'
    });

    const existingActivity = await Activity.findOne({
      where: {
        tipo: 'Medicamento',
        fecha: fecha_hora,
        residente_id,
        cuidador_id
      }
    });

    if (!existingActivity && fecha_hora && residente_id && cuidador_id) {
      await Activity.create({
        titulo: nombre || 'Medicamento programado',
        descripcion: dosis || '',
        fecha: new Date(fecha_hora),
        tipo: 'Medicamento',
        residente_id,
        cuidador_id,
        lugar: 'Habitación',
        estado: 'Pendiente'
      });
    }

    if (residente){
      const familiares = await residente.$get('familiares');
      // console.log(familiares);
      createNotification(`Medicamento: ${residente.nombre}`, `${residente.nombre} ha consumido sus ${dosis} ${nombre}`, familiares, fecha_hora);
    }

    res.status(201).json({
      success: true,
      data: medicacion,
      message: 'Medicación creada exitosamente (sincronizada con agenda)'
    });
  } catch (error) {
    next(error);
  }
};

export const getAllMedicaciones = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { cuidador_id, residente_id, estado } = req.query;
    
    const whereClause: any = {};
    
    if (cuidador_id) {
      whereClause.cuidador_id = cuidador_id;
    }
    
    if (residente_id) {
      whereClause.residente_id = residente_id;
    }
    
    if (estado) {
      whereClause.estado = estado;
    }

    const medicaciones = await Medicacion.findAll({
      where: whereClause,
      include: [
        {
          model: User,
          as: 'cuidador',
          attributes: ['id', 'name', 'email']
        },
        {
          model: Resident,
          as: 'residente',
          attributes: ['id', 'nombre', 'habitacion']
        }
      ],
      order: [['id', 'DESC']]
    });

    res.status(200).json({
      success: true,
      count: medicaciones.length,
      data: medicaciones
    });
  } catch (error) {
    next(error);
  }
};

export const getMedicacionById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    const medicacion = await Medicacion.findByPk(id, {
      include: [
        {
          model: User,
          as: 'cuidador',
          attributes: ['id', 'name', 'email']
        },
        {
          model: Resident,
          as: 'residente',
          attributes: ['id', 'nombre', 'habitacion', 'estado_salud']
        }
      ]
    });

    if (!medicacion) {
      return next(new AppError('Medicación no encontrada', 404));
    }

    res.status(200).json({
      success: true,
      data: medicacion
    });
  } catch (error) {
    next(error);
  }
};

export const updateMedicacion = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { nombre, dosis, horario, fecha_hora, cuidador_id, residente_id, estado } = req.body;

    const medicacion = await Medicacion.findByPk(id);
    
    if (!medicacion) {
      return next(new AppError('Medicación no encontrada', 404));
    }

    if (cuidador_id) {
      const cuidador = await User.findByPk(cuidador_id);
      if (!cuidador) {
        return next(new AppError('Cuidador no encontrado', 404));
      }
    }

    if (residente_id) {
      const residente = await Resident.findByPk(residente_id);
      if (!residente) {
        return next(new AppError('Residente no encontrado', 404));
      }
    }

    const oldData = {
      fecha_hora: medicacion.fecha_hora,
      residente_id: medicacion.residente_id,
      cuidador_id: medicacion.cuidador_id
    };

    await medicacion.update({
      nombre: nombre || medicacion.nombre,
      dosis: dosis || medicacion.dosis,
      horario: horario || medicacion.horario,
      fecha_hora: fecha_hora !== undefined ? fecha_hora : medicacion.fecha_hora,
      cuidador_id: cuidador_id !== undefined ? cuidador_id : medicacion.cuidador_id,
      residente_id: residente_id !== undefined ? residente_id : medicacion.residente_id,
      estado: estado || medicacion.estado
    });

    if (oldData.fecha_hora && oldData.residente_id && oldData.cuidador_id) {
      const correspondingActivity = await Activity.findOne({
        where: {
          tipo: 'Medicamento',
          fecha: oldData.fecha_hora,
          residente_id: oldData.residente_id,
          cuidador_id: oldData.cuidador_id
        }
      });

      if (correspondingActivity) {
        await correspondingActivity.update({
          titulo: medicacion.nombre || 'Medicamento programado',
          descripcion: medicacion.dosis || '',
          fecha: medicacion.fecha_hora || correspondingActivity.fecha,
          residente_id: medicacion.residente_id || correspondingActivity.residente_id,
          cuidador_id: medicacion.cuidador_id || correspondingActivity.cuidador_id
        });
      }
    }

    const medicacionActualizada = await Medicacion.findByPk(id, {
      include: [
        {
          model: User,
          as: 'cuidador',
          attributes: ['id', 'name', 'email']
        },
        {
          model: Resident,
          as: 'residente',
          attributes: ['id', 'nombre', 'habitacion']
        }
      ]
    });

    res.status(200).json({
      success: true,
      data: medicacionActualizada,
      message: 'Medicación actualizada exitosamente (sincronizada con agenda)'
    });
  } catch (error) {
    next(error);
  }
};

export const deleteMedicacion = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    const medicacion = await Medicacion.findByPk(id);
    
    if (!medicacion) {
      return next(new AppError('Medicación no encontrada', 404));
    }

    if (medicacion.fecha_hora && medicacion.residente_id && medicacion.cuidador_id) {
      await Activity.destroy({
        where: {
          tipo: 'Medicamento',
          fecha: medicacion.fecha_hora,
          residente_id: medicacion.residente_id,
          cuidador_id: medicacion.cuidador_id
        }
      });
    }

    await medicacion.destroy();

    res.status(200).json({
      success: true,
      message: 'Medicación eliminada exitosamente (sincronizada con agenda)'
    });
  } catch (error) {
    next(error);
  }
};

export const getMedicacionesByResidente = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { residente_id } = req.params;

    const residente = await Resident.findByPk(residente_id);
    if (!residente) {
      return next(new AppError('Residente no encontrado', 404));
    }

    const medicaciones = await Medicacion.findAll({
      where: { residente_id },
      include: [
        {
          model: User,
          as: 'cuidador',
          attributes: ['id', 'name', 'email']
        }
      ],
      order: [['fecha_hora', 'ASC']]
    });

    res.status(200).json({
      success: true,
      count: medicaciones.length,
      data: medicaciones
    });
  } catch (error) {
    next(error);
  }
};

export const updateEstadoMedicacion = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { estado } = req.body;

    if (!estado) {
      return next(new AppError('El estado es requerido', 400));
    }

    const medicacion = await Medicacion.findByPk(id);
    
    if (!medicacion) {
      return next(new AppError('Medicación no encontrada', 404));
    }

    await medicacion.update({ estado });

    res.status(200).json({
      success: true,
      data: medicacion,
      message: 'Estado de medicación actualizado exitosamente'
    });
  } catch (error) {
    next(error);
  }
}; 

export const getMedicacionByFecha = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { fecha } = req.params; // espera formato: '2025-06-04'
    const startDate = new Date(`${fecha}T00:00:00.000Z`);
    const endDate = new Date(`${fecha}T23:59:59.999Z`);

    const medicaciones = await Medicacion.findAll({
      where: {
        fecha_hora: {
          [Op.between]: [startDate, endDate],
        },
      },
      include: [
        {
          model: Resident,
          attributes: ['id', 'nombre']
        },
        {
          model: User,
          attributes: ['id', 'name']
        }
      ],
      order: [['fecha_hora', 'ASC']],
    });

    res.status(200).json({
      success: true,
      data: medicaciones,
      count: medicaciones.length,
    });
  } catch (error) {
    console.log(error)
    next(error);
  }
};