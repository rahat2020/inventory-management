import { useChat } from "@ai-sdk/react";
import { useRef, useEffect, useState } from "react";
import {
  MessageSquare,
  Send,
  User,
  Package,
  RefreshCw,
  Zap,
  Search,
  Edit3,
  Loader,
  MessageCircle,
  X,
  Minus,
} from "react-feather";
import "./FloatingChat.css";

const suggestedPrompts = [
  {
    icon: Search,
    text: "Show all products in inventory",
    color: "#3b82f6",
  },
  {
    icon: Package,
    text: "Check stock levels for low-stock items",
    color: "#8b5cf6",
  },
  {
    icon: Edit3,
    text: "Update stock for a specific SKU",
    color: "#10b981",
  },
  {
    icon: Zap,
    text: "Which products are out of stock?",
    color: "#f59e0b",
  },
];

const FloatingChat = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [hasUnread, setHasUnread] = useState(false);
  const [input, setInput] = useState("");

  const {
    messages,
    sendMessage,
    clearError,
    stop,
    error,
    status,
  } = useChat({
    api: "http://localhost:5000/api/chat",
  });

  const isLoading = status === "submitted" || status === "streaming";
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    } else if (messages.length > 0) {
      setHasUnread(true);
    }
  }, [messages, isOpen]);

  const handlePromptClick = (promptText) => {
    setInput(promptText);
  };

  const handleSubmit = (e) => {
    e?.preventDefault();
    if (!input.trim() || isLoading) return;
    sendMessage({ text: input });
    setInput("");
  };

  const handleKeyDown = async (e) => {
    // 1. Hitting Enter uploads prompt to server
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (input.trim() && !isLoading) {
        handleSubmit(e);
      }
    }

    // 2. Enable custom copy/paste fallback for Tauri / clipboard blocks
    if ((e.ctrlKey || e.metaKey) && e.key === "v") {
      try {
        const text = await navigator.clipboard.readText();
        const start = inputRef.current.selectionStart;
        const end = inputRef.current.selectionEnd;
        const newValue = input.slice(0, start) + text + input.slice(end);
        setInput(newValue);
        setTimeout(() => {
          inputRef.current.selectionStart = inputRef.current.selectionEnd = start + text.length;
        }, 0);
      } catch (err) {
        console.error("Failed to paste from clipboard:", err);
      }
    }

    if ((e.ctrlKey || e.metaKey) && e.key === "c") {
      const selectedText = input.slice(inputRef.current.selectionStart, inputRef.current.selectionEnd);
      if (selectedText) {
        try {
          await navigator.clipboard.writeText(selectedText);
        } catch (err) {
          console.error("Failed to copy to clipboard:", err);
        }
      }
    }
  };

  const formatContent = (content) => {
    if (!content) return "";
    return content
      .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
      .replace(/`(.*?)`/g, '<code class="chat-inline-code">$1</code>')
      .replace(/\n/g, "<br/>");
  };

  const toggleChat = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      setHasUnread(false);
    }
  };

  return (
    <div className="floating-chat-container">
      {/* Floating Action Button */}
      <button
        className={`floating-chat-badge ${isOpen ? "active" : ""} ${hasUnread ? "pulse-unread" : ""}`}
        onClick={toggleChat}
        aria-label="Toggle inventory assistant"
      >
        {isOpen ? <X size={24} /> : <MessageCircle size={24} />}
        {hasUnread && !isOpen && <span className="unread-dot" />}
      </button>

      {/* Floating Chat Panel */}
      {isOpen && (
        <div className="floating-chat-window animate-fadeIn">
          {/* Header */}
          <div className="floating-chat-header">
            <div className="header-info">
              <div className="header-avatar">
                <MessageSquare size={18} />
              </div>
              <div>
                <h3>Inventory AI</h3>
                <span className="status-text">
                  {isLoading ? "Typing..." : "Online"}
                </span>
              </div>
            </div>
            <div className="header-actions">
              <button onClick={() => setIsOpen(false)} title="Minimize">
                <Minus size={18} />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="floating-chat-messages">
            {messages.length === 0 ? (
              <div className="chat-welcome-view">
                <div className="welcome-logo">
                  <MessageCircle size={32} />
                </div>
                <h4>How can I help you today?</h4>
                <p>Search products or update stock levels using natural language.</p>
                <div className="welcome-prompts">
                  {suggestedPrompts.map((prompt, idx) => (
                    <button
                      key={idx}
                      onClick={() => handlePromptClick(prompt.text)}
                      className="prompt-pill"
                    >
                      {prompt.text}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="messages-list">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`message-bubble ${
                      message.role === "user" ? "user-bubble" : "bot-bubble"
                    }`}
                  >
                    <div className="bubble-avatar">
                      {message.role === "user" ? <User size={12} /> : <MessageSquare size={12} />}
                    </div>
                    <div className="bubble-content">
                      <div
                        className="text-content"
                        dangerouslySetInnerHTML={{
                          __html: formatContent(message.content),
                        }}
                      />

                      {/* Tool Invocations */}
                      {message.toolInvocations?.map((tool, idx) => (
                        <div key={idx} className="tool-card">
                          <div className="tool-header">
                            <Zap size={12} />
                            <span>
                              {tool.toolName === "checkInventory"
                                ? "Searching Database..."
                                : "Updating Stock..."}
                            </span>
                          </div>
                          {tool.state === "result" && (
                            <div className="tool-result">
                              {tool.toolName === "checkInventory" && tool.result?.found && (
                                <div className="result-products">
                                  {tool.result.products?.slice(0, 5).map((p, i) => (
                                    <div key={i} className="product-row">
                                      <div className="product-row-name">{p.name}</div>
                                      <div className="product-row-meta">
                                        <span>SKU: {p.sku}</span>
                                        <span className="qty-tag">Qty: {p.quantity}</span>
                                      </div>
                                    </div>
                                  ))}
                                  {tool.result.products?.length > 5 && (
                                    <div className="more-products">
                                      + {tool.result.products.length - 5} more products
                                    </div>
                                  )}
                                </div>
                              )}
                              {tool.toolName === "updateStock" && (
                                <div className="result-update">
                                  {tool.result?.success ? (
                                    <span>
                                      Updated <strong>{tool.result.product?.name}</strong> to{" "}
                                      {tool.result.product?.newQuantity}
                                    </span>
                                  ) : (
                                    <span>{tool.result?.message}</span>
                                  )}
                                </div>
                              )}
                            </div>
                          )}
                          {tool.state !== "result" && (
                            <div className="tool-loader">
                              <Loader size={12} className="spin" />
                              <span>Executing...</span>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
                {isLoading && !messages[messages.length - 1]?.content && (
                  <div className="message-bubble bot-bubble">
                    <div className="bubble-avatar">
                      <Loader size={12} className="spin" />
                    </div>
                    <div className="typing-dots">
                      <span></span>
                      <span></span>
                      <span></span>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>

          {/* Form */}
          <div className="floating-chat-footer">
            <form
              id="floating-chat-form"
              onSubmit={handleSubmit}
              className="chat-form-inline"
            >
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Message AI Assistant..."
                className="chat-input-field"
                disabled={isLoading}
              />
              <button
                type="submit"
                disabled={isLoading || !input?.trim()}
                className="chat-send-btn"
              >
                {isLoading ? <Loader size={14} className="spin" /> : <Send size={14} />}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default FloatingChat;
