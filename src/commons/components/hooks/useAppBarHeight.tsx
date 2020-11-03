import { useEffect, useState } from 'react';

export default function useAppBarHeight(): number {
  const [height, setHeight] = useState<number>(-1);

  const updateHeight = () => {
    const appbar = document.getElementById('appbar');
    if (appbar) {
      const rect = appbar.getBoundingClientRect();
      setHeight(rect.height);
    }
  };

  useEffect(() => {
    updateHeight();
    window.addEventListener('resize', updateHeight);
    return () => {
      window.removeEventListener('resize', updateHeight);
    };
  });

  return height;
}
