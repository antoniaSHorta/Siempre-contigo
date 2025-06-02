import { Request, Response, NextFunction } from 'express';
import { Alimentacion } from '../models/Alimentacion';
import { AppError } from '../utils/errorHandler';

export const createAlimentacion = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { tipo, descripcion, hora } = req.body;

    const alimentacion = await Alimentacion.create({
      tipo,
      descripcion,
      hora,
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

    const alimentacion = await Alimentacion.findByPk(id);

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
    const { tipo, descripcion, hora } = req.body;

    const alimentacion = await Alimentacion.findByPk(id);

    if (!alimentacion) {
      return next(new AppError('Alimentación no encontrada', 404));
    }

    await alimentacion.update({
      tipo: tipo !== undefined ? tipo : alimentacion.tipo,
      descripcion: descripcion !== undefined ? descripcion : alimentacion.descripcion,
      hora: hora !== undefined ? hora : alimentacion.hora,
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