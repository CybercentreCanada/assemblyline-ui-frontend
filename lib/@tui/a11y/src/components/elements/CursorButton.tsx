import type { ReactNode, SVGProps } from 'react';
import { useTranslation } from 'react-i18next';
import type { AppAccessibilityStates } from '../../configs/AppAccessibilityStates';
import { useAppAccessibilityPreferences, useAppAccessibilityStates } from '../../hooks';
import { MODULE_NAME } from '../../name';
import { AccessibilityButton, Step } from './AccessibilityButton';

export const ReadingMaskIcon = (props: SVGProps<SVGSVGElement>) => {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" version="1.2" viewBox="0 0 36 26" {...props}>
      <path
        fill="currentColor"
        d="m29.012621 0 3.008677.03216C33.117497.04383 34 .93578 34 2.03204V6.999l1 .00098c.552285 0 1 .44772 1 1v10c0 .55229-.447715 1-1 1l-1-.00098V24c0 1.10457-.895431 2-2 2H4c-1.104569 0-2-.89543-2-2v-5.001l-1 .00098c-.552285 0-1-.44771-1-1v-10c0-.55228.447715-1 1-1L2 6.999V2.04929c0-1.10303.893028-1.99782 1.996056-2L28.987378 0h.025243ZM5 18.999H3.8V24c0 .11046.089543.2.2.2h28c.110457 0 .2-.08954.2-.2v-5.001H31V22c0 .55228-.447715 1-1 1H6c-.552285 0-1-.44772-1-1v-3.001Zm28.75-8.99901H2.25c-.139571 0-.25.11193-.25.25v5.5c0 .13807.111929.25.25.25h31.5c.138071 0 .25-.11193.25-.25v-5.5c0-.13807-.111929-.25-.25-.25Zm-4.756547-8.19998-24.993847.04928c-.110303.00022-.199606.0897-.199606.2V6.999H5V4.0507c0-.5513.446172-.9986.997466-1l19.989356-.05066.026356.00011 3.997466.04255c.548101.00583.989356.45181.989356.99994V6.999h1.2V2.03204c0-.10962-.08825-.19882-.19787-.19999l-3.008677-.03204Z"
      />
    </svg>
  );
};

export const ReadingGuideIcon = (props: SVGProps<SVGSVGElement>) => {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" version="1.2" viewBox="0 0 36 26" {...props}>
      <path
        fill="currentColor"
        fillRule="evenodd"
        d="M28.993.0000711V0l-.0113.0000223-24.98564.049276C3.44479.0503855 2.94455.275608 2.58439.636476 2.22424.997344 2 1.49803 2 2.04929V24c0 .552.22484 1.0533.58579 1.4142C2.94673 25.7751 3.44796 26 4 26h28c.552 0 1.0533-.2249 1.4142-.5858C33.7752 25.0533 34 24.552 34 24V13.778c-.014.1248-.1199.2219-.2484.2219H32.2V24c0 .0555-.0214.1042-.0586.1414S32.0555 24.2 32 24.2H4c-.05548 0-.10424-.0214-.14142-.0586C3.8214 24.1042 3.8 24.0555 3.8 24V13.9999H2.25156c-.13807 0-.25-.112-.25-.25v-1.5c0-.1381.11193-.25.25-.25H3.8V2.04929c0-.05539.02135-.10411.05844-.14128.03709-.03716.08577-.05861.14117-.05872l24.97999-.04926 3.0225.03203h.0001c.055.0006.1033.02223.14.05932.0367.0371.0578.08561.0578.14067v9.96785h1.5516c.1285 0 .2344.097.2484.2218V2.03205c0-.54789-.2216-1.046139-.5783-1.406664-.3567-.360523-.8525-.5873892-1.4004-.5932238v-4e-7L28.993.0000711Z"
        clipRule="evenodd"
      />
      <path
        fill="currentColor"
        fillRule="evenodd"
        d="M35 8.99976H1c-.552285 0-1 .44771-1 1v6.00004c0 .5522.447715 1 1 1h34c.5523 0 1-.4478 1-1V9.99976c0-.55229-.4477-1-1-1ZM2.25 11.9998h31.5c.1381 0 .25.1119.25.25v1.5c0 .138-.1119.25-.25.25H2.25c-.13807 0-.25-.112-.25-.25v-1.5c0-.1381.11193-.25.25-.25Z"
        clipRule="evenodd"
      />
    </svg>
  );
};

export const CursorIcon = (props: SVGProps<SVGSVGElement>) => {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" version="1.2" viewBox="0 0 36 36" {...props}>
      <path
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        d="m15.9983464 11.5517813 9.5269972 9.52699721-4.4465655 4.44656549-9.5269972-9.52699717-4.05145413 9.06403815L1 1.0000004l24.0623846 6.5003268z"
      />
    </svg>
  );
};

const getCursorIcon = (cursor: AppAccessibilityStates['cursor']): ReactNode => {
  switch (cursor) {
    case 'default':
      return <CursorIcon height="2rem" width="2rem" />;
    case 'readingMask':
      return <ReadingMaskIcon height="2rem" width="2rem" />;
    case 'readingGuide':
      return <ReadingGuideIcon height="2rem" width="2rem" />;
  }
};

export const CursorButton = () => {
  const accessibilityStates = useAppAccessibilityStates();
  const accessibilityPreferences = useAppAccessibilityPreferences();
  const { t } = useTranslation(MODULE_NAME);

  return accessibilityPreferences.enableAccessibility && accessibilityPreferences.enableCursor ? (
    <AccessibilityButton
      title={
        accessibilityStates?.cursor === 'default'
          ? t('accessibilitymenu.cursor.default')
          : accessibilityStates?.cursor === 'readingGuide'
            ? t('accessibilitymenu.cursor.readingGuide')
            : t('accessibilitymenu.cursor.readingMask')
      }
      tooltip={t('accessibilitymenu.cursor.tooltip')}
      active={accessibilityStates?.cursor !== 'default'}
      action={accessibilityStates?.nextCursor}
      Icon={getCursorIcon(accessibilityStates?.cursor)}
      Steps={
        accessibilityStates?.cursor !== 'default' && <Step active={accessibilityStates?.cursor === 'readingMask'} />
      }
    />
  ) : null;
};
