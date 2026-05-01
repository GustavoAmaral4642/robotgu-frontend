import { MemoryResponse } from '../types/chat';
import ReactMarkdown from 'react-markdown';
import './MemoryDetailModal.css';

interface MemoryDetailModalProps {
  memory: MemoryResponse | null;
  isOpen: boolean;
  onClose: () => void;
}

const MemoryDetailModal = ({ memory, isOpen, onClose }: MemoryDetailModalProps) => {
  if (!isOpen || !memory) return null;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="memory-detail-overlay" onClick={onClose}>
      <div className="memory-detail-modal" onClick={(e) => e.stopPropagation()}>
        <div className="memory-detail-header">
          <div className="memory-detail-title">
            <h2>📋 Detalhes da Conversa</h2>
            <div className="memory-detail-meta">
              <span className="memory-detail-subject">{memory.subject}</span>
              <span className="memory-detail-date">{formatDate(memory.createdAt)}</span>
            </div>
          </div>
          <button className="memory-detail-close" onClick={onClose}>✕</button>
        </div>

        <div className="memory-detail-content">
          <section className="memory-detail-section question-section">
            <div className="section-header">
              <h3>❓ Pergunta</h3>
            </div>
            <div className="section-content">
              <p>{memory.question}</p>
            </div>
          </section>

          <section className="memory-detail-section answer-section">
            <div className="section-header">
              <h3>💡 Resposta</h3>
            </div>
            <div className="section-content markdown-content">
              <ReactMarkdown
                components={{
                  h1: ({ children }) => <h1 className="md-h1">{children}</h1>,
                  h2: ({ children }) => <h2 className="md-h2">{children}</h2>,
                  h3: ({ children }) => <h3 className="md-h3">{children}</h3>,
                  h4: ({ children }) => <h4 className="md-h4">{children}</h4>,
                  p: ({ children }) => <p className="md-p">{children}</p>,
                  ul: ({ children }) => <ul className="md-ul">{children}</ul>,
                  ol: ({ children }) => <ol className="md-ol">{children}</ol>,
                  li: ({ children }) => <li className="md-li">{children}</li>,
                  code: ({ className, children }) => {
                    const isInline = !className;
                    return isInline ? (
                      <code className="md-code-inline">{children}</code>
                    ) : (
                      <code className="md-code-block">{children}</code>
                    );
                  },
                  pre: ({ children }) => <pre className="md-pre">{children}</pre>,
                  blockquote: ({ children }) => <blockquote className="md-blockquote">{children}</blockquote>,
                  strong: ({ children }) => <strong className="md-strong">{children}</strong>,
                  em: ({ children }) => <em className="md-em">{children}</em>,
                  a: ({ href, children }) => (
                    <a href={href} className="md-link" target="_blank" rel="noopener noreferrer">
                      {children}
                    </a>
                  ),
                }}
              >
                {memory.answer}
              </ReactMarkdown>
            </div>
          </section>
        </div>

        <div className="memory-detail-footer">
          <button className="close-button" onClick={onClose}>
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};

export default MemoryDetailModal;
