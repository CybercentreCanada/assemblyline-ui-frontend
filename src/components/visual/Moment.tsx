import moment from 'moment';
import { ReactNode, memo, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

const MOMENT_VARIANTS = [
  'fromNow',
  'toNow',
  'toISOString',
  'localeDate',
  'localeDateTime',
  'fromDateTime',
  'fromFullDateTime'
] as const;
type MomentVariant = (typeof MOMENT_VARIANTS)[number];

type MomentProps = {
  children?: ReactNode;
  format?: string;
  variant?: MomentVariant;
};

const WrappedMoment = ({ children = null, format = null, variant = null }: MomentProps) => {
  const { i18n } = useTranslation();

  const data = useMemo<string | any>(() => {
    try {
      const input = new Date(children.toString()).toISOString();
      const time = moment(input).locale(i18n.language);

      if (format) return time.format(format);

      switch (variant) {
        case 'fromNow':
          return time.fromNow();
        case 'toNow':
          return time.toNow();
        case 'toISOString':
          return time.toISOString();
        case 'localeDate':
          return time.format(i18n.language === 'fr' ? 'Do MMMM YYYY' : 'MMMM Do YYYY');
        case 'localeDateTime':
          return time.format(i18n.language === 'fr' ? 'Do MMMM YYYY H[h]mm' : 'MMMM Do YYYY, h:mm a');
        case 'fromDateTime':
          return time.calendar(
            i18n.language === 'fr'
              ? {
                  sameDay: 'H[h]mm',
                  lastDay: '[Hier] H[h]mm',
                  lastWeek: 'dddd H[h]mm ',
                  sameElse: 'Do MMMM YYYY H[h]mm'
                }
              : {
                  sameDay: 'h:mm a',
                  lastDay: '[Yesterday] h:mm a',
                  lastWeek: 'dddd h:mm a',
                  sameElse: 'MMMM D YYYY, h:mm a'
                }
          );
        case 'fromFullDateTime':
          return time.calendar(
            i18n.language === 'fr'
              ? {
                  sameDay: "[Aujourd'hui à] H[h]mm",
                  lastDay: '[Hier à] H[h]mm',
                  lastWeek: '[Le] dddd H[h]mm ',
                  sameElse: '[Le] Do MMMM YYYY H[h]mm'
                }
              : {
                  sameDay: '[Today at] h:mm a',
                  lastDay: '[Yesterday at] h:mm a',
                  lastWeek: '[On] dddd h:mm a',
                  sameElse: '[On] MMMM D YYYY, h:mm a'
                }
          );
        default:
          return time.toString();
      }
    } catch (error) {
      // eslint-disable-next-line no-console
      console.debug(error);
      return children.toString();
    }
  }, [children, format, i18n.language, variant]);

  return <>{data}</>;
};

export const Moment = memo(WrappedMoment);
export default Moment;
