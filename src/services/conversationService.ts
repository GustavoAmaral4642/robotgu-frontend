import {
  Conversation,
  ConversationDetail,
  Message,
  CreateConversationRequest,
  SendMessageRequest,
} from '../types/conversation';

const API_BASE_URL = '/api';

export const conversationService = {
  /**
   * Lista todas as conversas
   * @param title - Filtro opcional por título
   */
  async list(title?: string): Promise<Conversation[]> {
    const url = title
      ? `${API_BASE_URL}/conversations?title=${encodeURIComponent(title)}`
      : `${API_BASE_URL}/conversations`;

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Erro ao listar conversas: ${response.status}`);
    }

    return response.json();
  },

  /**
   * Cria uma nova conversa
   * @param title - Título da conversa
   */
  async create(title: string): Promise<Conversation> {
    const request: CreateConversationRequest = { title };

    const response = await fetch(`${API_BASE_URL}/conversations`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      throw new Error(`Erro ao criar conversa: ${response.status}`);
    }

    return response.json();
  },

  /**
   * Busca uma conversa específica com todas as mensagens
   * @param id - ID da conversa
   */
  async get(id: number): Promise<ConversationDetail> {
    const response = await fetch(`${API_BASE_URL}/conversations/${id}`);

    if (!response.ok) {
      throw new Error(`Erro ao buscar conversa: ${response.status}`);
    }

    return response.json();
  },

  /**
   * Envia uma mensagem e recebe a resposta da IA
   * @param conversationId - ID da conversa
   * @param content - Conteúdo da mensagem
   */
  async sendMessage(conversationId: number, content: string): Promise<Message> {
    const request: SendMessageRequest = { content };

    const response = await fetch(
      `${API_BASE_URL}/conversations/${conversationId}/messages`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      }
    );

    if (!response.ok) {
      throw new Error(`Erro ao enviar mensagem: ${response.status}`);
    }

    return response.json();
  },

  /**
   * Deleta uma conversa
   * @param id - ID da conversa
   */
  async delete(id: number): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/conversations/${id}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error(`Erro ao deletar conversa: ${response.status}`);
    }
  },
};
