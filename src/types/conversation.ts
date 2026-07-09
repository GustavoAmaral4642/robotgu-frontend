import { ContextInfo } from './chat';

export interface Conversation {
  id: number;
  title: string;
  createdAt: string;
  lastMessageAt: string;
  messageCount: number;
}

export interface ConversationDetail extends Conversation {
  updatedAt: string;
  messages: Message[];
}

export interface Message {
  id: number;
  role: 'user' | 'assistant';
  content: string;
  createdAt: string;
  contextInfo?: ContextInfo;
}

export interface CreateConversationRequest {
  title: string;
  contextConversationIds?: number[];  // IDs de conversas para usar como contexto inicial
}

export interface SendMessageRequest {
  content: string;
  keywords?: string;
}

export interface MessageResponse extends Message { }

export interface ConversationResponse extends Conversation { }

export interface ConversationDetailResponse extends ConversationDetail { }

// Novos tipos para seleção manual de contexto
export interface ConversationSummary {
  id: number;
  question: string;
  answerPreview: string;
  createdAt: string;
  characterCount: number;
}

export interface HistoryResponse {
  subject: string;
  total: number;
  conversations: ConversationSummary[];
}
