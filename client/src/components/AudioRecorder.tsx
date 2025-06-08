import type React from "react"

import { IonButton, IonIcon, IonItem, IonLabel, IonProgressBar, IonAlert } from "@ionic/react"
import { mic, stop, play, pause, send, trash } from "ionicons/icons"
import { useState, useEffect, useRef } from "react"

interface AudioRecorderProps {
  isOpen: boolean
  onClose: () => void
  onSendAudio: (audioData: { blob: Blob; duration: number; size: string; url: string }) => void
}

const AudioRecorder: React.FC<AudioRecorderProps> = ({ isOpen, onClose, onSendAudio }) => {
  const [isRecording, setIsRecording] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [recordingTime, setRecordingTime] = useState(0)
  const [hasRecording, setHasRecording] = useState(false)
  const [showAlert, setShowAlert] = useState(false)

  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const audioUrlRef = useRef<string>("")
  const audioBlobRef = useRef<Blob | null>(null);

  useEffect(() => {
    if (isOpen) {
      setIsRecording(false)
      setIsPlaying(false)
      setRecordingTime(0)
      setHasRecording(false)
      if (audioUrlRef.current) {
        URL.revokeObjectURL(audioUrlRef.current)
        audioUrlRef.current = ""
      }
      audioBlobRef.current = null; // Limpiar el Blob también
    }
  }, [isOpen])

  const startRecording = async () => {
    try {
      // Solicitar acceso al micrófono
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      // Crear MediaRecorder
      const mediaRecorder = new MediaRecorder(stream)
      mediaRecorderRef.current = mediaRecorder
      audioChunksRef.current = [] // Reiniciar chunks de audio

      // Manejar datos disponibles (chunks de audio)
      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data)
      }

      // Manejar el final de la grabación
      mediaRecorder.onstop = () => {
        // Crear el Blob final a partir de los chunks
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/wav" }) // O "audio/mpeg", "audio/webm" dependiendo del navegador/formato
        audioBlobRef.current = audioBlob; // Guardar el Blob
        audioUrlRef.current = URL.createObjectURL(audioBlob) // Crear URL para reproducción local
        setHasRecording(true)
        // Detener las pistas de la transmisión (liberar el micrófono)
        stream.getTracks().forEach((track) => track.stop())
      }

      mediaRecorder.start() // Iniciar grabación
      setIsRecording(true)
      setRecordingTime(0)

      // Iniciar contador de tiempo
      intervalRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1)
      }, 1000)
    } catch (error) {
      console.error("Error accessing microphone:", error)
      setShowAlert(true) // Mostrar alerta si falla el acceso al micrófono
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop() // Detener la grabación
      setIsRecording(false)

      // Detener el contador de tiempo
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }
  }

  const playRecording = () => {
    if (audioUrlRef.current) {
      const audio = new Audio(audioUrlRef.current)
      audio.play()
      setIsPlaying(true)

      audio.onended = () => {
        setIsPlaying(false)
      }
    }
  }

  const deleteRecording = () => {
    if (audioUrlRef.current) {
      URL.revokeObjectURL(audioUrlRef.current) // Liberar la URL del objeto
      audioUrlRef.current = ""
    }
    audioBlobRef.current = null; // Eliminar el Blob
    setHasRecording(false)
    setRecordingTime(0)
  }

  const sendRecording = () => {
    if (hasRecording && audioBlobRef.current) { // Asegurarse de que el Blob exista
      const audioData = {
        blob: audioBlobRef.current, // Pasar el Blob real
        duration: recordingTime,
        size: `${Math.round(audioBlobRef.current.size / 1024)} KB`, // Calcular tamaño real del Blob
        url: audioUrlRef.current, // URL temporal para previsualización
      }

      onSendAudio(audioData) // Llamar al callback con los datos de audio
      onClose() // Cerrar el modal
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  if (!isOpen) return null // No renderizar si no está abierto

  return (
    <div className="audio-recorder-overlay">
      <div className="audio-recorder-modal">
        <div className="recorder-header">
          <h3>Grabar Audio</h3>
        </div>

        <div className="recorder-content">
          {!hasRecording ? (
            <div className="recording-section">
              <div className="recording-visualizer">
                <div className={`mic-icon ${isRecording ? "recording" : ""}`}>
                  <IonIcon icon={mic} />
                </div>
                {isRecording && (
                  <div className="recording-waves">
                    <div className="wave"></div>
                    <div className="wave"></div>
                    <div className="wave"></div>
                  </div>
                )}
              </div>

              <div className="recording-time">{formatTime(recordingTime)}</div>

              {isRecording && <IonProgressBar type="indeterminate" className="recording-progress" />}
            </div>
          ) : (
            <div className="playback-section">
              <IonItem>
                <IonIcon icon={mic} slot="start" />
                <IonLabel>
                  <h3>Audio grabado</h3>
                  <p>Duración: {formatTime(recordingTime)}</p>
                </IonLabel>
                <IonButton fill="clear" slot="end" onClick={playRecording} disabled={isPlaying}>
                  <IonIcon icon={isPlaying ? pause : play} />
                </IonButton>
              </IonItem>
            </div>
          )}
        </div>

        <div className="recorder-actions">
          {!hasRecording ? (
            <>
              <IonButton fill="outline" color="medium" onClick={onClose} disabled={isRecording}>
                Cancelar
              </IonButton>

              {!isRecording ? (
                <IonButton color="danger" onClick={startRecording}>
                  <IonIcon icon={mic} slot="start" />
                  Grabar
                </IonButton>
              ) : (
                <IonButton color="medium" onClick={stopRecording}>
                  <IonIcon icon={stop} slot="start" />
                  Detener
                </IonButton>
              )}
            </>
          ) : (
            <>
              <IonButton fill="outline" color="danger" onClick={deleteRecording}>
                <IonIcon icon={trash} slot="start" />
                Eliminar
              </IonButton>

              <IonButton color="primary" onClick={sendRecording}>
                <IonIcon icon={send} slot="start" />
                Enviar
              </IonButton>
            </>
          )}
        </div>
      </div>

      <IonAlert
        isOpen={showAlert}
        onDidDismiss={() => setShowAlert(false)}
        header="Error"
        message="No se pudo acceder al micrófono. Verifica los permisos."
        buttons={["OK"]}
      />
    </div>
  )
}

export default AudioRecorder;