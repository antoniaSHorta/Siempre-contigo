import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/errorHandler';

export const validateCreateMedicacion = (req: Request, res: Response, next: NextFunction) => {
  const { nombre, dosis, horario } = req.body;

  if (!nombre || typeof nombre !== 'string' || nombre.trim().length === 0) {
    return next(new AppError('El nombre de la medicación es requerido', 400));
  }

  if (!dosis || typeof dosis !== 'string' || dosis.trim().length === 0) {
    return next(new AppError('La dosis es requerida', 400));
  }

  if (!horario || typeof horario !== 'string' || horario.trim().length === 0) {
    return next(new AppError('El horario es requerido', 400));
  }

  if (nombre.length > 100) {
    return next(new AppError('El nombre no puede exceder 100 caracteres', 400));
  }

  if (dosis.length > 100) {
    return next(new AppError('La dosis no puede exceder 100 caracteres', 400));
  }

  if (horario.length > 100) {
    return next(new AppError('El horario no puede exceder 100 caracteres', 400));
  }

  next();
};

export const validateUpdateMedicacion = (req: Request, res: Response, next: NextFunction) => {
  const { nombre, dosis, horario, estado } = req.body;


  if (nombre !== undefined) {
    if (typeof nombre !== 'string' || nombre.trim().length === 0) {
      return next(new AppError('El nombre debe ser una cadena de texto válida', 400));
    }
    if (nombre.length > 100) {
      return next(new AppError('El nombre no puede exceder 100 caracteres', 400));
    }
  }

  if (dosis !== undefined) {
    if (typeof dosis !== 'string' || dosis.trim().length === 0) {
      return next(new AppError('La dosis debe ser una cadena de texto válida', 400));
    }
    if (dosis.length > 100) {
      return next(new AppError('La dosis no puede exceder 100 caracteres', 400));
    }
  }

  if (horario !== undefined) {
    if (typeof horario !== 'string' || horario.trim().length === 0) {
      return next(new AppError('El horario debe ser una cadena de texto válida', 400));
    }
    if (horario.length > 100) {
      return next(new AppError('El horario no puede exceder 100 caracteres', 400));
    }
  }

  if (estado !== undefined) {
    if (typeof estado !== 'string' || estado.trim().length === 0) {
      return next(new AppError('El estado debe ser una cadena de texto válida', 400));
    }
    const estadosValidos = ['pendiente', 'administrada', 'omitida', 'retrasada'];
    if (!estadosValidos.includes(estado)) {
      return next(new AppError('El estado debe ser: pendiente, administrada, omitida o retrasada', 400));
    }
  }

  next();
};

export const validateEstadoMedicacion = (req: Request, res: Response, next: NextFunction) => {
  const { estado } = req.body;

  if (!estado || typeof estado !== 'string') {
    return next(new AppError('El estado es requerido', 400));
  }

  const estadosValidos = ['pendiente', 'administrada', 'omitida', 'retrasada'];
  if (!estadosValidos.includes(estado)) {
    return next(new AppError('El estado debe ser: pendiente, administrada, omitida o retrasada', 400));
  }

  next();
}; 