export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  contextInfo?: ContextInfo;
}

export interface ContextInfo {
  memoriesUsed?: number;
  maxMemories?: number;
  previousQuestions?: string[];
  strategy?: string;
}

export interface ChatRequest {
  subject: string;
  question: string;
  keywords?: string;
}

export interface ChatResponse {
  answer: string;
  contextInfo?: ContextInfo;
}

export interface MemoryResponse {
  id: number;
  subject: string;
  question: string;
  answer: string;
  createdAt: string;
}
