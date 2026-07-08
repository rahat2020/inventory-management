import { useRef, useEffect, useState, useCallback } from "react";
import { createPortal } from "react-dom";

export default function AppHoverTooltip({
  children,
  content,
  delay = 200,
  className = "text-white bg-gray-700",
  placement = "cursor",
}) {
  const [isVisible, setIsVisible] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0, transform: "none" });
  const [mounted, setMounted] = useState(false);
  const timeoutRef = useRef();
  const triggerRef = useRef();

  // mark as mounted for SSR safety
  useEffect(() => {
    setMounted(true);
  }, []);

  const updatePosition = useCallback(
    (event) => {
      if (placement === "cursor") {
        const padding = 10;
        const offsetY = 20;
        let x = event ? event.clientX : 0;
        let y = event ? event.clientY - offsetY : 0;

        const tooltipWidth = 200; // rough estimate

        // clamp within viewport
        if (x + tooltipWidth > window.innerWidth) {
          x = window.innerWidth - tooltipWidth - padding;
        }
        if (x < padding) {
          x = padding;
        }
        if (y < padding) {
          y = (event ? event.clientY : 0) + offsetY;
        }

        setPosition({ x, y, transform: "none" });
      } else {
        const el = triggerRef.current;
        if (!el) return;

        const rect = el.getBoundingClientRect();
        let x = 0;
        let y = 0;
        let transform = "none";
        const gap = 8; // distance from element

        switch (placement) {
          case "top":
            x = rect.left + rect.width / 2;
            y = rect.top - gap;
            transform = "translate(-50%, -100%)";
            break;
          case "bottom":
            x = rect.left + rect.width / 2;
            y = rect.bottom + gap;
            transform = "translate(-50%, 0)";
            break;
          case "left":
            x = rect.left - gap;
            y = rect.top + rect.height / 2;
            transform = "translate(-100%, -50%)";
            break;
          case "right":
            x = rect.right + gap;
            y = rect.top + rect.height / 2;
            transform = "translate(0, -50%)";
            break;
          case "center":
            x = rect.left + rect.width / 2;
            y = rect.top + rect.height / 2;
            transform = "translate(-50%, -50%)";
            break;
          default:
            x = rect.left;
            y = rect.bottom + gap;
            transform = "translate(0, 0)";
            break;
        }

        setPosition({ x, y, transform });
      }
    },
    [placement],
  );

  const handleMouseEnter = useCallback(
    (event) => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      updatePosition(event);
      timeoutRef.current = setTimeout(() => setIsVisible(true), delay);
    },
    [delay, updatePosition],
  );

  const handleMouseMove = useCallback(
    (event) => {
      if (isVisible && placement === "cursor") updatePosition(event);
    },
    [isVisible, updatePosition, placement],
  );

  const handleMouseLeave = useCallback(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setIsVisible(false);
  }, []);

  // attach listeners
  useEffect(() => {
    const el = triggerRef.current;
    if (!el) return;
    el.addEventListener("mouseenter", handleMouseEnter);
    el.addEventListener("mousemove", handleMouseMove);
    el.addEventListener("mouseleave", handleMouseLeave);
    return () => {
      el.removeEventListener("mouseenter", handleMouseEnter);
      el.removeEventListener("mousemove", handleMouseMove);
      el.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, [handleMouseEnter, handleMouseMove, handleMouseLeave]);

  // cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  // the tooltip element
  const tooltipElement =
    mounted && isVisible && content ? (
      <div
        className={`fixed z-9999 px-3 py-2 text-xs rounded-md shadow-lg pointer-events-none transition-opacity duration-200 whitespace-normal max-w-xs ${className}`}
        style={{
          left: `${position.x}px`,
          top: `${position.y}px`,
          transform:
            position.transform !== "none" ? position.transform : undefined,
          opacity: isVisible ? 1 : 0,
        }}
      >
        {content}
      </div>
    ) : null;

  return (
    <>
      <div ref={triggerRef} className="">
        {children}
      </div>
      {mounted && tooltipElement && createPortal(tooltipElement, document.body)}
    </>
  );
}
