import { useState, useEffect } from 'react';
import { MemoryResponse } from '../types/chat';
import { getAllMemories } from '../services/api';
import ReactMarkdown from 'react-markdown';
import './ImportedChatView.css';

interface ConversationGroup {
  subject: string;
  memories: MemoryResponse[];
  totalMessages: number;
  lastUpdate: string;
}

const ImportedChatView = () => {
  const [conversations, setConversations] = useState<ConversationGroup[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<ConversationGroup | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadImportedConversations();
  }, []);

  const loadImportedConversations = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const memories = await getAllMemories();

      // Agrupa memórias por assunto
      const grouped = memories.reduce((groups, memory) => {
        const subject = memory.subject || 'Sem Assunto';
        if (!groups[subject]) {
          groups[subject] = [];
        }
        groups[subject].push(memory);
        return groups;
      }, {} as Record<string, MemoryResponse[]>);

      // Converte para array e ordena por data mais recente
      const conversationGroups: ConversationGroup[] = Object.keys(grouped).map((subject) => {
        const memories = grouped[subject];
        const sortedMemories = memories.sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );

        return {
          subject,
          memories: sortedMemories,
          totalMessages: sortedMemories.length * 2, // Cada memória tem pergunta + resposta
          lastUpdate: sortedMemories[0].createdAt,
        };
      });

      // Ordena conversas por última atualização
      conversationGroups.sort(
        (a, b) => new Date(b.lastUpdate).getTime() - new Date(a.lastUpdate).getTime()
      );

      setConversations(conversationGroups);
      if (conversationGroups.length > 0) {
        setSelectedConversation(conversationGroups[0]);
      }
    } catch (err) {
      setError('Erro ao carregar conversas importadas. Tente novamente.');
      console.error('Erro ao carregar conversas importadas:', err);
    } finally {
      setIsLoading(false);
    }
  };

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

  if (isLoading) {
    return (
      <div className="imported-view">
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Carregando conversas importadas...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="imported-view">
        <div className="error-message">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          {error}
        </div>
      </div>
    );
  }

  if (conversations.length === 0) {
    return (
      <div className="imported-view">
        <div className="empty-state">
          <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12" />
          </svg>
          <h3>Nenhuma conversa importada</h3>
          <p>Importe conversas do ChatGPT usando o botão "Importar ChatGPT" no topo</p>
        </div>
      </div>
    );
  }

  return (
    <div className="imported-view">
      <div className="imported-header">
        <h2>📥 Conversas do ChatGPT</h2>
        <p>{conversations.length} {conversations.length === 1 ? 'conversa importada' : 'conversas importadas'}</p>
      </div>

      <div className="imported-container">
        {/* Lista de conversas à esquerda */}
        <div className="imported-list">
          <div className="imported-list-header">
            <span className="imported-count">
              {conversations.length} {conversations.length === 1 ? 'conversa' : 'conversas'}
            </span>
          </div>
          <div className="imported-list-content">
            {conversations.map((conversation) => (
              <div
                key={conversation.subject}
                className={`imported-list-item ${selectedConversation?.subject === conversation.subject ? 'selected' : ''}`}
                onClick={() => setSelectedConversation(conversation)}
              >
                <div className="imported-list-meta">
                  <span className="imported-list-date">{formatDate(conversation.lastUpdate)}</span>
                </div>
                <div className="imported-list-title">
                  {conversation.subject}
                </div>
                <div className="imported-meta-badge">
                  {conversation.memories.length} {conversation.memories.length === 1 ? 'troca' : 'trocas'}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Detalhes da conversa à direita */}
        <div className="imported-detail">
          {selectedConversation ? (
            <>
              <div className="imported-detail-header">
                <div>
                  <h3 className="imported-detail-title">{selectedConversation.subject}</h3>
                  <span className="detail-date">{formatDate(selectedConversation.lastUpdate)}</span>
                </div>
                <div className="imported-badges">
                  <span className="badge">
                    {selectedConversation.memories.length} {selectedConversation.memories.length === 1 ? 'troca' : 'trocas'}
                  </span>
                  <span className="badge-chatgpt">ChatGPT</span>
                </div>
              </div>

              <div className="imported-detail-content">
                {selectedConversation.memories.map((memory, index) => (
                  <div key={memory.id} className="imported-exchange">
                    {/* Mensagem do usuário */}
                    <div className="imported-message user">
                      <div className="imported-message-header">
                        <span className="imported-message-role">👤 Você</span>
                        <span className="imported-message-time">
                          {new Date(memory.createdAt).toLocaleTimeString('pt-BR', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>
                      <div className="imported-message-content">
                        <p>{memory.question}</p>
                      </div>
                    </div>

                    {/* Resposta da IA */}
                    <div className="imported-message assistant">
                      <div className="imported-message-header">
                        <span className="imported-message-role">🤖 ChatGPT</span>
                      </div>
                      <div className="imported-message-content">
                        <ReactMarkdown
                          components={{
                            h1: ({ children }) => <h1 className="md-h1">{children}</h1>,
                            h2: ({ children }) => <h2 className="md-h2">{children}</h2>,
                            h3: ({ children }) => <h3 className="md-h3">{children}</h3>,
                            h4: ({ children }) => <h4 className="md-h4">{children}</h4>,
                            code: ({ inline, children }) =>
                              inline ? (
                                <code className="md-code-inline">{children}</code>
                              ) : (
                                <code className="md-code-block">{children}</code>
                              ),
                            pre: ({ children }) => <pre className="md-pre">{children}</pre>,
                            ul: ({ children }) => <ul className="md-ul">{children}</ul>,
                            ol: ({ children }) => <ol className="md-ol">{children}</ol>,
                            li: ({ children }) => <li className="md-li">{children}</li>,
                            blockquote: ({ children }) => <blockquote className="md-blockquote">{children}</blockquote>,
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
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="no-selection">
              <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12" />
              </svg>
              <p>Selecione uma conversa para ver os detalhes</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ImportedChatView;
