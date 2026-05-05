import { styled } from '@mui/material';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';

//*****************************************************************************************
// TextDivider
//*****************************************************************************************

const Divider = styled('div', {
  shouldForwardProp: prop => prop !== 'forcePaper'
})<{ forcePaper?: boolean }>(({ theme, forcePaper }) => ({
  display: 'inline-block',
  textAlign: 'center',
  width: '100%',
  margin: '30px 0',
  position: 'relative',
  borderTop: `1px solid ${theme.palette.divider}`,
  ...(forcePaper && { backgroundColor: theme.palette.background.paper })
}));

Divider.displayName = 'Divider';

const Inner = styled('div')(({ theme }) => ({
  backgroundColor: theme.palette.background.paper,
  left: '50%',
  marginLeft: '-30px',
  position: 'absolute',
  top: '-10px',
  width: '60px',
  [theme.breakpoints.only('xs')]: {
    backgroundColor: theme.palette.background.default
  }
}));

Inner.displayName = 'Inner';

/** Props for TextDivider. */
export type TextDividerProps = {
  /** Whether to force paper background color. */
  forcePaper?: boolean;
};

export const TextDivider = memo(({ forcePaper = false }: TextDividerProps) => {
  const { t } = useTranslation();

  return (
    <div>
      <Divider forcePaper={forcePaper} />
      <Inner>{t('divider')}</Inner>
      <Divider />
    </div>
  );
});

TextDivider.displayName = 'TextDivider';
