import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { chatbotService } from '../services';
import { useAuth } from '../context/AuthContext';

const STORAGE_KEY = 'raddazle-chat-session';

const ChatWidget = () => {
  const { isAuthenticated } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [sessionId, setSessionId] = useState(() => {
    if (typeof window === 'undefined') return null;
    return window.localStorage.getItem(STORAGE_KEY);
  });
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [bootstrapping, setBootstrapping] = useState(false);
  const [error, setError] = useState('');

  const lastMessages = useMemo(() => messages.slice(-40), [messages]);

  const persistSessionId = (id) => {
    setSessionId(id);
    if (typeof window !== 'undefined') {
      if (id) {
        window.localStorage.setItem(STORAGE_KEY, id);
      } else {
        window.localStorage.removeItem(STORAGE_KEY);
      }
    }
  };

  useEffect(() => {
    const loadExistingSession = async () => {
      if (!isAuthenticated || !sessionId) {
        setMessages([]);
        return;
      }
      setBootstrapping(true);
      setError('');
      try {
        const response = await chatbotService.getSession(sessionId);
        setMessages(response.session?.messages || []);
      } catch (err) {
        persistSessionId(null);
        const status = err.response?.status;
        if (status === 401) {
          setError('Session expired. Please log in again.');
        } else {
          setError(err.response?.data?.message || 'Unable to load previous conversation.');
        }
      } finally {
        setBootstrapping(false);
      }
    };

    if (isOpen && sessionId) {
      loadExistingSession();
    }

    if (!isAuthenticated) {
      persistSessionId(null);
      setMessages([]);
    }
  }, [isOpen, isAuthenticated, sessionId]);

  const upsertSessionFromResponse = (response) => {
    const session = response.session;
    persistSessionId(session?._id || null);
    setMessages(session?.messages || []);
  };

  const handleSend = async (event) => {
    event.preventDefault();
    const text = input.trim();
    if (!text) return;
    if (!isAuthenticated) {
      setError('Please log in to chat with support.');
      return;
    }

    setError('');
    setInput('');
    setLoading(true);

    try {
      const response = sessionId
        ? await chatbotService.sendMessage(sessionId, text)
        : await chatbotService.startSession({ message: text });
      upsertSessionFromResponse(response);
    } catch (err) {
      if (err.response?.status === 401) {
        persistSessionId(null);
        setError('Please log in to chat with support.');
      } else {
        setError(err.response?.data?.message || 'Something went wrong. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResolve = async () => {
    if (!sessionId) return;
    try {
      await chatbotService.resolveSession(sessionId);
      persistSessionId(null);
      setMessages([]);
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to close chat right now.');
    }
  };

  const renderMessage = (message, index) => {
    const isUser = message.role === 'user';
    return (
      <div
        key={`${message.createdAt || index}-${index}`}
        className={`chat-bubble ${isUser ? 'chat-bubble-user' : 'chat-bubble-assistant'}`}
      >
        <p className="mb-1">{message.content}</p>
        <small className="text-muted">
          {isUser ? 'You' : 'Raddazle Care'} · {new Date(message.createdAt || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </small>
      </div>
    );
  };

  return (
    <div className="chat-widget">
      {isOpen && (
        <div className="chat-panel shadow-lg">
          <div className="chat-header">
            <div>
              <p className="mb-0 fw-semibold">Need help?</p>
              <small className="text-muted">Chat with Raddazle Care</small>
            </div>
            <div className="d-flex gap-2">
              {sessionId && (
                <button type="button" className="btn btn-sm btn-outline-secondary" onClick={handleResolve} disabled={loading}>
                  Close
                </button>
              )}
              <button type="button" className="btn-close" aria-label="Close" onClick={() => setIsOpen(false)} />
            </div>
          </div>

          <div className="chat-body">
            {bootstrapping && (
              <p className="text-muted small mb-2">Loading conversation…</p>
            )}
            {!bootstrapping && lastMessages.map(renderMessage)}
            {loading && (
              <div className="chat-bubble chat-bubble-assistant">
                <p className="mb-1">Hang tight—I'm thinking of the best answer…</p>
                <small className="text-muted">Raddazle Care</small>
              </div>
            )}
            {error && <div className="alert alert-warning small mb-0 mt-2">{error}</div>}
          </div>

          <div className="chat-footer">
            {!isAuthenticated ? (
              <div className="text-center">
                <p className="mb-2">Please <Link to="/login">log in</Link> to chat with support.</p>
              </div>
            ) : (
              <form onSubmit={handleSend}>
                <div className="input-group">
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Describe your issue"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    disabled={loading}
                    autoComplete="off"
                  />
                  <button className="btn btn-primary" type="submit" disabled={loading}>
                    Send
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      <button type="button" className="chat-toggle btn btn-primary" onClick={() => setIsOpen((open) => !open)}>
        {isOpen ? 'Hide support' : 'Need help?'}
      </button>
    </div>
  );
};

export default ChatWidget;
