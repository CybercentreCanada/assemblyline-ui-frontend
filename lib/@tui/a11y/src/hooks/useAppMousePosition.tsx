import { useEffect, useState } from 'react';

/**
 * A react hook to get the current mouse position within the visible browser window
 *
 * @returns {{x: number, y: number}} Returns the x and y position of the mouse
 */
export const useAppMousePosition = () => {
  const [mousePosition, setMousePosition] = useState<{ x: number; y: number }>({ x: null, y: null });

  useEffect(() => {
    const updateMousePosition = ev => {
      setMousePosition({ x: ev.clientX, y: ev.clientY });
    };

    window.addEventListener('mousemove', updateMousePosition);

    return () => {
      window.removeEventListener('mousemove', updateMousePosition);
    };
  }, []);

  return mousePosition;
};
