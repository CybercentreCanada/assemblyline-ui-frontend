import { Tooltip, useTheme } from '@mui/material';
import { SubmissionVerdict } from 'components/models/base/alert';
import React from 'react';
import { useTranslation } from 'react-i18next';

type Props = {
  verdicts: SubmissionVerdict;
  width?: string;
};

const VerdictBar: React.FC<Props> = ({ verdicts, width = '100%' }) => {
  const { t } = useTranslation();
  const theme = useTheme();

  return (
    <Tooltip
      title={`${t('verdict.malicious')}: ${verdicts.malicious.length} / ${t('verdict.non_malicious')}: ${
        verdicts.non_malicious.length
      }`}
    >
      <svg height="15" width={width}>
        <rect height="15" width="100%" style={{ fill: 'transparent', stroke: theme.palette.divider }} />
        <rect
          y="1"
          height="13"
          fill={theme.palette.error.main}
          x={`${50 - verdicts.malicious.length * 5}%`}
          width={`${verdicts.malicious.length * 5}%`}
        />
        <rect
          x="50%"
          y="1"
          height="13"
          fill={theme.palette.success.main}
          width={`${verdicts.non_malicious.length * 5}%`}
        />
        <rect x="49.5%" y="1" height="13" width="1%" fill={theme.palette.divider} />
      </svg>
    </Tooltip>
  );
};
export default VerdictBar;
