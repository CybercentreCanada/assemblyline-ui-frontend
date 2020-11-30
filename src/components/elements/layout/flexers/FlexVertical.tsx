import React from 'react';

const FlexVertical = ({ children, height = '100%' }) => {
  return <div style={{ display: 'flex', flexDirection: 'column', height }}>{children}</div>;
};

export default FlexVertical;
