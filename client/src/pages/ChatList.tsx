import React, { useState, useEffect, useCallback } from "react";
import {
  IonContent, IonHeader, IonPage, IonTitle, IonToolbar, IonList, IonItem, IonAvatar, IonLabel,
  IonBadge, IonIcon, IonSearchbar, IonFab, IonFabButton, useIonRouter, IonToast, useIonViewWillEnter,
  IonSpinner, IonText, IonButton
} from "@ionic/react";
import { add, chatbubbleEllipses } from "ionicons/icons";
import NewChatModal from "../components/NewChatModal";
import "./ChatList.css";
import axios from "axios";
import { useAuth } from "../contexts/AuthContext";
import { formatDistanceToNow, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import Header from "../components/Header";

interface Chat {
  id: string;
  name: string;
  lastMessage: string;
  avatar: string;
  timestamp: string;
  unreadCount: number;
  isOnline: boolean;
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

const ChatList: React.FC = () => {
  const router = useIonRouter();
  const { user, logout } = useAuth();
  const [chats, setChats] = useState<Chat[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchText, setSearchText] = useState("");
  const [isNewChatModalOpen, setIsNewChatModalOpen] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  const fetchChats = useCallback(async () => {
    if (!user) {
        setIsLoading(false);
        setError("Usuario no autenticado.");
        return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      const token = localStorage.getItem("token");
      if (!token) {
          throw new Error("No se encontró token de autenticación");
      }
      
      const response = await axios.get(`${API_BASE_URL}/chat`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      const talkJSConversations = response.data.data;
      console.log(talkJSConversations)
      const formattedChats = Object.values(talkJSConversations).map((convo: any): Chat => {
        const otherParticipants = Object.values(convo.participants).filter((p: any) => p.id !== user.id.toString());
        
        let chatName = convo.subject || "Chat Grupal";
        let chatAvatar = `https://i.pravatar.cc/150?u=${convo.id}`;
        let isOnline = false;

        if (otherParticipants.length === 1) {
            const other = otherParticipants[0] as any;
            chatName = other.name || "Usuario desconocido";
            chatAvatar = other.photoUrl || `https://i.pravatar.cc/150?u=${other.id}`;
            isOnline = other.presence === 'online';
        }

        let timestamp = 'hace tiempo';
        if (convo.lastMessage && typeof convo.lastMessage.createdAt === 'string') {
            try {
                timestamp = formatDistanceToNow(parseISO(convo.lastMessage.createdAt), { addSuffix: true, locale: es });
            } catch (e) {
                console.error("Error al parsear la fecha: ", convo.lastMessage.createdAt);
            }
        }

        return {
          id: convo.id,
          name: chatName,
          lastMessage: convo.lastMessage?.text || "Conversación iniciada",
          timestamp: timestamp,
          unreadCount: convo.unreadMessageCount || 0,
          avatar: chatAvatar,
          isOnline: isOnline
        };
      });

      setChats(formattedChats);
    } catch (err) {
      if (axios.isAxiosError(err) && err.response?.status === 401) {
        setError("Tu sesión ha expirado. Por favor, inicia sesión de nuevo.");
        logout();
      } else {
        setError("No se pudieron cargar los chats.");
      }
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [user, logout]);

  useIonViewWillEnter(() => {
    fetchChats();
  });

  const handleChatClick = (chatId: string) => {
    router.push(`/app/chat/${chatId}`, "forward");
  };
  
  const handleChatCreated = () => {
    setIsNewChatModalOpen(false);
    setToastMessage("Chat creado con éxito");
    setShowToast(true);
    fetchChats();
  };

  const filteredChats = chats.filter((chat) => 
    chat.name.toLowerCase().includes(searchText.toLowerCase())
  );

  return (
    <IonPage className="chat-list-page">
      <Header title="Lista de Chats"/>

      <IonContent className="ion-padding">
        <IonSearchbar
          value={searchText}
          onIonInput={(e) => setSearchText(e.detail.value!)}
          placeholder="Buscar conversaciones..."
          className="chat-searchbar"
        />

        {isLoading && (
            <div className="loading-container">
                <IonSpinner name="crescent" />
                <p>Cargando tus chats...</p>
            </div>
        )}

        {error && (
            <div className="error-container">
                <IonIcon icon={chatbubbleEllipses} className="empty-icon" />
                <h3>Error</h3>
                <p>{error}</p>
                <IonButton onClick={fetchChats}>Reintentar</IonButton>
            </div>
        )}

        {!isLoading && !error && (
            <IonList className="chat-list">
                {filteredChats.length > 0 ? (
                    filteredChats.map((chat) => (
                        <IonItem key={chat.id} button onClick={() => handleChatClick(chat.id)} className="chat-item" lines="none">
                            <div className="chat-avatar-container">
                                <IonAvatar className="chat-avatar">
                                <img src={chat.avatar} alt={chat.name} onError={(e) => (e.currentTarget.src = 'https://i.pravatar.cc/150')} />
                                </IonAvatar>
                                {chat.isOnline && <div className="online-indicator"></div>}
                            </div>
                            <IonLabel className="chat-label">
                                <div className="chat-header">
                                <h2 className="chat-name">{chat.name}</h2>
                                <span className="chat-timestamp">{chat.timestamp}</span>
                                </div>
                                <div className="chat-preview">
                                <p className="chat-last-message">{chat.lastMessage}</p>
                                {chat.unreadCount > 0 && <IonBadge className="unread-badge">{chat.unreadCount}</IonBadge>}
                                </div>
                            </IonLabel>
                        </IonItem>
                    ))
                ) : (
                    <div className="empty-state">
                        <IonIcon icon={chatbubbleEllipses} className="empty-icon" />
                        <h3>No tienes conversaciones</h3>
                        <p>Inicia un nuevo chat para comenzar</p>
                    </div>
                )}
            </IonList>
        )}

        <IonFab vertical="bottom" horizontal="end" slot="fixed">
          <IonFabButton className="new-chat-fab" onClick={() => setIsNewChatModalOpen(true)}>
            <IonIcon icon={add} />
          </IonFabButton>
        </IonFab>
      </IonContent>

      <NewChatModal
        isOpen={isNewChatModalOpen}
        onClose={() => setIsNewChatModalOpen(false)}
        onChatCreated={handleChatCreated}
      />

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

export default ChatList;
