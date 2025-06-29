import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MessageCircle, Send, Bot, User, Loader2, Volume2, 
  ThumbsUp, ThumbsDown, Copy, RefreshCw, Sparkles
} from 'lucide-react';
import { aiService } from '../../services/aiService';
import { audioService } from '../../services/audioService';
import { useToast } from '../../hooks/useToast';

interface QAMessage {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  confidence?: number;
  sources?: string[];
  audioUrl?: string;
}

interface AIQuestionAnswerProps {
  lessonContext: string;
  lessonTitle: string;
  className?: string;
}

export const AIQuestionAnswer: React.FC<AIQuestionAnswerProps> = ({
  lessonContext,
  lessonTitle,
  className = ''
}) => {
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<QAMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isGeneratingAudio, setIsGeneratingAudio] = useState<string | null>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || isLoading) return;

    const userMessage: QAMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: inputValue.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      const response = await aiService.answerQuestion(
        userMessage.content,
        `Lesson: ${lessonTitle}\n\nContext: ${lessonContext}`
      );

      const assistantMessage: QAMessage = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: response.answer,
        timestamp: new Date(),
        confidence: response.confidence,
        sources: response.sources
      };

      setMessages(prev => [...prev, assistantMessage]);

      // Generate audio for the response if audio service is available
      if (audioService.isConfigured()) {
        try {
          setIsGeneratingAudio(assistantMessage.id);
          const audioUrl = await audioService.generateSectionAudio(
            response.answer,
            'content'
          );
          if (audioUrl) {
            setMessages(prev => prev.map(msg => 
              msg.id === assistantMessage.id 
                ? { ...msg, audioUrl }
                : msg
            ));
          }
        } catch (audioError) {
          console.error('Error generating audio for response:', audioError);
        } finally {
          setIsGeneratingAudio(null);
        }
      }

    } catch (error) {
      console.error('Error getting AI response:', error);
      toast({
        title: 'Error',
        description: 'Failed to get response. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const playMessageAudio = async (audioUrl: string) => {
    try {
      await audioService.playAudio(audioUrl);
    } catch (error) {
      console.error('Error playing message audio:', error);
      toast({
        title: 'Audio Error',
        description: 'Failed to play audio',
        variant: 'destructive',
      });
    }
  };

  const copyMessage = (content: string) => {
    navigator.clipboard.writeText(content);
    toast({
      title: 'Copied',
      description: 'Message copied to clipboard',
    });
  };

  const clearConversation = () => {
    setMessages([]);
    toast({
      title: 'Conversation Cleared',
      description: 'All messages have been removed',
    });
  };

  const provideFeedback = (messageId: string, isPositive: boolean) => {
    toast({
      title: 'Feedback Received',
      description: `Thank you for your ${isPositive ? 'positive' : 'negative'} feedback!`,
    });
  };

  if (!isOpen) {
    return (
      <div className={className}>
        <button
          onClick={() => setIsOpen(true)}
          className="cosmos-card p-4 w-full text-left hover:bg-cosmic-purple-900/20 transition-colors group"
        >
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-cosmic-purple-600 rounded-full group-hover:bg-cosmic-purple-500 transition-colors">
              <MessageCircle className="h-5 w-5 text-white" />
            </div>
            <div>
              <h3 className="font-display text-lg">Ask AI Assistant</h3>
              <p className="text-sm text-gray-400">
                Get instant answers about this lesson
              </p>
            </div>
            <Sparkles className="h-5 w-5 text-cosmic-gold-400 ml-auto" />
          </div>
        </button>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`cosmos-card p-0 overflow-hidden ${className}`}
    >
      {/* Header */}
      <div className="bg-cosmic-black/50 border-b border-cosmic-purple-700/30 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-cosmic-purple-600 rounded-full">
              <Bot className="h-5 w-5 text-white" />
            </div>
            <div>
              <h3 className="font-display text-lg">AI Assistant</h3>
              <p className="text-sm text-gray-400">
                Ask questions about "{lessonTitle}"
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {messages.length > 0 && (
              <button
                onClick={clearConversation}
                className="p-2 text-gray-400 hover:text-white transition-colors"
                title="Clear conversation"
              >
                <RefreshCw className="h-4 w-4" />
              </button>
            )}
            <button
              onClick={() => setIsOpen(false)}
              className="p-2 text-gray-400 hover:text-white transition-colors"
            >
              ×
            </button>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="h-96 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="text-center py-8">
            <Bot className="h-12 w-12 text-cosmic-purple-400 mx-auto mb-4" />
            <h4 className="font-medium text-white mb-2">Ready to help!</h4>
            <p className="text-sm text-gray-400">
              Ask me anything about this lesson. I can explain concepts, provide examples, or clarify confusing parts.
            </p>
          </div>
        ) : (
          messages.map((message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-[80%] ${message.type === 'user' ? 'order-2' : 'order-1'}`}>
                <div
                  className={`rounded-lg p-3 ${
                    message.type === 'user'
                      ? 'bg-cosmic-purple-600 text-white'
                      : 'bg-cosmic-black/50 border border-cosmic-purple-700/30 text-gray-100'
                  }`}
                >
                  <div className="flex items-start space-x-2">
                    <div className={`p-1 rounded-full ${message.type === 'user' ? 'bg-white/20' : 'bg-cosmic-purple-600'}`}>
                      {message.type === 'user' ? (
                        <User className="h-3 w-3" />
                      ) : (
                        <Bot className="h-3 w-3 text-white" />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm">{message.content}</p>
                      
                      {/* AI Response Metadata */}
                      {message.type === 'assistant' && (
                        <div className="mt-2 space-y-2">
                          {message.confidence && (
                            <div className="text-xs text-gray-400">
                              Confidence: {Math.round(message.confidence * 100)}%
                            </div>
                          )}
                          
                          {message.sources && message.sources.length > 0 && (
                            <div className="text-xs text-gray-400">
                              Sources: {message.sources.join(', ')}
                            </div>
                          )}
                          
                          {/* Action Buttons */}
                          <div className="flex items-center space-x-2 mt-2">
                            <button
                              onClick={() => copyMessage(message.content)}
                              className="p-1 text-gray-400 hover:text-white transition-colors"
                              title="Copy message"
                            >
                              <Copy className="h-3 w-3" />
                            </button>
                            
                            {message.audioUrl && (
                              <button
                                onClick={() => playMessageAudio(message.audioUrl!)}
                                className="p-1 text-gray-400 hover:text-cosmic-gold-400 transition-colors"
                                title="Play audio"
                              >
                                <Volume2 className="h-3 w-3" />
                              </button>
                            )}
                            
                            {isGeneratingAudio === message.id && (
                              <div className="p-1">
                                <Loader2 className="h-3 w-3 animate-spin text-cosmic-gold-400" />
                              </div>
                            )}
                            
                            <button
                              onClick={() => provideFeedback(message.id, true)}
                              className="p-1 text-gray-400 hover:text-green-400 transition-colors"
                              title="Helpful"
                            >
                              <ThumbsUp className="h-3 w-3" />
                            </button>
                            
                            <button
                              onClick={() => provideFeedback(message.id, false)}
                              className="p-1 text-gray-400 hover:text-red-400 transition-colors"
                              title="Not helpful"
                            >
                              <ThumbsDown className="h-3 w-3" />
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="text-xs text-gray-500 mt-1 px-2">
                  {message.timestamp.toLocaleTimeString()}
                </div>
              </div>
            </motion.div>
          ))
        )}
        
        {isLoading && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex justify-start"
          >
            <div className="bg-cosmic-black/50 border border-cosmic-purple-700/30 rounded-lg p-3 max-w-[80%]">
              <div className="flex items-center space-x-2">
                <div className="p-1 bg-cosmic-purple-600 rounded-full">
                  <Bot className="h-3 w-3 text-white" />
                </div>
                <div className="flex items-center space-x-1">
                  <Loader2 className="h-4 w-4 animate-spin text-cosmic-purple-400" />
                  <span className="text-sm text-gray-400">Thinking...</span>
                </div>
              </div>
            </div>
          </motion.div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="border-t border-cosmic-purple-700/30 p-4">
        <form onSubmit={handleSubmit} className="flex space-x-2">
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Ask a question about this lesson..."
            className="flex-1 bg-cosmic-black/50 border border-cosmic-purple-700/50 rounded-md px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-cosmic-purple-500"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading || !inputValue.trim()}
            className="bg-cosmic-purple-600 hover:bg-cosmic-purple-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-md px-4 py-2 text-white transition-colors"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </button>
        </form>
        
        {!aiService.isConfigured() && (
          <div className="mt-2 text-xs text-yellow-400">
            AI features require a Groq API key. Add VITE_GROQ_API_KEY to enable real-time responses.
          </div>
        )}
      </div>
    </motion.div>
  );
};