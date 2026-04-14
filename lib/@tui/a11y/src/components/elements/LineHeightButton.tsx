import type { SVGProps } from 'react';
import { useTranslation } from 'react-i18next';
import { useAppAccessibilityPreferences, useAppAccessibilityStates } from '../../hooks';
import { MODULE_NAME } from '../../name';
import { AccessibilityButton, Step } from './AccessibilityButton';

export const LineHeightIcon = (props: SVGProps<SVGSVGElement>) => {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" version="1.2" viewBox="0 0 47 19" {...props}>
      <g fill="none" fillRule="evenodd">
        <path stroke="currentColor" strokeLinecap="round" strokeWidth="2" d="M3.94487862 2.71042226V16.7104223" />
        <path
          fill="currentColor"
          d="m.11302135 14.5270412 3.44487862 4.2104072c.17486379.2137224.48987514.2452235.70359754.0703597a.4999988.4999988 0 0 0 .07035976-.0703597l3.44487862-4.2104072c.17486378-.2137225.14336265-.5287338-.07035976-.7035976-.08933106-.073089-.20119771-.1130213-.31661889-.1130213H.5c-.27614237 0-.5.2238576-.5.5 0 .1154211.0399323.2272878.11302135.3166189Zm0-10.1332381L3.55789997.18339592c.17486379-.21372241.48987514-.24522355.70359754-.07035976a.49999975.49999975 0 0 1 .07035976.07035976l3.44487862 4.2104072c.17486378.2137224.14336265.52873375-.07035976.70359754-.08933106.07308905-.20119771.11302135-.31661889.11302135H.5c-.27614237 0-.5-.22385762-.5-.5 0-.11542118.0399323-.22728783.11302135-.3166189Z"
        />
        <path
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          d="M15.4448786 1.71042226h30m-30 5h30m-30 5.00000004h30m-30 5h24"
        />
      </g>
    </svg>
  );
};

export const LineHeightButton = () => {
  const accessibilityStates = useAppAccessibilityStates();
  const accessibilityPreferences = useAppAccessibilityPreferences();
  const { t } = useTranslation(MODULE_NAME);

  return accessibilityPreferences.enableAccessibility && accessibilityPreferences.enableLineHeight ? (
    <AccessibilityButton
      title={
        accessibilityStates?.lineHeight === 'default'
          ? t('accessibilitymenu.lineheight.default')
          : accessibilityStates?.lineHeight === '1.5x'
            ? t('accessibilitymenu.lineheight.15x')
            : accessibilityStates?.lineHeight === '1.75x'
              ? t('accessibilitymenu.lineheight.175x')
              : t('accessibilitymenu.lineheight.2x')
      }
      tooltip={t('accessibilitymenu.lineheight.tooltip')}
      active={accessibilityStates?.lineHeight !== 'default'}
      action={accessibilityStates?.nextLineHeight}
      Icon={<LineHeightIcon height="2rem" width="2rem" />}
      Steps={
        accessibilityStates?.lineHeight !== 'default' && (
          <>
            <Step active={accessibilityStates?.lineHeight !== '1.5x'} />
            <Step active={accessibilityStates?.lineHeight === '2x'} />
          </>
        )
      }
    />
  ) : null;
};
