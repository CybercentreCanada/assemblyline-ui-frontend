import React, { useEffect, useState } from 'react';

interface Props extends React.HTMLProps<HTMLDivElement> {
  children?: React.ReactNode;
  name?: string;
  visible?: boolean;
}

const WrappedContent: React.FC<Props> = ({ children, name = '', style, visible = false, ...other }) => {
  const [render, setRender] = useState<boolean>(false);
  useEffect(() => {
    if (visible === true) setRender(true);
  }, [visible]);
  return (
    <div {...other} style={{ display: visible ? 'contents' : 'none', ...style }}>
      {render && children}
    </div>
  );
};

export const Content = React.memo(WrappedContent);
export default Content;
