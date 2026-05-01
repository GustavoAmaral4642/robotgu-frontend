import { useEffect, useState } from 'react';
import { MemoryResponse } from '../types/chat';
import MemoryDetailModal from './MemoryDetailModal';
import './ContextPanel.css';

interface ContextPanelProps {
  memories: MemoryResponse[];
  isLoading: boolean;
  selectedSubject: string;
}

const ContextPanel = ({ memories, isLoading, selectedSubject }: ContextPanelProps) => {
  const [selectedMemory, setSelectedMemory] = useState<MemoryResponse | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const panel = document.querySelector('.context-panel-content');
    if (panel) {
      panel.scrollTop = panel.scrollHeight;
    }
  }, [memories]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleMemoryClick = (memory: MemoryResponse) => {
    setSelectedMemory(memory);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedMemory(null);
  };

  if (!selectedSubject) {
    return (
      <div className="context-panel">
        <div className="context-header">
          <h3>📝 Contexto da Conversa</h3>
        </div>
        <div className="context-empty">
          <p>Selecione um assunto para ver o histórico de perguntas anteriores</p>
        </div>
      </div>
    );
  }

  return (
    <div className="context-panel">
      <div className="context-header">
        <h3>📝 Contexto: <span className="subject-badge">{selectedSubject}</span></h3>
        <span className="context-count">{memories.length} {memories.length === 1 ? 'pergunta' : 'perguntas'}</span>
      </div>

      {isLoading ? (
        <div className="context-loading">
          <div className="context-spinner"></div>
          <p>Carregando contexto...</p>
        </div>
      ) : memories.length === 0 ? (
        <div className="context-empty">
          <p>Nenhuma pergunta anterior sobre "{selectedSubject}"</p>
          <p className="context-hint">Seja o primeiro a perguntar sobre este assunto!</p>
        </div>
      ) : (
        <div className="context-panel-content">
          {memories.map((memory) => (
            <div
              key={memory.id}
              className="context-item"
              onClick={() => handleMemoryClick(memory)}
              title="Clique para ver detalhes"
            >
              <div className="context-item-header">
                <span className="context-date">{formatDate(memory.createdAt)}</span>
              </div>
              <div className="context-question">
                <strong>P:</strong> {memory.question}
              </div>
              <div className="context-answer">
                <strong>R:</strong> {memory.answer.length > 150
                  ? `${memory.answer.substring(0, 150)}...`
                  : memory.answer}
              </div>
            </div>
          ))}
        </div>
      )}

      <MemoryDetailModal
        memory={selectedMemory}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
      />
    </div>
  );
};

export default ContextPanel;
