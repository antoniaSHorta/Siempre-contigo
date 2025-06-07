import { Request, Response, NextFunction } from 'express';
import axios from 'axios';
import { AppError } from '../utils/errorHandler';
import { User } from '../models/User';
import { config } from '../config/config';
import { Resident } from '../models/Resident';
import { ResidentesCuidadores } from '../models/ResidentesCuidadores';
import { ResidentesFamiliares } from '../models/ResidentesFamiliares';
import { Op } from 'sequelize';

interface RequestWithUser extends Request {
  user?: User;
}

const talkjsAPI = axios.create({
  baseURL: `https://api.talkjs.com/v1/${config.talkjs.appId}`,
  headers: {
    Authorization: `Bearer ${config.talkjs.secretKey}`,
    'Content-Type': 'application/json',
  },
});

export const createConversationHttp = async (req: RequestWithUser, res: Response, next: NextFunction) => {
    const user = req.user;
    const { title, participants: participantIds } = req.body;

    if (!user) {
        return next(new AppError('Usuario no autenticado.', 401));
    }
    if (!participantIds || !Array.isArray(participantIds) || participantIds.length === 0) {
        return next(new AppError('Se requiere al menos un participante.', 400));
    }

    const allParticipants = Array.from(new Set([user.id.toString(), ...participantIds]));
    const conversationId = allParticipants.sort().join('_');
    const conversationUrl = `/conversations/${conversationId}`;

    try {
        const conversationResponse = await talkjsAPI.put(
            conversationUrl,
            {
                participants: allParticipants,
                subject: title,
            }
        );
        res.status(201).json(conversationResponse.data);
    } catch (error) {
        if (axios.isAxiosError(error)) {
            console.error('Error de TalkJS al crear conversación:', error.response?.data);
            return next(new AppError(error.response?.data?.message || 'Error al crear la conversación en TalkJS.', error.response?.status || 500));
        }
        next(error);
    }
};

export const getConversationsHttp = async (req: RequestWithUser, res: Response, next: NextFunction) => {
    const user = req.user;

    if (!user) {
        return next(new AppError('Usuario no autenticado.', 401));
    }

    try {
        const talkJSResponse = await talkjsAPI.get(`/users/${user.id}/conversations`, {
            params: { limit: 50 }
        });
        res.status(200).json(talkJSResponse.data);
    } catch (error) {
        if (axios.isAxiosError(error)) {
            console.error('Error de TalkJS al obtener conversaciones:', error.response?.data);
            return next(new AppError(error.response?.data?.message || 'Error al obtener conversaciones.', error.response?.status || 500));
        }
        next(error);
    }
};

export const getMessagesFromConversation = async (req: Request, res: Response, next: NextFunction) => {
    const { conversationId } = req.params;

    try {
        const talkJSResponse = await talkjsAPI.get(`/conversations/${conversationId}/messages`, {
            params: { limit: 100 }
        });
        res.status(200).json(talkJSResponse.data);
    } catch (error) {
        if (axios.isAxiosError(error)) {
            console.error('Error de TalkJS al obtener mensajes:', error.response?.data);
            return next(new AppError(error.response?.data?.message || 'Error al obtener mensajes.', error.response?.status || 500));
        }
        next(error);
    }
};

export const sendMessageHttp = async (req: RequestWithUser, res: Response, next: NextFunction) => {
    const { conversationId } = req.params;
    const { text } = req.body;
    const user = req.user;
    
    if (!user) {
        return next(new AppError('Usuario no autenticado.', 401));
    }
    if (!text) {
        return next(new AppError('El texto del mensaje es requerido.', 400));
    }

    try {
        const messagePayload = [{
            text,
            sender: user.id.toString(),
            type: 'UserMessage'
        }];

        await talkjsAPI.post(`/conversations/${conversationId}/messages`, messagePayload);
        res.status(201).json({ success: true, message: 'Mensaje enviado.' });
    } catch (error) {
        if (axios.isAxiosError(error)) {
            console.error('Error de TalkJS al enviar mensaje:', error.response?.data);
            return next(new AppError(error.response?.data?.message || 'Error al enviar el mensaje.', error.response?.status || 500));
        }
        next(error);
    }
};

export const updateConversationHttp = async (req: Request, res: Response, next: NextFunction) => {
  const { id } = req.params;
  const updates = req.body;
  try {
    const { data } = await talkjsAPI.patch(`/conversations/${id}`, updates);
    res.status(200).json({ success: true, data, message: 'Conversación actualizada' });
  } catch (error) {
    next(error);
  }
};

export const deleteConversation = async (req: Request, res: Response, next: NextFunction) => {
  const { id } = req.params;

  try {
    await talkjsAPI.delete(`/conversations/${id}`);

    res.status(200).json({
      success: true,
      message: 'Conversacion eliminada',
    });
  } catch (error) {
    next(error);
  }
};

export const deleteMessageHttp = async (req: Request, res: Response, next: NextFunction) => {
    const { messageId } = req.params;

    if (!messageId) {
        return next(new AppError('Se requiere el ID del mensaje.', 400));
    }

    try {
        await talkjsAPI.delete(`/messages/${messageId}`);
        res.status(200).json({ success: true, message: 'Mensaje eliminado correctamente en el servidor.' });
    } catch (error) {
        if (axios.isAxiosError(error)) {
            console.error('Error de TalkJS al eliminar mensaje:', error.response?.data);
            return next(new AppError(error.response?.data?.message || 'Error al eliminar el mensaje.', error.response?.status || 500));
        }
        next(error);
    }
};

export const getAvailableContacts = async (req: RequestWithUser, res: Response, next: NextFunction) => {
    const { userId } = req.params;
    // Asumiendo que el rol del usuario se obtiene de req.user (por ejemplo, después de la autenticación)
    const requestingUserRole = req.user?.role; 

    if (!userId) {
        return next(new AppError('Se requiere el ID del usuario.', 400));
    }

    try {
        let allContacts: User[] = [];
        let totalCount: number = 0;

        // --- Caso para Administrador ---
        if (requestingUserRole === 'Admin') {
            // Un administrador puede ver todos los usuarios con roles de 'familiar' o 'cuidador'
            const allUsers = await User.findAll({
                where: {
                    // Puedes añadir un filtro por tipo de usuario si tu modelo User tiene un campo 'type' o 'role'
                    // Por ejemplo: type: { [Op.in]: ['familiar', 'cuidador'] }
                    // Si no tienes un campo de tipo, simplemente traerá todos los usuarios
                },
                attributes: ['id', 'name'],
                order: [['name', 'ASC']]
            });

            allContacts = allUsers;
            totalCount = allUsers.length;

        } else {
            // --- Lógica existente para usuarios que son familiares o cuidadores ---
            // Encontrar todos los residentes relacionados con el usuario (ya sea familiar o cuidador)
            const residentes = await Resident.findAll({
                include: [
                    {
                        model: User,
                        as: 'familiares',
                        through: {
                            where: { familiar_id: userId },
                            attributes: []
                        },
                        attributes: ['id', 'name'],
                        required: false // Usar required: false para LEFT JOIN y no omitir residentes que solo tienen relación con el otro tipo de usuario
                    },
                    {
                        model: User,
                        as: 'cuidadores',
                        through: {
                            where: { cuidador_id: userId },
                            attributes: []
                        },
                        attributes: ['id', 'name'],
                        required: false // Usar required: false para LEFT JOIN
                    }
                ],
                // Añadir un where para asegurar que al menos una de las asociaciones exista para el userId dado
                // Esto es crucial para que la consulta no traiga TODOS los residentes cuando el userId no es ni familiar ni cuidador de ellos
                where: {
                    [Op.or]: [
                        { '$familiares.id$': { [Op.ne]: null } }, // Si hay familiares asociados
                        { '$cuidadores.id$': { [Op.ne]: null } }  // Si hay cuidadores asociados
                    ]
                }
            });

            const uniqueContacts: User[] = [];
            residentes.forEach(residente => {
                if (residente.familiares) {
                    residente.familiares.forEach(familiar => {
                        if (!uniqueContacts.some(contact => contact.id === familiar.id)) {
                            uniqueContacts.push(familiar);
                        }
                    });
                }
                if (residente.cuidadores) {
                    residente.cuidadores.forEach(cuidador => {
                        if (!uniqueContacts.some(contact => contact.id === cuidador.id)) {
                            uniqueContacts.push(cuidador);
                        }
                    });
                }
            });
            
            allContacts = uniqueContacts;
            totalCount = uniqueContacts.length;
        }

        res.status(200).json({
            success: true,
            data: allContacts,
            count: totalCount,
        });

    } catch (error) {
        console.log(`Error al conseguir contactos del usuario ${userId}, error: ${error}`);
        next(error);
    }
};