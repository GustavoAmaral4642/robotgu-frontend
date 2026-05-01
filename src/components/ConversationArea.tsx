import { useEffect, useRef } from 'react';
import { ConversationDetail } from '../types/conversation';
import ConversationMessage from './ConversationMessage';
import ConversationInput from './ConversationInput';
import './ConversationArea.css';

interface ConversationAreaProps {
  conversation: ConversationDetail | null;
  onSendMessage: (content: string) => void;
  isLoading: boolean;
}

const ConversationArea = ({ conversation, onSendMessage, isLoading }: ConversationAreaProps) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (conversation && conversation.messages.length > 0) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });

      // DEBUG: Log de renderização
      console.log('🎨 ConversationArea renderizando com', conversation.messages.length, 'mensagens');
      console.log('📌 IDs na renderização:', conversation.messages.map(m => m.id));
    }
  }, [conversation?.messages.length]); // Usa apenas o length para evitar re-renders excessivos

  if (!conversation) {
    return (
      <div className="conversation-area">
        <div className="empty-conversation">
          <div className="empty-icon">💬</div>
          <h2>Nenhuma conversa selecionada</h2>
          <p>Selecione uma conversa na barra lateral ou crie uma nova para começar</p>
        </div>
      </div>
    );
  }

  return (
    <div className="conversation-area">
      <div className="conversation-header">
        <h2>{conversation.title}</h2>
        <span className="message-count-badge">
          {conversation.messages.length} {conversation.messages.length === 1 ? 'mensagem' : 'mensagens'}
        </span>
      </div>

      <div className="conversation-messages">
        {conversation.messages.length === 0 ? (
          <div className="empty-messages">
            <p>Nenhuma mensagem ainda. Comece a conversa!</p>
          </div>
        ) : (
          conversation.messages.map((message) => (
            <ConversationMessage
              key={message.id}
              message={message}
            />
          ))
        )}

        {isLoading && (
          <div className="typing-indicator">
            <div className="typing-dot"></div>
            <div className="typing-dot"></div>
            <div className="typing-dot"></div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      <ConversationInput onSendMessage={onSendMessage} disabled={isLoading} />
    </div>
  );
};

export default ConversationArea;
