import { Message } from '../types/conversation';
import ReactMarkdown from 'react-markdown';
import ContextIndicator from './ContextIndicator';
import './ConversationMessage.css';

interface ConversationMessageProps {
  message: Message;
}

const ConversationMessage = ({ message }: ConversationMessageProps) => {
  const isUser = message.role === 'user';

  return (
    <div className={`conversation-message ${message.role}`}>
      <div className="message-header">
        <span className="message-role">
          {isUser ? '👤 Você' : '🤖 IA'}
        </span>
        <span className="message-time">
          {new Date(message.createdAt).toLocaleTimeString('pt-BR', {
            hour: '2-digit',
            minute: '2-digit',
          })}
        </span>
      </div>
      {!isUser && <ContextIndicator contextInfo={message.contextInfo} />}
      <div className="message-content">
        {isUser ? (
          <p>{message.content}</p>
        ) : (
          <ReactMarkdown
            components={{
              h1: ({ children }) => <h1 className="md-h1">{children}</h1>,
              h2: ({ children }) => <h2 className="md-h2">{children}</h2>,
              h3: ({ children }) => <h3 className="md-h3">{children}</h3>,
              h4: ({ children }) => <h4 className="md-h4">{children}</h4>,
              code: ({ inline, children }) =>
                inline ? (
                  <code className="md-code-inline">{children}</code>
                ) : (
                  <code className="md-code-block">{children}</code>
                ),
              pre: ({ children }) => <pre className="md-pre">{children}</pre>,
              ul: ({ children }) => <ul className="md-ul">{children}</ul>,
              ol: ({ children }) => <ol className="md-ol">{children}</ol>,
              li: ({ children }) => <li className="md-li">{children}</li>,
              blockquote: ({ children }) => <blockquote className="md-blockquote">{children}</blockquote>,
              a: ({ href, children }) => <a href={href} className="md-link" target="_blank" rel="noopener noreferrer">{children}</a>,
            }}
          >
            {message.content}
          </ReactMarkdown>
        )}
      </div>
    </div>
  );
};

export default ConversationMessage;
