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
} from "react-feather";
import "./ChatPage.css";

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

const ChatPage = () => {
  const [input, setInput] = useState("");
  const {
    messages,
    sendMessage,
    regenerate,
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
  const [isTyping, setIsTyping] = useState(false);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Track typing animation
  useEffect(() => {
    setIsTyping(isLoading);
  }, [isLoading]);

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

    // 2. Enable copy/paste fallback for custom platforms / Tauri
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
        console.error("Clipboard paste error:", err);
      }
    }

    if ((e.ctrlKey || e.metaKey) && e.key === "c") {
      const selectedText = input.slice(inputRef.current.selectionStart, inputRef.current.selectionEnd);
      if (selectedText) {
        try {
          await navigator.clipboard.writeText(selectedText);
        } catch (err) {
          console.error("Clipboard copy error:", err);
        }
      }
    }
  };

  const formatContent = (content) => {
    if (!content) return "";

    // Convert markdown-like patterns to styled HTML
    let formatted = content
      // Bold
      .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
      // Inline code
      .replace(/`(.*?)`/g, '<code class="chat-inline-code">$1</code>')
      // Line breaks
      .replace(/\n/g, "<br/>");

    return formatted;
  };

  return (
    <div className="chat-page">
      {/* Header */}
      <div className="chat-header">
        <div className="chat-header-left">
          <div className="chat-header-icon">
            <Send size={22} />
          </div>
          <div>
            <h1 className="chat-header-title">Inventory AI Assistant</h1>
            <p className="chat-header-subtitle">
              Powered by Google Gemini • Real-time database access
            </p>
          </div>
        </div>
        <div className="chat-header-right">
          <div
            className={`chat-status ${isLoading ? "chat-status-busy" : "chat-status-online"}`}
          >
            <span className="chat-status-dot" />
            {isLoading ? "Processing..." : "Online"}
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div className="chat-messages-container">
        {messages.length === 0 ? (
          <div className="chat-welcome">
            <div className="chat-welcome-icon-wrapper">
              <div className="chat-welcome-icon">
                <MessageSquare size={36} />
              </div>
            </div>
            <h2 className="chat-welcome-title">Welcome to InventoryPro AI</h2>
            <p className="chat-welcome-description">
              I can help you search products, check stock levels, and update
              inventory in real-time. Try one of the suggestions below or type
              your own query.
            </p>
            <div className="chat-suggestions-grid">
              {suggestedPrompts.map((prompt, idx) => (
                <button
                  key={idx}
                  className="chat-suggestion-card"
                  onClick={() => handlePromptClick(prompt.text)}
                >
                  <div
                    className="chat-suggestion-icon"
                    style={{
                      backgroundColor: `${prompt.color}15`,
                      color: prompt.color,
                    }}
                  >
                    <prompt.icon size={18} />
                  </div>
                  <span className="chat-suggestion-text">{prompt.text}</span>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="chat-messages">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`chat-message ${
                  message.role === "user"
                    ? "chat-message-user"
                    : "chat-message-assistant"
                }`}
              >
                <div className="chat-message-avatar">
                  {message.role === "user" ? (
                    <div className="chat-avatar chat-avatar-user">
                      <User size={16} />
                    </div>
                  ) : (
                    <div className="chat-avatar chat-avatar-bot">
                      <Send size={16} />
                    </div>
                  )}
                </div>
                <div className="chat-message-content">
                  <div className="chat-message-role">
                    {message.role === "user" ? "You" : "AI Assistant"}
                  </div>
                  <div
                    className="chat-message-text"
                    dangerouslySetInnerHTML={{
                      __html: formatContent(message.content),
                    }}
                  />

                  {/* Show tool invocations */}
                  {message.toolInvocations?.map((tool, idx) => (
                    <div key={idx} className="chat-tool-card">
                      <div className="chat-tool-header">
                        <Zap size={14} />
                        <span>
                          {tool.toolName === "checkInventory"
                            ? "Searching Inventory..."
                            : "Updating Stock..."}
                        </span>
                      </div>
                      {tool.state === "result" && (
                        <div className="chat-tool-result">
                          {tool.toolName === "checkInventory" &&
                            tool.result?.found && (
                              <div className="chat-inventory-results">
                                <div className="chat-result-badge">
                                  {tool.result.count} product(s) found
                                </div>
                                <div className="chat-products-list">
                                  {tool.result.products?.map((p, i) => (
                                    <div key={i} className="chat-product-item">
                                      <div className="chat-product-name">
                                        {p.name}
                                      </div>
                                      <div className="chat-product-details">
                                        <span className="chat-product-sku">
                                          SKU: {p.sku}
                                        </span>
                                        <span
                                          className={`chat-product-status chat-status-${p.status}`}
                                        >
                                          {p.status}
                                        </span>
                                        <span className="chat-product-qty">
                                          Qty: {p.quantity} {p.unit}
                                        </span>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          {tool.toolName === "updateStock" && (
                            <div
                              className={`chat-update-result ${
                                tool.result?.success
                                  ? "chat-update-success"
                                  : "chat-update-fail"
                              }`}
                            >
                              {tool.result?.success ? "✅" : "❌"}{" "}
                              {tool.result?.message}
                              {tool.result?.product && (
                                <div className="chat-updated-product">
                                  <strong>{tool.result.product.name}</strong> —
                                  New Qty: {tool.result.product.newQuantity} |
                                  Status: {tool.result.product.status}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      )}
                      {tool.state !== "result" && (
                        <div className="chat-tool-loading">
                          <Loader size={14} className="chat-spin" />
                          <span>Executing...</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}

            {/* Typing indicator */}
            {isTyping && !messages[messages.length - 1]?.content && (
              <div className="chat-message chat-message-assistant">
                <div className="chat-message-avatar">
                  <div className="chat-avatar chat-avatar-bot">
                    <Send size={16} />
                  </div>
                </div>
                <div className="chat-typing-indicator">
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

      {/* Input Area */}
      <div className="chat-input-area">
        <form
          id="chat-form"
          onSubmit={handleSubmit}
          className="chat-input-form"
        >
          <div className="chat-input-wrapper">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask about inventory, stock levels, or products..."
              className="chat-input"
              disabled={isLoading}
              autoFocus
            />
            <div className="chat-input-actions">
              {messages.length > 0 && (
                <button
                  type="button"
                  onClick={() => regenerate()}
                  className="chat-btn-secondary"
                  title="Regenerate last response"
                  disabled={isLoading}
                >
                  <RefreshCw size={16} />
                </button>
              )}
              <button
                type="submit"
                className="chat-btn-send"
                disabled={isLoading || !input?.trim()}
              >
                {isLoading ? (
                  <Loader size={18} className="chat-spin" />
                ) : (
                  <Send size={18} />
                )}
              </button>
            </div>
          </div>
          <p className="chat-input-hint">
            AI can search and update your live inventory database in real-time
          </p>
        </form>
      </div>
    </div>
  );
};

export default ChatPage;
