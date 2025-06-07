import React, { useState, useRef, useEffect, useCallback } from "react";
import {
    IonContent, IonHeader, IonPage, IonTitle, IonToolbar, IonButton, IonIcon, IonTextarea, IonAvatar,
    IonItem, IonBackButton, IonButtons, useIonRouter, IonToast, IonSpinner
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
  fileUrl?: string;
  fileName?: string;
  fileSize?: string;
  duration?: number;
  thumbnailUrl?: string;
  location?: {
    latitude: number;
    longitude: number;
    address?: string;
  };
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
    
    // Estados principales
    const [messageText, setMessageText] = useState("");
    const [messages, setMessages] = useState<Message[]>([]);
    const [chatInfo, setChatInfo] = useState<ChatInfo | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Estados para los modales
    const [isAttachmentModalOpen, setIsAttachmentModalOpen] = useState(false);
    const [isAudioRecorderOpen, setIsAudioRecorderOpen] = useState(false);
    const [isChatOptionsOpen, setIsChatOptionsOpen] = useState(false);
    const [showToast, setShowToast] = useState(false);
    const [toastMessage, setToastMessage] = useState("");
    
    const contentRef = useRef<HTMLIonContentElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null); // Referencia para el input de archivos

    const fetchChatData = useCallback(async () => {
        if (!chatId || !user) return;
        
        setIsLoading(true);
        setError(null);
        
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${API_BASE_URL}/chat/${chatId}/messages`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            const talkJsMessages = response.data.data;
            console.log(talkJsMessages)
            const formattedMessages = talkJsMessages.map((msg: any): Message => ({
                id: msg.id,
                text: msg.text,
                timestamp: new Date(msg.createdAt).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }),
                isOwn: msg.senderId === user.id.toString(),
                status: 'read', 
                type: msg.attachment ? 'document' : 'text', // Simplificado por ahora
                senderId: msg.senderId,
                fileUrl: msg.attachment?.url,
                fileName: msg.attachment?.name,
            }));
            
            setMessages(formattedMessages.reverse());

            const firstMessage = talkJsMessages[0];
            if (firstMessage && firstMessage.conversation && firstMessage.conversation.participants) {
                const otherParticipant = Object.values(firstMessage.conversation.participants).find(
                    (p: any) => p.id !== user.id.toString()
                ) as any;

                setChatInfo({
                    id: chatId,
                    name: otherParticipant?.name || firstMessage.conversation.subject || "Chat", 
                    avatar: otherParticipant?.photoUrl || `https://i.pravatar.cc/150?u=${otherParticipant?.id || chatId}`,
                    isOnline: otherParticipant?.presence === 'online',
                    lastSeen: otherParticipant?.lastSeen
                });
            } else {
                 setChatInfo({
                    id: chatId,
                    name: `Chat ${chatId}`, 
                    avatar: "https://i.pravatar.cc/150?img=1",
                    isOnline: false,
                });
            }

        } catch (err) {
            setError("No se pudieron cargar los mensajes.");
            console.error(err);
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
    };
    
    const handleSendMessage = async () => {
        if (messageText.trim() && user) {
            const currentMessage = messageText;
            addOptimisticMessage({ text: currentMessage, type: 'text' });
            setMessageText("");

            try {
                const token = localStorage.getItem('token');
                await axios.post(
                    `${API_BASE_URL}/chat/${chatId}/messages`,
                    { text: currentMessage },
                    { headers: { Authorization: `Bearer ${token}` } }
                );
            } catch (error) {
                console.error("Error al enviar el mensaje:", error);
                setError("No se pudo enviar el mensaje.");
            }
        }
    };
    
    const handleAttachmentSelect = (type: "gallery" | "document" | "audio" | "video" | "location") => {
        setIsAttachmentModalOpen(false);

        switch(type) {
            case 'gallery':
            case 'document':
                fileInputRef.current?.setAttribute('accept', type === 'gallery' ? 'image/*' : '*/*');
                fileInputRef.current?.click();
                break;
            case 'audio':
                setIsAudioRecorderOpen(true);
                break;
            default:
                setShowToast(true);
                setToastMessage(`Funcionalidad para '${type}' no implementada.`);
        }
    };

    const handleFileSelected = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            addOptimisticMessage({
                type: file.type.startsWith('image/') ? 'image' : 'document',
                fileName: file.name,
                fileSize: `${Math.round(file.size / 1024)} KB`,
                fileUrl: URL.createObjectURL(file)
            });
            // TODO: Subir el archivo al backend
        }
        if(fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };
    
    const handleSendAudio = (audioData: { duration: number; size: string; url: string }) => {
        setIsAudioRecorderOpen(false);
        addOptimisticMessage({ 
            type: 'audio',
            duration: audioData.duration,
            fileSize: audioData.size,
            fileUrl: audioData.url
        });
        // TODO: Subir el archivo de audio al backend
    };

    const handleDeleteMessage = (messageId: string) => {
        setMessages(prevMessages => prevMessages.filter(msg => msg.id !== messageId));
        setShowToast(true);
        setToastMessage("Mensaje eliminado.");
        // TODO: Llamada al backend para eliminar el mensaje de TalkJS
    };

    const handleClearChat = () => {
        setMessages([]);
        setToastMessage("Conversación limpiada.");
        setShowToast(true);
    };
    
    const handleDeleteChat = () => {
        setToastMessage("Chat eliminado.");
        setShowToast(true);
        router.push('/app/chat', 'back');
    };
    
    const handleBlockContact = () => {
        setToastMessage("Contacto bloqueado.");
        setShowToast(true);
        router.push('/app/chat', 'back');
    };

    if (isLoading) {
        return <IonPage><IonContent className="ion-text-center ion-padding"><IonSpinner name="crescent" /></IonContent></IonPage>;
    }

    if (error) {
        return <IonPage><IonContent className="ion-text-center ion-padding"><p>{error}</p></IonContent></IonPage>;
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
                                <span className="chat-status">{chatInfo.isOnline ? "En línea" : "Desconectado"}</span>
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
                    {messages.map((message) => (
                        <div key={message.id} className={`message ${message.isOwn ? "message-own" : "message-other"}`}>
                            <MessageBubble message={message} onDeleteMessage={handleDeleteMessage} />
                        </div>
                    ))}
                </div>
            </IonContent>
            
            <div className="message-input-container">
                 <IonItem className="message-input-item">
                    <IonButton fill="clear" slot="start" className="attachment-button" onClick={() => setIsAttachmentModalOpen(true)}>
                        <IonIcon icon={attach} />
                    </IonButton>
                    <IonTextarea
                        value={messageText}
                        onIonInput={(e) => setMessageText(e.detail.value!)}
                        placeholder="Escribe un mensaje..."
                        className="message-textarea"
                        autoGrow
                        rows={1}
                    />
                    {messageText.trim() ? (
                        <IonButton fill="clear" slot="end" className="send-button" onClick={handleSendMessage}>
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
