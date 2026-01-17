import React, { useState, useEffect, useRef } from 'react';
import { chatAPI } from '../services/api';
import { useNavigate } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';

/**
 * General Chat Component
 * Apple-inspired design with conversation threads
 */
export default function Chat() {
  const [conversations, setConversations] = useState([]);
  const [currentConversation, setCurrentConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState(null);
  const messagesEndRef = useRef(null);
  const navigate = useNavigate();

  // Load conversations on mount
  useEffect(() => {
    loadConversations();
  }, []);

  // Load messages when conversation changes
  useEffect(() => {
    if (currentConversation) {
      loadMessages(currentConversation.id);
    }
  }, [currentConversation]);

  // Auto-scroll to bottom
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadConversations = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await chatAPI.getConversations('general');
      if (response.data.success) {
        setConversations(response.data.data || []);
      } else {
        setError('Failed to load conversations');
      }
    } catch (error) {
      console.error('Error loading conversations:', error);
      setError(error.response?.data?.error || error.message || 'Failed to load conversations. Please try again.');
      // If unauthorized, redirect to login
      if (error.response?.status === 401) {
        navigate('/login');
      }
    } finally {
      setLoading(false);
    }
  };

  const loadMessages = async (conversationId) => {
    try {
      setError(null);
      const response = await chatAPI.getMessages(conversationId);
      if (response.data.success) {
        setMessages(response.data.data.messages || []);
      } else {
        setError('Failed to load messages');
      }
    } catch (error) {
      console.error('Error loading messages:', error);
      setError(error.response?.data?.error || error.message || 'Failed to load messages. Please try again.');
      if (error.response?.status === 401) {
        navigate('/login');
      }
    }
  };

  const createNewConversation = async () => {
    try {
      setError(null);
      const response = await chatAPI.createConversation({ chatType: 'general' });
      if (response.data.success) {
        const newConv = response.data.data;
        setConversations([newConv, ...conversations]);
        setCurrentConversation(newConv);
        setMessages([]);
      } else {
        setError('Failed to create conversation');
      }
    } catch (error) {
      console.error('Error creating conversation:', error);
      setError(error.response?.data?.error || error.message || 'Failed to create conversation. Please try again.');
      if (error.response?.status === 401) {
        navigate('/login');
      }
    }
  };

  const selectConversation = async (conversation) => {
    setCurrentConversation(conversation);
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!inputMessage.trim() || sending) return;

    const messageText = inputMessage.trim();
    setInputMessage('');
    setSending(true);

    try {
      let convId = currentConversation?.id;

      // Create conversation if needed
      if (!convId) {
        const createResp = await chatAPI.createConversation({ chatType: 'general' });
        convId = createResp.data.data.id;
        setCurrentConversation(createResp.data.data);
        await loadConversations();
      }

      // Add user message to UI immediately
      const userMessage = { role: 'user', content: messageText, created_at: new Date().toISOString() };
      setMessages(prev => [...prev, userMessage]);

      // Send to API
      const response = await chatAPI.sendMessage(convId, messageText);
      
      if (response.data.success) {
        // Add AI response
        const aiMessage = {
          role: 'assistant',
          content: response.data.data.message || response.data.data.content || 'No response received',
          created_at: new Date().toISOString(),
        };
        setMessages(prev => [...prev, aiMessage]);
        setError(null);
      } else {
        setError('Failed to send message');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage = error.response?.data?.error || error.message || 'Failed to send message. Please try again.';
      setError(errorMessage);
      // Remove user message if send failed
      setMessages(prev => prev.slice(0, -1));
      // Only redirect to login if it's truly a 401 and not a temporary issue
      if (error.response?.status === 401 && !error.response?.data?.retry) {
        setTimeout(() => {
          navigate('/login');
        }, 2000); // Delay to show error message first
      }
    } finally {
      setSending(false);
    }
  };

  const deleteConversation = async (conversationId, e) => {
    e.stopPropagation();
    if (!confirm('Delete this conversation?')) return;

    try {
      await chatAPI.deleteConversation(conversationId);
      if (currentConversation?.id === conversationId) {
        setCurrentConversation(null);
        setMessages([]);
      }
      await loadConversations();
    } catch (error) {
      console.error('Error deleting conversation:', error);
    }
  };

  return (
    <div className="flex h-[calc(100vh-4rem)] bg-white">
      {/* Conversations Sidebar */}
      <div className="w-80 border-r border-gray-200 bg-gray-50 flex flex-col">
        <div className="p-4 border-b border-gray-200 bg-white">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Conversations</h2>
            <button
              onClick={createNewConversation}
              className="px-3 py-1.5 bg-orange-600 text-white text-sm font-medium rounded-lg hover:bg-orange-700 transition-colors"
            >
              + New
            </button>
          </div>
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg">
              {error}
            </div>
          )}
        </div>

        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="p-4 text-center text-gray-500">Loading...</div>
          ) : conversations.length === 0 ? (
            <div className="p-4 text-center text-gray-500 text-sm">
              No conversations yet. Start a new chat!
            </div>
          ) : (
            <div className="p-2">
              {conversations.map((conv) => (
                <div
                  key={conv.id}
                  onClick={() => selectConversation(conv)}
                  className={`p-3 rounded-lg mb-2 cursor-pointer transition-colors ${
                    currentConversation?.id === conv.id
                      ? 'bg-orange-50 border border-orange-200'
                      : 'bg-white hover:bg-gray-100 border border-transparent'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-gray-900 truncate">
                        {conv.title || 'New Chat'}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {new Date(conv.updated_at).toLocaleDateString()}
                      </div>
                    </div>
                    <button
                      onClick={(e) => deleteConversation(conv.id, e)}
                      className="ml-2 text-gray-400 hover:text-red-600 opacity-0 group-hover:opacity-100"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Chat Window */}
      <div className="flex-1 flex flex-col bg-white">
        {currentConversation ? (
          <>
            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {messages.length === 0 ? (
                <div className="text-center text-gray-500 mt-20">
                  <p className="text-lg mb-2">Start a conversation</p>
                  <p className="text-sm">Ask me anything!</p>
                </div>
              ) : (
                messages.map((msg, idx) => (
                  <div
                    key={idx}
                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-3xl rounded-2xl px-4 py-3 ${
                        msg.role === 'user'
                          ? 'bg-orange-600 text-white'
                          : 'bg-gray-100 text-gray-900'
                      }`}
                    >
                      <div className="prose prose-sm max-w-none">
                        {msg.role === 'user' ? (
                          <p className="text-white mb-0">{msg.content}</p>
                        ) : (
                          <ReactMarkdown className="text-gray-900">{msg.content}</ReactMarkdown>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="border-t border-gray-200 p-4 bg-white">
              <form onSubmit={sendMessage} className="flex items-end space-x-3">
                <textarea
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  placeholder="Type your message..."
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none"
                  rows={1}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      sendMessage(e);
                    }
                  }}
                />
                <button
                  type="submit"
                  disabled={!inputMessage.trim() || sending}
                  className="px-6 py-3 bg-orange-600 text-white font-medium rounded-xl hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {sending ? 'Sending...' : 'Send'}
                </button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <p className="text-gray-500 text-lg mb-2">Select a conversation or start a new one</p>
              <button
                onClick={createNewConversation}
                className="px-6 py-3 bg-orange-600 text-white font-medium rounded-xl hover:bg-orange-700 transition-colors"
              >
                New Conversation
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
