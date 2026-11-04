import type { SystemType } from 'models/base/config';
import type { CSSProperties } from 'react';

//*****************************************************************************************
// System Version Props
//*****************************************************************************************

/** Props for the SystemVersion component. */
export type SystemVersionProps = {
  /** Optional class name override for custom styling or print hiding. */
  className?: string;
  /** Optional inline style overrides for dynamic positioning. */
  style?: CSSProperties;
};

//*****************************************************************************************
// System Version Info
//*****************************************************************************************

/** System version display information. */
export type SystemVersionInfo = {
  /** System environment type (e.g., 'production', 'staging', 'development'). */
  type?: SystemType | string;
  /** System software version string. */
  version?: string;
};

export const DEFAULT_SYSTEM_VERSION_INFO: SystemVersionInfo = {
  type: 'production',
  version: ''
};
