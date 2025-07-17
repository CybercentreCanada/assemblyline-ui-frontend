import { add, format as formatDate, formatISO, sub } from 'date-fns';
import { enCA, frCA } from 'date-fns/locale';
import React, { useMemo } from 'react';
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

type AbsoluteDateTimeProps = {
  absolute: 'ISO' | 'date' | 'datetime';
  relative?: null;
};

type RelativeDateTimeProps = {
  absolute?: null;
  relative: null;
};

type DateTimeFieldProps<DateType extends Date> = {
  children: DateType | number | string;
} & (AbsoluteDateTimeProps | RelativeDateTimeProps);

// (alias) function formatDate<DateType extends Date>(date: DateType | number | string, formatStr: string, options?: FormatOptions): string
// import formatDate

const WrappedDateTimeField = <DateType extends Date>({
  children = null,
  absolute = null,
  relative = null
}: DateTimeFieldProps<DateType>) => {
  const { i18n } = useTranslation();

  // const pastRelative = formatDistanceToNow(null, { addSuffix: true, locale: enCA }); // "5 days ago"
  // const futureRelative = formatDistanceToNow(null, { addSuffix: true, locale: frCA }); // "in 3 months"

  function luceneToDate(luceneDate) {
    const now = new Date();

    // Regex to parse Lucene-style datetime
    const match = /now([+-])(\d+)([smhd])/i.exec(luceneDate);

    if (!match) {
      throw new Error('Invalid Lucene date format');
    }

    const operator = match[1]; // "+" or "-"
    const value = parseInt(match[2], 10); // Numeric value
    const unit = match[3].toLowerCase(); // Unit of time (s, m, h, d)

    // `date-fns` requires the time unit as a key in an object
    const timeUnitMap = {
      s: 'seconds',
      m: 'minutes',
      h: 'hours',
      d: 'days',
      w: 'weeks',
      M: 'months',
      y: 'years'
    };

    const adjustment = { [timeUnitMap[unit]]: value };

    // Use `add` or `sub` based on the operator
    return operator === '+' ? add(now, adjustment) : sub(now, adjustment);
  }

  const isFR = useMemo(() => i18n.language === 'fr', [i18n.language]);
  const locale = useMemo(() => (isFR ? frCA : enCA), [isFR]);

  const absoluteDate = useMemo<string>(() => {
    try {
      switch (absolute) {
        case 'ISO':
          return formatISO(children);
        case 'date':
          return formatDate(children, 'PPP', { locale });
        case 'datetime':
          return formatDate(children, 'PPPp', { locale });
        default:
          return null;
      }
    } catch (e) {
      console.warn('Date: ', children, '\n', e);
      return null;
    }
  }, [absolute, children, locale]);

  return <>{absoluteDate}</>;

  // const data = useMemo<string | number | Date>(() => {
  //   try {
  //     const time = moment(children).locale(i18n.language);

  //     if (format) return time.format(format);

  //     switch (variant) {
  //       case 'fromNow':
  //         return time.fromNow();
  //       case 'toNow':
  //         return time.toNow();
  //       case 'toISOString':
  //         return time.toISOString();
  //       case 'localeDate':
  //         return time.format(i18n.language === 'fr' ? 'Do MMMM YYYY' : 'MMMM Do YYYY');
  //       case 'localeDateTime':
  //         return time.format(i18n.language === 'fr' ? 'Do MMMM YYYY H[h]mm' : 'MMMM Do YYYY, h:mm a');
  //       case 'fromDateTime':
  //         return time.calendar(
  //           i18n.language === 'fr'
  //             ? {
  //                 sameDay: 'H[h]mm',
  //                 lastDay: '[Hier] H[h]mm',
  //                 lastWeek: 'dddd H[h]mm ',
  //                 sameElse: 'Do MMMM YYYY H[h]mm'
  //               }
  //             : {
  //                 sameDay: 'h:mm a',
  //                 lastDay: '[Yesterday] h:mm a',
  //                 lastWeek: 'dddd h:mm a',
  //                 sameElse: 'MMMM D YYYY, h:mm a'
  //               }
  //         );
  //       case 'fromFullDateTime':
  //         return time.calendar(
  //           i18n.language === 'fr'
  //             ? {
  //                 sameDay: "[Aujourd'hui à] H[h]mm",
  //                 lastDay: '[Hier à] H[h]mm',
  //                 lastWeek: '[Le] dddd H[h]mm ',
  //                 sameElse: '[Le] Do MMMM YYYY H[h]mm'
  //               }
  //             : {
  //                 sameDay: '[Today at] h:mm a',
  //                 lastDay: '[Yesterday at] h:mm a',
  //                 lastWeek: '[On] dddd h:mm a',
  //                 sameElse: '[On] MMMM D YYYY, h:mm a'
  //               }
  //         );
  //       default:
  //         // eslint-disable-next-line @typescript-eslint/no-base-to-string
  //         return time.toString();
  //     }
  //   } catch (error) {
  //     // eslint-disable-next-line no-console
  //     console.debug(error);
  //     return children;
  //   }
  // }, [children, format, i18n.language, variant]);

  // return <>{data.toString()}</>;
};

export const DateTimeField: <DateType extends Date>(props: DateTimeFieldProps<DateType>) => React.ReactNode =
  React.memo(WrappedDateTimeField);
