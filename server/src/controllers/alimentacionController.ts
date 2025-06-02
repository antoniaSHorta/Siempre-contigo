import { Request, Response, NextFunction } from 'express';
import { Alimentacion } from '../models/Alimentacion';
import { Resident } from '../models/Resident';
import { User } from '../models/User';
import { AppError } from '../utils/errorHandler';

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

    res.status(201).json({
      success: true,
      data: alimentacion,
      message: 'Alimentación creada exitosamente',
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
          attributes: ['id', 'nombre']
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
          attributes: ['id', 'nombre']
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

    await alimentacion.update({
      tipo: tipo !== undefined ? tipo : alimentacion.tipo,
      descripcion: descripcion !== undefined ? descripcion : alimentacion.descripcion,
      hora: hora !== undefined ? hora : alimentacion.hora,
      fecha_hora: fecha_hora !== undefined ? fecha_hora : alimentacion.fecha_hora,
      residente_id: residente_id !== undefined ? residente_id : alimentacion.residente_id,
      cuidador_id: cuidador_id !== undefined ? cuidador_id : alimentacion.cuidador_id,
    });

    res.status(200).json({
      success: true,
      data: alimentacion,
      message: 'Alimentación actualizada exitosamente',
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

    await alimentacion.destroy();

    res.status(200).json({
      success: true,
      message: 'Alimentación eliminada exitosamente',
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
          attributes: ['id', 'nombre']
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
          attributes: ['id', 'nombre']
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