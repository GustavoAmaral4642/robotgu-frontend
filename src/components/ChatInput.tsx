import { useState, KeyboardEvent } from 'react';
import './ChatInput.css';

interface ChatInputProps {
  onSendMessage: (message: string, keywords?: string) => void;
  disabled?: boolean;
}

const ChatInput = ({ onSendMessage, disabled = false }: ChatInputProps) => {
  const [input, setInput] = useState('');
  const [keywords, setKeywords] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);

  const handleSend = () => {
    const trimmedInput = input.trim();
    if (trimmedInput && !disabled) {
      onSendMessage(trimmedInput, keywords.trim() || undefined);
      setInput('');
      setKeywords('');
    }
  };

  const handleKeyPress = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="chat-input-wrapper">
      <div className="chat-input-advanced-toggle" onClick={() => setShowAdvanced(!showAdvanced)}>
        <span className="toggle-icon">{showAdvanced ? '∨' : '›'}</span>
        <span className="toggle-text">⚙️ Busca avançada</span>
      </div>

      {showAdvanced && (
        <div className="chat-input-advanced-section">
          <label htmlFor="chat-keywords" className="keywords-label">
            Palavras-chave:
          </label>
          <input
            id="chat-keywords"
            type="text"
            className="keywords-input"
            value={keywords}
            onChange={(e) => setKeywords(e.target.value)}
            placeholder="Ex: SOLID design padrões"
            disabled={disabled}
          />
          <div className="keywords-hint-small">
            💡 Melhora a relevância usando termos específicos
          </div>
        </div>
      )}

      <div className="chat-input-container">
        <textarea
          className="chat-input"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyPress}
          placeholder="Digite sua mensagem..."
          disabled={disabled}
          rows={1}
        />
        <button
          className="send-button"
          onClick={handleSend}
          disabled={disabled || !input.trim()}
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <line x1="22" y1="2" x2="11" y2="13" />
            <polygon points="22 2 15 22 11 13 2 9 22 2" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default ChatInput;
