import { useState, useEffect } from 'react';
import { MemoryResponse } from '../types/chat';
import { Conversation, ConversationDetail } from '../types/conversation';
import { getSubjects, searchMemories, getAllMemories } from '../services/api';
import { conversationService } from '../services/conversationService';
import ReactMarkdown from 'react-markdown';
import SearchBar from './SearchBar';
import './MemoriesView.css';

type HistoryTab = 'conversations' | 'memories';

const MemoriesView = () => {
  const [activeHistoryTab, setActiveHistoryTab] = useState<HistoryTab>('conversations');

  // Estados para Memories (sistema antigo)
  const [subjects, setSubjects] = useState<string[]>([]);
  const [memories, setMemories] = useState<MemoryResponse[]>([]);
  const [selectedMemory, setSelectedMemory] = useState<MemoryResponse | null>(null);
  const [isLoadingMemories, setIsLoadingMemories] = useState(false);
  const [errorMemories, setErrorMemories] = useState<string | null>(null);
  const [searchPerformed, setSearchPerformed] = useState(false);

  // Estados para Conversations (sistema novo)
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<ConversationDetail | null>(null);
  const [isLoadingConversations, setIsLoadingConversations] = useState(false);
  const [errorConversations, setErrorConversations] = useState<string | null>(null);

  useEffect(() => {
    // Limpa seleção ao trocar de sub-aba
    setSelectedConversation(null);
    setSelectedMemory(null);

    if (activeHistoryTab === 'conversations') {
      loadConversations();
    } else {
      loadSubjects();
      loadAllMemories();
    }
  }, [activeHistoryTab]);

  // === Funções para Memories (sistema antigo) ===
  const loadSubjects = async () => {
    try {
      const data = await getSubjects();
      setSubjects(data);
    } catch (err) {
      console.error('Erro ao carregar assuntos:', err);
    }
  };

  const loadAllMemories = async () => {
    setIsLoadingMemories(true);
    setErrorMemories(null);
    setSelectedMemory(null); // Limpa seleção atual

    try {
      const data = await getAllMemories();
      setMemories(data);

      // Seleciona primeira memória apenas se houver dados
      if (data.length > 0) {
        setSelectedMemory(data[0]);
      }
    } catch (err) {
      setErrorMemories('Erro ao carregar memórias. Tente novamente.');
      setMemories([]);
    } finally {
      setIsLoadingMemories(false);
    }
  };

  const handleSearch = async (subject: string) => {
    setIsLoadingMemories(true);
    setErrorMemories(null);
    setSearchPerformed(true);
    setSelectedMemory(null); // Limpa seleção atual

    try {
      const data = await searchMemories(subject);
      setMemories(data);

      // Seleciona primeira memória apenas se houver resultados
      if (data.length > 0) {
        setSelectedMemory(data[0]);
      }
    } catch (err) {
      setErrorMemories('Erro ao buscar memórias. Tente novamente.');
      setMemories([]);
    } finally {
      setIsLoadingMemories(false);
    }
  };

  // === Funções para Conversations (sistema novo) ===
  const loadConversations = async () => {
    setIsLoadingConversations(true);
    setErrorConversations(null);
    setSelectedConversation(null); // Limpa seleção atual

    try {
      const data = await conversationService.list();
      setConversations(data);

      // Carrega a primeira conversa apenas se houver dados
      if (data.length > 0) {
        const firstConv = await conversationService.get(data[0].id);
        setSelectedConversation(firstConv);
      }
    } catch (err) {
      setErrorConversations('Erro ao carregar conversas. Tente novamente.');
      setConversations([]);
    } finally {
      setIsLoadingConversations(false);
    }
  };

  const handleSelectConversation = async (id: number) => {
    // Evita recarregar a mesma conversa
    if (selectedConversation?.id === id) {
      return;
    }

    try {
      const conversation = await conversationService.get(id);
      setSelectedConversation(conversation);
    } catch (err) {
      console.error('Erro ao carregar conversa:', err);
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

  const isLoading = activeHistoryTab === 'conversations' ? isLoadingConversations : isLoadingMemories;
  const error = activeHistoryTab === 'conversations' ? errorConversations : errorMemories;

  return (
    <div className="memories-view">
      <div className="memories-header">
        <h2>📚 Histórico</h2>
        <p>Consulte conversas anteriores e memórias salvas</p>
      </div>

      <div className="history-tabs">
        <button
          className={`history-tab ${activeHistoryTab === 'conversations' ? 'active' : ''}`}
          onClick={() => setActiveHistoryTab('conversations')}
        >
          💬 Conversas
          {conversations.length > 0 && (
            <span className="tab-badge">{conversations.length}</span>
          )}
        </button>
        <button
          className={`history-tab ${activeHistoryTab === 'memories' ? 'active' : ''}`}
          onClick={() => setActiveHistoryTab('memories')}
        >
          🧠 Memórias
          {memories.length > 0 && (
            <span className="tab-badge">{memories.length}</span>
          )}
        </button>
      </div>

      {activeHistoryTab === 'memories' && (
        <SearchBar subjects={subjects} onSearch={handleSearch} isLoading={isLoadingMemories} />
      )}

      {error && (
        <div className="error-message">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          {error}
        </div>
      )}

      {isLoading ? (
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Carregando {activeHistoryTab === 'conversations' ? 'conversas' : 'memórias'}...</p>
        </div>
      ) : activeHistoryTab === 'conversations' ? (
        // === VIEW DE CONVERSAS ===
        conversations.length === 0 ? (
          <div className="empty-memories">
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            <h3>Nenhuma conversa ainda</h3>
            <p>Crie conversas na aba "💬 Conversas" para vê-las aqui</p>
          </div>
        ) : (
          <div className="memories-container">
            {/* Lista de conversas à esquerda */}
            <div className="memories-list">
              <div className="memories-list-header">
                <span className="memories-count">
                  {conversations.length} {conversations.length === 1 ? 'conversa' : 'conversas'}
                </span>
              </div>
              <div className="memories-list-content">
                {conversations.map((conversation) => (
                  <div
                    key={conversation.id}
                    className={`memory-list-item ${selectedConversation?.id === conversation.id ? 'selected' : ''}`}
                    onClick={() => handleSelectConversation(conversation.id)}
                  >
                    <div className="memory-list-meta">
                      <span className="memory-list-date">{formatDate(conversation.lastMessageAt)}</span>
                    </div>
                    <div className="memory-list-question">
                      {conversation.title}
                    </div>
                    <div className="conversation-meta-badge">
                      {conversation.messageCount} {conversation.messageCount === 1 ? 'mensagem' : 'mensagens'}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Detalhes da conversa à direita */}
            <div className="memory-detail">
              {selectedConversation ? (
                <>
                  <div className="memory-detail-header">
                    <div>
                      <h3 className="conversation-detail-title">{selectedConversation.title}</h3>
                      <span className="detail-date">{formatDate(selectedConversation.createdAt)}</span>
                    </div>
                  </div>

                  <div className="memory-detail-content conversation-messages-history">
                    {selectedConversation.messages.map((message, index) => (
                      <div key={message.id} className={`history-message ${message.role}`}>
                        <div className="history-message-header">
                          <span className="history-message-role">
                            {message.role === 'user' ? '👤 Você' : '🤖 IA'}
                          </span>
                          <span className="history-message-time">
                            {new Date(message.createdAt).toLocaleTimeString('pt-BR', {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        </div>
                        <div className="history-message-content">
                          {message.role === 'user' ? (
                            <p>{message.content}</p>
                          ) : (
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
                                a: ({ href, children }) => <a href={href} className="md-link" target="_blank" rel="noopener noreferrer">{children}</a>,
                              }}
                            >
                              {message.content}
                            </ReactMarkdown>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div className="no-selection">
                  <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                  <p>Selecione uma conversa para ver os detalhes</p>
                </div>
              )}
            </div>
          </div>
        )
      ) : memories.length === 0 ? (
        // === EMPTY STATE MEMÓRIAS ===
        <div className="empty-memories">
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
          <h3>{searchPerformed ? 'Nenhuma memória encontrada' : 'Nenhuma memória ainda'}</h3>
          <p>
            {searchPerformed
              ? 'Tente buscar por outro assunto'
              : 'Use o "Chat Rápido" para criar memórias isoladas'}
          </p>
        </div>
      ) : (
        // === VIEW DE MEMÓRIAS ===
        <div className="memories-container">
          {/* Lista de memórias à esquerda */}
          <div className="memories-list">
            <div className="memories-list-header">
              <span className="memories-count">
                {memories.length} {memories.length === 1 ? 'conversa' : 'conversas'}
              </span>
            </div>
            <div className="memories-list-content">
              {(() => {
                // Agrupa memórias por assunto
                const groupedMemories = memories.reduce((groups, memory) => {
                  const subject = memory.subject || 'Sem assunto';
                  if (!groups[subject]) {
                    groups[subject] = [];
                  }
                  groups[subject].push(memory);
                  return groups;
                }, {} as Record<string, MemoryResponse[]>);

                // Ordena assuntos alfabeticamente
                const sortedSubjects = Object.keys(groupedMemories).sort();

                return sortedSubjects.map((subject) => (
                  <div key={subject} className="subject-group">
                    <div className="subject-group-header">
                      <span className="subject-group-badge">{subject}</span>
                      <span className="subject-group-count">
                        {groupedMemories[subject].length}
                      </span>
                    </div>
                    <div className="subject-group-items">
                      {groupedMemories[subject].map((memory) => (
                        <div
                          key={memory.id}
                          className={`memory-list-item ${selectedMemory?.id === memory.id ? 'selected' : ''}`}
                          onClick={() => {
                            // Evita recarregar a mesma memória
                            if (selectedMemory?.id !== memory.id) {
                              setSelectedMemory(memory);
                            }
                          }}
                        >
                          <div className="memory-list-meta">
                            <span className="memory-list-date">{formatDate(memory.createdAt)}</span>
                          </div>
                          <div className="memory-list-question">
                            {memory.question}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ));
              })()}
            </div>
          </div>
          {/* Detalhes da memória à direita */}
          <div className="memory-detail">
            {selectedMemory ? (
              <>
                <div className="memory-detail-header">
                  <div>
                    <span className="detail-subject-badge">{selectedMemory.subject}</span>
                    <span className="detail-date">{formatDate(selectedMemory.createdAt)}</span>
                  </div>
                </div>

                <div className="memory-detail-content">
                  <section className="detail-section">
                    <h3 className="section-title">❓ Pergunta</h3>
                    <div className="section-content question-content">
                      <p>{selectedMemory.question}</p>
                    </div>
                  </section>

                  <section className="detail-section">
                    <h3 className="section-title">💡 Resposta</h3>
                    <div className="section-content answer-content">
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
                        {selectedMemory.answer}
                      </ReactMarkdown>
                    </div>
                  </section>
                </div>
              </>
            ) : (
              <div className="no-selection">
                <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <p>Selecione uma conversa para ver os detalhes</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default MemoriesView;
