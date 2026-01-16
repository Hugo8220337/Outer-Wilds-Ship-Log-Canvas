import { useState, useEffect, useCallback } from "react";

/**
 * Personalized Hook to make a panel vertically resizable.
 * @param initialHeight     Initial height of the panel
 * @param minHeight         Minimum allowed height
 * @returns Objects and functions to manage resizing
 */
export function useResizable(initialHeight: number = 350, minHeight: number = 200) {
  const [height, setHeight] = useState(initialHeight);
  const [isDragging, setIsDragging] = useState(false);

  // Starts the dragging
  const startResizing = useCallback(() => {
    setIsDragging(true);
  }, []);

  // Stops the dragging
  const stopResizing = useCallback(() => {
    setIsDragging(false);
  }, []);

  // Movement Logic
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;

      // Calculate new height: Window Height - Mouse Y Position
      const newHeight = window.innerHeight - e.clientY;
      const maxHeight = window.innerHeight * 0.9; // Maximum 90% of the screen

      // Apply constraints and update height
      if (newHeight >= minHeight && newHeight <= maxHeight) {
        setHeight(newHeight);
      }
    };

    if (isDragging) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", stopResizing);
      // Prevent text selection while dragging
      document.body.style.userSelect = "none";
      document.body.style.cursor = "row-resize";
    } else {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", stopResizing);
      document.body.style.userSelect = "";
      document.body.style.cursor = "";
    }

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", stopResizing);
      document.body.style.userSelect = "";
      document.body.style.cursor = "";
    };
  }, [isDragging, minHeight, stopResizing]);

  return { height, startResizing, isDragging };
}