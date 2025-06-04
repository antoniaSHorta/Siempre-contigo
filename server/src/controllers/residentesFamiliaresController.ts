import { Request, Response } from 'express';
import { Resident } from '../models/Resident';
import { User } from '../models/User';

export const asignarFamiliares = async (req: Request, res: Response) => {
    try {
        const { residenteId } = req.params;
        const { familiares } = req.body;

        const residente = await Resident.findByPk(residenteId);
        if (!residente) {
            return res.status(404).json({ mensaje: 'Residente no encontrado' });
        }

        const familiaresExistentes = await User.findAll({
            where: { id: familiares },
        });

        if (familiaresExistentes.length !== familiares.length) {
            return res.status(400).json({ mensaje: 'Uno o más familiares no existen' });
        }


        await residente.$add('familiares', familiares);
        res.status(201).json({ mensaje: 'Familiaesr asignados al residente' });
    } catch (error) {
        res.status(500).json({ error: 'Error al asignar familiar', detalles: error });
    }
};

export const eliminarFamiliares = async (req: Request, res: Response) => {
    try {
        const { residenteId, familiarId } = req.params;

        const { familiares } = req.body;

        const residente = await Resident.findByPk(residenteId);
        if (!residente) {
            return res.status(404).json({ mensaje: 'Residente no encontrado' });
        }

        const familiaresExistentes = await User.findAll({
            where: { id: familiares },
        });

        if (familiaresExistentes.length !== familiares.length) {
            return res.status(400).json({ mensaje: 'Uno o más familiares no existen' });
        }

        res.status(201).json({ mensaje: 'Familiares eliminados del residente' });
    } catch (error) {
        res.status(500).json({ error: 'Error al eliminar familiar', detalles: error });
    }
};

export const actualizarFamiliares = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { familiares } = req.body;

        const residente = await Resident.findByPk(id);
        if (!residente) {
            return res.status(404).json({ mensaje: 'Residente no encontrado' });
        }

        const familiaresExistentes = await User.findAll({
            where: { id: familiares },
        });

        if (familiaresExistentes.length !== familiares.length) {
            return res.status(400).json({ mensaje: 'Uno o más familiares no existen' });
        }

        await residente.$set('familiares', familiaresExistentes);

        res.status(201).json({ mensaje: 'Familiares actualizados correctamente' });
    } catch (error) {
        res.status(500).json({ error: 'Error al actualizar familiares', detalles: error });
    }
};

