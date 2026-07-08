import { size } from "lodash";

export const formatShortTime = (date) => {
  // if it's already a Date do nothing, otherwise parse the ISO string
  const dt = date instanceof Date ? date : new Date(date);

  return dt.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
};

export const getFocusColor = (showFocus, focused) => {
  if (!showFocus) return "";
  return focused ? "ring-2 ring-blue-500" : "";
};

export const formatRelativeTime = (date) => {
  const dt = date instanceof Date ? date : new Date(date);
  const diffSeconds = Math.round((Date.now() - dt.getTime()) / 1000);

  if (diffSeconds < 60) return "just now";
  const diffMinutes = Math.round(diffSeconds / 60);
  if (diffMinutes < 60)
    return `${diffMinutes} min${diffMinutes === 1 ? "" : "s"} ago`;
  const diffHours = Math.round(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours} hour${diffHours === 1 ? "" : "s"} ago`;
  const diffDays = Math.round(diffHours / 24);
  if (diffDays < 30) return `${diffDays} day${diffDays === 1 ? "" : "s"} ago`;
  return dt.toLocaleDateString();
};

export const formatCurrency = (value) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(Number(value) || 0);

export const formatCompactNumber = (value) =>
  new Intl.NumberFormat("en-US", { notation: "compact" }).format(
    Number(value) || 0,
  );

export const getOptions = (label) => {
  const optionsMap = {
    COMPANY: ["CROWN WOOL WEAR LTD.", "ELITE TEXTILES", "Manha Accessories"],
    "COMPANY NAME": [
      "CROWN WOOL WEAR LTD.",
      "ELITE TEXTILES",
      "Manha Accessories",
    ],
    COUNTRY: ["BANGLADESH", "CHINA", "INDIA", "VIETNAM"],
    CITY: ["DHAKA", "GAZIPUR", "SUZHOU", "CHITTAGONG"],
    INDUSTRY: ["TEXTILE", "APPAREL", "MANUFACTURING", "PRINTING"],
    SUPPLIER: ["MANUFACTURER", "SUPPLIER", "WASHING & DYEING", "PRINTING"],
    "PRODUCT TYPE": ["APPAREL", "TEXTILE", "ACCESSORIES", "PACKAGING"],
    ASSIGN: ["ASSIGNED", "UNASSIGNED", "PENDING"],
    LISTED: ["LISTED", "UNLISTED", "PENDING"],
  };

  return optionsMap[label] || [];
};

export const handleMoveHeighlight = (
  direction,
  setHighlightedIndex,
  filteredOptions,
) => {
  if (!filteredOptions.length) return;
  setHighlightedIndex((prev) => {
    const nextIndex =
      direction === "down"
        ? (prev + 1) % filteredOptions.length
        : (prev - 1 + filteredOptions.length) % filteredOptions.length;
    return nextIndex;
  });
};

export function getSearchData(items, searchText, searchFields = []) {
  if (!size(items)) return [];
  if (!searchText) return items;

  return items?.filter((item) =>
    searchFields.some((path) => {
      const value = path.split(".").reduce((obj, key) => obj?.[key], item);
      return (value?.toString().toLowerCase() || "").includes(
        searchText.toLowerCase(),
      );
    }),
  );
}

export const truncateText = (text, maxLength, ellipsis = "...") => {
  if (typeof text !== "string" || typeof maxLength !== "number") {
    console.error(
      "Invalid arguments for truncateText: text must be a string and maxLength must be a number.",
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
