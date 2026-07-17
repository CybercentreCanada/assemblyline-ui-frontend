import type { ReactNode } from 'react';
import { memo, useEffect, useRef } from 'react';
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
  hostEl.style.display = 'contents';
  hostEl.setAttribute('data-testid', 'reverse-portal-host');
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
  children: ReactNode;
};

export const InPortal = memo(({ node, children }: InPortalProps) => <>{createPortal(children, node.hostEl)}</>);

InPortal.displayName = 'InPortal';

//*****************************************************************************************
// Out Portal
//*****************************************************************************************

export type OutPortalProps = {
  node: ReversePortalNode;
};

export const OutPortal = memo(({ node }: OutPortalProps) => {
  const outletRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    node.setOutlet(outletRef.current);
    return () => node.setOutlet(null);
  }, [node]);

  return <div data-testid="reverse-portal-outlet" ref={outletRef} style={{ display: 'contents' }} />;
});

OutPortal.displayName = 'OutPortal';
