import { useState, useEffect } from 'react';
import { getSubjects, getHistory } from '../services/api';
import { ConversationSummary } from '../types/conversation';
import ContextSelector from './ContextSelector';
import './NewConversationModal.css';

interface NewConversationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (title: string, contextIds?: number[]) => Promise<void>;
}

const NewConversationModal = ({ isOpen, onClose, onCreate }: NewConversationModalProps) => {
  const [title, setTitle] = useState('');
  const [subject, setSubject] = useState('');
  const [subjects, setSubjects] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [filteredSubjects, setFilteredSubjects] = useState<string[]>([]);
  const [useContext, setUseContext] = useState(false);
  const [conversations, setConversations] = useState<ConversationSummary[]>([]);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      loadSubjects();
    }
  }, [isOpen]);

  useEffect(() => {
    if (subject.trim()) {
      const filtered = subjects.filter((s) =>
        s.toLowerCase().includes(subject.toLowerCase())
      );
      setFilteredSubjects(filtered);
    } else {
      setFilteredSubjects(subjects);
    }
  }, [subject, subjects]);

  // Carrega histórico quando usuário ativa seleção de contexto
  useEffect(() => {
    if (useContext && subject.trim()) {
      loadHistory(subject.trim());
    } else {
      setConversations([]);
      setSelectedIds([]);
    }
  }, [useContext, subject]);

  const loadSubjects = async () => {
    try {
      const data = await getSubjects();
      setSubjects(data);
    } catch (err) {
      console.error('Erro ao carregar assuntos:', err);
    }
  };

  const loadHistory = async (subjectName: string) => {
    setIsLoadingHistory(true);
    try {
      const data = await getHistory(subjectName);
      setConversations(data.conversations);
    } catch (err) {
      console.error('Erro ao carregar histórico:', err);
      setConversations([]);
    } finally {
      setIsLoadingHistory(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setIsCreating(true);
    setError(null);

    try {
      await onCreate(
        title.trim(),
        useContext && selectedIds.length > 0 ? selectedIds : undefined
      );
      handleClose();
    } catch (err: any) {
      setError(err.message || 'Erro ao criar conversa. Tente novamente.');
    } finally {
      setIsCreating(false);
    }
  };

  const handleClose = () => {
    setTitle('');
    setSubject('');
    setUseContext(false);
    setConversations([]);
    setSelectedIds([]);
    setError(null);
    setShowSuggestions(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="modal-content new-conversation-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>➕ Nova Conversa</h2>
          <button className="close-button" onClick={handleClose}>
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-group">
            <label htmlFor="title">
              Título da Conversa: <span className="required">*</span>
            </label>
            <input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex: Design Patterns em Java"
              required
              disabled={isCreating}
              autoFocus
            />
          </div>

          <div className="form-group">
            <label htmlFor="subject">
              Assunto (para buscar contexto):{' '}
              <span className="optional-label">(opcional)</span>
            </label>
            <div className="autocomplete-wrapper">
              <input
                id="subject"
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                onFocus={() => setShowSuggestions(true)}
                placeholder="Ex: java, python, react..."
                disabled={isCreating}
              />
              {showSuggestions && filteredSubjects.length > 0 && (
                <div className="autocomplete-suggestions">
                  {filteredSubjects.map((s, index) => (
                    <div
                      key={index}
                      className="autocomplete-item"
                      onClick={() => {
                        setSubject(s);
                        setShowSuggestions(false);
                      }}
                    >
                      {s}
                    </div>
                  ))}
                </div>
              )}
            </div>
            {subject.trim() && (
              <p className="field-hint">
                💡 Assunto "{subject}" será usado para buscar conversas relacionadas
              </p>
            )}
          </div>

          {subject.trim() && (
            <div className="context-toggle-section">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={useContext}
                  onChange={(e) => setUseContext(e.target.checked)}
                  disabled={isCreating}
                />
                <span>
                  🔗 Incluir contexto de conversas antigas do assunto "{subject}"
                </span>
              </label>
              <p className="field-hint">
                Marque para selecionar conversas antigas que servirão como base de
                conhecimento para esta nova conversa.
              </p>
            </div>
          )}

          {useContext && (
            <ContextSelector
              subject={subject}
              conversations={conversations}
              selectedIds={selectedIds}
              onSelectionChange={setSelectedIds}
              isLoading={isLoadingHistory}
            />
          )}

          {error && <div className="error-message">❌ {error}</div>}

          <div className="modal-actions">
            <button
              type="button"
              onClick={handleClose}
              className="btn-secondary"
              disabled={isCreating}
            >
              Cancelar
            </button>
            <button type="submit" className="btn-primary" disabled={isCreating || !title.trim()}>
              {isCreating ? (
                <>
                  <span className="spinner-small"></span>
                  Criando...
                </>
              ) : (
                'Criar Conversa'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NewConversationModal;
