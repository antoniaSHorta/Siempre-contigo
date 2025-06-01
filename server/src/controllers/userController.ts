import { Request, Response, NextFunction } from 'express';
import { User } from '../models/User';
import { AppError } from '../utils/errorHandler';
import jwt from 'jsonwebtoken';
import { config } from '../config/config';

const generateToken = (id: number): string => {
  return jwt.sign(
    { id },
    config.jwtSecret as jwt.Secret,
    { expiresIn: config.jwtExpiresIn } as jwt.SignOptions
  );
};

export const register = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, email, password } = req.body;

    const userExists = await User.findOne({ where: { email } });
    if (userExists) {
      return next(new AppError('Usuario ya existe', 400));
    }

    const user = await User.create({
      name,
      email,
      password,
    });

    const token = generateToken(user.id);

    res.status(201).json({
      success: true,
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ where: { email } });
    
    if (!user) {
      return next(new AppError('Credenciales inválidas', 401));
    }

    const isMatch = await user.comparePassword(password);

    if (!isMatch) {
      return next(new AppError('Credenciales inválidas', 401));
    }

    const token = generateToken(user.id);

    res.status(200).json({
      success: true,
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        location: user.location,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getMe = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const requestWithUser = req as Request & { user?: User };
    const userId = requestWithUser.user?.id;

    if (!userId) {
      return next(new AppError('No autenticado', 401));
    }

    const user = await User.findByPk(userId);
    if (!user) {
      return next(new AppError('Usuario no encontrado', 404));
    }

    res.status(200).json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        location: user.location,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const logout = async (req: Request, res: Response, next: NextFunction) => {
  try {
    res.status(200).json({
      success: true,
      message: 'Sesión cerrada exitosamente'
    });
  } catch (error) {
    next(error);
  }
};

export const updateProfile = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const requestWithUser = req as Request & { user?: User };
    const userId = requestWithUser.user?.id;

    if (!userId) {
      return next(new AppError('No autenticado', 401));
    }

    const { name, email, phone, location } = req.body;

    if (email) {
      const existingUser = await User.findOne({ where: { email } });
      if (existingUser && existingUser.id !== userId) {
        return next(new AppError('El correo electrónico ya está en uso', 400));
      }
    }

    const user = await User.findByPk(userId);
    if (!user) {
      return next(new AppError('Usuario no encontrado', 404));
    }

    await user.update({
      name: name || user.name,
      email: email || user.email,
      phone: phone || user.phone,
      location: location || user.location,
    });

    res.status(200).json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        location: user.location,
        role: user.role,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const updatePassword = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const requestWithUser = req as Request & { user?: User };
    const userId = requestWithUser.user?.id;

    if (!userId) {
      return next(new AppError('No autenticado', 401));
    }

    const { currentPassword, newPassword } = req.body;

    const user = await User.findByPk(userId);
    if (!user) {
      return next(new AppError('Usuario no encontrado', 404));
    }

    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return next(new AppError('La contraseña actual es incorrecta', 401));
    }

    await user.update({ password: newPassword });

    res.status(200).json({
      success: true,
      message: 'Contraseña actualizada exitosamente',
    });
  } catch (error) {
    next(error);
  }
}; 