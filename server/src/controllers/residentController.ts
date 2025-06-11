import { Request, Response, NextFunction } from 'express';
import { Resident } from '../models/Resident';
import { AppError } from '../utils/errorHandler';
import { User } from '../models/User';

export const getAllResidents = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const residents = await Resident.findAll({
      where: { activo: true },
      order: [['nombre', 'ASC']],
      include: [
        {
          model: User,
          as: 'cuidadores',
          attributes: ['id', 'name'],
          through: { attributes: [] } 
        },
        {
          model: User,
          as: 'familiares',
          attributes: ['id', 'name'],
          through: { attributes: [] } 
        }
      ],
    });

    console.log(residents)

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
    const residents = await Resident.findAll({
      order: [['nombre', 'ASC']],
      include: [
        {
          model: User,
          as: 'cuidadores',
          attributes: ['id', 'name'],
          through: { attributes: [] } 
        },
        {
          model: User,
          as: 'familiares',
          attributes: ['id', 'name'],
          through: { attributes: [] } 
        }
      ],
    });

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

export const getResidentsByRole = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const requestWithUser = req as Request & { user?: User };
    const user = requestWithUser.user;

    if (!user) {
      return res.status(401).json({ message: 'No autorizado' });
    }

    const {id: userId, role} = user

    let residents;

    if (role === 'Admin') {
      residents = await Resident.findAll({
        order: [['nombre', 'ASC']],
        include: [
          { model: User, as: 'cuidadores', attributes: ['id', 'name'] },
          { model: User, as: 'familiares', attributes: ['id', 'name'] }
        ]
      });
    } else if (role === 'Cuidador') {
      residents = await Resident.findAll({
        where: { activo: true },
        include: [
          {
            model: User,
            as: 'cuidadores',
            where: { id: userId },
            attributes: [], 
          },
        ],
        order: [['nombre', 'ASC']],
      });
    } else if (role === 'Familiar') {
      residents = await Resident.findAll({
        where: { activo: true },
        include: [
          {
            model: User,
            as: 'familiares',
            where: { id: userId },
            attributes: [],
          },
        ],
        order: [['nombre', 'ASC']],
      });
    } else {
      return next(new AppError('Rol no autorizado para esta acción', 403));
    }

    res.json({
      success: true,
      data: residents,
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