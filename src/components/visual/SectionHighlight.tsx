import { useTheme } from '@mui/material';
import useALContext from 'components/hooks/useALContext';
import React from 'react';

type SectionHighlightProps = {
  score: number;
  indent: number;
  depth?: number;
  highlighted?: boolean;
  nested?: boolean;
};

const SectionHighlight: React.FC<SectionHighlightProps> = ({
  score,
  indent,
  depth = 1,
  highlighted = false,
  nested = false
}) => {
  const theme = useTheme();
  const { scoreToVerdict } = useALContext();

  const VERDICT_SCORE_MAP = {
    // suspicious: theme.palette.mode === 'dark' ? '#1f5c6e' : '#a8ebff',
    info: theme.palette.mode === 'dark' ? '#393939' : '#f0f0f0',
    safe: theme.palette.mode === 'dark' ? '#2a492b' : '#9ae99d',
    suspicious: theme.palette.mode === 'dark' ? '#654312' : '#ffd395',
    highly_suspicious: theme.palette.mode === 'dark' ? '#654312' : '#ffd395',
    malicious: theme.palette.mode === 'dark' ? '#6e2b2b' : '#ffa1a1'
  };

  return (
    <div
      style={{
        backgroundColor: highlighted
          ? theme.palette.mode === 'dark'
            ? '#343a44'
            : '#e2f2fa'
          : VERDICT_SCORE_MAP[scoreToVerdict(score)],
        minWidth: '0.5rem',
        marginLeft: nested ? `${-1 * indent - 0.5}rem` : `${-1 * indent + -0.5 * (indent - depth)}rem`,
        marginRight: nested ? `${1 * indent}rem` : `${1 * indent + 0.5 * (indent - depth)}rem`
      }}
    />
  );
};

export default SectionHighlight;
