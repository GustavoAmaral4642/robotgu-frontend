import { useState } from 'react';
import { ContextInfo } from '../types/chat';
import './ContextIndicator.css';

interface ContextIndicatorProps {
  contextInfo?: ContextInfo;
}

const ContextIndicator = ({ contextInfo }: ContextIndicatorProps) => {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!contextInfo) {
    return (
      <div className="context-indicator">
        <div className="context-badge">
          <span className="context-icon">🧠</span>
          <span className="context-text">Contexto inteligente (até 5 memórias)</span>
        </div>
      </div>
    );
  }

  const hasDetailedInfo = contextInfo.memoriesUsed !== undefined || contextInfo.previousQuestions?.length;

  return (
    <div className="context-indicator">
      <div
        className={`context-badge ${hasDetailedInfo ? 'clickable' : ''}`}
        onClick={() => hasDetailedInfo && setIsExpanded(!isExpanded)}
      >
        <span className="context-icon">🧠</span>
        <span className="context-text">
          {contextInfo.memoriesUsed !== undefined
            ? `${contextInfo.memoriesUsed}/${contextInfo.maxMemories || 5} memórias usadas`
            : 'Contexto inteligente (até 5 memórias)'}
        </span>
        {hasDetailedInfo && (
          <span className="expand-icon">{isExpanded ? '▼' : '▶'}</span>
        )}
      </div>

      {isExpanded && hasDetailedInfo && (
        <div className="context-details">
          <div className="context-details-header">
            <strong>Contexto Utilizado</strong>
          </div>

          {contextInfo.strategy && (
            <div className="context-strategy">
              <span className="detail-label">Estratégia:</span>
              <span className="detail-value">{contextInfo.strategy}</span>
            </div>
          )}

          {contextInfo.previousQuestions && contextInfo.previousQuestions.length > 0 && (
            <div className="context-questions">
              <span className="detail-label">Perguntas anteriores:</span>
              <ul className="questions-list">
                {contextInfo.previousQuestions.map((q, idx) => (
                  <li key={idx} className="question-item">
                    {q}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ContextIndicator;
