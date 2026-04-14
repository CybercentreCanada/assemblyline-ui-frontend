import type { ReactNode, SVGProps } from 'react';
import { useTranslation } from 'react-i18next';
import type { AppAccessibilityStates } from '../../configs/AppAccessibilityStates';
import { useAppAccessibilityPreferences, useAppAccessibilityStates } from '../../hooks';
import { MODULE_NAME } from '../../name';
import { AccessibilityButton, Step } from './AccessibilityButton';

export const LightSpacingIcon = (props: SVGProps<SVGSVGElement>) => {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" version="1.2" viewBox="0 0 36 36" {...props}>
      <g fill="none" fillRule="evenodd" stroke="currentColor" strokeLinecap="round" strokeWidth="2">
        <path strokeDasharray="4,7" d="M3 7h26" />
        <path strokeLinejoin="round" d="M7 13 1 7l6-6m18 12 6-6-6-6" />
      </g>
    </svg>
  );
};

export const ModerateSpacingIcon = (props: SVGProps<SVGSVGElement>) => {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" version="1.2" viewBox="0 0 60 36" {...props}>
      <g fill="none" fillRule="evenodd" stroke="currentColor" strokeLinecap="round" strokeWidth="2">
        <path strokeDasharray="4,7" d="M3.5 7h48" />
        <path strokeLinejoin="round" d="M7 13 1 7l6-6m41 12 6-6-6-6" />
      </g>
    </svg>
  );
};

export const HeavySpacingIcon = (props: SVGProps<SVGSVGElement>) => {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" version="1.2" viewBox="0 0 68 36" {...props}>
      <g fill="none" fillRule="evenodd" stroke="currentColor" strokeLinecap="round" strokeWidth="2">
        <path strokeDasharray="4,7" d="M3 7h62" />
        <path strokeLinejoin="round" d="M7 13 1 7l6-6m51 12 6-6-6-6" />
      </g>
    </svg>
  );
};

const getTextSpacingIcon = (textSpacing: AppAccessibilityStates['textSpacing']): ReactNode => {
  switch (textSpacing) {
    case 'default':
    case 'moderate':
      return <ModerateSpacingIcon height="2rem" width="2rem" />;
    case 'light':
      return <LightSpacingIcon height="2rem" width="2rem" />;
    case 'heavy':
      return <HeavySpacingIcon height="2rem" width="2rem" />;
  }
};

export const TextSpacingButton = () => {
  const accessibilityStates = useAppAccessibilityStates();
  const accessibilityPreferences = useAppAccessibilityPreferences();
  const { t } = useTranslation(MODULE_NAME);

  return accessibilityPreferences.enableAccessibility && accessibilityPreferences.enableTextSpacing ? (
    <AccessibilityButton
      title={
        accessibilityStates?.textSpacing === 'default'
          ? t('accessibilitymenu.linespacing.default')
          : accessibilityStates?.textSpacing === 'light'
            ? t('accessibilitymenu.linespacing.light')
            : accessibilityStates?.textSpacing === 'moderate'
              ? t('accessibilitymenu.linespacing.moderate')
              : t('accessibilitymenu.linespacing.heavy')
      }
      tooltip={t('accessibilitymenu.linespacing.tooltip')}
      active={accessibilityStates?.textSpacing !== 'default'}
      action={accessibilityStates?.nextTextSpacing}
      Icon={getTextSpacingIcon(accessibilityStates?.textSpacing)}
      Steps={
        accessibilityStates?.textSpacing !== 'default' && (
          <>
            <Step active={accessibilityStates?.textSpacing !== 'light'} />
            <Step active={accessibilityStates?.textSpacing === 'heavy'} />
          </>
        )
      }
    />
  ) : null;
};
