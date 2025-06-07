"use client";

import type React from "react";
import { IonModal, IonHeader, IonToolbar, IonTitle, IonContent, IonButton, IonButtons, IonIcon, IonSearchbar, IonList, IonItem, IonLabel, IonAvatar, IonCheckbox, IonFab, IonFabButton, IonBadge, IonSpinner, IonText, useIonToast, IonInput } from "@ionic/react";
import { close, checkmark, people, person } from "ionicons/icons";
import { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import axios from "axios";

interface SelectableUser {
  id: string;
  name: string;
  avatar: string;
}

interface NewChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  onChatCreated: () => void;
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

const NewChatModal: React.FC<NewChatModalProps> = ({ isOpen, onClose, onChatCreated }) => {
  const { user: currentUser } = useAuth();
  const [presentToast] = useIonToast();

  const [searchText, setSearchText] = useState("");
  const [selectedContacts, setSelectedContacts] = useState<Set<string>>(new Set());
  const [isGroupMode, setIsGroupMode] = useState(false);
  const [groupName, setGroupName] = useState("");

  const [allUsers, setAllUsers] = useState<SelectableUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // useEffect(() => {
  //   if (isOpen) {
  //     const fetchUsers = async () => {
  //       setIsLoading(true);
  //       setError(null);
  //       try {
  //         const token = localStorage.getItem("token");
  //         const response = await axios.get(`${API_BASE_URL}/admin`, {
  //           headers: { Authorization: `Bearer ${token}` },
  //         });

  //         const selectableUsers = response.data.users
  //           .filter((u: any) => u.id.toString() !== currentUser?.id.toString())
  //           .map((u: any): SelectableUser => ({
  //               id: u.id.toString(),
  //               name: u.name,
  //               avatar: `https://i.pravatar.cc/150?u=${u.id}`
  //           }));
  //         setAllUsers(selectableUsers);
  //       } catch (err) {
  //         setError("No se pudo cargar la lista de usuarios.");
  //         console.error(err);
  //       } finally {
  //         setIsLoading(false);
  //       }
  //     };
  //     fetchUsers();
  //   } else {
  //       setSearchText("");
  //       setSelectedContacts(new Set());
  //       setIsGroupMode(false);
  //       setGroupName("");
  //   }
  // }, [isOpen, currentUser]);
  
  useEffect(() => {
    if (isOpen) {
      const fetchUsers = async () => {
        setIsLoading(true);
        setError(null);
        try {
          const token = localStorage.getItem("token");
          const response = await axios.get(`${API_BASE_URL}/chat/availableContacts/${currentUser.id}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          console.log(response)
          const selectableUsers = response.data.data
            .filter((u: any) => u.id.toString() !== currentUser?.id.toString())
            .map((u: any): SelectableUser => ({
                id: u.id.toString(),
                name: u.name,
                avatar: `https://i.pravatar.cc/150?u=${u.id}`
            }));
          setAllUsers(selectableUsers);
        } catch (err) {
          setError("No se pudo cargar la lista de usuarios.");
          console.error(err);
        } finally {
          setIsLoading(false);
        }
      };
      fetchUsers();
    } else {
        setSearchText("");
        setSelectedContacts(new Set());
        setIsGroupMode(false);
        setGroupName("");
    }
  }, [isOpen, currentUser]);
  

  const handleContactSelect = (contactId: string) => {
    if (!isGroupMode) {
      handleCreate([contactId]);
    } else {
      const newSelection = new Set(selectedContacts);
      if (newSelection.has(contactId)) {
        newSelection.delete(contactId);
      } else {
        newSelection.add(contactId);
      }
      setSelectedContacts(newSelection);
    }
  };

  const handleCreate = async (participantIds?: string[]) => {
    const finalParticipantIds = participantIds || Array.from(selectedContacts);

    if (finalParticipantIds.length === 0) {
      presentToast({ message: 'Selecciona al menos un contacto', duration: 2000, color: 'warning' });
      return;
    }
    
    const allParticipants = [currentUser!.id.toString(), ...finalParticipantIds];
    const isGroup = allParticipants.length > 2;
    
    if (isGroup && !groupName.trim()) {
       presentToast({ message: 'Por favor, ingresa un nombre para el grupo', duration: 2000, color: 'warning' });
       return;
    }
    
    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      await axios.post(`${API_BASE_URL}/chat`, {
        title: isGroup ? groupName : null,
        participants: allParticipants,
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      onChatCreated(); 
    } catch (err) {
      presentToast({ message: 'Error al crear el chat', duration: 2000, color: 'danger' });
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredContacts = allUsers.filter(contact => 
    contact.name.toLowerCase().includes(searchText.toLowerCase())
  );

  return (
    <IonModal isOpen={isOpen} onDidDismiss={onClose}>
      <IonHeader>
        <IonToolbar>
          <IonTitle>{isGroupMode ? "Nuevo Grupo" : "Nuevo Chat"}</IonTitle>
          <IonButtons slot="start">
            <IonButton fill="clear" onClick={onClose}>
              <IonIcon icon={close} />
            </IonButton>
          </IonButtons>
           <IonButtons slot="end">
            <IonButton fill="clear" onClick={() => setIsGroupMode(!isGroupMode)}>
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
              <IonItem>
                  <IonInput
                    value={groupName}
                    onIonChange={e => setGroupName(e.detail.value!)}
                    placeholder="Nombre del Grupo"
                  />
              </IonItem>
              {selectedContacts.size > 0 && <IonBadge color="primary">{selectedContacts.size} seleccionados</IonBadge>}
            </div>
          )}
        </div>
        
        {isLoading && <IonSpinner />}
        {error && <IonText color="danger" className="ion-padding">{error}</IonText>}

        {!isLoading && !error && (
            <IonList className="contacts-list">
              {filteredContacts.map((contact) => (
                <IonItem key={contact.id} button={!isGroupMode} onClick={() => handleContactSelect(contact.id)} className="contact-item">
                  {isGroupMode && (
                    <IonCheckbox
                      slot="start"
                      checked={selectedContacts.has(contact.id)}
                      onIonChange={() => handleContactSelect(contact.id)}
                    />
                  )}
                  <IonAvatar className="contact-avatar">
                    <img src={contact.avatar} alt={contact.name} />
                  </IonAvatar>
                  <IonLabel className="contact-label">{contact.name}</IonLabel>
                </IonItem>
              ))}
            </IonList>
        )}

        {isGroupMode && (
          <IonFab vertical="bottom" horizontal="end" slot="fixed">
            <IonFabButton className="create-group-fab" onClick={() => handleCreate()} disabled={selectedContacts.size === 0}>
              <IonIcon icon={checkmark} />
            </IonFabButton>
          </IonFab>
        )}
      </IonContent>
    </IonModal>
  );
};

export default NewChatModal;