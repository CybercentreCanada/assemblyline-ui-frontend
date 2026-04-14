import type { SVGProps } from 'react';
import { useTranslation } from 'react-i18next';
import { useAppAccessibilityPreferences, useAppAccessibilityStates } from '../../hooks';
import { MODULE_NAME } from '../../name';
import { AccessibilityButton, Step } from './AccessibilityButton';

export const TextSizeIcon = (props: SVGProps<SVGSVGElement>) => {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" version="1.2" viewBox="0 0 36 36" {...props}>
      <g fill="none" fillRule="evenodd" stroke="currentColor" strokeLinecap="round" strokeWidth="2">
        <path strokeLinejoin="round" d="M26.58 21.3225806V1m-7.92 4.06451613V1H34.5v4.06451613" />
        <path d="M22.62 21.3225806h7.92" />
        <path strokeLinejoin="round" d="M6.78 18.6129032V5.06451613M1.5 7.77419355V5.06451613h10.56v2.70967742" />
        <path d="M4.14 18.6129032h5.28" />
      </g>
    </svg>
  );
};

export const TextSizeButton = () => {
  const accessibilityStates = useAppAccessibilityStates();
  const accessibilityPreferences = useAppAccessibilityPreferences();
  const { t } = useTranslation(MODULE_NAME);

  return accessibilityPreferences.enableAccessibility && accessibilityPreferences.enableTextSize ? (
    <AccessibilityButton
      title={t('accessibilitymenu.textsize.default')}
      tooltip={t('accessibilitymenu.textsize.tooltip')}
      active={accessibilityStates?.textSize !== 'default'}
      action={accessibilityStates?.nextTextSize}
      Icon={<TextSizeIcon height="2rem" width="2rem" />}
      Steps={
        accessibilityStates?.textSize !== 'default' && (
          <>
            <Step active={accessibilityStates?.textSize !== 'sm'} />
            <Step active={accessibilityStates?.textSize === 'lg'} />
          </>
        )
      }
    />
  ) : null;
};
