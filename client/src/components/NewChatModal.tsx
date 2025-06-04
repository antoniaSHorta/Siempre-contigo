"use client"

import type React from "react"

import { IonModal, IonHeader, IonToolbar, IonTitle, IonContent, IonButton, IonButtons, IonIcon, IonSearchbar, IonList, IonItem, IonLabel, IonAvatar, IonCheckbox, IonFab, IonFabButton, IonBadge } from "@ionic/react"
import { close, checkmark, people, person } from "ionicons/icons"
import { useState } from "react"

interface Contact {
  id: string
  name: string
  email?: string
  phone?: string
  avatar: string
  isOnline: boolean
  lastSeen?: string
}

interface NewChatModalProps {
  isOpen: boolean
  onClose: () => void
  onCreateChat: (contactIds: string[], isGroup: boolean) => void
}

const NewChatModal: React.FC<NewChatModalProps> = ({ isOpen, onClose, onCreateChat }) => {
  const [searchText, setSearchText] = useState("")
  const [selectedContacts, setSelectedContacts] = useState<string[]>([])
  const [isGroupMode, setIsGroupMode] = useState(false)

  // Datos de ejemplo - estos vendrán del backend
  const [contacts] = useState<Contact[]>([
    {
      id: "1",
      name: "Ana Martínez",
      email: "ana@example.com",
      phone: "+1234567890",
      avatar: "https://i.pravatar.cc/150?img=3",
      isOnline: true,
    },
    {
      id: "2",
      name: "Carlos Rodríguez",
      email: "carlos@example.com",
      phone: "+1234567891",
      avatar: "https://i.pravatar.cc/150?img=2",
      isOnline: false,
      lastSeen: "Hace 2 horas",
    },
    {
      id: "3",
      name: "Luis Fernández",
      email: "luis@example.com",
      phone: "+1234567892",
      avatar: "https://i.pravatar.cc/150?img=4",
      isOnline: true,
    },
    {
      id: "4",
      name: "Sofia García",
      email: "sofia@example.com",
      phone: "+1234567893",
      avatar: "https://i.pravatar.cc/150?img=5",
      isOnline: false,
      lastSeen: "Hace 1 día",
    },
    {
      id: "5",
      name: "Miguel Torres",
      email: "miguel@example.com",
      phone: "+1234567894",
      avatar: "https://i.pravatar.cc/150?img=6",
      isOnline: true,
    },
    {
      id: "6",
      name: "Elena Ruiz",
      email: "elena@example.com",
      phone: "+1234567895",
      avatar: "https://i.pravatar.cc/150?img=7",
      isOnline: false,
      lastSeen: "Hace 3 días",
    },
  ])

  const filteredContacts = contacts.filter((contact) => contact.name.toLowerCase().includes(searchText.toLowerCase()))

  const handleContactSelect = (contactId: string) => {
    if (isGroupMode) {
      setSelectedContacts((prev) =>
        prev.includes(contactId) ? prev.filter((id) => id !== contactId) : [...prev, contactId],
      )
    } else {
      onCreateChat([contactId], false)
      handleClose()
    }
  }

  const handleCreateGroup = () => {
    if (selectedContacts.length >= 2) {
      onCreateChat(selectedContacts, true)
      handleClose()
    }
  }

  const handleClose = () => {
    setSearchText("")
    setSelectedContacts([])
    setIsGroupMode(false)
    onClose()
  }

  const toggleGroupMode = () => {
    setIsGroupMode(!isGroupMode)
    setSelectedContacts([])
  }

  return (
    <IonModal isOpen={isOpen} onDidDismiss={handleClose}>
      <IonHeader>
        <IonToolbar>
          <IonTitle>{isGroupMode ? "Nuevo grupo" : "Nuevo chat"}</IonTitle>
          <IonButtons slot="start">
            <IonButton fill="clear" onClick={handleClose}>
              <IonIcon icon={close} />
            </IonButton>
          </IonButtons>
          <IonButtons slot="end">
            <IonButton fill="clear" onClick={toggleGroupMode}>
              <IonIcon icon={isGroupMode ? person : people} />
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>

      <IonContent className="new-chat-content">
        <div className="new-chat-header">
          <IonSearchbar
            value={searchText}
            onIonInput={(e) => setSearchText(e.detail.value!)}
            placeholder="Buscar contactos..."
            className="contact-searchbar"
          />

          {isGroupMode && (
            <div className="group-mode-info">
              <p>Selecciona al menos 2 contactos para crear un grupo</p>
              {selectedContacts.length > 0 && (
                <IonBadge color="primary">{selectedContacts.length} seleccionados</IonBadge>
              )}
            </div>
          )}
        </div>

        <IonList className="contacts-list">
          {filteredContacts.map((contact) => (
            <IonItem key={contact.id} button onClick={() => handleContactSelect(contact.id)} className="contact-item">
              {isGroupMode && (
                <IonCheckbox
                  slot="start"
                  checked={selectedContacts.includes(contact.id)}
                  onIonChange={() => handleContactSelect(contact.id)}
                />
              )}

              <div className="contact-avatar-container">
                <IonAvatar className="contact-avatar">
                  <img src={contact.avatar || "/placeholder.svg"} alt={contact.name} />
                </IonAvatar>
              </div>

              <IonLabel className="contact-label">
                <div className="contact-info">
                  <h2 className="contact-name">{contact.name}</h2>
                  <span className={`contact-status ${contact.isOnline ? "" : "offline"}`}>
                    {contact.isOnline ? "En línea" : contact.lastSeen || "Desconectado"}
                  </span>
                </div>
                {contact.email && <p className="contact-email">{contact.email}</p>}
              </IonLabel>
            </IonItem>
          ))}
        </IonList>

        {filteredContacts.length === 0 && (
          <div className="empty-contacts">
            <IonIcon icon={people} className="empty-icon" />
            <h3>No se encontraron contactos</h3>
            <p>Intenta con otros términos de búsqueda</p>
          </div>
        )}

        {isGroupMode && selectedContacts.length >= 2 && (
          <IonFab vertical="bottom" horizontal="end" slot="fixed">
            <IonFabButton className="create-group-fab" onClick={handleCreateGroup}>
              <IonIcon icon={checkmark} />
            </IonFabButton>
          </IonFab>
        )}
      </IonContent>
    </IonModal>
  )
}

export default NewChatModal
