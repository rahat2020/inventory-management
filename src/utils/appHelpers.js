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
