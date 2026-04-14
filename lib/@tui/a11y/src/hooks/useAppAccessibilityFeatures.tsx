import { useContext, useMemo, type ReactNode } from 'react';
import {
  AnimationButton,
  CursorButton,
  LineHeightButton,
  TextAlignmentButton,
  TextSizeButton,
  TextSpacingButton,
  TooltipLeaveDelayButton
} from '../components/elements';
import { AppAccessibilityContext } from '../configs/AccessibilityContext';

const DEFAULT_ACCESSIBILITY_FEATURES = [
  <CursorButton key="cursorAccessibilityButton" />,
  <AnimationButton key="animationAccessibilityButton" />,
  <LineHeightButton key="lineHeightAccessibilityButton" />,
  <TextSizeButton key="textSizeAccessibilityButton" />,
  <TextSpacingButton key="textSpacingAccessibilityButton" />,
  <TextAlignmentButton key="textAlignmentAccessibilityButton" />,
  <TooltipLeaveDelayButton key="TooltipLeaveDelayButton" />
];

export function useAppAccessibilityFeatures() {
  const { features } = useContext(AppAccessibilityContext);

  return useMemo(() => {
    // Merge user provided configs with defaults.
    const _features = [...DEFAULT_ACCESSIBILITY_FEATURES, ...(features || [])] as ReactNode[];

    // Rebuild new context.
    return _features;
  }, [features]);
}
