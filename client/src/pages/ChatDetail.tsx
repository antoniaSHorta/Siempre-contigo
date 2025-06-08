import React, { useState, useRef, useEffect, useCallback } from "react";
import {
    IonContent, IonHeader, IonPage, IonTitle, IonToolbar, IonButton, IonIcon, IonTextarea, IonAvatar,
    IonItem, IonBackButton, IonButtons, useIonRouter, IonToast, IonSpinner,
} from "@ionic/react";
import { send, attach, mic, ellipsisVertical } from "ionicons/icons";
import { useParams } from "react-router-dom";
import AttachmentModal from "../components/AttachmentModal";
import AudioRecorder from "../components/AudioRecorder";
import MessageBubble from "../components/MessageBubble";
import ChatOptionsModal from "../components/ChatOptionsModal";
import Header from "../components/Header";
import "./ChatDetail.css";
import { useAuth } from "../contexts/AuthContext";
import axios from "axios";

// Interfaz extendida para soportar diferentes tipos de mensajes
interface Message {
    id: string;
    text?: string;
    timestamp: string;
    isOwn: boolean;
    status: "sent" | "delivered" | "read";
    type: "text" | "image" | "audio" | "document" | "video" | "location";
    senderId: string;
    fileUrl?: string; // URL temporal para previsualización en el frontend
    fileName?: string;
    fileSize?: string;
    duration?: number; // Para audio/video
    thumbnailUrl?: string; // Para video/imagen
    location?: {
        latitude: number;
        longitude: number;
        address?: string;
    };
    attachmentToken?: string; // Nuevo: para el token de adjunto de TalkJS
}

interface ChatInfo {
    id: string;
    name: string;
    avatar: string;
    isOnline: boolean;
    lastSeen?: string;
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

const ChatDetail: React.FC = () => {
    const { chatId } = useParams<{ chatId: string }>();
    const { user } = useAuth();
    const router = useIonRouter();

    const [messageText, setMessageText] = useState("");
    const [messages, setMessages] = useState<Message[]>([]);
    const [chatInfo, setChatInfo] = useState<ChatInfo | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isSendingFile, setIsSendingFile] = useState(false);

    const [isAttachmentModalOpen, setIsAttachmentModalOpen] = useState(false);
    const [isAudioRecorderOpen, setIsAudioRecorderOpen] = useState(false);
    const [isChatOptionsOpen, setIsChatOptionsOpen] = useState(false);
    const [showToast, setShowToast] = useState(false);
    const [toastMessage, setToastMessage] = useState("");

    const contentRef = useRef<HTMLIonContentElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const addOptimisticMessage = (messageData: Partial<Message>) => {
        if (!user) return;
        const newMessage: Message = {
            id: Date.now().toString(),
            timestamp: new Date().toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" }),
            isOwn: true,
            status: "sent",
            senderId: user.id.toString(),
            type: 'text',
            ...messageData,
        } as Message;
        setMessages(prev => [...prev, newMessage]);
        setTimeout(() => contentRef.current?.scrollToBottom(300), 50);
        console.log("Frontend: Mensaje optimista añadido:", newMessage); // LOG AÑADIDO
    };

    const showNotification = (message: string) => {
        setToastMessage(message);
        setShowToast(true);
    };

    const fetchChatData = useCallback(async () => {
        if (!chatId || !user) {
            console.warn("Frontend: No chatId o user para cargar datos del chat."); // LOG AÑADIDO
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            const token = localStorage.getItem('token');
            console.log("Frontend: Fetching messages for chatId:", chatId); // LOG AÑADIDO
            const response = await axios.get(`${API_BASE_URL}/chat/${chatId}/messages`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            const talkJsMessages = response.data.data;
            console.log("Frontend: TalkJS Raw Messages Received:", talkJsMessages); // LOG AÑADIDO (detallado)

            const formattedMessages = talkJsMessages.map((msg: any): Message => {
                let messageType: Message['type'] = 'text';
                let fileUrl: string | undefined;
                let fileName: string | undefined;
                let fileSize: string | undefined;
                let duration: number | undefined;
                let thumbnailUrl: string | undefined;

                if (msg.attachment) {
                    const attachment = msg.attachment;
                    fileUrl = attachment.url;
                    fileName = attachment.name;
                    fileSize = attachment.size ? `${Math.round(attachment.size / 1024)} KB` : undefined;
                    duration = attachment.duration;
                    thumbnailUrl = attachment.thumbnailUrl;

                    if (attachment.type === 'image' || attachment.contentType?.startsWith('image/')) {
                        messageType = 'image';
                    } else if (attachment.type === 'audio' || attachment.contentType?.startsWith('audio/')) {
                        messageType = 'audio';
                    } else if (attachment.type === 'video' || attachment.contentType?.startsWith('video/')) {
                        messageType = 'video';
                    } else {
                        messageType = 'document';
                    }
                    console.log("Frontend: Mensaje con adjunto:", { msgId: msg.id, attachment: msg.attachment }); // LOG AÑADIDO
                } else if (msg.custom?.location) { // Ejemplo para otros tipos si los manejas
                    messageType = 'location';
                }

                return {
                    id: msg.id,
                    text: msg.text,
                    timestamp: new Date(msg.createdAt).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }),
                    isOwn: msg.senderId === user.id.toString(),
                    status: 'read',
                    type: messageType,
                    senderId: msg.senderId,
                    fileUrl: fileUrl,
                    fileName: fileName,
                    fileSize: fileSize,
                    duration: duration,
                    thumbnailUrl: thumbnailUrl,
                };
            });

            setMessages(formattedMessages.reverse());
            console.log("Frontend: Mensajes formateados y establecidos:", formattedMessages.length); // LOG AÑADIDO

            if (talkJsMessages.length > 0 && talkJsMessages[0].conversation && talkJsMessages[0].conversation.participants) {
                const conversation = talkJsMessages[0].conversation;
                const otherParticipant = Object.values(conversation.participants).find(
                    (p: any) => p.id !== user.id.toString()
                ) as any;

                setChatInfo({
                    id: chatId,
                    name: otherParticipant?.name || conversation.subject || "Chat",
                    avatar: otherParticipant?.photoUrl || `https://i.pravatar.cc/150?u=${otherParticipant?.id || chatId}`,
                    isOnline: otherParticipant?.presence === 'online',
                    lastSeen: otherParticipant?.lastSeen,
                });
                console.log("Frontend: Chat info establecido:", chatInfo); // LOG AÑADIDO
            } else {
                setChatInfo({
                    id: chatId,
                    name: `Chat ${chatId}`,
                    avatar: "https://i.pravatar.cc/150?img=1",
                    isOnline: false,
                });
                console.warn("Frontend: No se encontraron mensajes o participantes, usando info de chat por defecto."); // LOG AÑADIDO
            }

        } catch (err) {
            setError("No se pudieron cargar los mensajes.");
            console.error("Frontend: Error fetching chat data:", err); // LOG AÑADIDO
        } finally {
            setIsLoading(false);
        }
    }, [chatId, user]);

    useEffect(() => {
        fetchChatData();
    }, [fetchChatData]);

    useEffect(() => {
        contentRef.current?.scrollToBottom(300);
    }, [messages]);

    const handleSendMessage = async (text?: string, attachmentToken?: string, fileType?: Message['type']) => {
        if (!user) {
            showNotification("Usuario no autenticado.");
            return;
        }

        if (!text && !attachmentToken) {
            showNotification("El mensaje o el adjunto son requeridos.");
            return;
        }

        try {
            const token = localStorage.getItem('token');
            const payload: { text?: string; attachmentToken?: string; type?: Message['type'] } = {};

            if (attachmentToken) {
                payload.attachmentToken = attachmentToken;
                payload.type = fileType;
            }
            else if (text) {
                payload.text = text;
            }
            

            console.log("Frontend: Enviando mensaje a backend:", payload); // LOG AÑADIDO
            await axios.post(
                `${API_BASE_URL}/chat/${chatId}/messages`,
                payload,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            console.log("Frontend: Mensaje enviado exitosamente a backend."); // LOG AÑADIDO

            fetchChatData(); // Reload messages to get the official TalkJS message with attachment info

        } catch (error) {
            console.error("Frontend: Error al enviar el mensaje:", error); // LOG AÑADIDO
            showNotification("No se pudo enviar el mensaje.");
        }
    };

    const handleSendTextMessage = () => {
        if (messageText.trim()) {
            const currentMessage = messageText;
            addOptimisticMessage({ text: currentMessage, type: 'text' });
            setMessageText("");
            handleSendMessage(currentMessage);
        }
    };

    const uploadFileToBackend = async (file: File, messageType: Message['type']) => {
        if (!user) {
            showNotification("Usuario no autenticado.");
            return null;
        }

        setIsSendingFile(true);
        showNotification("Subiendo archivo...");
        console.log("Frontend: Iniciando subida de archivo a backend:", file.name, file.type); // LOG AÑADIDO

        try {
            const formData = new FormData();
            formData.append('file', file);

            const token = localStorage.getItem('token');
            const response = await axios.post(
                `${API_BASE_URL}/chat/upload`,
                formData,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'multipart/form-data',
                    },
                    onUploadProgress: (progressEvent) => {
                        const percentCompleted = Math.round((progressEvent.loaded * 100) / (progressEvent.total || 1));
                        console.log(`Frontend: Subiendo: ${percentCompleted}%`); // LOG AÑADIDO
                    }
                }
            );

            const attachmentToken = response.data.data.attachmentToken;
            console.log("Frontend: Archivo subido exitosamente al backend. Token de adjunto recibido:", attachmentToken); // LOG AÑADIDO
            showNotification("Archivo subido exitosamente.");
            return attachmentToken;

        } catch (error) {
            console.error("Frontend: Error al subir archivo al backend:", error); // LOG AÑADIDO
            showNotification("Error al subir el archivo.");
            return null;
        } finally {
            setIsSendingFile(false);
        }
    };

    const handleAttachmentSelect = (type: "gallery" | "document" | "audio" | "video" | "location") => {
        setIsAttachmentModalOpen(false);
        console.log("Frontend: Opción de adjunto seleccionada:", type); // LOG AÑADIDO

        switch (type) {
            case 'gallery':
            case 'document':
                fileInputRef.current?.setAttribute('accept', type === 'gallery' ? 'image/*' : '*/*');
                fileInputRef.current?.click();
                break;
            case 'audio':
                setIsAudioRecorderOpen(true);
                break;
            default:
                showNotification(`Funcionalidad para '${type}' no implementada.`);
        }
    };

    const handleFileSelected = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            console.log("Frontend: Archivo seleccionado:", file.name, file.type, file.size); // LOG AÑADIDO
            const messageType: Message['type'] = file.type.startsWith('image/') ? 'image' : (file.type.startsWith('video/') ? 'video' : 'document');

            addOptimisticMessage({
                type: messageType,
                fileName: file.name,
                fileSize: `${(file.size / 1024).toFixed(0)} KB`,
                fileUrl: URL.createObjectURL(file),
            });

            const attachmentToken = await uploadFileToBackend(file, messageType);

            if (attachmentToken) {
                const messageTextForAttachment = `[${messageType === 'image' ? 'Imagen' : messageType === 'video' ? 'Video' : 'Documento'}: ${file.name}]`;
                console.log("Frontend: Enviando mensaje con token de adjunto:", attachmentToken); // LOG AÑADIDO

                // --- POSIBLE FIX: ADD A SMALL DELAY HERE ---
                await new Promise(resolve => setTimeout(resolve, 1000)); // Uncomment this line to test with a delay

                handleSendMessage(messageTextForAttachment, attachmentToken, messageType);
            }
        }
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    const handleSendAudio = async (audioData: { blob: Blob; duration: number; size: string; url: string }) => {
        setIsAudioRecorderOpen(false);
        console.log("Frontend: Datos de audio recibidos:", audioData.duration, audioData.size); // LOG AÑADIDO

        const audioFile = new File([audioData.blob], `audio-${Date.now()}.webm`, { type: audioData.blob.type });

        addOptimisticMessage({
            type: 'audio',
            duration: audioData.duration,
            fileSize: audioData.size,
            fileUrl: audioData.url,
        });

        const attachmentToken = await uploadFileToBackend(audioFile, 'audio');

        if (attachmentToken) {
            const messageTextForAudio = `[Audio: ${audioData.duration}s]`;
            console.log("Frontend: Enviando mensaje de audio con token de adjunto:", attachmentToken); // LOG AÑADIDO

            // --- POSIBLE FIX: ADD A SMALL DELAY HERE ---
            await new Promise(resolve => setTimeout(resolve, 500)); // Uncomment this line to test with a delay

            handleSendMessage(messageTextForAudio, attachmentToken, 'audio');
        }
    };

    const handleDeleteMessage = async (messageId: string) => {
        try {
            const token = localStorage.getItem('token');
            console.log("Frontend: Intentando eliminar mensaje:", messageId); // LOG AÑADIDO
            await axios.delete(`${API_BASE_URL}/chat/messages/${messageId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setMessages(prevMessages => prevMessages.filter(msg => msg.id !== messageId));
            showNotification("Mensaje eliminado.");
            console.log("Frontend: Mensaje eliminado exitosamente:", messageId); // LOG AÑADIDO
        } catch (error) {
            console.error("Frontend: Error al eliminar el mensaje:", error); // LOG AÑADIDO
            showNotification("No se pudo eliminar el mensaje.");
        }
    };

    const handleClearChat = async () => {
        setMessages([]);
        showNotification("Conversación limpiada (localmente).");
        setIsChatOptionsOpen(false);
        console.log("Frontend: Chat limpiado localmente."); // LOG AÑADIDO
    };

    const handleDeleteChat = async () => {
        try {
            const token = localStorage.getItem('token');
            console.log("Frontend: Intentando eliminar chat:", chatId); // LOG AÑADIDO
            await axios.delete(`${API_BASE_URL}/chat/${chatId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            showNotification("Chat eliminado.");
            router.push('/app/chat', 'back');
            console.log("Frontend: Chat eliminado exitosamente."); // LOG AÑADIDO
        } catch (error) {
            console.error("Frontend: Error al eliminar el chat:", error); // LOG AÑADIDO
            showNotification("No se pudo eliminar el chat.");
        }
    };

    const handleBlockContact = () => {
        showNotification("Funcionalidad de bloqueo no implementada.");
        setIsChatOptionsOpen(false);
        console.log("Frontend: Bloquear contacto no implementado."); // LOG AÑADIDO
    };

    if (isLoading) {
        return (
            <IonPage>
                <IonContent className="ion-text-center ion-padding">
                    <IonSpinner name="crescent" />
                    <p>Cargando mensajes...</p>
                </IonContent>
            </IonPage>
        );
    }

    if (error) {
        return (
            <IonPage>
                <IonContent className="ion-text-center ion-padding">
                    <p className="error-message">{error}</p>
                    <IonButton onClick={fetchChatData}>Reintentar</IonButton>
                </IonContent>
            </IonPage>
        );
    }

    return (
        <IonPage className="chat-detail-page">
            <IonHeader className="ion-no-border">
                <IonToolbar>
                    <IonButtons slot="start">
                        <IonBackButton defaultHref="/app/chat" />
                    </IonButtons>
                    {chatInfo && (
                        <div className="chat-header-info">
                            <IonAvatar className="header-avatar">
                                <img src={chatInfo.avatar} alt={chatInfo.name} />
                            </IonAvatar>
                            <div className="header-details">
                                <IonTitle className="chat-title">{chatInfo.name}</IonTitle>
                                <span className="chat-status">{chatInfo.isOnline ? "En línea" : chatInfo.lastSeen ? `Visto por última vez: ${new Date(chatInfo.lastSeen).toLocaleTimeString()}` : "Desconectado"}</span>
                            </div>
                        </div>
                    )}
                    <IonButtons slot="end">
                        <IonButton fill="clear" onClick={() => setIsChatOptionsOpen(true)}>
                            <IonIcon icon={ellipsisVertical} />
                        </IonButton>
                    </IonButtons>
                </IonToolbar>
            </IonHeader>

            <IonContent ref={contentRef} className="chat-content">
                <div className="messages-container">
                    {messages.length === 0 && !isLoading && (
                        <p className="no-messages-text">No hay mensajes en esta conversación aún. ¡Sé el primero en saludar!</p>
                    )}
                    {messages.map((message) => (
                        <div key={message.id} className={`message ${message.isOwn ? "message-own" : "message-other"}`}>
                            <MessageBubble message={message} onDeleteMessage={handleDeleteMessage} />
                        </div>
                    ))}
                </div>
            </IonContent>

            <div className="message-input-container">
                <IonItem className="message-input-item">
                    <IonButton fill="clear" slot="start" className="attachment-button" onClick={() => setIsAttachmentModalOpen(true)} disabled={isSendingFile}>
                        <IonIcon icon={attach} />
                    </IonButton>
                    <IonTextarea
                        value={messageText}
                        onIonInput={(e) => setMessageText(e.detail.value!)}
                        placeholder="Escribe un mensaje..."
                        className="message-textarea"
                        autoGrow
                        rows={1}
                        disabled={isSendingFile}
                    />
                    {isSendingFile ? (
                        <IonButton fill="clear" slot="end">
                            <IonSpinner name="dots" />
                        </IonButton>
                    ) : messageText.trim() ? (
                        <IonButton fill="clear" slot="end" className="send-button" onClick={handleSendTextMessage}>
                            <IonIcon icon={send} />
                        </IonButton>
                    ) : (
                        <IonButton fill="clear" slot="end" className="mic-button" onClick={() => setIsAudioRecorderOpen(true)}>
                            <IonIcon icon={mic} />
                        </IonButton>
                    )}
                </IonItem>
            </div>

            <input type="file" ref={fileInputRef} style={{ display: 'none' }} onChange={handleFileSelected} />

            <AttachmentModal
                isOpen={isAttachmentModalOpen}
                onClose={() => setIsAttachmentModalOpen(false)}
                onSelectOption={handleAttachmentSelect}
            />

            <AudioRecorder
                isOpen={isAudioRecorderOpen}
                onClose={() => setIsAudioRecorderOpen(false)}
                onSendAudio={handleSendAudio}
            />

            {chatInfo && (
                <ChatOptionsModal
                    isOpen={isChatOptionsOpen}
                    onClose={() => setIsChatOptionsOpen(false)}
                    chatInfo={chatInfo}
                    onClearChat={handleClearChat}
                    onDeleteChat={handleDeleteChat}
                    onBlockContact={handleBlockContact}
                />
            )}

            <IonToast
                isOpen={showToast}
                onDidDismiss={() => setShowToast(false)}
                message={toastMessage}
                duration={2000}
                position="top"
            />
        </IonPage>
    );
};

export default ChatDetail;