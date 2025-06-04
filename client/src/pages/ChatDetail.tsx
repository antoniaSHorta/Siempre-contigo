"use client"

import type React from "react"

import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar, IonButton, IonIcon, IonTextarea, IonAvatar, IonItem, IonBackButton, IonButtons, useIonRouter, IonToast } from "@ionic/react"
import { send, attach, mic, ellipsisVertical } from "ionicons/icons"
import { useState, useRef, useEffect } from "react"
import { useParams } from "react-router-dom"
import AttachmentModal from "../components/AttachmentModal"
import AudioRecorder from "../components/AudioRecorder"
import MessageBubble from "../components/MessageBubble"
import ChatOptionsModal from "../components/ChatOptionsModal"
import "./ChatDetail.css"
import "../components/AudioRecorder.css"
import "../components/MessageBubble.css"
import "../components/ChatOptionsModal.css"
import "../components/ChatSearchModal.css"

interface Message {
  id: string
  text?: string
  timestamp: string
  isOwn: boolean
  status: "sent" | "delivered" | "read"
  type: "text" | "image" | "audio" | "document" | "video" | "location"
  fileUrl?: string
  fileName?: string
  fileSize?: string
  duration?: number
  thumbnailUrl?: string
  location?: {
    latitude: number
    longitude: number
    address?: string
  }
}

interface ChatInfo {
  id: string
  name: string
  avatar: string
  isOnline: boolean
  lastSeen?: string
  phone?: string
  email?: string
}

const ChatDetail: React.FC = () => {
  const { chatId } = useParams<{ chatId: string }>()
  const router = useIonRouter()
  const [messageText, setMessageText] = useState("")
  const [isAttachmentModalOpen, setIsAttachmentModalOpen] = useState(false)
  const [isAudioRecorderOpen, setIsAudioRecorderOpen] = useState(false)
  const [isChatOptionsOpen, setIsChatOptionsOpen] = useState(false)
  const [showToast, setShowToast] = useState(false)
  const [toastMessage, setToastMessage] = useState("")
  const contentRef = useRef<any>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Datos de ejemplo - estos vendrán del backend
  const [chatInfo] = useState<ChatInfo>({
    id: chatId || "1",
    name: "María González",
    avatar: "https://i.pravatar.cc/150?img=1",
    isOnline: true,
    lastSeen: "Última vez hace 5 min",
    phone: "+1234567890",
    email: "maria@example.com",
  })

  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      text: "Hola, ¿cómo estás?",
      timestamp: "10:30",
      isOwn: false,
      status: "read",
      type: "text",
    },
    {
      id: "2",
      text: "¡Hola! Todo bien, gracias. ¿Y tú qué tal?",
      timestamp: "10:32",
      isOwn: true,
      status: "read",
      type: "text",
    },
    {
      id: "3",
      type: "image",
      text: "Mira esta foto que tomé ayer",
      timestamp: "10:35",
      isOwn: false,
      status: "read",
      fileUrl: "https://picsum.photos/300/200?random=1",
    },
    {
      id: "4",
      type: "audio",
      timestamp: "10:36",
      isOwn: true,
      status: "delivered",
      duration: 15,
    },
    {
      id: "5",
      text: "¿Nos vemos mañana para revisar el proyecto?",
      timestamp: "10:40",
      isOwn: false,
      status: "read",
      type: "text",
    },
    {
      id: "6",
      text: "Perfecto, ¿a qué hora te viene bien?",
      timestamp: "10:42",
      isOwn: true,
      status: "read",
      type: "text",
    },
  ])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    if (contentRef.current) {
      contentRef.current.scrollToBottom(300)
    }
  }

  const handleNavigateToMessage = (messageId: string) => {
    // Simular navegación al mensaje específico
    const messageElement = document.querySelector(`[data-message-id="${messageId}"]`)
    if (messageElement) {
      messageElement.scrollIntoView({ behavior: "smooth", block: "center" })
      // Agregar clase de highlight temporal
      messageElement.classList.add("message-highlighted")
      setTimeout(() => {
        messageElement.classList.remove("message-highlighted")
      }, 2000)
    }
  }

  const handleClearChat = () => {
    // Limpiar todos los mensajes
    setMessages([])
    console.log("Chat limpiado para:", chatId)
    // En backend: DELETE /api/chats/{chatId}/messages
  }

  const handleDeleteChat = () => {
    // Eliminar chat y regresar a la lista
    console.log("Chat eliminado:", chatId)
    router.push("/app/chat", "back")
    // En backend: DELETE /api/chats/{chatId}
  }

  const handleBlockContact = () => {
    // Bloquear contacto y regresar a la lista
    console.log("Contacto bloqueado:", chatInfo.id)
    router.push("/app/chat", "back")
    // En backend: POST /api/contacts/{contactId}/block
  }

  const handleSendMessage = () => {
    if (messageText.trim()) {
      const newMessage: Message = {
        id: Date.now().toString(),
        text: messageText.trim(),
        timestamp: new Date().toLocaleTimeString("es-ES", {
          hour: "2-digit",
          minute: "2-digit",
        }),
        isOwn: true,
        status: "sent",
        type: "text",
      }

      setMessages((prev) => [...prev, newMessage])
      setMessageText("")

      // Simular respuesta automática después de 2 segundos
      setTimeout(() => {
        const autoReply: Message = {
          id: (Date.now() + 1).toString(),
          text: "Mensaje recibido, gracias!",
          timestamp: new Date().toLocaleTimeString("es-ES", {
            hour: "2-digit",
            minute: "2-digit",
          }),
          isOwn: false,
          status: "read",
          type: "text",
        }
        setMessages((prev) => [...prev, autoReply])
      }, 2000)
    }
  }

  const handleKeyPress = (e: any) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const handleAttachmentSelect = (type: "gallery" | "document" | "audio" | "video" | "location") => {
    setIsAttachmentModalOpen(false)

    switch (type) {
      case "gallery":
        handleGallery()
        break
      case "document":
        handleDocument()
        break
      case "audio":
        setIsAudioRecorderOpen(true)
        break
      case "video":
        handleVideo()
        break
      case "location":
        handleLocation()
        break
    }
  }

  const handleGallery = () => {
    // Crear input file invisible para simular selección de galería
    const input = document.createElement("input")
    input.type = "file"
    input.accept = "image/*"
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (file) {
        const reader = new FileReader()
        reader.onload = (e) => {
          const newMessage: Message = {
            id: Date.now().toString(),
            type: "image",
            text: "Imagen de la galería",
            timestamp: new Date().toLocaleTimeString("es-ES", {
              hour: "2-digit",
              minute: "2-digit",
            }),
            isOwn: true,
            status: "sent",
            fileUrl: e.target?.result as string,
          }

          setMessages((prev) => [...prev, newMessage])
        }
        reader.readAsDataURL(file)
      }
    }
    input.click()
  }

  const handleDocument = () => {
    // Simular selección de documento
    const input = document.createElement("input")
    input.type = "file"
    input.accept = ".pdf,.doc,.docx,.txt"
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (file) {
        const newMessage: Message = {
          id: Date.now().toString(),
          type: "document",
          timestamp: new Date().toLocaleTimeString("es-ES", {
            hour: "2-digit",
            minute: "2-digit",
          }),
          isOwn: true,
          status: "sent",
          fileName: file.name,
          fileSize: `${Math.round(file.size / 1024)} KB`,
          fileUrl: URL.createObjectURL(file),
        }

        setMessages((prev) => [...prev, newMessage])
        setToastMessage("Documento enviado")
        setShowToast(true)
      }
    }
    input.click()
  }

  const handleVideo = () => {
    // Simular selección de video
    const newMessage: Message = {
      id: Date.now().toString(),
      type: "video",
      text: "Video compartido",
      timestamp: new Date().toLocaleTimeString("es-ES", {
        hour: "2-digit",
        minute: "2-digit",
      }),
      isOwn: true,
      status: "sent",
      fileUrl: "video-url-placeholder",
      thumbnailUrl: `https://picsum.photos/300/200?random=${Date.now()}`,
    }

    setMessages((prev) => [...prev, newMessage])
    setToastMessage("Video enviado")
    setShowToast(true)
  }

  const handleLocation = () => {
    // Simular compartir ubicación
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const newMessage: Message = {
            id: Date.now().toString(),
            type: "location",
            timestamp: new Date().toLocaleTimeString("es-ES", {
              hour: "2-digit",
              minute: "2-digit",
            }),
            isOwn: true,
            status: "sent",
            location: {
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
              address: "Mi ubicación actual",
            },
          }

          setMessages((prev) => [...prev, newMessage])
          setToastMessage("Ubicación compartida")
          setShowToast(true)
        },
        () => {
          // Simular ubicación si no se puede obtener
          const newMessage: Message = {
            id: Date.now().toString(),
            type: "location",
            timestamp: new Date().toLocaleTimeString("es-ES", {
              hour: "2-digit",
              minute: "2-digit",
            }),
            isOwn: true,
            status: "sent",
            location: {
              latitude: -34.6037,
              longitude: -58.3816,
              address: "Buenos Aires, Argentina",
            },
          }

          setMessages((prev) => [...prev, newMessage])
          setToastMessage("Ubicación compartida")
          setShowToast(true)
        },
      )
    }
  }

  const handleSendAudio = (audioData: { duration: number; size: string; url: string }) => {
    const newMessage: Message = {
      id: Date.now().toString(),
      type: "audio",
      timestamp: new Date().toLocaleTimeString("es-ES", {
        hour: "2-digit",
        minute: "2-digit",
      }),
      isOwn: true,
      status: "sent",
      duration: audioData.duration,
      fileUrl: audioData.url,
      fileSize: audioData.size,
    }

    setMessages((prev) => [...prev, newMessage])
    setToastMessage("Audio enviado")
    setShowToast(true)
  }

  return (
    <IonPage className="chat-detail-page">
      <IonHeader className="ion-no-border">
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton defaultHref="/app/chat" />
          </IonButtons>

          <div className="chat-header-info">
            <IonAvatar className="header-avatar">
              <img src={chatInfo.avatar || "/placeholder.svg"} alt={chatInfo.name} />
            </IonAvatar>
            <div className="header-details">
              <IonTitle className="chat-title">{chatInfo.name}</IonTitle>
              <span className="chat-status">{chatInfo.isOnline ? "En línea" : chatInfo.lastSeen}</span>
            </div>
          </div>

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
            <div
              key={message.id}
              className={`message ${message.isOwn ? "message-own" : "message-other"}`}
              data-message-id={message.id}
            >
              <MessageBubble message={message} />
            </div>
          ))}
        </div>
      </IonContent>

      <div className="message-input-container">
        <IonItem className="message-input-item">
          <IonButton
            fill="clear"
            slot="start"
            className="attachment-button"
            onClick={() => setIsAttachmentModalOpen(true)}
          >
            <IonIcon icon={attach} />
          </IonButton>

          <IonTextarea
            value={messageText}
            onIonInput={(e) => setMessageText(e.detail.value!)}
            onKeyDown={handleKeyPress}
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

      <ChatOptionsModal
        isOpen={isChatOptionsOpen}
        onClose={() => setIsChatOptionsOpen(false)}
        chatInfo={chatInfo}
        messages={messages}
        onClearChat={handleClearChat}
        onDeleteChat={handleDeleteChat}
        onBlockContact={handleBlockContact}
        onNavigateToMessage={handleNavigateToMessage}
      />

      <IonToast
        isOpen={showToast}
        onDidDismiss={() => setShowToast(false)}
        message={toastMessage}
        duration={2000}
        position="top"
      />

      <input ref={fileInputRef} type="file" style={{ display: "none" }} onChange={() => {}} />
    </IonPage>
  )
}

export default ChatDetail
