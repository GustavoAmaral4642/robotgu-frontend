import { useState, useEffect } from 'react';
import { ConversationSummary } from '../types/conversation';
import './ContextSelector.css';

interface ContextSelectorProps {
  subject: string;
  conversations: ConversationSummary[];
  selectedIds: number[];
  onSelectionChange: (ids: number[]) => void;
  isLoading?: boolean;
}

const ContextSelector = ({
  subject,
  conversations,
  selectedIds,
  onSelectionChange,
  isLoading = false,
}: ContextSelectorProps) => {
  const [searchTerm, setSearchTerm] = useState('');

  // Filtra conversas pela busca
  const filteredConversations = conversations.filter((conv) =>
    conv.question.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Calcula estatísticas
  const selectedConversations = conversations.filter((c) =>
    selectedIds.includes(c.id)
  );
  const totalChars = selectedConversations.reduce(
    (sum, c) => sum + c.characterCount,
    0
  );
  const isOverLimit = totalChars > 2500;

  // Toggle seleção
  const toggleSelection = (id: number) => {
    if (selectedIds.includes(id)) {
      onSelectionChange(selectedIds.filter((i) => i !== id));
    } else {
      onSelectionChange([...selectedIds, id]);
    }
  };

  // Selecionar/Desselecionar todos
  const selectAll = () => {
    onSelectionChange(filteredConversations.map((c) => c.id));
  };

  const clearAll = () => {
    onSelectionChange([]);
  };

  if (isLoading) {
    return (
      <div className="context-selector loading">
        <div className="loading-spinner"></div>
        <p>Carregando conversas disponíveis...</p>
      </div>
    );
  }

  if (conversations.length === 0) {
    return (
      <div className="context-selector empty">
        <p>📭 Nenhuma conversa antiga encontrada para "{subject}"</p>
        <p className="hint">Inicie sem contexto ou escolha outro assunto.</p>
      </div>
    );
  }

  return (
    <div className="context-selector">
      <div className="context-selector-header">
        <h4>🔗 Selecione conversas como contexto inicial</h4>
        <p className="subtitle">
          Escolha conversas antigas que serão usadas como base de conhecimento
        </p>
      </div>

      <div className="search-bar">
        <input
          type="search"
          placeholder="🔍 Buscar conversas..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
        <div className="bulk-actions">
          <button onClick={selectAll} className="btn-link">
            Selecionar todas ({filteredConversations.length})
          </button>
          {selectedIds.length > 0 && (
            <button onClick={clearAll} className="btn-link">
              Limpar seleção
            </button>
          )}
        </div>
      </div>

      <div className="conversation-list">
        {filteredConversations.length === 0 ? (
          <div className="no-results">
            <p>Nenhuma conversa encontrada com "{searchTerm}"</p>
          </div>
        ) : (
          filteredConversations.map((conv) => (
            <label key={conv.id} className="conversation-item">
              <input
                type="checkbox"
                checked={selectedIds.includes(conv.id)}
                onChange={() => toggleSelection(conv.id)}
              />
              <div className="conversation-details">
                <div className="conversation-question">
                  <strong>#{conv.id}</strong> {conv.question}
                </div>
                <div className="conversation-preview">{conv.answerPreview}...</div>
                <div className="conversation-meta">
                  <span className="date">
                    📅 {new Date(conv.createdAt).toLocaleDateString('pt-BR')}
                  </span>
                  <span className="chars">📏 {conv.characterCount} caracteres</span>
                </div>
              </div>
            </label>
          ))
        )}
      </div>

      {selectedIds.length > 0 && (
        <div className={`context-stats ${isOverLimit ? 'warning' : 'ok'}`}>
          <div className="stats-content">
            <div className="stat">
              <strong>{selectedIds.length}</strong>
              {selectedIds.length === 1 ? ' conversa selecionada' : ' conversas selecionadas'}
            </div>
            <div className="stat">
              <strong>{totalChars.toLocaleString('pt-BR')}</strong> caracteres
            </div>
          </div>
          {isOverLimit && (
            <div className="warning-message">
              ⚠️ Contexto muito grande! Recomendado: máximo 2.500 caracteres
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ContextSelector;
