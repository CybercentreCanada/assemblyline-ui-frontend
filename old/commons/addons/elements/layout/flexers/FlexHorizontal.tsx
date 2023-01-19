import React from "react";

const FlexHorizontal: React.FC<{
  children: React.ReactNode;
  height?: string;
}> = React.memo(({ children, height = '100%' }) => (
  <div style={{ display: 'flex', flexDirection: 'row', height }}>{children}</div>
));

export default FlexHorizontal;
