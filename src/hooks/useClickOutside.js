import { useEffect } from "react";

/**
 * Custom hook to detect click outside of a ref.
 * ref - The element ref to detect outside click for.
 * callback - The function to call when an outside click is detected.
 */

export const useClickOutside = (ref, callback) => {
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (ref.current && !ref.current.contains(event.target)) {
        callback();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [ref, callback]);
};
