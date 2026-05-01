import { useState, useEffect, useRef } from 'react';
import './SearchBar.css';

interface SearchBarProps {
  subjects: string[];
  onSearch: (subject: string) => void;
  isLoading?: boolean;
}

const SearchBar = ({ subjects, onSearch, isLoading = false }: SearchBarProps) => {
  const [input, setInput] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [filteredSubjects, setFilteredSubjects] = useState<string[]>([]);
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (input.trim()) {
      const filtered = subjects.filter(subject =>
        subject.toLowerCase().includes(input.toLowerCase())
      );
      setFilteredSubjects(filtered);
    } else {
      setFilteredSubjects(subjects);
    }
  }, [input, subjects]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = (subject: string) => {
    setInput(subject);
    setShowSuggestions(false);
    onSearch(subject);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim()) {
      handleSearch(input.trim());
    }
  };

  return (
    <div className="search-bar-container" ref={searchRef}>
      <form onSubmit={handleSubmit} className="search-form">
        <div className="search-input-wrapper">
          <svg
            className="search-icon"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.35-4.35" />
          </svg>
          <input
            type="text"
            className="search-input"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onFocus={() => setShowSuggestions(true)}
            placeholder="Buscar por assunto..."
            disabled={isLoading}
          />
          {input && (
            <button
              type="button"
              className="clear-button"
              onClick={() => {
                setInput('');
                setShowSuggestions(false);
              }}
            >
              ✕
            </button>
          )}
        </div>
        <button type="submit" className="search-button" disabled={isLoading || !input.trim()}>
          {isLoading ? 'Buscando...' : 'Buscar'}
        </button>
      </form>

      {showSuggestions && filteredSubjects.length > 0 && (
        <div className="suggestions-dropdown">
          {filteredSubjects.map((subject, index) => (
            <div
              key={index}
              className="suggestion-item"
              onClick={() => handleSearch(subject)}
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
              {subject}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SearchBar;
