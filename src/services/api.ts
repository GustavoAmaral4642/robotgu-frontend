import { ChatRequest, ChatResponse, MemoryResponse } from '../types/chat';

const API_BASE_URL = '/api';

export const sendMessage = async (
  question: string,
  subject: string = '',
  useGlobalContext: boolean = false,
  keywords?: string
): Promise<string> => {
  const request: ChatRequest = {
    subject,
    question,
    ...(keywords && { keywords })
  };

  const url = useGlobalContext
    ? `${API_BASE_URL}/chat?useGlobalContext=true`
    : `${API_BASE_URL}/chat`;

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      throw new Error(`Erro na requisição: ${response.status}`);
    }

    const data: ChatResponse = await response.json();
    return data.answer;
  } catch (error) {
    console.error('Erro ao enviar mensagem:', error);
    throw error;
  }
};

export const getSubjects = async (): Promise<string[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/chat/subjects`);

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
    const response = await fetch(`${API_BASE_URL}/chat/search?subject=${encodeURIComponent(subject)}`);

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
    const response = await fetch(`${API_BASE_URL}/chat/memories`);

    if (!response.ok) {
      throw new Error(`Erro ao buscar todas as memórias: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Erro ao buscar todas as memórias:', error);
    throw error;
  }
};
