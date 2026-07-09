# Guia de Integração Backend - Contexto Inteligente

## Para o desenvolvedor do backend

Este documento explica como o backend pode retornar informações de contexto para que o frontend as exiba adequadamente.

## 📌 Estrutura Atual vs. Nova (Opcional)

### Resposta Atual (continua funcionando)
```json
{
  "answer": "Resposta da IA aqui..."
}
```

### Resposta com Contexto (opcional, recomendado)
```json
{
  "answer": "Resposta da IA aqui...",
  "contextInfo": {
    "memoriesUsed": 3,
    "maxMemories": 5,
    "strategy": "inteligente",
    "previousQuestions": [
      "Como faço para criar um usuário?",
      "Qual a diferença entre POST e PUT?",
      "Como deletar um registro?"
    ]
  }
}
```

## 🔧 Campos do contextInfo

### `memoriesUsed` (number, opcional)
- Número de memórias efetivamente utilizadas na resposta
- Exemplo: `3` (usou 3 das 5 memórias disponíveis)

### `maxMemories` (number, opcional)
- Número máximo de memórias que podem ser usadas
- Exemplo: `5`
- Se não informado, frontend assume `5`

### `strategy` (string, opcional)
- Tipo de estratégia de contexto utilizada
- Exemplos:
  - `"inteligente"` - Contexto com até 5 memórias relevantes
  - `"global"` - Contexto global ativado
  - `"restrito"` - Contexto limitado por assunto
  - `"completo"` - Todas as memórias disponíveis

### `previousQuestions` (string[], opcional)
- Array com as perguntas anteriores usadas como contexto
- Frontend exibe em lista colapsável
- Limite recomendado: 5 perguntas mais recentes

## 💡 Exemplos de Uso

### Exemplo 1: Contexto Básico
```json
{
  "answer": "Para criar um usuário, você deve...",
  "contextInfo": {
    "memoriesUsed": 2,
    "maxMemories": 5
  }
}
```

**Como frontend exibe:**
- Badge: "🧠 2/5 memórias usadas"
- Clicável para expandir (mas sem perguntas anteriores)

---

### Exemplo 2: Contexto Completo
```json
{
  "answer": "Para deletar um registro, como mencionado anteriormente...",
  "contextInfo": {
    "memoriesUsed": 4,
    "maxMemories": 5,
    "strategy": "inteligente",
    "previousQuestions": [
      "Como criar um usuário?",
      "Qual a diferença entre POST e PUT?",
      "Como atualizar dados?",
      "Quais são os endpoints disponíveis?"
    ]
  }
}
```

**Como frontend exibe:**
- Badge: "🧠 4/5 memórias usadas" (clicável)
- Ao clicar, expande mostrando:
  ```
  Contexto Utilizado
  ──────────────────
  Estratégia: inteligente
  
  Perguntas anteriores:
  • Como criar um usuário?
  • Qual a diferença entre POST e PUT?
  • Como atualizar dados?
  • Quais são os endpoints disponíveis?
  ```

---

### Exemplo 3: Apenas Estratégia
```json
{
  "answer": "Resposta utilizando contexto global...",
  "contextInfo": {
    "strategy": "global"
  }
}
```

**Como frontend exibe:**
- Badge: "🧠 Contexto inteligente (até 5 memórias)" (clicável)
- Ao clicar:
  ```
  Contexto Utilizado
  ──────────────────
  Estratégia: global
  ```

---

## 🎯 Integração no Backend

### Endpoint: POST /api/chat

#### Cenário 1: Sem alterações (retrocompatível)
```python
# Backend atual
return {
    "answer": resposta_ia
}
```
✅ Frontend exibe indicador padrão

#### Cenário 2: Com informações básicas
```python
# Backend com info de memórias
return {
    "answer": resposta_ia,
    "contextInfo": {
        "memoriesUsed": len(memorias_utilizadas),
        "maxMemories": 5
    }
}
```
✅ Frontend exibe contador de memórias

#### Cenário 3: Com informações completas
```python
# Backend com todas as informações
perguntas_contexto = [msg.question for msg in ultimas_mensagens]

return {
    "answer": resposta_ia,
    "contextInfo": {
        "memoriesUsed": len(memorias_utilizadas),
        "maxMemories": 5,
        "strategy": "inteligente",
        "previousQuestions": perguntas_contexto[-5:]  # Últimas 5
    }
}
```
✅ Frontend exibe informações completas

---

### Endpoint: POST /api/conversations/{id}/messages

#### Resposta com contextInfo
```python
# Ao enviar mensagem em conversa
resposta_ia = gerar_resposta_com_contexto(mensagem, conversa_id)

# Salvar mensagem do usuário
msg_usuario = criar_mensagem(role="user", content=mensagem)

# Salvar mensagem da IA com contextInfo
msg_assistente = criar_mensagem(
    role="assistant",
    content=resposta_ia["answer"],
    context_info=resposta_ia.get("contextInfo")  # Opcional
)

return msg_assistente
```

**Estrutura da mensagem retornada:**
```json
{
  "id": 123,
  "role": "assistant",
  "content": "Resposta da IA...",
  "createdAt": "2026-05-06T10:30:00Z",
  "contextInfo": {
    "memoriesUsed": 3,
    "maxMemories": 5,
    "strategy": "inteligente",
    "previousQuestions": [...]
  }
}
```

---

## 📊 Modelo de Dados Recomendado (Backend)

### Adicionar campo opcional na tabela de mensagens

```sql
-- Exemplo SQL
ALTER TABLE messages 
ADD COLUMN context_info JSONB NULL;
```

```python
# Exemplo SQLAlchemy/FastAPI
class Message(Base):
    __tablename__ = "messages"
    
    id = Column(Integer, primary_key=True)
    conversation_id = Column(Integer, ForeignKey("conversations.id"))
    role = Column(String)
    content = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)
    context_info = Column(JSON, nullable=True)  # NOVO CAMPO
```

---

## ✅ Checklist de Implementação (Backend)

### Opcional - Fase 1 (Mínimo)
- [ ] Adicionar campo `context_info` no modelo de Message
- [ ] Retornar `memoriesUsed` e `maxMemories` na resposta
- [ ] Testar com frontend

### Opcional - Fase 2 (Recomendado)
- [ ] Adicionar `strategy` indicando tipo de contexto
- [ ] Incluir `previousQuestions` com perguntas usadas
- [ ] Testar visualização expandida no frontend

### Opcional - Fase 3 (Futuro)
- [ ] Adicionar mais campos conforme necessidade
- [ ] Criar endpoint para estatísticas de contexto
- [ ] Implementar analytics de uso de memórias

---

## 🧪 Como Testar

### 1. Testar sem contextInfo (retrocompatível)
```bash
curl -X POST http://localhost:8000/api/chat \
  -H "Content-Type: application/json" \
  -d '{"subject":"teste","question":"Oi"}'

# Resposta esperada:
# {"answer":"Olá! Como posso ajudar?"}
```

✅ Frontend mostra: "🧠 Contexto inteligente (até 5 memórias)"

### 2. Testar com contextInfo básico
```bash
curl -X POST http://localhost:8000/api/chat \
  -H "Content-Type: application/json" \
  -d '{"subject":"teste","question":"Como criar usuário?"}'

# Resposta esperada:
# {
#   "answer":"Para criar...",
#   "contextInfo":{"memoriesUsed":2,"maxMemories":5}
# }
```

✅ Frontend mostra: "🧠 2/5 memórias usadas" (clicável)

### 3. Testar com contextInfo completo
```bash
curl -X POST http://localhost:8000/api/chat \
  -H "Content-Type: application/json" \
  -d '{"subject":"teste","question":"E para deletar?"}'

# Resposta esperada:
# {
#   "answer":"Para deletar...",
#   "contextInfo":{
#     "memoriesUsed":3,
#     "maxMemories":5,
#     "strategy":"inteligente",
#     "previousQuestions":["Como criar usuário?","Como atualizar?"]
#   }
# }
```

✅ Frontend mostra badge clicável com detalhes expandíveis

---

## 🎨 Observações Finais

1. **Nenhum campo é obrigatório** - Backend pode adicionar gradualmente
2. **Frontend já está preparado** - Qualquer campo enviado será exibido
3. **Sem quebra de compatibilidade** - Ausência de `contextInfo` funciona normalmente
4. **Evolução incremental** - Comece com campos simples, adicione mais depois

---

**Dúvidas?** O frontend está 100% pronto para receber e exibir as informações quando o backend estiver preparado!
