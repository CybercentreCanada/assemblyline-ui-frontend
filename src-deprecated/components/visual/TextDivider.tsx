import { styled } from '@mui/material';
import React from 'react';
import { useTranslation } from 'react-i18next';

type DividerProps = {
  forcePaper?: boolean;
};

const Divider = styled('div', {
  shouldForwardProp: prop => prop !== 'forcePaper'
})<DividerProps>(({ theme, forcePaper }) => ({
  display: 'inline-block',
  textAlign: 'center',
  width: '100%',
  margin: '30px 0',
  position: 'relative',
  borderTop: `1px solid ${theme.palette.divider}`,

  ...(forcePaper && {
    backgroundColor: theme.palette.background.paper
  })
}));

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

interface TextDividerProps {
  forcePaper?: boolean;
}

const TextDivider: React.FC<TextDividerProps> = ({ forcePaper = false }) => {
  const { t } = useTranslation();

  return (
    <div>
      <Divider forcePaper={forcePaper}>
        <Inner>{t('divider')}</Inner>
      </Divider>
    </div>
  );
};

export default TextDivider;
