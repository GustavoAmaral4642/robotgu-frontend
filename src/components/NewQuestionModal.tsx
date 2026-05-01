import { useState, useEffect } from 'react';
import { sendMessage, getSubjects } from '../services/api';
import './NewQuestionModal.css';

interface NewQuestionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (answer: string) => void;
}

const NewQuestionModal = ({ isOpen, onClose, onSuccess }: NewQuestionModalProps) => {
  const [subjects, setSubjects] = useState<string[]>([]);
  const [subject, setSubject] = useState('');
  const [question, setQuestion] = useState('');
  const [keywords, setKeywords] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [filteredSubjects, setFilteredSubjects] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [useGlobalContext, setUseGlobalContext] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadSubjects();
    }
  }, [isOpen]);

  useEffect(() => {
    if (subject.trim()) {
      const filtered = subjects.filter(s =>
        s.toLowerCase().includes(subject.toLowerCase())
      );
      setFilteredSubjects(filtered);
    } else {
      setFilteredSubjects(subjects);
    }
  }, [subject, subjects]);

  const loadSubjects = async () => {
    try {
      const data = await getSubjects();
      setSubjects(data);
    } catch (err) {
      console.error('Erro ao carregar assuntos:', err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim()) return;

    setIsLoading(true);
    setError(null);

    try {
      const answer = await sendMessage(question, subject || '', useGlobalContext, keywords || undefined);
      onSuccess(answer);
      handleClose();
    } catch (err) {
      setError('Erro ao enviar pergunta. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setSubject('');
    setQuestion('');
    setKeywords('');
    setError(null);
    setShowSuggestions(false);
    setUseGlobalContext(false);
    setShowAdvanced(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>💬 Nova Pergunta</h2>
          <button className="close-button" onClick={handleClose}>✕</button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-group">
            <label htmlFor="subject">
              Assunto: <span className="optional-label">(opcional - auto-detecção se vazio)</span>
            </label>
            <div className="autocomplete-wrapper">
              <input
                id="subject"
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                onFocus={() => setShowSuggestions(true)}
                placeholder="Deixe vazio para auto-detectar o assunto"
                disabled={isLoading}
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
          </div>

          <div className="form-group">
            <label htmlFor="question">Pergunta:</label>
            <textarea
              id="question"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="Digite sua pergunta aqui..."
              rows={5}
              required
              disabled={isLoading}
            />
          </div>

          <div className="advanced-toggle" onClick={() => setShowAdvanced(!showAdvanced)}>
            <span className="toggle-icon">{showAdvanced ? '∨' : '›'}</span>
            <span className="toggle-text">⚙️ Busca avançada (opcional)</span>
          </div>

          {showAdvanced && (
            <div className="advanced-section">
              <div className="form-group">
                <label htmlFor="keywords">
                  Palavras-chave para contexto:
                </label>
                <input
                  id="keywords"
                  type="text"
                  value={keywords}
                  onChange={(e) => setKeywords(e.target.value)}
                  placeholder="Ex: SOLID design padrões"
                  disabled={isLoading}
                />
                <div className="keywords-hint">
                  💡 Melhora a relevância da resposta usando termos específicos
                </div>
              </div>
            </div>
          )}

          <div className="form-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={useGlobalContext}
                onChange={(e) => setUseGlobalContext(e.target.checked)}
                disabled={isLoading}
              />
              <span className="checkbox-text">
                🌍 Usar contexto global
              </span>
            </label>
            {useGlobalContext && (
              <div className="checkbox-hint">
                A IA vai considerar todas as memórias, não apenas deste assunto
              </div>
            )}
          </div>

          {error && (
            <div className="modal-error">
              {error}
            </div>
          )}

          <div className="modal-actions">
            <button
              type="button"
              className="cancel-button"
              onClick={handleClose}
              disabled={isLoading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="submit-button"
              disabled={isLoading || !question.trim()}
            >
              {isLoading ? 'Enviando...' : 'Enviar Pergunta'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NewQuestionModal;
