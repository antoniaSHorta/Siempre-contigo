import { Request, Response, NextFunction } from 'express';
import { Activity } from '../models/Activity';
import { User } from '../models/User';
import { AppError } from '../utils/errorHandler';
import { Op } from 'sequelize';

export const createActivity = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { fecha, titulo, descripcion, tipo, residente_id, lugar, estado } = req.body;
    const requestWithUser = req as Request & { user?: any };

    if (!requestWithUser.user?.id) {
      return next(new AppError('No autenticado', 401));
    }

    const activity = await Activity.create({
      fecha: new Date(fecha),
      titulo,
      descripcion,
      tipo,
      residente_id,
      lugar,
      estado: estado || 'Incompleto',
      cuidador_id: requestWithUser.user.id
    });

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
          attributes: ['id', 'name', 'role']
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
          attributes: ['id', 'name', 'role']
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


    await activity.update({
      fecha: fecha ? new Date(fecha) : activity.fecha,
      titulo: titulo || activity.titulo,
      descripcion: descripcion || activity.descripcion,
      tipo: tipo || activity.tipo,
      residente_id: residente_id || activity.residente_id,
      lugar: lugar || activity.lugar,
      estado: estado || activity.estado
    });

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

    await activity.destroy();

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    next(error);
  }
}; 