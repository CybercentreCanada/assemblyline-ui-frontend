import { useContext } from 'react';
import { OverlayContext } from './OverlayProvider';

export const useAppOverlay = () => {
  return useContext(OverlayContext);
};

export type OverlayProps = {
  id: string;
  label: string;
  region: string;
  description?: string;
  rect: DOMRect;
};

export { OverlayLabel } from './OverlayLabel';
export { OverlayDefs, OverlayProvider } from './OverlayProvider';
export { OverlayShadow } from './OverlayShadow';
