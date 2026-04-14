import type { SVGProps } from 'react';
import { useTranslation } from 'react-i18next';
import { useAppAccessibilityPreferences, useAppAccessibilityStates } from '../../hooks';
import { MODULE_NAME } from '../../name';
import { AccessibilityButton } from './AccessibilityButton';

export const PauseAnimationIcon = (props: SVGProps<SVGSVGElement>) => {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" version="1.2" viewBox="0 0 36 36" {...props}>
      <g fill="none" fillRule="evenodd">
        <path
          fill="currentColor"
          d="M15.8087111 23.6666667h-1.2702778c-.4429444 0-.8018333-.3598334-.8018333-.8027778v-9.7277778c0-.4429444.3588889-.8027778.8018333-.8027778h1.2702778c.4429445 0 .8027778.3598334.8027778.8027778v9.7277778c0 .4429444-.3598333.8027778-.8027778.8027778m6.6525722 0h-1.2702777c-.442 0-.8018334-.3598334-.8018334-.8027778v-9.7277778c0-.4429444.3598334-.8027778.8018334-.8027778h1.2702777c.4438889 0 .8027778.3598334.8027778.8027778v9.7277778c0 .4429444-.3588889.8027778-.8027778.8027778"
        />
        <path
          stroke="currentColor"
          strokeLinecap="round"
          strokeWidth="1.88888889"
          d="M18.5 4.77777778V1m0 34v-3.7777778M31.7222222 18H35.5m-34 0h3.77777778m3.87278889-9.34943333L6.47873333 5.97967778M30.5204167 30.0204167l-2.6708889-2.6708889m-.0000945-18.69896113 2.6708889-2.67088889M6.47911111 30.0204167l2.67183333-2.6708889M23.5542889 5.78219444l1.4440555-3.49066666M12.0013722 33.7087556l1.4440556-3.4906667m17.2723778-7.1638 3.4906666 1.4440555M2.79124444 11.5013722l3.49066667 1.4440556m7.15274999-7.15860558L11.9877722 2.2971m13.0246445 31.4061778-1.4468889-3.4897222m7.14765-17.2788945L34.2029 11.4877722M2.79672222 24.5124167l3.48972222-1.4468889"
        />
      </g>
    </svg>
  );
};

export const PlayAnimationIcon = (props: SVGProps<SVGSVGElement>) => {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" version="1.2" viewBox="0 0 36 36" {...props}>
      <g fill="none" fillRule="evenodd">
        <path
          fill="currentColor"
          d="M14 13.6845422v8.6309156c0 .5522848.4477153 1 1 1 .167319 0 .3319635-.0419834.4788521-.1221044l7.9116727-4.3154578c.4848483-.2644628.6635062-.8718994.3990434-1.3567477-.0919453-.1685665-.2304769-.3070981-.3990434-.3990435l-7.9116727-4.3154578c-.4848483-.2644627-1.0922849-.0858049-1.3567477.3990435-.080121.1468886-.1221044.3115331-.1221044.4788521Z"
        />
        <path
          stroke="currentColor"
          strokeLinecap="round"
          strokeWidth="1.88888889"
          d="M18 4.77777778V1m0 34v-3.7777778M31.2222222 18H35M1 18h3.77777778m3.87278889-9.34943333L5.97873333 5.97967778M30.0204167 30.0204167l-2.6708889-2.6708889m-.0000945-18.69896113 2.6708889-2.67088889M5.97911111 30.0204167l2.67183333-2.6708889M23.0542889 5.78219444l1.4440555-3.49066666M11.5013722 33.7087556l1.4440556-3.4906667m17.2723778-7.1638 3.4906666 1.4440555M2.29124444 11.5013722l3.49066667 1.4440556m7.15274999-7.15860558L11.4877722 2.2971m13.0246445 31.4061778-1.4468889-3.4897222m7.14765-17.2788945L33.7029 11.4877722M2.29672222 24.5124167l3.48972222-1.4468889"
        />
      </g>
    </svg>
  );
};

export const AnimationButton = () => {
  const accessibilityStates = useAppAccessibilityStates();
  const accessibilityPreferences = useAppAccessibilityPreferences();
  const { t } = useTranslation(MODULE_NAME);

  return accessibilityPreferences.enableAccessibility && accessibilityPreferences.enableAnimation ? (
    <AccessibilityButton
      title={
        accessibilityStates?.animation === 'play'
          ? t('accessibilitymenu.animation.pause')
          : t('accessibilitymenu.animation.play')
      }
      tooltip={t('accessibilitymenu.animation.tooltip')}
      active={accessibilityStates?.animation === 'pause'}
      action={accessibilityStates?.toggleAnimation}
      Icon={
        accessibilityStates?.animation === 'play' ? (
          <PlayAnimationIcon height="2rem" width="2rem" />
        ) : (
          <PauseAnimationIcon height="2rem" width="2rem" />
        )
      }
    />
  ) : null;
};
