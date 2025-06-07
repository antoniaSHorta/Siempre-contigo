import express from 'express';
import {
  createConversationHttp,
  getConversationsHttp,
  getMessagesFromConversation,
  sendMessageHttp,
  deleteConversation,
  deleteMessageHttp,
  updateConversationHttp,
  getAvailableContacts,
} from '../controllers/chatController';
import { protect } from '../middleware/auth';

const router = express.Router();

router.use(protect);

// --- Rutas Generales para Conversaciones ---
router.get('/', getConversationsHttp);
router.post('/', createConversationHttp);

// --- Rutas Para conseguir los contactos
router.get('/availableContacts/:userId',getAvailableContacts)

// --- Rutas Específicas para Mensajes ---
// ESTAS DEBEN IR ANTES de las rutas con un solo parámetro como /:id
router.get('/:conversationId/messages', getMessagesFromConversation); 
router.post('/:conversationId/messages', sendMessageHttp); 
router.delete('/:conversationId/messages/:messageId', deleteMessageHttp); // Ruta específica para eliminar un mensaje

// --- Rutas para una Conversación Específica ---
// ESTAS VAN AL FINAL para no interceptar las rutas más específicas de arriba.
router.patch('/:id', updateConversationHttp);
router.delete('/:id', deleteConversation);

export default router;
