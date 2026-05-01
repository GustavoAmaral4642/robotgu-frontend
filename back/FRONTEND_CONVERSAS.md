# 📱 GUIA FRONTEND - Sistema de Conversas

## 🎯 **PARA O DESENVOLVEDOR FRONTEND**

O backend agora tem sistema de conversas igual ao ChatGPT! Aqui está tudo que você precisa saber:

---

## 📋 **ENDPOINTS DISPONÍVEIS**

### **Base URL:** `http://localhost:8080`

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| POST | `/conversations` | Criar nova conversa |
| GET | `/conversations` | Listar conversas |
| GET | `/conversations/{id}` | Ver conversa completa |
| POST | `/conversations/{id}/messages` | Enviar mensagem |
| DELETE | `/conversations/{id}` | Deletar conversa |

---

## 💻 **EXEMPLOS DE USO (JavaScript/TypeScript)**

### **1. Criar conversa**

```typescript
interface ConversationResponse {
  id: number;
  title: string;
  createdAt: string;
  lastMessageAt: string;
  messageCount: number;
}

const createConversation = async (title: string): Promise<ConversationResponse> => {
  const response = await fetch('http://localhost:8080/conversations', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title })
  });
  return response.json();
};

// Uso:
const conv = await createConversation("Aprendendo Java");
// conv.id = 1
```

---

### **2. Listar conversas (para sidebar)**

```typescript
const listConversations = async (): Promise<ConversationResponse[]> => {
  const response = await fetch('http://localhost:8080/conversations');
  return response.json();
};

// Uso:
const conversations = await listConversations();
// [{ id: 1, title: "Aprendendo Java", messageCount: 6 }, ...]
```

---

### **3. Ver conversa completa**

```typescript
interface Message {
  id: number;
  role: 'user' | 'assistant';
  content: string;
  createdAt: string;
}

interface ConversationDetail {
  id: number;
  title: string;
  createdAt: string;
  updatedAt: string;
  messages: Message[];
}

const getConversation = async (id: number): Promise<ConversationDetail> => {
  const response = await fetch(`http://localhost:8080/conversations/${id}`);
  return response.json();
};

// Uso:
const conversation = await getConversation(1);
// conversation.messages = [{ role: 'user', content: '...' }, ...]
```

---

### **4. Enviar mensagem (conversar)**

```typescript
interface MessageResponse {
  id: number;
  role: 'user' | 'assistant';
  content: string;
  createdAt: string;
}

const sendMessage = async (
  conversationId: number,
  content: string
): Promise<MessageResponse> => {
  const response = await fetch(
    `http://localhost:8080/conversations/${conversationId}/messages`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content })
    }
  );
  return response.json();
};

// Uso:
const aiResponse = await sendMessage(1, "O que é polimorfismo?");
// aiResponse.content = "Polimorfismo é..."
```

---

### **5. Deletar conversa**

```typescript
const deleteConversation = async (id: number): Promise<void> => {
  await fetch(`http://localhost:8080/conversations/${id}`, {
    method: 'DELETE'
  });
};

// Uso:
await deleteConversation(1);
```

---

## 🎨 **SUGESTÃO DE UI (React)**

### **Componente principal:**

```tsx
import { useState, useEffect } from 'react';

function ChatApp() {
  const [conversations, setConversations] = useState([]);
  const [activeConv, setActiveConv] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');

  // Carregar conversas ao iniciar
  useEffect(() => {
    loadConversations();
  }, []);

  const loadConversations = async () => {
    const data = await fetch('/conversations').then(r => r.json());
    setConversations(data);
  };

  const loadMessages = async (convId) => {
    const data = await fetch(`/conversations/${convId}`).then(r => r.json());
    setActiveConv(data);
    setMessages(data.messages);
  };

  const createNew = async () => {
    const title = prompt("Título da conversa:");
    const conv = await fetch('/conversations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title })
    }).then(r => r.json());
    
    setConversations([...conversations, conv]);
    setActiveConv(conv);
    setMessages([]);
  };

  const sendMessage = async () => {
    if (!input.trim() || !activeConv) return;

    const response = await fetch(`/conversations/${activeConv.id}/messages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: input })
    }).then(r => r.json());

    // Adicionar mensagem do usuário e resposta da IA
    setMessages([
      ...messages,
      { role: 'user', content: input, createdAt: new Date().toISOString() },
      response
    ]);
    
    setInput('');
  };

  return (
    <div className="chat-app">
      {/* Sidebar */}
      <aside className="sidebar">
        <button onClick={createNew}>+ Nova Conversa</button>
        {conversations.map(conv => (
          <div 
            key={conv.id}
            onClick={() => loadMessages(conv.id)}
            className={activeConv?.id === conv.id ? 'active' : ''}
          >
            {conv.title}
            <span>{conv.messageCount} mensagens</span>
          </div>
        ))}
      </aside>

      {/* Chat */}
      <main className="chat">
        {activeConv && <h2>{activeConv.title}</h2>}
        
        <div className="messages">
          {messages.map((msg, i) => (
            <div key={i} className={`message ${msg.role}`}>
              <strong>{msg.role === 'user' ? 'Você' : 'IA'}:</strong>
              <div dangerouslySetInnerHTML={{ __html: renderMarkdown(msg.content) }} />
            </div>
          ))}
        </div>

        <div className="input">
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyPress={e => e.key === 'Enter' && sendMessage()}
            placeholder="Digite sua mensagem..."
          />
          <button onClick={sendMessage}>Enviar</button>
        </div>
      </main>
    </div>
  );
}
```

---

## 📊 **FLUXO COMPLETO**

```
1. Usuário abre app
   ↓
   GET /conversations → Exibe sidebar

2. Usuário clica "Nova Conversa"
   ↓
   POST /conversations { title: "..." }
   ↓
   Conversa criada (vazia)

3. Usuário envia primeira mensagem
   ↓
   POST /conversations/{id}/messages { content: "..." }
   ↓
   Backend salva pergunta + chama IA + salva resposta
   ↓
   Retorna resposta da IA

4. Usuário envia segunda mensagem
   ↓
   POST /conversations/{id}/messages { content: "..." }
   ↓
   Backend busca contexto (últimas 10 mensagens)
   ↓
   IA responde com contexto!

5. Usuário muda de conversa
   ↓
   GET /conversations/{id}
   ↓
   Carrega histórico completo
```

---

## ⚙️ **CONFIGURAÇÕES OPCIONAIS**

### **Buscar conversas por título:**
```typescript
const found = await fetch('/conversations?title=java').then(r => r.json());
```

### **Polling para atualizar sidebar:**
```typescript
setInterval(async () => {
  const conversations = await loadConversations();
  setConversations(conversations);
}, 5000); // A cada 5 segundos
```

---

## 🎨 **EXEMPLO DE CSS (sugestão)**

```css
.chat-app {
  display: flex;
  height: 100vh;
}

.sidebar {
  width: 300px;
  background: #f5f5f5;
  padding: 1rem;
  overflow-y: auto;
}

.sidebar button {
  width: 100%;
  margin-bottom: 1rem;
}

.sidebar div {
  padding: 0.75rem;
  margin-bottom: 0.5rem;
  border-radius: 4px;
  cursor: pointer;
}

.sidebar div:hover {
  background: #e0e0e0;
}

.sidebar div.active {
  background: #2196f3;
  color: white;
}

.chat {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 1rem;
}

.messages {
  flex: 1;
  overflow-y: auto;
  margin-bottom: 1rem;
}

.message {
  margin-bottom: 1rem;
  padding: 1rem;
  border-radius: 8px;
}

.message.user {
  background: #e3f2fd;
  text-align: right;
}

.message.assistant {
  background: #f5f5f5;
}

.input {
  display: flex;
  gap: 0.5rem;
}

.input input {
  flex: 1;
  padding: 0.75rem;
  border: 1px solid #ccc;
  border-radius: 4px;
}

.input button {
  padding: 0.75rem 1.5rem;
  background: #2196f3;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}
```

---

## ✅ **CHECKLIST DE IMPLEMENTAÇÃO**

```
[ ] Criar componente Sidebar (lista de conversas)
[ ] Criar componente Chat (mensagens)
[ ] Integrar API de criar conversa
[ ] Integrar API de listar conversas
[ ] Integrar API de enviar mensagem
[ ] Implementar renderização de Markdown
[ ] Adicionar estados de loading
[ ] Adicionar tratamento de erros
[ ] Testar fluxo completo
```

---

## 🚀 **TESTE RÁPIDO**

Cole isso no console do navegador (com app rodando):

```javascript
// Criar conversa
const conv = await fetch('http://localhost:8080/conversations', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ title: 'Teste Frontend' })
}).then(r => r.json());

console.log('Conversa criada:', conv);

// Enviar mensagem
const msg = await fetch(`http://localhost:8080/conversations/${conv.id}/messages`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ content: 'Olá!' })
}).then(r => r.json());

console.log('Resposta da IA:', msg.content);
```

---

**BACKEND PRONTO! AGUARDANDO FRONTEND!** 🎨🚀

