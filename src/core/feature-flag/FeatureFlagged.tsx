import { useIsFeatureEnabled } from 'core/feature-flag/feature-flag.hooks';
import type { PropsWithChildren } from 'react';
import { memo } from 'react';
import { FeatureFlagType } from './feature-flag.models';

export type FeatureFlaggedProps = PropsWithChildren<{
  /** Feature flag controlling whether children are rendered. */
  flag: FeatureFlagType;
}>;

export const FeatureFlagged = memo(({ children, flag }: FeatureFlaggedProps) => {
  const enabled = useIsFeatureEnabled(flag);

  return enabled ? <>{children}</> : null;
});

FeatureFlagged.displayName = 'FeatureFlagged';
