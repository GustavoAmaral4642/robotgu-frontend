export interface ChatGPTMessage {
  role?: string; // Formato antigo (mantido para compatibilidade)
  author?: {
    role: string;
    name?: string;
    metadata?: any;
  };
  content: {
    content_type: string;
    parts: string[];
  };
}

export interface ChatGPTConversation {
  title: string;
  create_time: number;
  mapping: Record<string, {
    id: string;
    message?: ChatGPTMessage;
    parent?: string;
    children: string[];
  }>;
}

export interface ImportResponse {
  totalConversations: number;
  totalMessages: number;
  memoriesImported: number;
  duplicatesSkipped: number;
  importDurationMs: number;
  subjectsCreated: string[];
  errors: Array<{
    conversation?: string;
    message?: string;
  }>;
}

export interface DebugImportResponse {
  totalConversations: number;
  conversations: Array<{
    index: number;
    title: string;
    totalMessages: number;
    messagesPreview: Array<{
      role: string;
      content: string;
    }>;
  }>;
}
