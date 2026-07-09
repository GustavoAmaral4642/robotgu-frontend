import {
  Conversation,
  ConversationDetail,
  Message,
  CreateConversationRequest,
  SendMessageRequest,
} from '../types/conversation';

const API_BASE_URL = '/api';
const API_TIMEOUT = 10000; // 10 segundos

/**
 * Adiciona timeout a uma requisição fetch
 */
const fetchWithTimeout = async (url: string, options: RequestInit = {}): Promise<Response> => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    return response;
  } catch (error: any) {
    clearTimeout(timeoutId);
    if (error.name === 'AbortError') {
      throw new Error('A requisição excedeu o tempo limite de 10 segundos');
    }
    throw error;
  }
};

export const conversationService = {
  /**
   * Lista todas as conversas
   * @param title - Filtro opcional por título
   */
  async list(title?: string): Promise<Conversation[]> {
    const url = title
      ? `${API_BASE_URL}/conversations?title=${encodeURIComponent(title)}`
      : `${API_BASE_URL}/conversations`;

    const response = await fetchWithTimeout(url);

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

    const response = await fetchWithTimeout(`${API_BASE_URL}/conversations`, {
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
    const response = await fetchWithTimeout(`${API_BASE_URL}/conversations/${id}`);

    if (!response.ok) {
      throw new Error(`Erro ao buscar conversa: ${response.status}`);
    }

    return response.json();
  },

  /**
   * Envia uma mensagem e recebe a resposta da IA
   * @param conversationId - ID da conversa
   * @param content - Conteúdo da mensagem
   * @param keywords - Palavras-chave opcionais para busca contextual
   */
  async sendMessage(conversationId: number, content: string, keywords?: string): Promise<Message> {
    const request: SendMessageRequest = {
      content,
      ...(keywords && { keywords })
    };

    const response = await fetchWithTimeout(
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
      if (response.status === 429) {
        throw new Error('Too Many Requests - aguarde alguns segundos antes de enviar outra mensagem');
      }
      throw new Error(`Erro ao enviar mensagem: ${response.status}`);
    }

    return response.json();
  },

  /**
   * Deleta uma conversa
   * @param id - ID da conversa
   */
  async delete(id: number): Promise<void> {
    const response = await fetchWithTimeout(`${API_BASE_URL}/conversations/${id}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error(`Erro ao deletar conversa: ${response.status}`);
    }
  },
};
