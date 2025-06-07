import React, { useState } from "react";
import { IonIcon, IonButton, IonImg, useIonActionSheet, IonAlert } from "@ionic/react";
import { play, pause, download, document, trash, close } from "ionicons/icons";
import "./MessageBubble.css";

// Interfaz para los mensajes
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
}

interface MessageBubbleProps {
  message: Message;
  onDeleteMessage: (messageId: string) => void;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ message, onDeleteMessage }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [presentActionSheet] = useIonActionSheet();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const formatTime = (seconds: number = 0) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const handleMessageClick = () => {
    // Solo permitir eliminar si el mensaje es propio y no es uno temporal
    if (message.isOwn && !message.id.startsWith('temp_')) {
      presentActionSheet({
        cssClass: 'custom-action-sheet', // Clase para estilos claros
        buttons: [
          { text: 'Eliminar Mensaje', role: 'destructive', icon: trash, handler: () => setShowDeleteConfirm(true) },
          { text: 'Cancelar', icon: close, role: 'cancel' },
        ],
      });
    }
  };
  
  const renderMessageContent = () => {
    switch (message.type) {
        case "text":
            return <p className="message-text">{message.text}</p>;
        case "image":
            return <IonImg src={message.fileUrl} alt={message.fileName || "Imagen"} className="message-image" />;
        case "audio":
            return (
                <div className="message-audio">
                    <IonButton fill="clear" size="small" onClick={() => setIsPlaying(!isPlaying)}><IonIcon icon={isPlaying ? pause : play} /></IonButton>
                    <span>Audio ({formatTime(message.duration)})</span>
                </div>
            );
        case "document":
            return (
                 <div className="message-document">
                    <IonIcon icon={document} className="document-icon" />
                    <div className="document-details">
                        <span className="document-name">{message.fileName || "Documento"}</span>
                        <span className="document-size">{message.fileSize || ""}</span>
                    </div>
                    {/* SOLUCIÓN: La propiedad 'download' espera un string. */}
                    <IonButton fill="clear" size="small" href={message.fileUrl} download={message.fileName || 'file'}>
                        <IonIcon icon={download} />
                    </IonButton>
                 </div>
            );
        default:
            return <p className="message-text">{message.text || "Mensaje no soportado"}</p>;
    }
  };

  return (
    <>
      <div className="message-bubble" onClick={handleMessageClick}>
        {renderMessageContent()}
        <div className="message-info">
          <span className="message-time">{message.timestamp}</span>
          {message.isOwn && <span className="message-status read">✓✓</span>}
        </div>
      </div>

      <IonAlert
        isOpen={showDeleteConfirm}
        onDidDismiss={() => setShowDeleteConfirm(false)}
        header={'Confirmar'}
        message={'¿Eliminar este mensaje?'}
        buttons={[
          { text: 'Cancelar', role: 'cancel' },
          { text: 'Eliminar', role: 'destructive', handler: () => onDeleteMessage(message.id) },
        ]}
        cssClass="custom-alert" // Asegura que los estilos claros se apliquen
      />
    </>
  );
};

export default MessageBubble;
