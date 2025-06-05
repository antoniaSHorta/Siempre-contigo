import { Request, Response } from 'express';
import { Resident } from '../models/Resident';
import { User } from '../models/User';

export const asignarCuidadores = async (req: Request, res: Response) => {
    try {
        const { residenteId } = req.params;
        const { cuidadores } = req.body;
        

        const residente = await Resident.findByPk(residenteId);
        if (!residente) {
            return res.status(404).json({ mensaje: 'Residente no encontrado' });
        }

        const cuidadoresExistentes = await User.findAll({
            where: { id: cuidadores },
        });

        if (cuidadoresExistentes.length !== cuidadores.length) {
            return res.status(400).json({ mensaje: 'Uno o más cuidadores no existen' });
        }

        await residente.$add('cuidadores', cuidadoresExistentes);
        res.status(201).json({ mensaje: 'Cuidadores asignados al residente' });
    } catch (error) {
        res.status(500).json({ error: 'Error al asignar cuidador', detalles: error });
    }
};

export const eliminarCuidadores = async (req: Request, res: Response) => {
    try {
        const { residenteId} = req.params;
        const { cuidadores } = req.body;    

        const residente = await Resident.findByPk(residenteId);
        if (!residente) {
            return res.status(404).json({ mensaje: 'Residente no encontrado' });
        }

        const cuidadoresExistentes = await User.findAll({
            where: { id: cuidadores },
        });

        if (cuidadoresExistentes.length !== cuidadores.length) {
            return res.status(400).json({ mensaje: 'Uno o más cuidadores no existen' });
        }

        await residente.$remove('cuidadores', cuidadoresExistentes);
        res.status(201).json({ mensaje: 'Cuidadores eliminados del residente' });
    } catch (error) {
        res.status(500).json({ error: 'Error al eliminar cuidador', detalles: error });
    }
};

export const actualizarCuidadores = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { cuidadores } = req.body; 

        const residente = await Resident.findByPk(id);
        if (!residente) {
            return res.status(404).json({ mensaje: 'Residente no encontrado' });
        }

        const cuidadoresExistentes = await User.findAll({
            where: { id: cuidadores },
        });

        if (cuidadoresExistentes.length !== cuidadores.length) {
            return res.status(400).json({ mensaje: 'Uno o más cuidadores no existen' });
        }
        await residente.$set('cuidadores', cuidadoresExistentes);

        res.status(201).json({ mensaje: 'Cuidadores actualizados correctamente' });
    } catch (error) {
        res.status(500).json({ error: 'Error al actualizar cuidadores', detalles: error });
    }
};
