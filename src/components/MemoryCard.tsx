import { MemoryResponse } from '../types/chat';
import './MemoryCard.css';

interface MemoryCardProps {
  memory: MemoryResponse;
}

const MemoryCard = ({ memory }: MemoryCardProps) => {
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
    <div className="memory-card">
      <div className="memory-header">
        <span className="memory-subject">{memory.subject}</span>
        <span className="memory-date">{formatDate(memory.createdAt)}</span>
      </div>
      <div className="memory-question">
        <strong>❓ Pergunta:</strong>
        <p>{memory.question}</p>
      </div>
      <div className="memory-answer">
        <strong>💡 Resposta:</strong>
        <p>{memory.answer}</p>
      </div>
    </div>
  );
};

export default MemoryCard;
