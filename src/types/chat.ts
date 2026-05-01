export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export interface ChatRequest {
  subject: string;
  question: string;
  keywords?: string;
}

export interface ChatResponse {
  answer: string;
}

export interface MemoryResponse {
  id: number;
  subject: string;
  question: string;
  answer: string;
  createdAt: string;
}
