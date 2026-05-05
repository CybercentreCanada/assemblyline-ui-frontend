import { memo } from 'react';

//*****************************************************************************************
// TitleKey
//*****************************************************************************************

/** Props for TitleKey. */
export type TitleKeyProps = {
  /** The key text to display as a title. */
  title: string;
};

export const TitleKey = memo(({ title }: TitleKeyProps) => (
  <span style={{ fontWeight: 500, textTransform: 'capitalize' }}>{title.replace(/[-_.]/g, ' ')}</span>
));

TitleKey.displayName = 'TitleKey';
