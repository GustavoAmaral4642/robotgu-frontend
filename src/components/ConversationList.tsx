import { useState } from 'react';
import { Conversation } from '../types/conversation';
import ConversationItem from './ConversationItem';
import './ConversationList.css';

interface ConversationListProps {
  conversations: Conversation[];
  activeConversationId: number | null;
  onSelectConversation: (id: number) => void;
  onDeleteConversation: (id: number) => void;
  onCreateConversation: () => void;
}

const ConversationList = ({
  conversations,
  activeConversationId,
  onSelectConversation,
  onDeleteConversation,
  onCreateConversation,
}: ConversationListProps) => {
  const [isCreating, setIsCreating] = useState(false);

  const handleCreate = async () => {
    setIsCreating(true);
    try {
      await onCreateConversation();
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <aside className="conversation-list">
      <div className="conversation-list-header">
        <h2>💬 Conversas</h2>
        <button
          className="new-conversation-btn"
          onClick={handleCreate}
          disabled={isCreating}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          {isCreating ? 'Criando...' : 'Nova'}
        </button>
      </div>

      <div className="conversation-list-items">
        {conversations.length === 0 ? (
          <div className="empty-state">
            <p>Nenhuma conversa ainda</p>
            <p className="empty-hint">Clique em "Nova" para começar</p>
          </div>
        ) : (
          conversations.map((conversation) => (
            <ConversationItem
              key={conversation.id}
              conversation={conversation}
              isActive={conversation.id === activeConversationId}
              onClick={() => onSelectConversation(conversation.id)}
              onDelete={() => onDeleteConversation(conversation.id)}
            />
          ))
        )}
      </div>
    </aside>
  );
};

export default ConversationList;
