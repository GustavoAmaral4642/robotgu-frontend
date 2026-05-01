import { Conversation } from '../types/conversation';
import './ConversationItem.css';

interface ConversationItemProps {
  conversation: Conversation;
  isActive: boolean;
  onClick: () => void;
  onDelete: () => void;
}

const ConversationItem = ({ conversation, isActive, onClick, onDelete }: ConversationItemProps) => {
  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm(`Deletar conversa "${conversation.title}"?`)) {
      onDelete();
    }
  };

  return (
    <div
      className={`conversation-item ${isActive ? 'active' : ''}`}
      onClick={onClick}
    >
      <div className="conversation-item-header">
        <h3 className="conversation-title">{conversation.title}</h3>
        <button
          className="conversation-delete-btn"
          onClick={handleDelete}
          title="Deletar conversa"
        >
          ✕
        </button>
      </div>
      <div className="conversation-meta">
        <span className="message-count">
          {conversation.messageCount} {conversation.messageCount === 1 ? 'mensagem' : 'mensagens'}
        </span>
      </div>
    </div>
  );
};

export default ConversationItem;
