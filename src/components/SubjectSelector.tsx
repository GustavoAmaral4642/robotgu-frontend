import { useState, useEffect, useRef } from 'react';
import './SubjectSelector.css';

interface SubjectSelectorProps {
  subjects: string[];
  selectedSubject: string;
  onSelectSubject: (subject: string) => void;
  isLoading?: boolean;
}

const SubjectSelector = ({ subjects, selectedSubject, onSelectSubject, isLoading = false }: SubjectSelectorProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredSubjects = subjects.filter(subject =>
    subject.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSelectSubject = (subject: string) => {
    onSelectSubject(subject);
    setIsOpen(false);
    setSearchTerm('');
  };

  const handleClearSubject = () => {
    onSelectSubject('');
    setSearchTerm('');
  };

  return (
    <div className="subject-selector-container" ref={dropdownRef}>
      <label className="subject-label">
        📚 Assunto:
        <span className="subject-hint">(opcional - auto-detecção se vazio)</span>
      </label>

      <div className="subject-selector">
        <button
          type="button"
          className={`subject-button ${selectedSubject ? 'has-selection' : ''}`}
          onClick={() => setIsOpen(!isOpen)}
          disabled={isLoading}
        >
          {selectedSubject || 'Auto-detectar assunto'}
          <svg
            className={`dropdown-arrow ${isOpen ? 'open' : ''}`}
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </button>

        {selectedSubject && (
          <button
            type="button"
            className="clear-subject-button"
            onClick={handleClearSubject}
            title="Limpar seleção"
          >
            ✕
          </button>
        )}

        {isOpen && (
          <div className="subject-dropdown">
            <div className="subject-search">
              <input
                type="text"
                placeholder="Buscar assunto..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                autoFocus
              />
            </div>

            <div className="subject-list">
              {filteredSubjects.length === 0 ? (
                <div className="no-subjects">
                  {subjects.length === 0 ? 'Nenhum assunto cadastrado' : 'Nenhum assunto encontrado'}
                </div>
              ) : (
                filteredSubjects.map((subject, index) => (
                  <div
                    key={index}
                    className={`subject-item ${subject === selectedSubject ? 'selected' : ''}`}
                    onClick={() => handleSelectSubject(subject)}
                  >
                    <span>{subject}</span>
                    {subject === selectedSubject && (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SubjectSelector;
