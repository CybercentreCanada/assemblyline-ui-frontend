import { Divider, Skeleton, styled, Typography, useTheme } from '@mui/material';
import type { SubmissionReport, TAttackMatrix } from 'components/models/ui/submission_report';
import TextVerdict from 'components/visual/TextVerdict';
import React from 'react';
import { useTranslation } from 'react-i18next';

const AttackBloc = styled('div')(({ theme }) => ({
  height: '100%',
  width: '100%',
  display: 'inline-block',
  pageBreakInside: 'avoid',
  marginBottom: theme.spacing(2)
}));

type AttackMatrixBlockProps = {
  attack: string;
  items: TAttackMatrix;
};

function AttackMatrixBlock({ attack, items }: AttackMatrixBlockProps) {
  return (
    <AttackBloc>
      <span style={{ fontSize: '110%', textTransform: 'capitalize', fontWeight: 600 }}>
        {attack.replace(/-/g, ' ')}
      </span>
      {Object.keys(items).map((cat, idx) =>
        items[cat].h_type === 'safe' ? null : (
          <div key={idx}>
            <TextVerdict verdict={items[cat].h_type} mono />
            <span style={{ verticalAlign: 'middle' }}>{cat}</span>
          </div>
        )
      )}
    </AttackBloc>
  );
}

function AttackMatrixSkel() {
  const theme = useTheme();

  return (
    <AttackBloc>
      <Skeleton style={{ height: '2rem' }} />
      <div style={{ display: 'flex', flexDirection: 'row' }}>
        <Skeleton style={{ height: '2rem', width: '1.5rem', marginRight: theme.spacing(2) }} />
        <Skeleton style={{ height: '2rem', flexGrow: 1 }} />
      </div>
      <div style={{ display: 'flex', flexDirection: 'row' }}>
        <Skeleton style={{ height: '2rem', width: '1.5rem', marginRight: theme.spacing(2) }} />
        <Skeleton style={{ height: '2rem', flexGrow: 1 }} />
      </div>
    </AttackBloc>
  );
}

type AttackProps = {
  report: SubmissionReport;
};

function WrappedAttack({ report }: AttackProps) {
  const { t } = useTranslation(['submissionReport']);
  const theme = useTheme();

  return (
    (!report || Object.keys(report.attack_matrix).length !== 0) && (
      <div style={{ pageBreakInside: 'avoid' }}>
        <div style={{ marginTop: theme.spacing(4), pageBreakAfter: 'avoid', pageBreakInside: 'avoid' }}>
          <Typography variant="h6">{t('attack')}</Typography>
          <Divider
            sx={{
              '@media print': {
                backgroundColor: '#0000001f !important'
              }
            }}
          />
        </div>
        <div
          style={{
            columnWidth: '20rem',
            columnGap: '1rem',
            marginTop: theme.spacing(2),
            marginBottom: theme.spacing(2),
            pageBreakBefore: 'avoid',
            pageBreakInside: 'avoid'
          }}
        >
          {report
            ? Object.keys(report.attack_matrix).map((att, i) => (
                <AttackMatrixBlock key={i} attack={att} items={report.attack_matrix[att]} />
              ))
            : [...Array(5)].map((_, i) => <AttackMatrixSkel key={i} />)}
        </div>
      </div>
    )
  );
}

const Attack = React.memo(WrappedAttack);
export default Attack;
