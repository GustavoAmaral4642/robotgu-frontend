# 📥 Importação de Conversas do ChatGPT

## Visão Geral

A funcionalidade de importação permite que você transfira suas conversas do ChatGPT para o RobotGu, preservando todo o histórico de perguntas e respostas.

## Como Usar

### 1. Exportar Conversas do ChatGPT

1. Acesse [ChatGPT](https://chat.openai.com)
2. Clique no seu perfil (canto superior direito)
3. Vá em **Settings** → **Data Controls**
4. Clique em **Export data**
5. Aguarde o e-mail com o link de download (pode demorar alguns minutos)
6. Baixe o arquivo ZIP e descompacte
7. Localize o arquivo **`conversations.json`**

### 2. Importar no RobotGu

1. No RobotGu, clique no botão **"📥 Importar ChatGPT"** no cabeçalho
2. Clique em **"Escolher arquivo JSON"** ou arraste o arquivo `conversations.json`
3. Clique em **"Importar Conversas"**
4. Aguarde o processamento
5. Visualize as estatísticas:
   - ✅ **Importadas**: conversas salvas com sucesso
   - ⚠️ **Falharam**: conversas que não puderam ser importadas
6. Você será redirecionado automaticamente para o **Histórico**

## Formato dos Dados

### Entrada (ChatGPT)
```json
{
  "title": "Programação em Python",
  "create_time": 1680000000,
  "mapping": {
    "id1": {
      "message": {
        "role": "user",
        "content": {
          "content_type": "text",
          "parts": ["Como criar uma função em Python?"]
        }
      }
    },
    "id2": {
      "message": {
        "role": "assistant",
        "content": {
          "content_type": "text",
          "parts": ["Para criar uma função em Python..."]
        }
      }
    }
  }
}
```

### Saída (RobotGu)
```json
[
  {
    "subject": "Programação em Python",
    "question": "Como criar uma função em Python?",
    "answer": "Para criar uma função em Python..."
  }
]
```

## Estrutura Técnica

### Arquivos Criados

#### 1. `src/types/import.ts`
Define as interfaces TypeScript para:
- **ChatGPTConversation**: formato de exportação do ChatGPT
- **ImportMemoryRequest**: formato aceito pelo backend
- **ImportResponse**: resposta da API de importação

#### 2. `src/services/import.ts`
Contém:
- **convertChatGPTToMemories()**: converte formato ChatGPT → RobotGu
- **importChatGPT()**: envia dados para `POST /api/chat/import`

#### 3. `src/components/ImportChatModal.tsx`
Modal completo com:
- Upload de arquivo JSON
- Validação de formato
- Conversão automática
- Exibição de estatísticas
- Tratamento de erros

#### 4. `src/components/ImportChatModal.css`
Estilos completos incluindo:
- Modal responsivo
- Drag & drop visual
- Animações
- Estatísticas coloridas

### Função de Conversão

```typescript
export const convertChatGPTToMemories = (conversation: ChatGPTConversation): ImportMemoryRequest[] => {
  const memories: ImportMemoryRequest[] = [];
  const { title, mapping } = conversation;

  // Extrai mensagens
  const messages: { role: string; content: string }[] = [];
  
  Object.values(mapping).forEach((node) => {
    if (node.message && node.message.content.parts.length > 0) {
      messages.push({
        role: node.message.role,
        content: node.message.content.parts.join('\n'),
      });
    }
  });

  // Agrupa perguntas (user) e respostas (assistant)
  for (let i = 0; i < messages.length - 1; i++) {
    if (messages[i].role === 'user' && messages[i + 1].role === 'assistant') {
      memories.push({
        subject: title || 'chatgpt-import',
        question: messages[i].content,
        answer: messages[i + 1].content,
      });
    }
  }

  return memories;
};
```

### Endpoint da API

**POST** `/api/chat/import`

**Request Body:**
```json
[
  {
    "subject": "string",
    "question": "string",
    "answer": "string"
  }
]
```

**Response:**
```json
{
  "imported": 15,
  "failed": 2,
  "errors": [
    "Erro ao importar item 5: campo obrigatório ausente",
    "Erro ao importar item 12: formato inválido"
  ]
}
```

## Validações

### Frontend
- ✅ Verifica se o arquivo é JSON
- ✅ Valida estrutura básica do ChatGPT
- ✅ Filtra mensagens vazias
- ✅ Agrupa pares pergunta-resposta

### Backend
- ✅ Valida campos obrigatórios
- ✅ Limita tamanho dos textos
- ✅ Retorna erros específicos por item

## Tratamento de Erros

### Arquivo Inválido
```
⚠️ Arquivo JSON inválido. Verifique o formato.
```

### Sem Conversas
```
⚠️ Nenhuma conversa válida encontrada no arquivo
```

### Erro de Rede
```
⚠️ Erro ao importar conversas. Tente novamente.
```

## Melhorias Futuras

- [ ] Importação em lote de múltiplos arquivos
- [ ] Visualização prévia antes da importação
- [ ] Seleção de conversas específicas
- [ ] Mapeamento de assuntos customizado
- [ ] Importação incremental (evitar duplicatas)
- [ ] Suporte a outros formatos (CSV, MD)
- [ ] Backup antes da importação

## Observações

- **Título da conversa** é usado como **assunto** no RobotGu
- Se não houver título, usa `"chatgpt-import"` como padrão
- Apenas pares **user → assistant** são importados
- Mensagens órfãs ou em sequência são ignoradas
- O arquivo pode ser grande (MB), processamento é feito no frontend

## Exemplo de Uso Completo

```typescript
// 1. Usuário seleciona arquivo
const file = document.getElementById('file-upload').files[0];

// 2. Lê o arquivo
const text = await file.text();
const conversation = JSON.parse(text);

// 3. Converte formato
const memories = convertChatGPTToMemories(conversation);

// 4. Envia para backend
const result = await importChatGPT(memories);

// 5. Exibe resultado
console.log(`✅ ${result.imported} importadas`);
console.log(`⚠️ ${result.failed} falharam`);
```

## Suporte

Para problemas com a importação:
1. Verifique se o arquivo é o **conversations.json** exportado do ChatGPT
2. Confirme que o arquivo não está corrompido (abra em um editor de texto)
3. Teste com uma conversa pequena primeiro
4. Consulte os logs do backend para erros específics
