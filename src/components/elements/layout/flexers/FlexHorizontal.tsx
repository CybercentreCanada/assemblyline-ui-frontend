import React from 'react';

const FlexHorizontal = ({ children , height = '100%'}) => {
  return <div style={{ display: 'flex', flexDirection: 'row', height }}>{children}</div>;
};

export default FlexHorizontal;
