import React, { useLayoutEffect, useRef, useState } from 'react';

const Viewport = ({ children }) => {
  const ref = useRef<HTMLDivElement>();
  const [height, setHeight] = useState<number>(0);
  useLayoutEffect(() => {
    const updateHeight = () => {
      const { current: element } = ref;
      const _height = window.innerHeight - element.offsetTop;
      setHeight(_height);
    };
    window.addEventListener('resize', updateHeight);
    updateHeight();
    return () => {
      window.removeEventListener('resize', updateHeight);
    };
  }, []);
  console.log(height);
  return (
    <div ref={ref} style={{ height }}>
      {children}
    </div>
  );
};

export default Viewport;
