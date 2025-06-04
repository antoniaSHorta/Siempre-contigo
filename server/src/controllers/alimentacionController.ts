import { Request, Response, NextFunction } from 'express';
import { Alimentacion } from '../models/Alimentacion';
import { Activity } from '../models/Activity';
import { Resident } from '../models/Resident';
import { User } from '../models/User';
import { AppError } from '../utils/errorHandler';
import { Op } from 'sequelize';

export const createAlimentacion = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { tipo, descripcion, hora, fecha_hora, residente_id, cuidador_id } = req.body;
    const alimentacion = await Alimentacion.create({
      tipo,
      descripcion,
      hora,
      fecha_hora,
      residente_id,
      cuidador_id,
    });

    const existingActivity = await Activity.findOne({
      where: {
        tipo: 'Alimentacion',
        fecha: new Date(fecha_hora),
        residente_id: residente_id,
        cuidador_id: cuidador_id
      }
    });

    if (!existingActivity && fecha_hora && residente_id && cuidador_id) {
      await Activity.create({
        titulo: tipo || 'Alimentación programada',
        descripcion: descripcion || '',
        fecha: new Date(fecha_hora),
        tipo: 'Alimentacion',
        residente_id,
        cuidador_id,
        lugar: 'Comedor',
        estado: 'Pendiente'
      });
    }

    res.status(201).json({
      success: true,
      data: alimentacion,
      message: 'Alimentación creada exitosamente (sincronizada con agenda)',
    });
  } catch (error) {
    next(error);
  }
};

export const getAllAlimentaciones = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const alimentaciones = await Alimentacion.findAll({
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
      order: [['hora', 'ASC']],
    });

    res.status(200).json({
      success: true,
      data: alimentaciones,
      count: alimentaciones.length,
    });
  } catch (error) {
    next(error);
  }
};

export const getAlimentacionById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    const alimentacion = await Alimentacion.findByPk(id, {
      include: [
        {
          model: Resident,
          attributes: ['id', 'nombre']
        },
        {
          model: User,
          attributes: ['id', 'name']
        }
      ]
    });

    if (!alimentacion) {
      return next(new AppError('Alimentación no encontrada', 404));
    }

    res.status(200).json({
      success: true,
      data: alimentacion,
    });
  } catch (error) {
    next(error);
  }
};

export const updateAlimentacion = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { tipo, descripcion, hora, fecha_hora, residente_id, cuidador_id } = req.body;

    const alimentacion = await Alimentacion.findByPk(id);

    if (!alimentacion) {
      return next(new AppError('Alimentación no encontrada', 404));
    }

    const oldData = {
      fecha_hora: alimentacion.fecha_hora,
      residente_id: alimentacion.residente_id,
      cuidador_id: alimentacion.cuidador_id
    };

    await alimentacion.update({
      tipo: tipo !== undefined ? tipo : alimentacion.tipo,
      descripcion: descripcion !== undefined ? descripcion : alimentacion.descripcion,
      hora: hora !== undefined ? hora : alimentacion.hora,
      fecha_hora: fecha_hora !== undefined ? fecha_hora : alimentacion.fecha_hora,
      residente_id: residente_id !== undefined ? residente_id : alimentacion.residente_id,
      cuidador_id: cuidador_id !== undefined ? cuidador_id : alimentacion.cuidador_id,
    });

    if (oldData.fecha_hora && oldData.residente_id && oldData.cuidador_id) {
      const correspondingActivity = await Activity.findOne({
        where: {
          tipo: 'Alimentacion',
          fecha: oldData.fecha_hora,
          residente_id: oldData.residente_id,
          cuidador_id: oldData.cuidador_id
        }
      });

      if (correspondingActivity) {
        await correspondingActivity.update({
          titulo: alimentacion.tipo || 'Alimentación programada',
          descripcion: alimentacion.descripcion || '',
          fecha: alimentacion.fecha_hora || correspondingActivity.fecha,
          residente_id: alimentacion.residente_id || correspondingActivity.residente_id,
          cuidador_id: alimentacion.cuidador_id || correspondingActivity.cuidador_id
        });
      }
    }

    res.status(200).json({
      success: true,
      data: alimentacion,
      message: 'Alimentación actualizada exitosamente (sincronizada con agenda)',
    });
  } catch (error) {
    next(error);
  }
};

export const deleteAlimentacion = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    const alimentacion = await Alimentacion.findByPk(id);

    if (!alimentacion) {
      return next(new AppError('Alimentación no encontrada', 404));
    }

    // Buscar y eliminar la actividad correspondiente
    if (alimentacion.fecha_hora && alimentacion.residente_id && alimentacion.cuidador_id) {
      await Activity.destroy({
        where: {
          tipo: 'Alimentacion',
          fecha: alimentacion.fecha_hora,
          residente_id: alimentacion.residente_id,
          cuidador_id: alimentacion.cuidador_id
        }
      });
    }

    await alimentacion.destroy();

    res.status(200).json({
      success: true,
      message: 'Alimentación eliminada exitosamente (sincronizada con agenda)',
    });
  } catch (error) {
    next(error);
  }
};

export const getAlimentacionesByTipo = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { tipo } = req.params;

    const alimentaciones = await Alimentacion.findAll({
      where: { tipo },
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
      order: [['hora', 'ASC']],
    });

    res.status(200).json({
      success: true,
      data: alimentaciones,
      count: alimentaciones.length,
    });
  } catch (error) {
    next(error);
  }
};

export const getAlimentacionesByFecha = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { fecha } = req.params; // espera formato: '2025-06-04'
    const startDate = new Date(`${fecha}T00:00:00.000Z`);
    const endDate = new Date(`${fecha}T23:59:59.999Z`);

    const alimentaciones = await Alimentacion.findAll({
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
      data: alimentaciones,
      count: alimentaciones.length,
    });
  } catch (error) {
    console.log(error)
    next(error);
  }
};


export const getAlimentacionesByResidente = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { residente_id } = req.params;

    const alimentaciones = await Alimentacion.findAll({
      where: { residente_id },
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
      data: alimentaciones,
      count: alimentaciones.length,
    });
  } catch (error) {
    next(error);
  }
}; 