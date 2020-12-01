import React from 'react';

const FlexHorizontal: React.FC<{ height?: string; children: React.ReactNode }> = React.memo(
  ({ children, height = '100%' }) => {
    return <div style={{ display: 'flex', flexDirection: 'row', height }}>{children}</div>;
  }
);

export default FlexHorizontal;
