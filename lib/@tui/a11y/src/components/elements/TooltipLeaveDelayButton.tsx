import {
  HourglassBottomOutlined,
  HourglassDisabledOutlined,
  HourglassEmptyOutlined,
  HourglassFullOutlined
} from '@mui/icons-material';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import type { AppAccessibilityStates } from '../../configs/AppAccessibilityStates';
import { useAppAccessibilityPreferences } from '../../hooks/useAppAccessibilityPreferences';
import { useAppAccessibilityStates } from '../../hooks/useAppAccessibilityStates';
import { MODULE_NAME } from '../../name';
import { AccessibilityButton, Step } from './AccessibilityButton';

const getTooltipLeaveDelayIcon = (tooltipLeaveDelay: AppAccessibilityStates['tooltipLeaveDelay']): ReactNode => {
  switch (tooltipLeaveDelay) {
    case 'long':
      return <HourglassFullOutlined height="2.5rem" width="2.5rem" />;
    case 'moderate':
      return <HourglassBottomOutlined height="2.5rem" width="2.5rem" />;
    case 'short':
      return <HourglassEmptyOutlined height="2.5rem" width="2.5rem" />;
    default:
      return <HourglassDisabledOutlined height="2.5rem" width="2.5rem" />;
  }
};

export const TooltipLeaveDelayButton = () => {
  const accessibilityStates = useAppAccessibilityStates();
  const accessibilityPreferences = useAppAccessibilityPreferences();
  const { t } = useTranslation(MODULE_NAME);

  return accessibilityPreferences.enableAccessibility && accessibilityPreferences.enableTooltipLeaveDelay ? (
    <AccessibilityButton
      title={
        accessibilityStates?.tooltipLeaveDelay === 'default'
          ? t('accessibilitymenu.tooltipleavedelay.default')
          : accessibilityStates?.tooltipLeaveDelay === 'short'
            ? t('accessibilitymenu.tooltipleavedelay.short')
            : accessibilityStates?.tooltipLeaveDelay === 'moderate'
              ? t('accessibilitymenu.tooltipleavedelay.moderate')
              : t('accessibilitymenu.tooltipleavedelay.long')
      }
      tooltip={t('accessibilitymenu.tooltipleavedelay.tooltip')}
      active={accessibilityStates?.tooltipLeaveDelay !== 'default'}
      action={accessibilityStates?.nextTooltipLeaveDelay}
      Icon={getTooltipLeaveDelayIcon(accessibilityStates?.tooltipLeaveDelay)}
      Steps={
        accessibilityStates?.tooltipLeaveDelay !== 'default' && (
          <>
            <Step active={accessibilityStates?.tooltipLeaveDelay !== 'short'} />
            <Step active={accessibilityStates?.tooltipLeaveDelay === 'long'} />
          </>
        )
      }
    />
  ) : null;
};
