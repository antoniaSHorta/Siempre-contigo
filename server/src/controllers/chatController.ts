import { Request, Response, NextFunction } from 'express';
import axios from 'axios';
import multer from 'multer';
import fs from 'fs';
import FormData from 'form-data';
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

const upload = multer({ dest: 'uploads/' });

const talkjsAPI = axios.create({
  baseURL: `https://api.talkjs.com/v1/${config.talkjs.appId}`,
  headers: {
    Authorization: `Bearer ${config.talkjs.secretKey}`,
    'Content-Type': 'application/json',
  },
});

export const createConversationHttp = async (req: RequestWithUser, res: Response, next: NextFunction) => {
    const user = req.user;
    const { title, participants: participantIds, subject } = req.body;

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
                subject: subject,
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
    const { text, attachmentToken } = req.body; // text will be the placeholder for files, or actual message
    const currentUser = req.user;

    if (!currentUser) {
        return next(new AppError('Usuario no autenticado.', 401));
    }

    // Ensure at least one form of content is present
    if (!text && !attachmentToken) {
        return next(new AppError('El mensaje o el adjunto son requeridos.', 400));
    }

    console.log(`Attachment token recibido: ${attachmentToken || 'N/A'}. Texto: "${text}"`);

    try {
        let messagePayload: any;

        // Case 1: Sending an attachment (with or without a text description)
        if (attachmentToken) {
            const contentBlocks: any[] = [];

            // If there's text, add it as a text block within content
            // NOTE: If TalkJS truly doesn't allow mixed content for the `multiple_body_params` error,
            // this part might still be problematic if the text is not purely decorative for the attachment.
            // However, based on their "mixed-content" claim, this is the way to try.
            // If this still fails, we'll have to remove the text content block from attachments.
            if (text && text.trim() !== '' && text.trim() !== '[Archivo adjunto]') { // Avoid adding placeholder text as actual content
                 contentBlocks.push({
                     type: 'text',
                     children: [{ type: 'text', text: text.trim() }]
                 });
            }

            // Add the file block
            contentBlocks.push({
                type: 'file',
                fileToken: attachmentToken
            });

            // Construct the payload for a file message
            messagePayload = {
                sender: currentUser.id.toString(),
                type: 'UserMessage',
                content: contentBlocks, // Message content (file + optional text description)
                // OMIT THE TOP-LEVEL 'text' FIELD WHEN USING 'content' WITH FILES
                // text: text || '', // This was the likely cause of 'multiple_body_params' if content is also present
            };

            // If you still want the `text` field for *previews/notifications* (and TalkJS allows it
            // when `content` is also present for files), you could conditionally add it back *here*,
            // but the error suggests it's problematic when `content` contains text parts.
            // For now, let's omit it to fix 'multiple_body_params'
            if (text && text.trim()) {
                messagePayload.text = text.trim(); // Add back if it works for *file messages*, for summary only
            }


        } else { // Case 2: Sending only a text message (no attachmentToken)
            // Construct the payload for a pure text message
            messagePayload = {
                sender: currentUser.id.toString(),
                type: 'UserMessage',
                text: text.trim(), // Use the top-level text field for pure text messages
                // OMIT THE 'content' FIELD FOR PURE TEXT MESSAGES
                // content: [{ type: 'text', children: [{ type: 'text', text: text.trim() }] }],
            };
        }

        // TalkJS API always expects an array of messages
        const finalPayloadForTalkJS = [messagePayload];

        console.log(`Backend: Enviando mensaje a TalkJS para conversación ${conversationId}:`, JSON.stringify(finalPayloadForTalkJS, null, 2));

        await talkjsAPI.post(`/conversations/${conversationId}/messages`, finalPayloadForTalkJS);

        res.status(201).json({ success: true, message: 'Mensaje enviado.' });

    } catch (error: any) {
        if (axios.isAxiosError(error)) {
            console.error('Backend: Error de TalkJS al enviar mensaje:', error.response?.data);
            return next(new AppError(error.response?.data?.message || 'Error al enviar el mensaje.', error.response?.status || 500));
        }
        console.error('Backend: Error inesperado al enviar mensaje:', error);
        next(new AppError('Error interno del servidor al enviar el mensaje.', 500));
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

// Para conseuguir los contactos disponibles de un usuario, para familiares/cuidadores solo aparecen aquellos usuarios
// con los que comparta residente en las tablas Residente Familiar/Cuidador
export const getAvailableContacts = async (req: RequestWithUser, res: Response, next: NextFunction) => {
    const { userId } = req.params;
    const requestingUserRole = req.user?.role; 
    
    console.log(requestingUserRole)

    if (!userId) {
        return next(new AppError('Falta el id del suario.', 400));
    }

    try {
        let allContacts: User[] = [];
        let totalCount: number = 0;

        if (requestingUserRole === 'Admin') {
            const allUsers = await User.findAll({
                where: {
                    role: { [Op.in]: ['familiar', 'cuidador'] }
                },
                attributes: ['id', 'name'],
                order: [['name', 'ASC']]
            });

            allContacts = allUsers;
            totalCount = allUsers.length;

        } else {

            const residentIdsFromFamiliares = await ResidentesFamiliares.findAll({
                attributes: ['residente_id'],
                where: { familiar_id: userId }
            });
            const residentIdsFromCuidadores = await ResidentesCuidadores.findAll({
                attributes: ['residente_id'],
                where: { cuidador_id: userId }
            });

            const uniqueResidentIds = new Set<number>();
            residentIdsFromFamiliares.forEach(item => uniqueResidentIds.add(item.residente_id));
            residentIdsFromCuidadores.forEach(item => uniqueResidentIds.add(item.residente_id));

            const residentIdsArray = Array.from(uniqueResidentIds);
            

            if (residentIdsArray.length === 0) {
                res.status(200).json({
                    success: true,
                    data: [],
                    count: 0,
                });
                return;
            }

            const associatedResidents = await Resident.findAll({
                where: {
                    id: { [Op.in]: residentIdsArray } 
                },
                include: [
                    {
                        model: User,
                        as: 'familiares',
                        attributes: ['id', 'name'],
                        through: { attributes: [] }
                    },
                    {
                        model: User,
                        as: 'cuidadores',
                        attributes: ['id', 'name'],
                        through: { attributes: [] }
                    }
                ]
            });

            const uniqueContacts: User[] = [];
            associatedResidents.forEach(residente => {
                if (residente.familiares && residente.familiares.length > 0) {
                    residente.familiares.forEach(familiar => {
                        if (!uniqueContacts.some(contact => contact.id === familiar.id)) {
                            uniqueContacts.push(familiar);
                        }
                    });
                } else {
                    console.log(`Residente no tiene familiares.`);
                }

                if (residente.cuidadores && residente.cuidadores.length > 0) {
                    residente.cuidadores.forEach(cuidador => {
                        if (!uniqueContacts.some(contact => contact.id === cuidador.id)) {
                            uniqueContacts.push(cuidador);
                        }
                    });
                } else {
                    console.log(`Residente no tiene cuidadores.`);
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
        console.error(`Error par el usuario con id ${userId}:`, error);
        next(error);
    }
};

export const uploadFile = async (req: Request, res: Response, next: NextFunction) => {
    try {
        if (!req.file) {
            return next(new AppError('No se adjuntó ningún archivo.', 400));
        }

        if (!config.talkjs.appId || !config.talkjs.secretKey) {
            return next(new AppError('Las credenciales de la API de TalkJS no están configuradas en el servidor.', 500));
        }

        const file = req.file;
        const filename = file.originalname;
        const filePath = file.path;
        const mimeType = file.mimetype;

        console.log(`Backend: Attempting to upload file to TalkJS: ${filename}`);
        console.log(`Backend: File temp path: ${filePath}`);
        console.log(`Backend: File MIME type: ${mimeType}`);
        console.log(`Backend: File size (Multer): ${file.size} bytes`);


        // Read the temporary file content
        const fileContent = fs.readFileSync(filePath);
        console.log(`Backend: Read file content length: ${fileContent.length} bytes`);
        if (fileContent.length === 0) {
            console.warn('Backend: File content is empty after reading from temporary path!');
            return next(new AppError('El archivo subido está vacío.', 400));
        }

        const formData = new FormData();
        formData.append('file', fileContent, {
            filename: filename,
            contentType: mimeType,
        });
        // formData.append('filename', filename); // This line is actually redundant for TalkJS /files endpoint

        console.log('Backend: FormData prepared.');
        console.log('Backend: FormData headers:', formData.getHeaders()); // Check this output carefully

        const talkjsResponse = await axios.post(
            `https://api.talkjs.com/v1/${config.talkjs.appId}/files`,
            formData,
            {
                headers: {
                    ...formData.getHeaders(),
                    'Authorization': `Bearer ${config.talkjs.secretKey}`,
                },
                maxBodyLength: Infinity,
                maxContentLength: Infinity,
            }
        );

        const { attachmentToken } = talkjsResponse.data;
        console.log(`Backend: TalkJS /files API response data:`, talkjsResponse.data); // Log full response
        console.log(`Backend: File uploaded successfully to TalkJS. Attachment Token: ${attachmentToken}`);

        res.status(200).json({
            status: 'success',
            message: 'Archivo subido a TalkJS exitosamente',
            data: {
                attachmentToken: attachmentToken,
            }
        });

    } catch (error: any) {
        console.error('Backend: Error uploading file to TalkJS:', error.message);
        if (axios.isAxiosError(error) && error.response) {
            console.error('Backend: TalkJS API error response status:', error.response.status);
            console.error('Backend: TalkJS API error response data:', error.response.data); // Crucial for debugging
            return next(new AppError(`TalkJS API Error: ${error.response.data.message || error.response.statusText}`, error.response.status || 500));
        }
        next(new AppError('Failed to upload file.', 500));
    } finally {
        if (req.file && fs.existsSync(req.file.path)) {
            fs.unlink(req.file.path, (err) => {
                if (err) console.error('Error deleting temporary file:', err);
            });
        }
    }
};
export { upload };
