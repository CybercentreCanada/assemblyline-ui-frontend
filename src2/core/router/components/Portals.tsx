import React, { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';

export type ReversePortalNode = {
  hostEl: HTMLDivElement;
  setOutlet: (el: HTMLElement | null) => void;
};

export const createReversePortalNode = (): ReversePortalNode => {
  const hostEl = document.createElement('div');
  let currentOutlet: HTMLElement | null = null;

  const setOutlet = (el: HTMLElement | null) => {
    // detach from old outlet
    if (hostEl.parentElement) hostEl.parentElement.removeChild(hostEl);

    currentOutlet = el;

    // attach to new outlet
    if (currentOutlet) currentOutlet.appendChild(hostEl);
  };

  return { hostEl, setOutlet };
};

export type InPortalProps = {
  node: ReversePortalNode;
  children: React.ReactNode;
};

export const InPortal = ({ node, children }: { node: ReversePortalNode; children: React.ReactNode }) => {
  return <>{createPortal(children, node.hostEl)}</>;
};

export type OutPortalProps = {
  node: ReversePortalNode;
};

export const OutPortal = ({ node }: OutPortalProps) => {
  const outletRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    node.setOutlet(outletRef.current);
    return () => node.setOutlet(null);
  }, [node]);

  return <div ref={outletRef} />;
};
