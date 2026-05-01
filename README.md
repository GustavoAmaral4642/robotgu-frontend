# 🤖 RobotGu Frontend

Frontend moderno para chat com IA, desenvolvido com React, TypeScript e Vite.

## 🚀 Tecnologias

- **React 18** - Biblioteca JavaScript para interfaces
- **TypeScript** - Tipagem estática
- **Vite** - Build tool e dev server rápido
- **CSS3** - Estilização moderna e responsiva

## 📁 Estrutura do Projeto

```
src/
├── components/
│   ├── ChatWindow.tsx       # Janela principal do chat
│   ├── ChatWindow.css
│   ├── ChatInput.tsx        # Input para mensagens
│   ├── ChatInput.css
│   ├── MessageBubble.tsx    # Bolhas de mensagem
│   └── MessageBubble.css
├── services/
│   └── api.ts               # Comunicação com backend
├── types/
│   └── chat.ts              # Tipagens TypeScript
├── App.tsx                  # Componente principal
├── App.css
├── main.tsx                 # Entry point
└── index.css
```

## 🛠️ Instalação

```bash
# 1. Instalar dependências
npm install

# 2. Iniciar servidor de desenvolvimento
npm run dev
```

O frontend estará disponível em: http://localhost:5173

## 🔌 Integração com Backend

O frontend espera que o backend esteja rodando em:
- **URL:** http://localhost:8080
- **Endpoint:** POST /chat

### Request esperado:
```json
{
  "subject": "general",
  "question": "sua pergunta aqui"
}
```

### Response esperado:
```json
{
  "answer": "resposta da IA"
}
```

## ⚙️ Configuração CORS

O backend Spring Boot precisa permitir requisições do frontend.

Veja o arquivo [CORS_BACKEND_CONFIG.md](./CORS_BACKEND_CONFIG.md) para instruções detalhadas.

## 📦 Build para Produção

```bash
npm run build
```

Os arquivos otimizados serão gerados na pasta `dist/`.

## 🎨 Funcionalidades

- ✅ Interface de chat moderna e responsiva
- ✅ Histórico de mensagens com scroll automático
- ✅ Indicador de loading durante requisições
- ✅ Tratamento de erros
- ✅ Timestamps em cada mensagem
- ✅ Animações suaves
- ✅ Design gradient moderno
- ✅ Suporte a múltiplas linhas (Shift + Enter)

## 🔧 Scripts Disponíveis

```bash
npm run dev      # Inicia servidor de desenvolvimento
npm run build    # Gera build de produção
npm run preview  # Preview do build de produção
```

## 📱 Responsividade

O layout é totalmente responsivo e funciona bem em:
- 💻 Desktop
- 📱 Tablets
- 📱 Smartphones

## 🎯 Fluxo de Uso

1. Usuário digita mensagem
2. Clica em enviar ou pressiona Enter
3. Mensagem é enviada ao backend
4. Loading é exibido
5. Resposta da IA aparece no chat
6. Histórico é mantido localmente

## 🤝 Contribuindo

Sugestões e melhorias são bem-vindas!

## 📄 Licença

MIT
# robotgu-frontend
