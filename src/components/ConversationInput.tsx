import { useState, KeyboardEvent } from 'react';
import './ConversationInput.css';

interface ConversationInputProps {
  onSendMessage: (content: string) => void;
  disabled: boolean;
}

const ConversationInput = ({ onSendMessage, disabled }: ConversationInputProps) => {
  const [input, setInput] = useState('');

  const handleSend = () => {
    if (input.trim() && !disabled) {
      onSendMessage(input.trim());
      setInput('');
    }
  };

  const handleKeyPress = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="conversation-input">
      <textarea
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyPress={handleKeyPress}
        placeholder={disabled ? "IA está pensando..." : "Digite sua mensagem... (Enter para enviar, Shift+Enter para nova linha)"}
        disabled={disabled}
        rows={3}
      />
      <button
        onClick={handleSend}
        disabled={!input.trim() || disabled}
        className="send-button"
      >
        {disabled ? (
          <div className="spinner"></div>
        ) : (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="22" y1="2" x2="11" y2="13"></line>
            <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
          </svg>
        )}
        {disabled ? 'Enviando...' : 'Enviar'}
      </button>
    </div>
  );
};

export default ConversationInput;
