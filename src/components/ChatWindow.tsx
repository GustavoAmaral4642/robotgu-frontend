import { useEffect, useRef } from 'react';
import { ChatMessage } from '../types/chat';
import MessageBubble from './MessageBubble';
import './ChatWindow.css';

interface ChatWindowProps {
  messages: ChatMessage[];
  isLoading: boolean;
}

const ChatWindow = ({ messages, isLoading }: ChatWindowProps) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  return (
    <div className="chat-window">
      {messages.length === 0 ? (
        <div className="empty-state">
          <h2>👋 Olá!</h2>
          <p>Faça sua primeira pergunta para começar a conversar com a IA.</p>
        </div>
      ) : (
        <div className="messages-container">
          {messages.map((message, index) => (
            <MessageBubble key={index} message={message} />
          ))}
          {isLoading && (
            <div className="loading-container">
              <div className="loading-bubble">
                <div className="loading-dots">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      )}
    </div>
  );
};

export default ChatWindow;
