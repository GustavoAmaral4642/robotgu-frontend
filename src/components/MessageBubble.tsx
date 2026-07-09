import { ChatMessage } from '../types/chat';
import ReactMarkdown from 'react-markdown';
import ContextIndicator from './ContextIndicator';
import './MessageBubble.css';

interface MessageBubbleProps {
  message: ChatMessage;
}

const MessageBubble = ({ message }: MessageBubbleProps) => {
  const isUser = message.role === 'user';

  return (
    <div className={`message-container ${isUser ? 'user' : 'assistant'}`}>
      <div className={`message-bubble ${isUser ? 'user' : 'assistant'}`}>
        {!isUser && <ContextIndicator contextInfo={message.contextInfo} />}
        <div className="message-content">
          {isUser ? (
            <p>{message.content}</p>
          ) : (
            <ReactMarkdown
              components={{
                // Customização de componentes markdown
                h1: ({ children }) => <h1 className="md-h1">{children}</h1>,
                h2: ({ children }) => <h2 className="md-h2">{children}</h2>,
                h3: ({ children }) => <h3 className="md-h3">{children}</h3>,
                h4: ({ children }) => <h4 className="md-h4">{children}</h4>,
                p: ({ children }) => <p className="md-p">{children}</p>,
                ul: ({ children }) => <ul className="md-ul">{children}</ul>,
                ol: ({ children }) => <ol className="md-ol">{children}</ol>,
                li: ({ children }) => <li className="md-li">{children}</li>,
                code: ({ className, children }) => {
                  const isInline = !className;
                  return isInline ? (
                    <code className="md-code-inline">{children}</code>
                  ) : (
                    <code className="md-code-block">{children}</code>
                  );
                },
                pre: ({ children }) => <pre className="md-pre">{children}</pre>,
                blockquote: ({ children }) => <blockquote className="md-blockquote">{children}</blockquote>,
                strong: ({ children }) => <strong className="md-strong">{children}</strong>,
                em: ({ children }) => <em className="md-em">{children}</em>,
                a: ({ href, children }) => (
                  <a href={href} className="md-link" target="_blank" rel="noopener noreferrer">
                    {children}
                  </a>
                ),
              }}
            >
              {message.content}
            </ReactMarkdown>
          )}
        </div>
        <span className="message-time">
          {message.timestamp.toLocaleTimeString('pt-BR', {
            hour: '2-digit',
            minute: '2-digit'
          })}
        </span>
      </div>
    </div>
  );
};

export default MessageBubble;
