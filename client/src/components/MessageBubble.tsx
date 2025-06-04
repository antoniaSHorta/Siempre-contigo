"use client"

import type React from "react"

import { IonIcon, IonButton, IonImg } from "@ionic/react"
import { play, pause, download, document, location, videocam } from "ionicons/icons"
import { useState } from "react"

interface MessageBubbleProps {
  message: {
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
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ message }) => {
  const [isPlaying, setIsPlaying] = useState(false)

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "sent":
        return "✓"
      case "delivered":
        return "✓✓"
      case "read":
        return "✓✓"
      default:
        return ""
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  const handlePlayAudio = () => {
    if (message.fileUrl) {
      const audio = new Audio(message.fileUrl)
      setIsPlaying(true)
      audio.play()

      audio.onended = () => {
        setIsPlaying(false)
      }
    }
  }

  const handleDownload = () => {
    if (message.fileUrl) {
      // Implementación de descarga del archivo
      console.log("Descargando archivo:", message.fileName)
    }
  }

  const renderMessageContent = () => {
    switch (message.type) {
      case "text":
        return <p className="message-text">{message.text}</p>

      case "image":
        return (
          <div className="message-image">
            <IonImg
              src={message.fileUrl || "/placeholder.svg?height=200&width=300"}
              alt="Imagen"
              className="image-content"
            />
            {message.text && <p className="message-caption">{message.text}</p>}
          </div>
        )

      case "audio":
        return (
          <div className="message-audio">
            <div className="audio-controls">
              <IonButton fill="clear" size="small" onClick={handlePlayAudio} disabled={isPlaying}>
                <IonIcon icon={isPlaying ? pause : play} />
              </IonButton>
              <div className="audio-info">
                <div className="audio-waveform">
                  <div className="waveform-bars">
                    {[...Array(20)].map((_, i) => (
                      <div key={i} className="bar" style={{ height: `${Math.random() * 100}%` }}></div>
                    ))}
                  </div>
                </div>
                <span className="audio-duration">{message.duration ? formatTime(message.duration) : "0:00"}</span>
              </div>
            </div>
          </div>
        )

      case "document":
        return (
          <div className="message-document">
            <div className="document-info">
              <IonIcon icon={document} className="document-icon" />
              <div className="document-details">
                <span className="document-name">{message.fileName || "Documento"}</span>
                <span className="document-size">{message.fileSize || "0 KB"}</span>
              </div>
              <IonButton fill="clear" size="small" onClick={handleDownload}>
                <IonIcon icon={download} />
              </IonButton>
            </div>
          </div>
        )

      case "video":
        return (
          <div className="message-video">
            <div className="video-thumbnail">
              <img
                src={message.thumbnailUrl || "/placeholder.svg?height=200&width=300"}
                alt="Video thumbnail"
                className="thumbnail-image"
              />
              <div className="video-overlay">
                <IonIcon icon={videocam} className="video-icon" />
              </div>
            </div>
            {message.text && <p className="message-caption">{message.text}</p>}
          </div>
        )

      case "location":
        return (
          <div className="message-location">
            <div className="location-map">
              <img src="/placeholder.svg?height=150&width=250" alt="Mapa" className="map-image" />
              <div className="location-overlay">
                <IonIcon icon={location} className="location-icon" />
              </div>
            </div>
            <div className="location-info">
              <span className="location-address">{message.location?.address || "Ubicación compartida"}</span>
            </div>
          </div>
        )

      default:
        return <p className="message-text">{message.text}</p>
    }
  }

  return (
    <div className="message-bubble">
      {renderMessageContent()}
      <div className="message-info">
        <span className="message-time">{message.timestamp}</span>
        {message.isOwn && (
          <span className={`message-status ${message.status === "read" ? "read" : ""}`}>
            {getStatusIcon(message.status)}
          </span>
        )}
      </div>
    </div>
  )
}

export default MessageBubble
