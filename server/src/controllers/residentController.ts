import { Request, Response, NextFunction } from 'express';
import { Resident } from '../models/Resident';
import { AppError } from '../utils/errorHandler';
import { User } from '../models/User';

export const getAllResidents = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const residents = await Resident.findAll({
      where: { activo: true },
      order: [['nombre', 'ASC']]
    });

    res.json({
      success: true,
      data: residents
    });
  } catch (error) {
    next(error);
  }
};

export const getAllResidentsInactiveAndActive = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const residents = await Resident.findAll();

    res.json({
      success: true,
      data: residents
    });
  } catch (error) {
    next(error);
  }
};

export const getResidentById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const resident = await Resident.findByPk(id,{
      include: [
      { model: User, as: 'cuidadores', attributes: ['id', 'name'] },
      { model: User, as: 'familiares', attributes: ['id', 'name'] }
    ]
    });

    if (!resident) {
      return next(new AppError('Residente no encontrado', 404));
    }

    res.json({
      success: true,
      data: resident
    });
  } catch (error) {
    next(error);
  }
};

export const createResident = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { nombre, nacimiento, estado_salud, habitacion, ingreso } = req.body;

    const resident = await Resident.create({
      nombre,
      nacimiento: nacimiento ? new Date(nacimiento) : null,
      estado_salud,
      habitacion,
      ingreso: ingreso ? new Date(ingreso) : null,
      activo: true
    });

    res.status(201).json({
      success: true,
      data: resident
    });
  } catch (error) {
    next(error);
  }
};

export const updateResident = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { nombre, nacimiento, estado_salud, habitacion, ingreso } = req.body;

    const resident = await Resident.findByPk(id);

    if (!resident) {
      return next(new AppError('Residente no encontrado', 404));
    }

    await resident.update({
      nombre,
      nacimiento: nacimiento ? new Date(nacimiento) : null,
      estado_salud,
      habitacion,
      ingreso: ingreso ? new Date(ingreso) : null
    });

    res.json({
      success: true,
      data: resident
    });
  } catch (error) {
    next(error);
  }
};

export const activateResident = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    const resident = await Resident.findByPk(id);

    if (!resident) {
      return next(new AppError('Residente no encontrado', 404));
    }

    await resident.update({ activo: true });

    res.json({
      success: true,
      message: 'Residente eliminado correctamente'
    });
  } catch (error) {
    next(error);
  }
};

export const deleteResident = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    const resident = await Resident.findByPk(id);

    if (!resident) {
      return next(new AppError('Residente no encontrado', 404));
    }

    await resident.update({ activo: false });

    res.json({
      success: true,
      message: 'Residente eliminado correctamente'
    });
  } catch (error) {
    next(error);
  }
}; 