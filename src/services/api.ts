import { ChatRequest, ChatResponse, MemoryResponse } from '../types/chat';
import { HistoryResponse } from '../types/conversation';

const API_BASE_URL = '/api';
const API_TIMEOUT = 30000; // 30 segundos

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

export const sendMessage = async (
  question: string,
  subject: string = '',
  useGlobalContext: boolean = false,
  keywords?: string
): Promise<ChatResponse> => {
  const request: ChatRequest = {
    subject,
    question,
    ...(keywords && { keywords })
  };

  const url = useGlobalContext
    ? `${API_BASE_URL}/chat?useGlobalContext=true`
    : `${API_BASE_URL}/chat`;

  try {
    const response = await fetchWithTimeout(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      if (response.status === 429) {
        throw new Error('Too Many Requests - aguarde alguns segundos antes de tentar novamente');
      }
      throw new Error(`Erro na requisição: ${response.status}`);
    }

    const data: ChatResponse = await response.json();
    return data;
  } catch (error) {
    console.error('Erro ao enviar mensagem:', error);
    throw error;
  }
};

export const getSubjects = async (): Promise<string[]> => {
  try {
    const response = await fetchWithTimeout(`${API_BASE_URL}/chat/subjects`);

    if (!response.ok) {
      throw new Error(`Erro ao buscar assuntos: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Erro ao buscar assuntos:', error);
    throw error;
  }
};

export const searchMemories = async (subject: string): Promise<MemoryResponse[]> => {
  try {
    const response = await fetchWithTimeout(`${API_BASE_URL}/chat/search?subject=${encodeURIComponent(subject)}`);

    if (!response.ok) {
      throw new Error(`Erro ao buscar memórias: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Erro ao buscar memórias:', error);
    throw error;
  }
};

export const getAllMemories = async (): Promise<MemoryResponse[]> => {
  try {
    const response = await fetchWithTimeout(`${API_BASE_URL}/chat/memories`);

    if (!response.ok) {
      throw new Error(`Erro ao buscar todas as memórias: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Erro ao buscar todas as memórias:', error);
    throw error;
  }
};

/**
 * Busca histórico de conversas antigas de um assunto para seleção manual de contexto
 * @param subject - Assunto/tópico das conversas
 */
export const getHistory = async (subject: string): Promise<HistoryResponse> => {
  try {
    const response = await fetchWithTimeout(`${API_BASE_URL}/chat/history/${encodeURIComponent(subject)}`);

    if (!response.ok) {
      throw new Error(`Erro ao buscar histórico: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Erro ao buscar histórico:', error);
    throw error;
  }
};
