import {
  FormatAlignCenterOutlined,
  FormatAlignJustifyOutlined,
  FormatAlignLeftOutlined,
  FormatAlignRightOutlined
} from '@mui/icons-material';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import type { AppAccessibilityStates } from '../../configs/AppAccessibilityStates';
import { useAppAccessibilityPreferences, useAppAccessibilityStates } from '../../hooks';
import { MODULE_NAME } from '../../name';
import { AccessibilityButton, Step } from './AccessibilityButton';

const getTextAlignmentIcon = (textAlign: AppAccessibilityStates['textAlign']): ReactNode => {
  switch (textAlign) {
    case 'default':
    case 'alignLeft':
      return <FormatAlignLeftOutlined sx={{ height: '2rem', width: '2rem' }} />;
    case 'alignCenter':
      return <FormatAlignCenterOutlined sx={{ height: '2rem', width: '2rem' }} />;
    case 'alignRight':
      return <FormatAlignRightOutlined sx={{ height: '2rem', width: '2rem' }} />;
    case 'justified':
      return <FormatAlignJustifyOutlined sx={{ height: '2rem', width: '2rem' }} />;
  }
};

export const TextAlignmentButton = () => {
  const accessibilityStates = useAppAccessibilityStates();
  const accessibilityPreferences = useAppAccessibilityPreferences();
  const { t } = useTranslation(MODULE_NAME);

  return accessibilityPreferences.enableAccessibility && accessibilityPreferences.enableTextAlignment ? (
    <AccessibilityButton
      title={
        accessibilityStates?.textAlign === 'default'
          ? t('accessibilitymenu.textalignment.default')
          : accessibilityStates?.textAlign === 'alignLeft'
            ? t('accessibilitymenu.textalignment.left')
            : accessibilityStates?.textAlign === 'alignRight'
              ? t('accessibilitymenu.textalignment.right')
              : accessibilityStates?.textAlign === 'alignCenter'
                ? t('accessibilitymenu.textalignment.center')
                : t('accessibilitymenu.textalignment.justify')
      }
      tooltip={t('accessibilitymenu.textalignment.tooltip')}
      active={accessibilityStates?.textAlign !== 'default'}
      action={accessibilityStates?.nextTextAlign}
      Icon={getTextAlignmentIcon(accessibilityStates?.textAlign)}
      Steps={
        accessibilityStates?.textAlign !== 'default' && (
          <>
            <Step active={accessibilityStates?.textAlign !== 'alignLeft'} />
            <Step
              active={accessibilityStates?.textAlign !== 'alignLeft' && accessibilityStates?.textAlign !== 'alignRight'}
            />
            <Step active={accessibilityStates?.textAlign === 'justified'} />
          </>
        )
      }
    />
  ) : null;
};
