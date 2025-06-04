"use client"

import type React from "react"

import { IonActionSheet } from "@ionic/react"
import { image, document, mic, videocam, location } from "ionicons/icons"

interface AttachmentModalProps {
  isOpen: boolean
  onClose: () => void
  onSelectOption: (type: "gallery" | "document" | "audio" | "video" | "location") => void
}

const AttachmentModal: React.FC<AttachmentModalProps> = ({ isOpen, onClose, onSelectOption }) => {
  const actionSheetButtons = [
    {
      text: "Galería",
      icon: image,
      handler: () => onSelectOption("gallery"),
    },
    {
      text: "Documento",
      icon: document,
      handler: () => onSelectOption("document"),
    },
    {
      text: "Audio",
      icon: mic,
      handler: () => onSelectOption("audio"),
    },
    {
      text: "Video",
      icon: videocam,
      handler: () => onSelectOption("video"),
    },
    {
      text: "Ubicación",
      icon: location,
      handler: () => onSelectOption("location"),
    },
    {
      text: "Cancelar",
      role: "cancel",
    },
  ]

  return (
    <IonActionSheet isOpen={isOpen} onDidDismiss={onClose} buttons={actionSheetButtons} header="Seleccionar adjunto" />
  )
}

export default AttachmentModal
