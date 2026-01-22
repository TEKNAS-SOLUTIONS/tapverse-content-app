import React, { useState, useEffect, useRef } from 'react';
import { adminChatAPI, chatAPI } from '../services/api';
import ReactMarkdown from 'react-markdown';

/**
 * Admin Chat Component
 * Portfolio-wide queries with tool calling and recommendations
 */
export default function AdminChat() {
  const [conversations, setConversations] = useState([]);
  const [currentConversation, setCurrentConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState(null);
  const [insights, setInsights] = useState([]);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    loadConversations();
    loadInsights();
  }, []);

  useEffect(() => {
    if (currentConversation?.id) {
      loadMessages(currentConversation.id);
    } else {
      setMessages([]);
    }
  }, [currentConversation?.id]);

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
      const response = await chatAPI.getConversations('admin');
      if (response.data.success) {
        setConversations(response.data.data || []);
      } else {
        setError('Failed to load conversations');
      }
    } catch (error) {
      console.error('Error loading conversations:', error);
      setError(error.response?.data?.error || error.message || 'Failed to load conversations. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const loadMessages = async (conversationId) => {
    if (!conversationId) {
      setMessages([]);
      return;
    }
    
    try {
      setLoadingMessages(true);
      setError(null);
      const response = await chatAPI.getMessages(conversationId);
      if (response.data.success) {
        const loadedMessages = response.data.data.messages || [];
        setMessages(loadedMessages);
      } else {
        setError('Failed to load messages');
        setMessages([]);
      }
    } catch (error) {
      console.error('Error loading messages:', error);
      setError(error.response?.data?.error || error.message || 'Failed to load messages. Please try again.');
      setMessages([]);
    } finally {
      setLoadingMessages(false);
    }
  };

  const loadInsights = async () => {
    try {
      const response = await adminChatAPI.getInsights({ acknowledged: false });
      setInsights(response.data.data || []);
    } catch (error) {
      console.error('Error loading insights:', error);
    }
  };

  const createNewConversation = async () => {
    try {
      const response = await chatAPI.createConversation({ chatType: 'admin' });
      const newConv = response.data.data;
      setConversations([newConv, ...conversations]);
      setCurrentConversation(newConv);
      setMessages([]);
    } catch (error) {
      console.error('Error creating conversation:', error);
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

      if (!convId) {
        const createResp = await chatAPI.createConversation({ chatType: 'admin' });
        convId = createResp.data.data.id;
        setCurrentConversation(createResp.data.data);
        await loadConversations();
      }

      const userMessage = {
        role: 'user',
        content: messageText,
        created_at: new Date().toISOString(),
      };
      setMessages(prev => [...prev, userMessage]);

      const response = await adminChatAPI.sendMessage(convId, messageText);
      
      if (response.data.success) {
        const aiMessage = {
          role: 'assistant',
          content: response.data.data.message || response.data.data.content || 'No response received',
          created_at: new Date().toISOString(),
          toolUsed: response.data.data.toolUsed,
        };
        setMessages(prev => [...prev, aiMessage]);
        setError(null);
      } else {
        setError('Failed to send message');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      setError(error.response?.data?.error || error.message || 'Failed to send message. Please try again.');
      // Remove user message if send failed
      setMessages(prev => prev.slice(0, -1));
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

  const generateRecommendations = async () => {
    try {
      await adminChatAPI.generateRecommendations();
      await loadInsights();
      alert('Recommendations generated successfully!');
    } catch (error) {
      console.error('Error generating recommendations:', error);
      alert('Error generating recommendations.');
    }
  };

  return (
    <div className="flex h-[calc(100vh-8rem)] bg-white rounded-xl border border-gray-200">
      {/* Sidebar with Conversations and Insights */}
      <div className="w-80 border-r border-gray-200 bg-gray-50 flex flex-col">
        {/* Insights Section */}
        <div className="p-4 border-b border-gray-200 bg-white">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-gray-900">Insights</h3>
            <button
              onClick={generateRecommendations}
              className="px-2 py-1 bg-orange-600 text-white text-xs font-medium rounded-lg hover:bg-orange-700 transition-colors"
              title="Generate automated recommendations"
            >
              🔄
            </button>
          </div>
          <div className="max-h-32 overflow-y-auto space-y-1">
            {insights.length === 0 ? (
              <p className="text-xs text-gray-500">No insights yet</p>
            ) : (
              insights.slice(0, 3).map((insight) => (
                <div
                  key={insight.id}
                  className={`p-2 rounded text-xs ${
                    insight.priority === 'high' || insight.priority === 'urgent'
                      ? 'bg-red-50 border border-red-200'
                      : 'bg-blue-50 border border-blue-200'
                  }`}
                >
                  <div className="font-medium text-gray-900">{insight.title}</div>
                  <div className="text-gray-600 mt-1">{insight.description}</div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Conversations Section */}
        <div className="p-4 border-b border-gray-200 bg-white">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-gray-900">Conversations</h3>
            <button
              onClick={createNewConversation}
              className="px-2 py-1 bg-orange-600 text-white text-xs font-medium rounded-lg hover:bg-orange-700 transition-colors"
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
            <div className="p-4 text-center text-gray-500 text-sm">Loading...</div>
          ) : conversations.length === 0 ? (
            <div className="p-4 text-center text-gray-500 text-xs">
              No conversations yet.
            </div>
          ) : (
            <div className="p-2">
              {conversations.map((conv) => (
                <div
                  key={conv.id}
                  onClick={() => selectConversation(conv)}
                  className={`p-2 rounded-lg mb-1 cursor-pointer transition-colors ${
                    currentConversation?.id === conv.id
                      ? 'bg-orange-50 border border-orange-200'
                      : 'bg-white hover:bg-gray-100'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-medium text-gray-900 truncate">
                        {conv.title || 'Admin Chat'}
                      </div>
                      <div className="text-xs text-gray-500 mt-0.5">
                        {new Date(conv.updated_at).toLocaleDateString()}
                      </div>
                    </div>
                    <button
                      onClick={(e) => deleteConversation(conv.id, e)}
                      className="ml-1 text-gray-400 hover:text-red-600 opacity-0 group-hover:opacity-100"
                    >
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {loadingMessages ? (
                <div className="text-center text-gray-500 mt-10">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto mb-2"></div>
                  <p className="text-sm">Loading messages...</p>
                </div>
              ) : messages.length === 0 ? (
                <div className="text-center text-gray-500 mt-10">
                  <p className="mb-2">Ask me about any client or portfolio metrics</p>
                  <div className="text-xs text-gray-400 mt-4 space-y-1">
                    <p>Try: "What's the status of Client ABC?"</p>
                    <p>"Show me keywords for Client XYZ"</p>
                    <p>"Give me portfolio recommendations"</p>
                  </div>
                </div>
              ) : (
                messages.map((msg, idx) => (
                  <div
                    key={idx}
                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-3xl rounded-xl px-4 py-3 ${
                        msg.role === 'user'
                          ? 'bg-orange-600 text-white'
                          : 'bg-gray-100 text-gray-900'
                      }`}
                    >
                      {msg.role === 'user' ? (
                        <p className="text-white mb-0">{msg.content}</p>
                      ) : (
                        <>
                          {msg.toolUsed && (
                            <div className="text-xs text-gray-500 mb-2">
                              🔧 Used: {msg.toolUsed}
                            </div>
                          )}
                          <ReactMarkdown className="text-gray-900 prose prose-sm max-w-none">
                            {msg.content}
                          </ReactMarkdown>
                        </>
                      )}
                    </div>
                  </div>
                ))
              )}
              <div ref={messagesEndRef} />
            </div>

            <div className="border-t border-gray-200 p-4 bg-white">
              <form onSubmit={sendMessage} className="flex items-end space-x-3">
                <textarea
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  placeholder="Ask about clients, keywords, portfolio metrics..."
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
              <p className="text-gray-500 mb-3">Select or start a conversation</p>
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
