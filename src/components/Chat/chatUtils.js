import { DefaultChatTransport } from "ai";

export const CHAT_API_URL =
  import.meta.env.VITE_CHAT_API_URL || "http://localhost:5000/api/chat";

export const createChatTransport = () =>
  new DefaultChatTransport({
    api: CHAT_API_URL,
  });

export const getMessageText = (message) => {
  if (typeof message?.content === "string") {
    return message.content;
  }

  if (!Array.isArray(message?.parts)) {
    return "";
  }

  return message.parts
    .filter((part) => part.type === "text")
    .map((part) => part.text || "")
    .join("");
};

export const getToolParts = (message) => {
  if (Array.isArray(message?.toolInvocations)) {
    return message.toolInvocations.map((tool) => ({
      toolName: tool.toolName,
      state: tool.state,
      result: tool.result,
      errorText: tool.errorText,
    }));
  }

  if (!Array.isArray(message?.parts)) {
    return [];
  }

  return message.parts
    .filter(
      (part) => part.type?.startsWith("tool-") || part.type === "dynamic-tool"
    )
    .map((part) => ({
      toolName:
        part.toolName ||
        (part.type?.startsWith("tool-") ? part.type.replace("tool-", "") : ""),
      state: part.state,
      result: part.output,
      errorText: part.errorText,
    }));
};

export const hasStreamingText = (message) => Boolean(getMessageText(message));

export const getErrorMessage = (error) => {
  if (!error) {
    return "The request failed. Please try again.";
  }

  if (typeof error === "string") {
    return error;
  }

  return (
    error.message ||
    error.errorText ||
    error.error ||
    "The request failed. Please try again."
  );
};

export const createMessageId = () => {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }

  return `chat-${Date.now()}-${Math.random().toString(36).slice(2)}`;
};
