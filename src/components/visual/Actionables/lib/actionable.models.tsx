import type { ExternalLink } from 'components/models/base/config';

export type ActionableProps = {
  category: 'heuristic' | 'signature' | 'hash' | 'metadata' | 'tag';
  classification?: string | null;
  highlightKey?: string;
  index?: string;
  loading?: boolean;
  preventRender?: boolean;
  type: string;
  value: string;
  setBorealisDetails?: (value: boolean) => void;
};

export const ACTIONABLE_PROPS: ActionableProps = {
  category: null,
  classification: null,
  highlightKey: null,
  index: null,
  loading: false,
  preventRender: false,
  setBorealisDetails: null,
  type: null,
  value: null
};

export type ActionableStates = {
  badlistDialog?: boolean;
  badlistReason?: string;
  externalLinks?: ExternalLink[];
  mouseX?: number;
  mouseY?: number;
  safelistDialog?: boolean;
  safelistReason?: string;
};

export const ACTIONABLE_STATES: ActionableStates = {
  badlistDialog: false,
  badlistReason: '',
  externalLinks: [],
  mouseX: null,
  mouseY: null,
  safelistDialog: false,
  safelistReason: ''
};
