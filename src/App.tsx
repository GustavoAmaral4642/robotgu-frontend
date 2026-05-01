import { useState, useEffect } from 'react';
import ChatWindow from './components/ChatWindow';
import ChatInput from './components/ChatInput';
import MemoriesView from './components/MemoriesView';
import ImportedChatView from './components/ImportedChatView';
import NewQuestionModal from './components/NewQuestionModal';
import ImportChatModal from './components/ImportChatModal';
import SubjectSelector from './components/SubjectSelector';
import ContextPanel from './components/ContextPanel';
import GlobalContextToggle from './components/GlobalContextToggle';
import ConversationList from './components/ConversationList';
import ConversationArea from './components/ConversationArea';
import { ChatMessage, MemoryResponse } from './types/chat';
import { Conversation, ConversationDetail, Message } from './types/conversation';
import { sendMessage, getSubjects, searchMemories } from './services/api';
import { conversationService } from './services/conversationService';
import './App.css';

type TabType = 'conversations' | 'chat' | 'imported' | 'memories';

function App() {
  const [activeTab, setActiveTab] = useState<TabType>('conversations');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);

  // Estados para seleção de assunto e contexto (aba Chat legado)
  const [subjects, setSubjects] = useState<string[]>([]);
  const [selectedSubject, setSelectedSubject] = useState('');
  const [contextMemories, setContextMemories] = useState<MemoryResponse[]>([]);
  const [isLoadingContext, setIsLoadingContext] = useState(false);
  const [useGlobalContext, setUseGlobalContext] = useState(false);

  // Estados para conversas (novo sistema)
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversation, setActiveConversation] = useState<ConversationDetail | null>(null);
  const [isLoadingConversation, setIsLoadingConversation] = useState(false);

  // Carrega conversas quando entra na aba de conversas
  useEffect(() => {
    if (activeTab === 'conversations') {
      loadConversations();
    }
  }, [activeTab]);

  // Carrega assuntos quando entra na aba de chat (legado)
  useEffect(() => {
    if (activeTab === 'chat') {
      loadSubjects();
    }
  }, [activeTab]);

  // Carrega memórias quando seleciona um assunto
  useEffect(() => {
    if (selectedSubject) {
      loadContextMemories(selectedSubject);
    } else {
      setContextMemories([]);
    }
  }, [selectedSubject]);

  const loadSubjects = async () => {
    try {
      const data = await getSubjects();
      setSubjects(data);
    } catch (error) {
      console.error('Erro ao carregar assuntos:', error);
    }
  };

  const loadContextMemories = async (subject: string) => {
    setIsLoadingContext(true);
    try {
      const data = await searchMemories(subject);
      setContextMemories(data);
    } catch (error) {
      console.error('Erro ao carregar contexto:', error);
      setContextMemories([]);
    } finally {
      setIsLoadingContext(false);
    }
  };

  const handleSendMessage = async (content: string) => {
    // Adiciona mensagem do usuário
    const userMessage: ChatMessage = {
      role: 'user',
      content,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    try {
      // Envia para o backend e recebe resposta (com assunto se selecionado)
      // String vazia ativa auto-detecção de assunto no backend
      const answer = await sendMessage(
        content,
        selectedSubject || '',
        useGlobalContext
      );

      // Adiciona resposta da IA
      const assistantMessage: ChatMessage = {
        role: 'assistant',
        content: answer,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);

      // Atualiza o contexto se estiver com assunto selecionado
      if (selectedSubject) {
        loadContextMemories(selectedSubject);
      }
    } catch (error) {
      // Adiciona mensagem de erro
      const errorMessage: ChatMessage = {
        role: 'assistant',
        content: 'Desculpe, ocorreu um erro ao processar sua mensagem. Tente novamente.',
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleNewQuestionSuccess = (answer: string) => {
    // Exibe a resposta em um alert ou notificação
    alert(`Resposta recebida:\n\n${answer}`);

    // Recarrega assuntos e contexto se necessário
    loadSubjects();
    if (selectedSubject) {
      loadContextMemories(selectedSubject);
    }
  };

  const handleImportSuccess = () => {
    // Recarrega assuntos após importação
    loadSubjects();
    // Muda para a aba de conversas importadas
    setActiveTab('imported');
  };

  // === Funções para Conversas ===
  const loadConversations = async () => {
    try {
      const data = await conversationService.list();
      // Ordena por última mensagem (mais recente primeiro)
      const sorted = data.sort((a, b) => {
        const dateA = new Date(a.lastMessageAt).getTime();
        const dateB = new Date(b.lastMessageAt).getTime();
        return dateB - dateA;
      });
      setConversations(sorted);
    } catch (error) {
      console.error('Erro ao carregar conversas:', error);
    }
  };

  const handleCreateConversation = async () => {
    const title = prompt('Digite o título da conversa:');
    if (!title || !title.trim()) return;

    try {
      const newConversation = await conversationService.create(title.trim());
      setConversations((prev) => [newConversation, ...prev]);

      // Seleciona a nova conversa
      const detail = await conversationService.get(newConversation.id);
      setActiveConversation(detail);
    } catch (error) {
      console.error('Erro ao criar conversa:', error);
      alert('Erro ao criar conversa. Tente novamente.');
    }
  };

  const handleSelectConversation = async (id: number) => {
    setIsLoadingConversation(true);
    try {
      const conversation = await conversationService.get(id);

      // DEBUG: Verifica duplicatas ao carregar conversa
      console.log('📊 Conversa carregada - Total de mensagens:', conversation.messages.length);
      console.log('📋 IDs das mensagens:', conversation.messages.map(m => m.id));

      const ids = conversation.messages.map(m => m.id);
      const uniqueIds = new Set(ids);
      if (ids.length !== uniqueIds.size) {
        console.warn('⚠️ DUPLICATAS DETECTADAS ao carregar! Backend retornou mensagens duplicadas');
        console.log('IDs duplicados:', ids.filter((id, index) => ids.indexOf(id) !== index));

        // Remove duplicatas baseado no ID
        const uniqueMessages = conversation.messages.filter((message, index, self) =>
          index === self.findIndex(m => m.id === message.id)
        );
        conversation.messages = uniqueMessages;
        console.log('✅ Duplicatas removidas. Total de mensagens únicas:', uniqueMessages.length);
      }

      setActiveConversation(conversation);
    } catch (error) {
      console.error('Erro ao carregar conversa:', error);
      alert('Erro ao carregar conversa.');
    } finally {
      setIsLoadingConversation(false);
    }
  };

  const handleSendConversationMessage = async (content: string) => {
    if (!activeConversation) return;

    setIsLoadingConversation(true);

    try {
      // Envia para o backend (backend salva pergunta + resposta automaticamente)
      await conversationService.sendMessage(activeConversation.id, content);

      // Recarrega a conversa completa do backend
      const updatedConversation = await conversationService.get(activeConversation.id);

      // DEBUG: Verifica duplicatas
      console.log('📊 Mensagens recebidas do backend:', updatedConversation.messages.length);
      console.log('📋 IDs das mensagens:', updatedConversation.messages.map(m => m.id));

      // Verifica se há IDs duplicados
      const ids = updatedConversation.messages.map(m => m.id);
      const uniqueIds = new Set(ids);
      if (ids.length !== uniqueIds.size) {
        console.warn('⚠️ DUPLICATAS DETECTADAS! Backend retornou mensagens duplicadas');
        console.log('IDs duplicados:', ids.filter((id, index) => ids.indexOf(id) !== index));

        // Remove duplicatas baseado no ID
        const uniqueMessages = updatedConversation.messages.filter((message, index, self) =>
          index === self.findIndex(m => m.id === message.id)
        );
        updatedConversation.messages = uniqueMessages;
        console.log('✅ Duplicatas removidas. Total de mensagens únicas:', uniqueMessages.length);
      }

      setActiveConversation(updatedConversation);

      // Atualiza a lista de conversas para refletir messageCount atualizado
      await loadConversations();
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
      alert('Erro ao enviar mensagem. Tente novamente.');
    } finally {
      setIsLoadingConversation(false);
    }
  };

  const handleDeleteConversation = async (id: number) => {
    try {
      await conversationService.delete(id);

      // Remove da lista
      setConversations((prev) => prev.filter((c) => c.id !== id));

      // Limpa conversa ativa se foi deletada
      if (activeConversation?.id === id) {
        setActiveConversation(null);
      }
    } catch (error) {
      console.error('Erro ao deletar conversa:', error);
      alert('Erro ao deletar conversa.');
    }
  };

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-content">
          <div className="header-title">
            <h1>🤖 RobotGu Chat</h1>
            <p>Converse com a inteligência artificial</p>
          </div>
          <div className="header-actions">
            <button className="import-btn" onClick={() => setIsImportModalOpen(true)}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12" />
              </svg>
              Importar ChatGPT
            </button>
            <button className="new-question-btn" onClick={() => setIsModalOpen(true)}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              Nova Pergunta
            </button>
          </div>
        </div>

        <nav className="app-tabs">
          <button
            className={`tab-button ${activeTab === 'conversations' ? 'active' : ''}`}
            onClick={() => setActiveTab('conversations')}
          >
            💬 Conversas
          </button>
          <button
            className={`tab-button ${activeTab === 'chat' ? 'active' : ''}`}
            onClick={() => setActiveTab('chat')}
          >
            🗨️ Chat Rápido
          </button>
          <button
            className={`tab-button ${activeTab === 'imported' ? 'active' : ''}`}
            onClick={() => setActiveTab('imported')}
          >
            📥 ChatGPT Importado
          </button>
          <button
            className={`tab-button ${activeTab === 'memories' ? 'active' : ''}`}
            onClick={() => setActiveTab('memories')}
          >
            📚 Histórico
          </button>
        </nav>
      </header>

      <main className="app-main">
        {activeTab === 'conversations' ? (
          <div className="conversations-container">
            <ConversationList
              conversations={conversations}
              activeConversationId={activeConversation?.id || null}
              onSelectConversation={handleSelectConversation}
              onDeleteConversation={handleDeleteConversation}
              onCreateConversation={handleCreateConversation}
            />
            <ConversationArea
              conversation={activeConversation}
              onSendMessage={handleSendConversationMessage}
              isLoading={isLoadingConversation}
            />
          </div>
        ) : activeTab === 'chat' ? (
          <div className="chat-container">
            <ContextPanel
              memories={contextMemories}
              isLoading={isLoadingContext}
              selectedSubject={selectedSubject}
            />
            <div className="chat-main">
              <SubjectSelector
                subjects={subjects}
                selectedSubject={selectedSubject}
                onSelectSubject={setSelectedSubject}
                isLoading={isLoading}
              />
              <GlobalContextToggle
                enabled={useGlobalContext}
                onChange={setUseGlobalContext}
                disabled={isLoading}
              />
              <ChatWindow messages={messages} isLoading={isLoading} />
              <ChatInput onSendMessage={handleSendMessage} disabled={isLoading} />
            </div>
          </div>
        ) : activeTab === 'imported' ? (
          <ImportedChatView />
        ) : (
          <MemoriesView />
        )}
      </main>

      <NewQuestionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={handleNewQuestionSuccess}
      />

      <ImportChatModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onSuccess={handleImportSuccess}
      />
    </div>
  );
}

export default App;
