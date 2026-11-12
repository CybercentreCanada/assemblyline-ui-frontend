import type { FeatureFlagType } from 'core/feature-flag';
import { useIsFeatureEnabled } from 'core/feature-flag/feature-flag.hooks';
import type { PropsWithChildren } from 'react';
import { memo } from 'react';

export type FeatureFlaggedProps = PropsWithChildren<{
  /** Feature flag controlling whether children are rendered. */
  flag: FeatureFlagType;
}>;

/**
 * Renders children only if the specified feature flag is enabled.
 */
export const FeatureFlagged = memo(({ children, flag }: FeatureFlaggedProps) => {
  const enabled = useIsFeatureEnabled(flag);

  return enabled ? <>{children}</> : null;
});

FeatureFlagged.displayName = 'FeatureFlagged';
