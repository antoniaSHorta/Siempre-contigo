import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/errorHandler';
import jwt from 'jsonwebtoken';
import { config } from '../config/config';
import { User } from '../models/User';

export const protect = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return next(new AppError('Not authorized to access this route', 401));
    }

    try {
      const decoded = jwt.verify(token, config.jwtSecret) as { id: number };
      
      const user = await User.findByPk(decoded.id);
      if (!user) {
        return next(new AppError('User not found', 404));
      }

      (req as Request & { user: User }).user = user;
      next();
    } catch (error) {
      return next(new AppError('Not authorized to access this route', 401));
    }
  } catch (error) {
    next(error);
  }
};

export const authorize = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const requestWithUser = req as Request & { user?: User };
    
    if (!requestWithUser.user) {
      return next(new AppError('Not authorized to access this route', 401));
    }

    if (!roles.includes(requestWithUser.user.role)) {
      return next(new AppError('Not authorized to access this route', 403));
    }
    next();
  };
}; 