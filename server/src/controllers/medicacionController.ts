import { Request, Response, NextFunction } from 'express';
import { Medicacion } from '../models/Medicacion';
import { User } from '../models/User';
import { Resident } from '../models/Resident';
import { AppError } from '../utils/errorHandler';

export const createMedicacion = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { nombre, dosis, horario, cuidador_id, residente_id, estado } = req.body;

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

    const medicacion = await Medicacion.create({
      nombre,
      dosis,
      horario,
      cuidador_id,
      residente_id,
      estado: estado || 'pendiente'
    });

    res.status(201).json({
      success: true,
      data: medicacion,
      message: 'Medicación creada exitosamente'
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
    const { nombre, dosis, horario, cuidador_id, residente_id, estado } = req.body;

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

    await medicacion.update({
      nombre: nombre || medicacion.nombre,
      dosis: dosis || medicacion.dosis,
      horario: horario || medicacion.horario,
      cuidador_id: cuidador_id !== undefined ? cuidador_id : medicacion.cuidador_id,
      residente_id: residente_id !== undefined ? residente_id : medicacion.residente_id,
      estado: estado || medicacion.estado
    });

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
      message: 'Medicación actualizada exitosamente'
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

    await medicacion.destroy();

    res.status(200).json({
      success: true,
      message: 'Medicación eliminada exitosamente'
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
      order: [['horario', 'ASC']]
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