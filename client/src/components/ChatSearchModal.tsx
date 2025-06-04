"use client"

import type React from "react"

import { IonModal, IonHeader, IonToolbar, IonTitle, IonContent, IonButton, IonButtons, IonIcon, IonSearchbar, IonList, IonItem, IonLabel } from "@ionic/react"
import { close, chevronUp, chevronDown, search } from "ionicons/icons"
import { useState, useEffect } from "react"

interface SearchResult {
  messageId: string
  text: string
  timestamp: string
  isOwn: boolean
  context: string // Texto antes y después para contexto
  highlightedText: string // Texto con highlight
}

interface ChatSearchModalProps {
  isOpen: boolean
  onClose: () => void
  onNavigateToMessage: (messageId: string) => void
  messages: Array<{
    id: string
    text?: string
    timestamp: string
    isOwn: boolean
    type: string
  }>
}

const ChatSearchModal: React.FC<ChatSearchModalProps> = ({ isOpen, onClose, onNavigateToMessage, messages }) => {
  const [searchText, setSearchText] = useState("")
  const [searchResults, setSearchResults] = useState<SearchResult[]>([])
  const [currentResultIndex, setCurrentResultIndex] = useState(-1)
  const [isSearching, setIsSearching] = useState(false)

  useEffect(() => {
    if (searchText.trim().length >= 2) {
      performSearch(searchText.trim())
    } else {
      setSearchResults([])
      setCurrentResultIndex(-1)
    }
  }, [searchText, messages])

  const performSearch = (query: string) => {
    setIsSearching(true)

    // Simular delay de búsqueda
    setTimeout(() => {
      const results: SearchResult[] = []
      const lowerQuery = query.toLowerCase()

      messages.forEach((message, index) => {
        if (message.text && message.text.toLowerCase().includes(lowerQuery)) {
          // Crear contexto (mensaje anterior y siguiente)
          const prevMessage = index > 0 ? messages[index - 1] : null
          const nextMessage = index < messages.length - 1 ? messages[index + 1] : null

          let context = ""
          if (prevMessage?.text) {
            context += `...${prevMessage.text.slice(-30)} `
          }
          context += message.text
          if (nextMessage?.text) {
            context += ` ${nextMessage.text.slice(0, 30)}...`
          }

          // Crear texto con highlight
          const highlightedText = message.text.replace(
            new RegExp(`(${query})`, "gi"),
            '<mark class="search-highlight">$1</mark>',
          )

          results.push({
            messageId: message.id,
            text: message.text,
            timestamp: message.timestamp,
            isOwn: message.isOwn,
            context: context.length > 100 ? context.slice(0, 100) + "..." : context,
            highlightedText,
          })
        }
      })

      setSearchResults(results)
      setCurrentResultIndex(results.length > 0 ? 0 : -1)
      setIsSearching(false)
    }, 300)
  }

  const navigateToResult = (index: number) => {
    if (index >= 0 && index < searchResults.length) {
      setCurrentResultIndex(index)
      const result = searchResults[index]
      onNavigateToMessage(result.messageId)
      onClose()
    }
  }

  const navigateNext = () => {
    const nextIndex = currentResultIndex < searchResults.length - 1 ? currentResultIndex + 1 : 0
    navigateToResult(nextIndex)
  }

  const navigatePrevious = () => {
    const prevIndex = currentResultIndex > 0 ? currentResultIndex - 1 : searchResults.length - 1
    navigateToResult(prevIndex)
  }

  const handleResultClick = (index: number) => {
    navigateToResult(index)
  }

  const handleClose = () => {
    setSearchText("")
    setSearchResults([])
    setCurrentResultIndex(-1)
    onClose()
  }

  return (
    <IonModal isOpen={isOpen} onDidDismiss={handleClose}>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Buscar en conversación</IonTitle>
          <IonButtons slot="end">
            <IonButton fill="clear" onClick={handleClose}>
              <IonIcon icon={close} />
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>

      <IonContent className="chat-search-content">
        <div className="search-header">
          <IonSearchbar
            value={searchText}
            onIonInput={(e) => setSearchText(e.detail.value!)}
            placeholder="Buscar mensajes..."
            className="search-input"
            showClearButton="focus"
          />

          {searchResults.length > 0 && (
            <div className="search-navigation">
              <div className="search-counter">
                <span>
                  {currentResultIndex + 1} de {searchResults.length}
                </span>
              </div>
              <div className="search-nav-buttons">
                <IonButton fill="clear" size="small" onClick={navigatePrevious} disabled={searchResults.length === 0}>
                  <IonIcon icon={chevronUp} />
                </IonButton>
                <IonButton fill="clear" size="small" onClick={navigateNext} disabled={searchResults.length === 0}>
                  <IonIcon icon={chevronDown} />
                </IonButton>
              </div>
            </div>
          )}
        </div>

        <div className="search-results">
          {searchText.length >= 2 && !isSearching && searchResults.length === 0 && (
            <div className="no-results">
              <IonIcon icon={search} className="no-results-icon" />
              <h3>No se encontraron resultados</h3>
              <p>Intenta con otros términos de búsqueda</p>
            </div>
          )}

          {searchText.length < 2 && (
            <div className="search-instructions">
              <IonIcon icon={search} className="search-icon" />
              <h3>Buscar en conversación</h3>
              <p>Escribe al menos 2 caracteres para buscar mensajes</p>
            </div>
          )}

          {isSearching && (
            <div className="searching">
              <p>Buscando...</p>
            </div>
          )}

          <IonList className="results-list">
            {searchResults.map((result, index) => (
              <IonItem
                key={`${result.messageId}-${index}`}
                button
                onClick={() => handleResultClick(index)}
                className={`search-result-item ${index === currentResultIndex ? "active" : ""}`}
              >
                <IonLabel>
                  <div className="result-header">
                    <span className="result-sender">{result.isOwn ? "Tú" : "Contacto"}</span>
                    <span className="result-time">{result.timestamp}</span>
                  </div>
                  <div className="result-text" dangerouslySetInnerHTML={{ __html: result.highlightedText }}></div>
                  <div className="result-context">{result.context}</div>
                </IonLabel>
              </IonItem>
            ))}
          </IonList>
        </div>
      </IonContent>
    </IonModal>
  )
}

export default ChatSearchModal
