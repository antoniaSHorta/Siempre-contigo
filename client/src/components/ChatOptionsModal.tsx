"use client"

import type React from "react"

import { IonActionSheet, IonAlert, IonModal, IonHeader, IonToolbar, IonTitle, IonContent, IonButton, IonButtons, IonIcon, IonItem, IonLabel, IonAvatar, IonToggle, IonList, IonListHeader, IonToast } from "@ionic/react"
import { informationCircle, search, notifications, notificationsOff, trash, ban, close, person } from "ionicons/icons"
import { useState } from "react"
import ChatSearchModal from "./ChatSearchModal"

interface ChatOptionsModalProps {
  isOpen: boolean
  onClose: () => void
  chatInfo: {
    id: string
    name: string
    avatar: string
    isOnline: boolean
    phone?: string
    email?: string
  }
  messages?: Array<{
    id: string
    text?: string
    timestamp: string
    isOwn: boolean
    type: string
  }>
  onClearChat?: () => void
  onDeleteChat?: () => void
  onBlockContact?: () => void
  onNavigateToMessage?: (messageId: string) => void
}

const ChatOptionsModal: React.FC<ChatOptionsModalProps> = ({
  isOpen,
  onClose,
  chatInfo,
  messages = [],
  onClearChat,
  onDeleteChat,
  onBlockContact,
  onNavigateToMessage,
}) => {
  const [showDeleteAlert, setShowDeleteAlert] = useState(false)
  const [showBlockAlert, setShowBlockAlert] = useState(false)
  const [showClearAlert, setShowClearAlert] = useState(false)
  const [showContactInfo, setShowContactInfo] = useState(false)
  const [showSearchModal, setShowSearchModal] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [showToast, setShowToast] = useState(false)
  const [toastMessage, setToastMessage] = useState("")
  const [toastColor, setToastColor] = useState<"success" | "warning" | "danger">("success")

  const showToastMessage = (message: string, color: "success" | "warning" | "danger" = "success") => {
    setToastMessage(message)
    setToastColor(color)
    setShowToast(true)
  }

  const handleSearchInChat = () => {
    onClose()
    setShowSearchModal(true)
  }

  const handleMuteToggle = () => {
    setIsMuted(!isMuted)
    const message = isMuted ? "Notificaciones activadas" : "Chat silenciado"
    showToastMessage(message)

    // Aquí se conectaría con el backend
    console.log("Toggle mute for chat:", chatInfo.id, "muted:", !isMuted)
  }

  const handleClearChat = () => {
    setShowClearAlert(false)
    onClose()

    // Simular limpieza del chat
    if (onClearChat) {
      onClearChat()
    }

    showToastMessage("Conversación limpiada", "warning")

    // Aquí se conectaría con el backend
    console.log("Clear chat:", chatInfo.id)
    // API call: DELETE /api/chats/{chatId}/messages
  }

  const handleDeleteChat = () => {
    setShowDeleteAlert(false)
    onClose()

    // Simular eliminación del chat
    if (onDeleteChat) {
      onDeleteChat()
    }

    showToastMessage("Chat eliminado", "danger")

    // Aquí se conectaría con el backend
    console.log("Delete chat:", chatInfo.id)
    // API call: DELETE /api/chats/{chatId}
  }

  const handleBlockContact = () => {
    setShowBlockAlert(false)
    onClose()

    // Simular bloqueo del contacto
    if (onBlockContact) {
      onBlockContact()
    }

    showToastMessage(`${chatInfo.name} ha sido bloqueado`, "danger")

    // Aquí se conectaría con el backend
    console.log("Block contact:", chatInfo.id)
    // API call: POST /api/contacts/{contactId}/block
  }

  const handleNavigateToMessage = (messageId: string) => {
    if (onNavigateToMessage) {
      onNavigateToMessage(messageId)
    }
    setShowSearchModal(false)
  }

  const actionSheetButtons = [
    {
      text: "Ver información",
      icon: informationCircle,
      handler: () => setShowContactInfo(true),
    },
    {
      text: "Buscar en conversación",
      icon: search,
      handler: handleSearchInChat,
    },
    {
      text: isMuted ? "Activar notificaciones" : "Silenciar notificaciones",
      icon: isMuted ? notifications : notificationsOff,
      handler: handleMuteToggle,
    },
    {
      text: "Limpiar conversación",
      icon: trash,
      handler: () => setShowClearAlert(true),
    },
    {
      text: "Eliminar chat",
      icon: trash,
      role: "destructive",
      handler: () => setShowDeleteAlert(true),
    },
    {
      text: "Bloquear contacto",
      icon: ban,
      role: "destructive",
      handler: () => setShowBlockAlert(true),
    },
    {
      text: "Cancelar",
      role: "cancel",
    },
  ]

  return (
    <>
      <IonActionSheet
        isOpen={isOpen && !showContactInfo && !showSearchModal}
        onDidDismiss={onClose}
        buttons={actionSheetButtons}
        header="Opciones del chat"
      />

      {/* Modal de información del contacto */}
      <IonModal isOpen={showContactInfo} onDidDismiss={() => setShowContactInfo(false)}>
        <IonHeader>
          <IonToolbar>
            <IonTitle>Información del contacto</IonTitle>
            <IonButtons slot="end">
              <IonButton fill="clear" onClick={() => setShowContactInfo(false)}>
                <IonIcon icon={close} />
              </IonButton>
            </IonButtons>
          </IonToolbar>
        </IonHeader>

        <IonContent className="contact-info-content">
          <div className="contact-header">
            <IonAvatar className="contact-avatar">
              <img src={chatInfo.avatar || "/placeholder.svg"} alt={chatInfo.name} />
            </IonAvatar>
            <h2 className="contact-name">{chatInfo.name}</h2>
            <p className="contact-status">{chatInfo.isOnline ? "En línea" : "Desconectado"}</p>
          </div>

          <IonList>
            <IonListHeader>
              <IonLabel>Información</IonLabel>
            </IonListHeader>

            <IonItem>
              <IonIcon icon={person} slot="start" />
              <IonLabel>
                <h3>Nombre</h3>
                <p>{chatInfo.name}</p>
              </IonLabel>
            </IonItem>

            {chatInfo.phone && (
              <IonItem>
                <IonIcon icon={person} slot="start" />
                <IonLabel>
                  <h3>Teléfono</h3>
                  <p>{chatInfo.phone}</p>
                </IonLabel>
              </IonItem>
            )}

            {chatInfo.email && (
              <IonItem>
                <IonIcon icon={person} slot="start" />
                <IonLabel>
                  <h3>Email</h3>
                  <p>{chatInfo.email}</p>
                </IonLabel>
              </IonItem>
            )}
          </IonList>

          <IonList>
            <IonListHeader>
              <IonLabel>Configuraciones</IonLabel>
            </IonListHeader>

            <IonItem>
              <IonIcon icon={isMuted ? notificationsOff : notifications} slot="start" />
              <IonLabel>Silenciar notificaciones</IonLabel>
              <IonToggle checked={isMuted} onIonChange={handleMuteToggle} slot="end" />
            </IonItem>
          </IonList>

          <div className="contact-danger-zone">
            <IonButton expand="block" fill="outline" color="medium" onClick={() => setShowClearAlert(true)}>
              Limpiar conversación
            </IonButton>
            <IonButton expand="block" fill="outline" color="danger" onClick={() => setShowDeleteAlert(true)}>
              Eliminar chat
            </IonButton>
            <IonButton expand="block" fill="outline" color="danger" onClick={() => setShowBlockAlert(true)}>
              Bloquear contacto
            </IonButton>
          </div>
        </IonContent>
      </IonModal>

      {/* Modal de búsqueda */}
      <ChatSearchModal
        isOpen={showSearchModal}
        onClose={() => setShowSearchModal(false)}
        onNavigateToMessage={handleNavigateToMessage}
        messages={messages}
      />

      {/* Alert para limpiar chat */}
      <IonAlert
        isOpen={showClearAlert}
        onDidDismiss={() => setShowClearAlert(false)}
        header="Limpiar conversación"
        message={`¿Estás seguro de que quieres eliminar todos los mensajes de la conversación con ${chatInfo.name}? Esta acción no se puede deshacer.`}
        buttons={[
          {
            text: "Cancelar",
            role: "cancel",
          },
          {
            text: "Limpiar",
            role: "destructive",
            handler: handleClearChat,
          },
        ]}
      />

      {/* Alert para eliminar chat */}
      <IonAlert
        isOpen={showDeleteAlert}
        onDidDismiss={() => setShowDeleteAlert(false)}
        header="Eliminar chat"
        message={`¿Estás seguro de que quieres eliminar completamente la conversación con ${chatInfo.name}? Esta acción no se puede deshacer.`}
        buttons={[
          {
            text: "Cancelar",
            role: "cancel",
          },
          {
            text: "Eliminar",
            role: "destructive",
            handler: handleDeleteChat,
          },
        ]}
      />

      {/* Alert para bloquear contacto */}
      <IonAlert
        isOpen={showBlockAlert}
        onDidDismiss={() => setShowBlockAlert(false)}
        header="Bloquear contacto"
        message={`¿Estás seguro de que quieres bloquear a ${chatInfo.name}? No podrás recibir mensajes de este contacto y será eliminado de tu lista de chats.`}
        buttons={[
          {
            text: "Cancelar",
            role: "cancel",
          },
          {
            text: "Bloquear",
            role: "destructive",
            handler: handleBlockContact,
          },
        ]}
      />

      {/* Toast para feedback */}
      <IonToast
        isOpen={showToast}
        onDidDismiss={() => setShowToast(false)}
        message={toastMessage}
        duration={3000}
        position="top"
        color={toastColor}
      />
    </>
  )
}

export default ChatOptionsModal
