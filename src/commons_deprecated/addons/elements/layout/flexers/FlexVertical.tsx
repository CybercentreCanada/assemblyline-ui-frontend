import React from 'react';

const FlexVertical: React.FC<{
  children: React.ReactNode;
  height?: string;
}> = React.memo(({ children, height = '100%' }) => (
  <div style={{ display: 'flex', flexDirection: 'column', height }}>{children}</div>
));

export default FlexVertical;
