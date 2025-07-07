import { size } from "lodash";

export const formatShortTime = (date) => {
  // if it's already a Date do nothing, otherwise parse the ISO string
  const dt = date instanceof Date ? date : new Date(date);

  return dt.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
};

export const truncateText = (text, maxLength, ellipsis = "...") => {
  if (typeof text !== "string" || typeof maxLength !== "number") {
    console.error(
      "Invalid arguments for truncateText: text must be a string and maxLength must be a number."
    );
    return text;
  }

  if (text.length <= maxLength) return text;

  const charsToShow = maxLength - ellipsis.length;
  return text.substring(0, charsToShow) + ellipsis;
};

export const checkEmailForValid = (value) => {
  const regex = /^[\w%\+\-]+(\.[\w%\+\-]+)*@[\w%\+\-]+(\.[\w%\+\-]+)+$/;
  return regex.test(value);
};

export const getUniqueID = (data = []) => {
  if (size(data) > 0) {
    return Math.max(...data.map((row) => row.id)) + 1;
  }
};

export const getStatusBadgeClasses = (status) => {
  const baseClasses =
    "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium";
  switch (status) {
    case "in-stock":
      return `${baseClasses} bg-green-100 text-green-800`;
    case "low-stock":
      return `${baseClasses} bg-yellow-100 text-yellow-800`;
    case "out-of-stock":
      return `${baseClasses} bg-red-100 text-red-800`;
    default:
      return `${baseClasses} bg-gray-100 text-gray-800`;
  }
};

export const getRoundedClasses = (roundedValue) => {
  const classesLists = {
    sm: "rounded-sm",
    md: "rounded-md",
    lg: "rounded-lg",
    xl: "rounded-xl",
    "2xl": "rounded-2xl",
    "t-sm": "rounded-t-sm",
    "t-md": "rounded-t-md",
    "t-lg": "rounded-t-lg",
    "t-xl": "rounded-t-xl",
    "t-2xl": "rounded-t-2xl",
    "tl-sm": "rounded-tl-sm",
    "tl-md": "rounded-tl-md",
    "tl-lg": "rounded-tl-lg",
    "tl-xl": "rounded-tl-xl",
    "tl-2xl": "rounded-tl-2xl",
    "tr-sm": "rounded-tr-sm",
    "tr-md": "rounded-tr-md",
    "tr-lg": "rounded-tr-lg",
    "tr-xl": "rounded-tr-xl",
    "tr-2xl": "rounded-tr-2xl",
    "b-sm": "rounded-b-sm",
    "b-md": "rounded-b-md",
    "b-lg": "rounded-b-lg",
    "b-xl": "rounded-b-xl",
    "b-2xl": "rounded-b-2xl",
    "bl-sm": "rounded-bl-sm",
    "bl-md": "rounded-bl-md",
    "bl-lg": "rounded-bl-lg",
    "bl-xl": "rounded-bl-xl",
    "bl-2xl": "rounded-bl-2xl",
    "br-sm": "rounded-br-sm",
    "br-md": "rounded-br-md",
    "br-lg": "rounded-br-lg",
    "br-xl": "rounded-br-xl",
    "br-2xl": "rounded-br-2xl",
  };

  return classesLists[roundedValue] || "";
};
