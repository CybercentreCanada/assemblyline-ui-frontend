import { Tooltip } from '@material-ui/core';
import CustomChip from 'components/visual/CustomChip';
import React from 'react';

const VERDICT_COLOR_MAP = {
  info: 'default',
  safe: 'success',
  suspicious: 'warning',
  malicious: 'error'
};

type TextVerdictProps = {
  verdict: string;
  variant?: 'outlined' | 'default';
  size?: 'tiny' | 'small' | 'medium';
  mono?: boolean;
};

const TextVerdict: React.FC<TextVerdictProps> = ({ verdict, variant = 'default', size = 'tiny', mono = false }) => {
  const color = VERDICT_COLOR_MAP[verdict];

  return (
    <Tooltip title={verdict}>
      <span>
        <CustomChip
          type="square"
          variant={variant}
          size={size}
          label={verdict[0].toUpperCase()}
          color={color}
          mono={mono}
        />
      </span>
    </Tooltip>
  );
};

export default TextVerdict;
