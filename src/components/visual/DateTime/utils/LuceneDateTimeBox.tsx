import type { LuceneDateTime } from 'components/visual/DateTime/utils/lucenedatetime';
import { format } from 'date-fns';
import { useTranslation } from 'react-i18next';

export type LuceneDateTimeBoxProps = {
  value: LuceneDateTime;
  type?: 'absolute' | 'relative';
};

export const LuceneDateTimeBox = ({ value = null, type = null }: LuceneDateTimeBoxProps) => {
  const { t, i18n } = useTranslation('dateTime');

  if (type === 'absolute' || value.type === 'absolute') {
    return format(value.absolute.toDate(), 'PPp');
  } else if (type === 'relative' || value.type === 'relative') {
    return value.relative;
  } else {
    return null;
  }
};
