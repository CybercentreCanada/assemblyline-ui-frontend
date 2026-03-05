import React, { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';

//*****************************************************************************************
// Reverse Portal Node
//*****************************************************************************************
export type ReversePortalNode = {
  hostEl: HTMLDivElement;
  setOutlet: (el: HTMLElement | null) => void;
};

export const createReversePortalNode = (): ReversePortalNode => {
  const hostEl = document.createElement('div');
  let currentOutlet: HTMLElement | null = null;

  const setOutlet = (el: HTMLElement | null) => {
    if (hostEl.parentElement) hostEl.parentElement.removeChild(hostEl);
    currentOutlet = el;
    if (currentOutlet) currentOutlet.appendChild(hostEl);
  };

  return { hostEl, setOutlet };
};

//*****************************************************************************************
// In Portal
//*****************************************************************************************

export type InPortalProps = {
  node: ReversePortalNode;
  children: React.ReactNode;
};

export const InPortal = React.memo(({ node, children }: InPortalProps) => <>{createPortal(children, node.hostEl)}</>);

InPortal.displayName = 'InPortal';

//*****************************************************************************************
// Out Portal
//*****************************************************************************************

export type OutPortalProps = {
  node: ReversePortalNode;
};

export const OutPortal = React.memo(({ node }: OutPortalProps) => {
  const outletRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    node.setOutlet(outletRef.current);
    return () => node.setOutlet(null);
  }, [node]);

  return <div ref={outletRef} />;
});

OutPortal.displayName = 'OutPortal';
