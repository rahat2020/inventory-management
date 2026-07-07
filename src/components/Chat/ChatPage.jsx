import { useChat } from "@ai-sdk/react";
import { useRef, useEffect, useMemo, useCallback, useState } from "react";
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
  AlertTriangle,
} from "react-feather";
import "./ChatPage.css";
import {
  createChatTransport,
  getErrorMessage,
  getMessageText,
  getToolParts,
  hasStreamingText,
} from "./chatUtils";

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
  {
    icon: User,
    text: "Show me all pending orders",
    color: "#ec4899",
  },
  {
    icon: Package,
    text: "What are the incoming stock movements?",
    color: "#14b8a6",
  },
  {
    icon: Search,
    text: "Show all active customers and suppliers",
    color: "#f97316",
  },
  {
    icon: RefreshCw,
    text: "Generate a comprehensive inventory report",
    color: "#8b5cf6",
  },
  {
    icon: Package,
    text: "Seed 20 demo products and categories",
    color: "#ef4444",
  },
];

const ChatPage = () => {
  const [input, setInput] = useState("");
  const chatTransport = useMemo(() => createChatTransport(), []);
  const {
    messages,
    setMessages,
    sendMessage,
    regenerate,
    clearError,
    stop,
    error,
    status,
  } = useChat({
    transport: chatTransport,
  });

  const isLoading = status === "submitted" || status === "streaming";
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const [isTyping, setIsTyping] = useState(false);
  const [chatError, setChatError] = useState("");
  const failedPromptRef = useRef("");
  const failedMessageCountRef = useRef(0);

  const clearChatError = useCallback(() => {
    setChatError("");
    clearError();
  }, [clearError]);

  const cancelFailedPrompt = useCallback(
    (requestError) => {
      const message = getErrorMessage(requestError);
      const failedPrompt = failedPromptRef.current;
      const failedMessageCount = failedMessageCountRef.current;

      setChatError(message);
      setIsTyping(false);

      if (failedPrompt) {
        setInput((currentInput) => currentInput || failedPrompt);
      }

      setMessages((currentMessages) =>
        currentMessages.slice(0, failedMessageCount)
      );

      failedPromptRef.current = "";
      failedMessageCountRef.current = 0;
    },
    [setMessages]
  );

  useEffect(() => {
    if (error) {
      cancelFailedPrompt(error);
    }
  }, [error, cancelFailedPrompt]);

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

    const prompt = input.trim();
    if (!prompt || isLoading) return;

    failedPromptRef.current = prompt;
    failedMessageCountRef.current = messages.length;
    clearChatError();
    setInput("");

    sendMessage({ text: prompt }).catch(cancelFailedPrompt);
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

  const isToolComplete = (tool) =>
    tool.state === "result" || tool.state === "output-available";

  const getToolLabel = (tool) => {
    const complete = isToolComplete(tool);

    if (tool.toolName === "checkInventory") {
      return complete ? "Inventory Search Complete" : "Searching Inventory...";
    }

    if (tool.toolName === "updateStock") {
      return complete ? "Stock Update Complete" : "Updating Stock...";
    }

    if (tool.toolName === "seedDemoInventory") {
      return complete ? "Demo Data Seeded" : "Seeding Demo Data...";
    }

    if (tool.toolName === "checkOrders") {
      return complete ? "Orders Retrieved" : "Fetching Orders...";
    }

    if (tool.toolName === "checkStockLevels") {
      return complete ? "Stock Levels Retrieved" : "Checking Stock Levels...";
    }

    if (tool.toolName === "checkIncoming") {
      return complete ? "Incoming Stock Retrieved" : "Checking Incoming Stock...";
    }

    if (tool.toolName === "checkOutgoing") {
      return complete ? "Outgoing Stock Retrieved" : "Checking Outgoing Stock...";
    }

    if (tool.toolName === "checkSuppliers") {
      return complete ? "Supplier Data Retrieved" : "Fetching Supplier Data...";
    }

    if (tool.toolName === "checkCustomers") {
      return complete ? "Customer Data Retrieved" : "Fetching Customer Data...";
    }

    if (tool.toolName === "generateReport") {
      return complete ? "Report Generated" : "Generating Report...";
    }

    return complete ? "Tool Complete" : "Executing Tool...";
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
              Powered by Google Gemini - Real-time database access
            </p>
          </div>
        </div>
        <div className="chat-header-right">
          <div
            className={`chat-status ${chatError ? "chat-status-busy" : isLoading ? "chat-status-busy" : "chat-status-online"}`}
          >
            <span className="chat-status-dot" />
            {chatError ? "Error" : isLoading ? "Processing..." : "Online"}
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div className="chat-messages-container">
        {messages.length === 0 && !chatError ? (
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
                      __html: formatContent(getMessageText(message)),
                    }}
                  />

                  {/* Show tool invocations */}
                  {getToolParts(message).map((tool, idx) => (
                    <div key={idx} className="chat-tool-card">
                      <div className="chat-tool-header">
                        <Zap size={14} />
                        <span>
                          {getToolLabel(tool)}
                        </span>
                      </div>
                      {isToolComplete(tool) ? (
                        <div className="chat-tool-result">
                          {tool.toolName === "checkInventory" && (
                            tool.result?.found ? (
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
                            ) : (
                              <div className="chat-update-result chat-update-fail">
                                {tool.result?.message || tool.result?.error || "No products found."}
                                {tool.result?.suggestions && (
                                  <div className="chat-updated-product">
                                    {tool.result.suggestions}
                                  </div>
                                )}
                              </div>
                            )
                          )}
                          {tool.toolName === "updateStock" && (
                            <div
                              className={`chat-update-result ${
                                tool.result?.success
                                  ? "chat-update-success"
                                  : "chat-update-fail"
                              }`}
                            >
                              {tool.result?.success ? "Success:" : "Failed:"}{" "}
                              {tool.result?.message || tool.result?.error || "Stock update failed."}
                              {tool.result?.product && (
                                <div className="chat-updated-product">
                                  <strong>{tool.result.product.name}</strong> -
                                  New Qty: {tool.result.product.newQuantity} |
                                  Status: {tool.result.product.status}
                                </div>
                              )}
                            </div>
                          )}
                          {tool.toolName === "seedDemoInventory" && (
                            <div
                              className={`chat-update-result ${
                                tool.result?.success
                                  ? "chat-update-success"
                                  : "chat-update-fail"
                              }`}
                            >
                              {tool.result?.success ? "Success:" : "Failed:"}{" "}
                              {tool.result?.message || tool.result?.error || "Demo data seed failed."}
                              {tool.result?.success && (
                                <div className="chat-updated-product">
                                  Products: {tool.result.productsSeeded} | Created: {tool.result.productsCreated} | Updated: {tool.result.productsUpdated} | Categories: {tool.result.categoriesSeeded}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      ) : null}
                      {tool.state === "output-error" && (
                        <div className="chat-tool-result">
                          <div className="chat-update-result chat-update-fail">
                            {tool.errorText || "Tool execution failed"}
                          </div>
                        </div>
                      )}
                      {tool.state !== "result" &&
                        tool.state !== "output-available" &&
                        tool.state !== "output-error" && (
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
            {isTyping && !hasStreamingText(messages[messages.length - 1]) && (
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

            {chatError && (
              <div className="chat-message chat-message-assistant">
                <div className="chat-message-avatar">
                  <div className="chat-avatar chat-avatar-bot chat-avatar-error">
                    <AlertTriangle size={16} />
                  </div>
                </div>
                <div className="chat-message-content">
                  <div className="chat-message-role">Request failed</div>
                  <div className="chat-error-card">
                    <strong>Prompt cancelled.</strong>
                    <span>{chatError}</span>
                    <button type="button" onClick={clearChatError}>
                      Dismiss
                    </button>
                  </div>
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
              onChange={(e) => {
                if (chatError) clearChatError();
                setInput(e.target.value);
              }}
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
          <p className={`chat-input-hint ${chatError ? "chat-input-error" : ""}`}>
            {chatError ? "Prompt restored. Fix the issue or edit the prompt, then try again." : "AI can search and update your live inventory database in real-time"}
          </p>
        </form>
      </div>
    </div>
  );
};

export default ChatPage;















