import React, { useState, useRef } from "react"; // Añadimos useRef para el audio
import { IonIcon, IonButton, IonImg, useIonActionSheet, IonAlert } from "@ionic/react";
import { play, pause, download, document, trash, close, musicalNotes, film } from "ionicons/icons"; // Añadimos nuevos iconos
import "./MessageBubble.css";

// Interfaz para los mensajes (mantener consistente con ChatDetail)
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
  duration?: number; // Para audio/video
  thumbnailUrl?: string; // Para imágenes/videos
  location?: { // Si implementas ubicación
    latitude: number;
    longitude: number;
    address?: string;
  };
}

interface MessageBubbleProps {
  message: Message;
  onDeleteMessage: (messageId: string) => void;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ message, onDeleteMessage }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [presentActionSheet] = useIonActionSheet();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null); // Referencia para el elemento de audio

  // Para manejar la reproducción de audio
  const toggleAudioPlayback = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const formatTime = (seconds: number = 0) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const handleMessageClick = () => {
    // Solo permitir eliminar si el mensaje es propio y no es uno temporal
    // Los mensajes optimistas (con id como 'temp_') no deben ofrecer opción de eliminar hasta que sean confirmados por el backend.
    if (message.isOwn && !message.id.startsWith('temp_')) { // Asegúrate de que tus IDs temporales empiecen con 'temp_'
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
        return (
          <div className="message-image-container">
            {message.fileUrl && (
              <>
                <IonImg src={message.fileUrl} alt={message.fileName || "Imagen"} className="message-image" />
                {message.fileName && (
                  <p className="image-filename">
                    <IonIcon icon={download} /> {message.fileName}
                  </p>
                )}
              </>
            )}
            {!message.fileUrl && message.fileName && (
              <div className="placeholder-content">
                  <IonIcon icon={download} />
                  <span>{message.fileName}</span>
                  {message.fileSize && <span>({message.fileSize})</span>}
                  <p>Cargando imagen...</p>
              </div>
            )}
          </div>
        );

      case "audio":
        return (
          <div className="message-audio-container">
            <IonButton fill="clear" size="small" onClick={toggleAudioPlayback}>
              <IonIcon icon={isPlaying ? pause : play} />
            </IonButton>
            <IonIcon icon={musicalNotes} className="audio-icon" />
            <span className="audio-filename">{message.fileName || "Audio"}</span>
            {message.duration !== undefined && (
              <span className="audio-duration">({formatTime(message.duration)})</span>
            )}
            {message.fileUrl && (
              <audio ref={audioRef} src={message.fileUrl} onEnded={() => setIsPlaying(false)} preload="none" />
            )}
            {message.fileUrl && (
                <IonButton fill="clear" size="small" href={message.fileUrl} download={message.fileName || 'audio.wav'}>
                    <IonIcon icon={download} />
                </IonButton>
            )}
          </div>
        );

      case "video":
        return (
          <div className="message-video-container">
            {message.fileUrl && (
              <>
                {/* Puedes usar un tag <video> para reproducción in-line o un enlace */}
                <video controls className="message-video">
                  <source src={message.fileUrl} type="video/mp4" /> {/* Ajusta el tipo MIME según el video */}
                  Tu navegador no soporta el elemento de video.
                </video>
                {/* Si TalkJS proporciona thumbnail, puedes usarlo aquí */}
                {/* <IonImg src={message.thumbnailUrl} alt="Video Thumbnail" className="video-thumbnail" /> */}
                <p className="video-filename">
                  <IonIcon icon={film} /> {message.fileName || "Video"}
                </p>
              </>
            )}
            {!message.fileUrl && message.fileName && (
              <div className="placeholder-content">
                  <IonIcon icon={film} />
                  <span>{message.fileName}</span>
                  {message.fileSize && <span>({message.fileSize})</span>}
                  <p>Cargando video...</p>
              </div>
            )}
            {message.fileUrl && (
                <IonButton fill="clear" size="small" href={message.fileUrl} download={message.fileName || 'video.mp4'}>
                    <IonIcon icon={download} />
                </IonButton>
            )}
          </div>
        );

      case "document":
        return (
          <div className="message-document-container">
            <IonIcon icon={document} className="document-icon" />
            <div className="document-details">
              <span className="document-name">{message.fileName || "Documento"}</span>
              {message.fileSize && <span className="document-size">{message.fileSize}</span>}
            </div>
            {message.fileUrl && (
              <IonButton fill="clear" size="small" href={message.fileUrl} download={message.fileName || 'document'}>
                <IonIcon icon={download} />
              </IonButton>
            )}
            {!message.fileUrl && message.fileName && (
              <div className="placeholder-content">
                  <IonIcon icon={document} />
                  <span>{message.fileName}</span>
                  {message.fileSize && <span>({message.fileSize})</span>}
                  <p>Cargando documento...</p>
              </div>
            )}
          </div>
        );

      case "location":
        // Aquí puedes renderizar un mapa estático o un enlace a Google Maps
        // TalkJS no tiene un tipo de adjunto 'location' nativo, esto sería personalizado
        return (
          <div className="message-location-container">
            <IonIcon icon="location-outline" /> {/* Asegúrate de importar 'location-outline' si lo usas */}
            {message.location?.address && <p>{message.location.address}</p>}
            {message.location?.latitude && message.location?.longitude && (
              <a
                href={`https://maps.google.com/?q=${message.location.latitude},${message.location.longitude}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                Ver en el mapa
              </a>
            )}
            {!message.location?.address && !message.location?.latitude && <p>Ubicación compartida</p>}
          </div>
        );

      default:
        // Fallback para tipos de mensajes no reconocidos, o si 'text' está presente con un adjunto
        return <p className="message-text">{message.text || "Mensaje no soportado"}</p>;
    }
  };

  return (
    <>
      <div className={`message-bubble ${message.isOwn ? "own" : "other"}`} onClick={handleMessageClick}>
        {renderMessageContent()}
        <div className="message-info">
          <span className="message-time">{message.timestamp}</span>
          {message.isOwn && <span className="message-status read">✓✓</span>} {/* O un ícono de verificación */}
        </div>
      </div>

      <IonAlert
        isOpen={showDeleteConfirm}
        onDidDismiss={() => setShowDeleteConfirm(false)}
        header={'Confirmar'}
        message={'¿Estás seguro de que quieres eliminar este mensaje? Esta acción no se puede deshacer.'}
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