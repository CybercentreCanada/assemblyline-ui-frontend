import { Avatar, ChipProps, useTheme } from '@material-ui/core';
import { Chip } from 'components/elements/mui/chips';
import React from 'react';

const ALERT_SCORE_MAP = {
  0: {
    avatar: 'NM',
    text: 'Non-malicious',
    color: 'hsl(0 ,0%, 38%)'
  },
  1: {
    avatar: 'S',
    text: 'Safe',
    color: 'hsl(120, 100%, 25%)'
  },
  2: {
    avatar: 'SP',
    text: 'Suspicious',
    color: 'hsl(234, 100%, 61%)'
  },
  3: {
    avatar: 'HS',
    text: 'Highly Suspicous',
    color: 'hsl(39, 100%, 50%)'
  },
  4: {
    avatar: 'ML',
    text: 'Malicious',
    color: 'hsl(0, 100%, 50%)'
  }
};

type AlertScoreProps = ChipProps & {
  withText?: boolean;
  score: number;
};

const AlertScore: React.FC<AlertScoreProps> = props => {
  const { withText = true, score, ...chipProps } = props;
  const theme = useTheme();

  let scoreKey = null;
  if (score >= 2000) {
    scoreKey = 4;
  } else if (score >= 500) {
    scoreKey = 3;
  } else if (score >= 100) {
    scoreKey = 2;
  } else if (score < 0) {
    scoreKey = 1;
  } else {
    scoreKey = 0;
  }

  const { text, color, avatar } = ALERT_SCORE_MAP[scoreKey];

  return (
    <Chip
      {...chipProps}
      label={withText ? text : ''}
      avatar={
        <Avatar style={{ backgroundColor: color, color: theme.palette.getContrastText(color) }}>
          {withText ? ' ' : avatar}
        </Avatar>
      }
      style={{ backgroundColor: 'transparent' }}
    />
  );
};

export default AlertScore;
