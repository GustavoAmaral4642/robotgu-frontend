# 🔄 MIGRAÇÃO: Sistema Antigo → Sistema de Conversas

**Para:** Desenvolvedor Frontend  
**Assunto:** Como migrar do sistema antigo para o novo

---

## 📊 **MUDANÇAS PRINCIPAIS**

### **ENDPOINTS DESCONTINUADOS:**

| Endpoint Antigo | Status | Substituto |
|-----------------|--------|------------|
| `POST /chat` | ⚠️ Mantido por compatibilidade | `POST /conversations/{id}/messages` |
| `GET /chat/search` | ✅ Mantido | `GET /conversations?title=...` |
| `GET /chat/memories` | ✅ Mantido | `GET /conversations` (melhor) |
| `GET /chat/subjects` | ✅ Mantido | - |

**Nota:** Endpoints antigos ainda funcionam, mas **sistema novo é recomendado** para novos desenvolvimentos.

---

## 🔀 **COMPARAÇÃO LADO A LADO**

### **Antigo: POST /chat**
```typescript
// ❌ Sistema antigo (isolado)
const response = await fetch('/chat', {
  method: 'POST',
  body: JSON.stringify({
    subject: 'react',
    question: 'O que é useState?'
  })
});

// Resposta: { answer: "..." }
// Problema: Próxima pergunta não tem contexto!
```

### **Novo: POST /conversations/{id}/messages**
```typescript
// ✅ Sistema novo (com contexto)
// 1. Criar conversa (1x)
const conv = await fetch('/conversations', {
  method: 'POST',
  body: JSON.stringify({ title: 'Aprendendo React' })
}).then(r => r.json());

// 2. Enviar mensagens (quantas quiser)
const msg1 = await fetch(`/conversations/${conv.id}/messages`, {
  method: 'POST',
  body: JSON.stringify({ content: 'O que é useState?' })
}).then(r => r.json());

const msg2 = await fetch(`/conversations/${conv.id}/messages`, {
  method: 'POST',
  body: JSON.stringify({ content: 'Dê exemplo' })
}).then(r => r.json());

// IA lembra da pergunta anterior! ✅
```

---

## 🎨 **MUDANÇAS NA UI**

### **ANTES:**
```
┌──────────────────────────────┐
│  Memory Chat                 │
├──────────────────────────────┤
│                              │
│  Subject: [react]            │
│  Question: [............]    │
│  [Enviar]                    │
│                              │
│  Resposta aparece aqui       │
│                              │
└──────────────────────────────┘
```

**Problema:** 
- Cada pergunta é isolada
- Difícil ver histórico
- Sem organização de conversas

---

### **AGORA:**
```
┌─────────────────────────────────────────────────┐
│  [Sidebar]      │  [Chat Area]                 │
│                 │                              │
│  + Nova Conv    │  📝 Aprendendo React         │
│  ────────────   │  ─────────────────────       │
│  📁 React       │  👤 Você: O que é useState?  │
│     10 msgs     │  🤖 IA: useState é...        │
│                 │                              │
│  📁 Python      │  👤 Você: Dê exemplo         │
│     5 msgs      │  🤖 IA: ```jsx...            │
│                 │                              │
│  📁 Java        │  [Digite mensagem...]        │
│     15 msgs     │  [Enviar]                    │
└─────────────────────────────────────────────────┘
```

**Benefícios:**
- ✅ Conversas organizadas
- ✅ Histórico visível
- ✅ Contexto automático
- ✅ UX igual ChatGPT

---

## 📝 **GUIA DE MIGRAÇÃO**

### **Passo 1: Adicionar novos tipos**

```typescript
// types/conversation.ts
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
}
```

---

### **Passo 2: Criar serviço de API**

```typescript
// services/conversationService.ts
export const conversationService = {
  async list(): Promise<Conversation[]> {
    const res = await fetch('/conversations');
    return res.json();
  },

  async create(title: string): Promise<Conversation> {
    const res = await fetch('/conversations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title })
    });
    return res.json();
  },

  async get(id: number): Promise<ConversationDetail> {
    const res = await fetch(`/conversations/${id}`);
    return res.json();
  },

  async sendMessage(id: number, content: string): Promise<Message> {
    const res = await fetch(`/conversations/${id}/messages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content })
    });
    return res.json();
  },

  async delete(id: number): Promise<void> {
    await fetch(`/conversations/${id}`, { method: 'DELETE' });
  }
};
```

---

### **Passo 3: Criar componentes**

**Componentes necessários:**

```
components/
  ├── ConversationList.tsx     (sidebar)
  ├── ConversationItem.tsx     (item da sidebar)
  ├── ChatArea.tsx             (área principal)
  ├── MessageList.tsx          (lista de mensagens)
  ├── MessageItem.tsx          (balão de mensagem)
  ├── MessageInput.tsx         (input + botão enviar)
  └── NewConversationButton.tsx
```

---

### **Passo 4: Gerenciamento de estado**

**React Context:**
```typescript
// context/ConversationContext.tsx
interface ConversationContextValue {
  conversations: Conversation[];
  activeConversation: ConversationDetail | null;
  isLoading: boolean;
  createConversation: (title: string) => Promise<void>;
  selectConversation: (id: number) => Promise<void>;
  sendMessage: (content: string) => Promise<void>;
  deleteConversation: (id: number) => Promise<void>;
}
```

**Ou Zustand:**
```typescript
// store/conversationStore.ts
interface ConversationStore {
  conversations: Conversation[];
  activeConversation: ConversationDetail | null;
  isLoading: boolean;
  actions: {
    fetchConversations: () => Promise<void>;
    createConversation: (title: string) => Promise<void>;
    selectConversation: (id: number) => Promise<void>;
    sendMessage: (content: string) => Promise<void>;
  };
}
```

---

## 🔧 **EXEMPLO COMPLETO (React + Context)**

```tsx
// App.tsx (simplificado)
function App() {
  return (
    <ConversationProvider>
      <div className="app">
        <Sidebar />
        <ChatArea />
      </div>
    </ConversationProvider>
  );
}

// Sidebar.tsx
function Sidebar() {
  const { conversations, createConversation } = useConversations();

  return (
    <aside className="sidebar">
      <button onClick={() => createConversation('Nova Conversa')}>
        + Nova Conversa
      </button>
      {conversations.map(conv => (
        <ConversationItem key={conv.id} conversation={conv} />
      ))}
    </aside>
  );
}

// ChatArea.tsx
function ChatArea() {
  const { activeConversation, sendMessage } = useConversations();

  if (!activeConversation) {
    return <EmptyState />;
  }

  return (
    <main className="chat-area">
      <h2>{activeConversation.title}</h2>
      <MessageList messages={activeConversation.messages} />
      <MessageInput onSend={sendMessage} />
    </main>
  );
}

// MessageList.tsx
function MessageList({ messages }: { messages: Message[] }) {
  return (
    <div className="messages">
      {messages.map(msg => (
        <div key={msg.id} className={`message ${msg.role}`}>
          <strong>{msg.role === 'user' ? 'Você' : 'IA'}:</strong>
          <ReactMarkdown>{msg.content}</ReactMarkdown>
        </div>
      ))}
    </div>
  );
}
```

---

## 📦 **DEPENDÊNCIAS NECESSÁRIAS**

```bash
# Renderização de Markdown
npm install react-markdown

# Syntax highlighting para código
npm install react-syntax-highlighter
npm install @types/react-syntax-highlighter --save-dev

# Formatação de datas (opcional)
npm install date-fns
```

---

## 🎯 **CRONOGRAMA SUGERIDO**

```
Semana 1:
[ ] Criar tipos TypeScript
[ ] Criar serviço de API
[ ] Implementar ConversationList (sidebar)
[ ] Implementar botão "Nova Conversa"

Semana 2:
[ ] Implementar ChatArea
[ ] Implementar MessageList
[ ] Implementar MessageInput
[ ] Integrar react-markdown

Semana 3:
[ ] Estados de loading
[ ] Tratamento de erros
[ ] Testes
[ ] Melhorias de UX

Semana 4:
[ ] Refinamentos visuais
[ ] Responsividade mobile
[ ] Acessibilidade
[ ] Deploy
```

---

## ⚠️ **PONTOS DE ATENÇÃO**

### **1. Scroll automático**
```typescript
// Após adicionar mensagem, scroll para o final
const messagesEndRef = useRef<HTMLDivElement>(null);

useEffect(() => {
  messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
}, [messages]);
```

### **2. Loading durante envio**
```typescript
const [isThinking, setIsThinking] = useState(false);

const handleSend = async (content: string) => {
  setIsThinking(true);
  try {
    await sendMessage(content);
  } finally {
    setIsThinking(false);
  }
};

// UI
{isThinking && <div className="thinking">IA está pensando...</div>}
```

### **3. Evitar refresh ao trocar conversa**
```typescript
// Não refaça GET toda vez - mantenha cache
const conversationCache = useRef<Map<number, ConversationDetail>>(new Map());

const selectConversation = async (id: number) => {
  if (conversationCache.current.has(id)) {
    setActive(conversationCache.current.get(id));
  } else {
    const conv = await conversationService.get(id);
    conversationCache.current.set(id, conv);
    setActive(conv);
  }
};
```

---

## 🚀 **TESTE RÁPIDO**

**Backend está rodando em:** `http://localhost:8080`

**Teste no console do navegador:**

```javascript
// 1. Criar conversa
const conv = await fetch('http://localhost:8080/conversations', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ title: 'Teste Console' })
}).then(r => r.json());

console.log('Conversa criada:', conv);

// 2. Enviar mensagem
const msg = await fetch(`http://localhost:8080/conversations/${conv.id}/messages`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ content: 'Olá!' })
}).then(r => r.json());

console.log('IA respondeu:', msg.content);

// 3. Ver histórico
const full = await fetch(`http://localhost:8080/conversations/${conv.id}`)
  .then(r => r.json());

console.log('Histórico completo:', full.messages);
```

---

## ✅ **CHECKLIST FINAL**

```
Backend (Pronto):
[✓] API de conversas implementada
[✓] Contexto automático funcionando
[✓] Respostas em Markdown
[✓] Quota de 1500 req/dia
[✓] Documentação completa

Frontend (A fazer):
[ ] Tipos TypeScript criados
[ ] Serviço de API criado
[ ] Sidebar implementada
[ ] Área de chat implementada
[ ] Markdown renderizado
[ ] Loading states
[ ] Tratamento de erros
[ ] Testes
```

---

## 📞 **DOCUMENTAÇÃO ADICIONAL**

- **RELATORIO_FRONTEND_CONVERSAS.md** ← Comece aqui!
- **FRONTEND_CONVERSAS.md** - Exemplos React completos
- **SISTEMA_CONVERSAS_IMPLEMENTADO.md** - Visão técnica backend

---

**BACKEND PRONTO E AGUARDANDO INTEGRAÇÃO!** 🚀

Qualquer dúvida sobre os endpoints ou comportamento da API, consulte a documentação ou faça testes diretos nos endpoints! 💻✨

