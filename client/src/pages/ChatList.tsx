"use client"

import type React from "react"

import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar, IonList, IonItem, IonAvatar, IonLabel, IonBadge, IonIcon, IonSearchbar, IonFab, IonFabButton, useIonRouter, IonToast } from "@ionic/react"
import { add, chatbubbleEllipses } from "ionicons/icons"
import { useState } from "react"
import NewChatModal from "../components/NewChatModal"
import "./ChatList.css"
import "../components/NewChatModal.css"
import logo from "../assets/logo.png"

interface Chat {
  id: string
  name: string
  lastMessage: string
  timestamp: string
  unreadCount: number
  avatar: string
  isOnline: boolean
}

const ChatList: React.FC = () => {
  const router = useIonRouter()
  const [searchText, setSearchText] = useState("")
  const [isNewChatModalOpen, setIsNewChatModalOpen] = useState(false)
  const [showToast, setShowToast] = useState(false)
  const [toastMessage, setToastMessage] = useState("")

  // Datos de ejemplo - estos vendrán del backend
  const [chats, setChats] = useState<Chat[]>([
    {
      id: "1",
      name: "María González",
      lastMessage: "Hola, ¿cómo estás?",
      timestamp: "10:30",
      unreadCount: 2,
      avatar: "https://i.pravatar.cc/150?img=1",
      isOnline: true,
    },
    {
      id: "2",
      name: "Carlos Rodríguez",
      lastMessage: "Perfecto, nos vemos mañana",
      timestamp: "09:15",
      unreadCount: 0,
      avatar: "https://i.pravatar.cc/150?img=2",
      isOnline: false,
    },
    {
      id: "3",
      name: "Ana Martínez",
      lastMessage: "Gracias por la información",
      timestamp: "Ayer",
      unreadCount: 1,
      avatar: "https://i.pravatar.cc/150?img=3",
      isOnline: true,
    },
    {
      id: "4",
      name: "Luis Fernández",
      lastMessage: "👍",
      timestamp: "Ayer",
      unreadCount: 0,
      avatar: "https://i.pravatar.cc/150?img=4",
      isOnline: false,
    },
    {
      id: "5",
      name: "Grupo Proyecto",
      lastMessage: "Juan: Excelente trabajo equipo",
      timestamp: "2 días",
      unreadCount: 5,
      avatar: "https://i.pravatar.cc/150?img=5",
      isOnline: true,
    },
  ])

  const filteredChats = chats.filter((chat) => chat.name.toLowerCase().includes(searchText.toLowerCase()))

  const handleChatClick = (chatId: string) => {
    router.push(`/app/chat/${chatId}`, "forward")
  }

  const handleCreateChat = (contactIds: string[], isGroup: boolean) => {
    // Simular creación de chat
    const newChatId = Date.now().toString()

    if (isGroup) {
      // Crear chat grupal
      const newGroupChat: Chat = {
        id: newChatId,
        name: `Grupo ${contactIds.length} personas`,
        lastMessage: "Grupo creado",
        timestamp: "Ahora",
        unreadCount: 0,
        avatar: "https://i.pravatar.cc/150?img=10",
        isOnline: true,
      }

      setChats((prev) => [newGroupChat, ...prev])
      setToastMessage(`Grupo creado con ${contactIds.length} personas`)
      setShowToast(true)

      // Navegar al nuevo chat grupal
      setTimeout(() => {
        router.push(`/app/chat/${newChatId}`, "forward")
      }, 1000)
    } else {
      // Crear chat individual
      const contactId = contactIds[0]

      // Verificar si ya existe un chat con este contacto
      const existingChat = chats.find((chat) => chat.id === contactId)

      if (existingChat) {
        // Si ya existe, navegar al chat existente
        router.push(`/app/chat/${existingChat.id}`, "forward")
        setToastMessage("Chat ya existente")
        setShowToast(true)
      } else {
        // Crear nuevo chat individual
        const contactNames = [
          "Ana Martínez",
          "Carlos Rodríguez",
          "Luis Fernández",
          "Sofia García",
          "Miguel Torres",
          "Elena Ruiz",
        ]
        const contactName = contactNames[Number.parseInt(contactId) - 1] || "Nuevo contacto"

        const newChat: Chat = {
          id: contactId,
          name: contactName,
          lastMessage: "Chat iniciado",
          timestamp: "Ahora",
          unreadCount: 0,
          avatar: `https://i.pravatar.cc/150?img=${contactId}`,
          isOnline: true,
        }

        setChats((prev) => [newChat, ...prev])
        setToastMessage(`Chat iniciado con ${contactName}`)
        setShowToast(true)

        // Navegar al nuevo chat
        setTimeout(() => {
          router.push(`/app/chat/${contactId}`, "forward")
        }, 1000)
      }
    }
  }

  return (
    <IonPage className="chat-list-page">
      <IonHeader className="ion-no-border">
        <IonToolbar>
          <div className="header-content">
            <img src={logo || "/placeholder.svg"} alt="Logo" className="header-logo" />
            <IonTitle>Chats</IonTitle>
          </div>
        </IonToolbar>
      </IonHeader>

      <IonContent className="ion-padding">
        <IonSearchbar
          value={searchText}
          onIonInput={(e) => setSearchText(e.detail.value!)}
          placeholder="Buscar conversaciones..."
          className="chat-searchbar"
        />

        <IonList className="chat-list">
          {filteredChats.map((chat) => (
            <IonItem key={chat.id} button onClick={() => handleChatClick(chat.id)} className="chat-item">
              <div className="chat-avatar-container">
                <IonAvatar className="chat-avatar">
                  <img src={chat.avatar || "/placeholder.svg"} alt={chat.name} />
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
          ))}
        </IonList>

        {filteredChats.length === 0 && (
          <div className="empty-state">
            <IonIcon icon={chatbubbleEllipses} className="empty-icon" />
            <h3>No se encontraron conversaciones</h3>
            <p>Intenta con otros términos de búsqueda</p>
          </div>
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
        onCreateChat={handleCreateChat}
      />

      <IonToast
        isOpen={showToast}
        onDidDismiss={() => setShowToast(false)}
        message={toastMessage}
        duration={2000}
        position="top"
      />
    </IonPage>
  )
}

export default ChatList
