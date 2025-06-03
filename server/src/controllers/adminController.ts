import { Request, Response, NextFunction } from 'express';
import { User } from '../models/User';
import { AppError } from '../utils/errorHandler';

export const createUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { name, email, password, role } = req.body;

        const allowedRoles = ['Cuidador', 'Familiar'];
        if (!allowedRoles.includes(role)) {
            return next(new AppError('Invalid role specified', 400));
        }

        const userExists = await User.findOne({ where: { email } });
        if (userExists) {
            return next(new AppError('User already exists', 400));
        }

        const newUser = await User.create({ name, email, password, role });

        res.status(201).json({
            success: true,
            user: {
                id: newUser.id,
                name: newUser.name,
                email: newUser.email,
                role: newUser.role,
            },
        });
    } catch (error) {
        next(error);
    }
};

export const getAllUsers = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const users = await User.findAll({
            attributes: ['id', 'name', 'email', 'role', 'isActive'],
        });

        res.status(200).json({
            success: true,
            users,
        });
    } catch (error) {
        next(error);
    }
};

export const getUserById = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        const user = await User.findByPk(id, {
            attributes: ['id', 'name', 'email', 'role', 'isActive'],
        });

        if (!user) {
            return next(new AppError('User not found', 404));
        }

        res.status(200).json({
            success: true,
            user,
        });
    } catch (error) {
        next(error);
    }
};

export const updateUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        const { name, email, password, role } = req.body;

        const user = await User.findByPk(id);
        if (!user) {
            return next(new AppError('User not found', 404));
        }

        if (role && !['Cuidador', 'Familiar'].includes(role)) {
            return next(new AppError('Invalid role specified', 400));
        }

        if (name) user.name = name;
        if (email) user.email = email;
        if (password) user.password = password; 
        if (role) user.role = role;

        await user.save();

        res.status(200).json({
            success: true,
            message: 'User updated successfully',
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

export const toggleStatusUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        const { isActive } = req.body;

        const user = await User.findByPk(id);
        if (!user) {
            return next(new AppError('User not found', 404));
        }

        user.isActive = isActive;
        await user.save();

        res.status(200).json({
            success: true,
            message: `User ${isActive ? 'activated' : 'deactivated'} successfully`,
        });
    } catch (error) {
        next(error);
    }
};

export const checkEmail = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { email } = req.body;

        if (!email || typeof email !== 'string') {
            return next(new AppError('Email is required and must be a string', 400));
        }

        const user = await User.findOne({ where: { email } });

        res.status(200).json({
            success: true,
            exists: !!user,
        });
    } catch (error) {
        next(error);
    }
};
