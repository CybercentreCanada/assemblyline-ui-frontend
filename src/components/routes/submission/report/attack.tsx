import { Divider, Skeleton, Typography, useTheme } from '@mui/material';
import makeStyles from '@mui/styles/makeStyles';
import { TAttackMatrix, TSubmissionReport } from 'components/models/ui/submission_report';
import TextVerdict from 'components/visual/TextVerdict';
import React from 'react';
import { useTranslation } from 'react-i18next';

const useStyles = makeStyles(theme => ({
  attack_bloc: {
    height: '100%',
    width: '100%',
    display: 'inline-block',
    pageBreakInside: 'avoid',
    marginBottom: theme.spacing(2)
  },
  attack_title: {
    fontSize: '110%',
    textTransform: 'capitalize',
    fontWeight: 600
  },
  divider: {
    '@media print': {
      backgroundColor: '#0000001f !important'
    }
  },
  section_title: {
    marginTop: theme.spacing(4),
    pageBreakAfter: 'avoid',
    pageBreakInside: 'avoid'
  },
  section_content: {
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(2),
    pageBreakBefore: 'avoid',
    pageBreakInside: 'avoid'
  },
  section: {
    pageBreakInside: 'avoid'
  }
}));

type AttackMatrixBlockProps = {
  attack: string;
  items: TAttackMatrix;
};

function AttackMatrixBlock({ attack, items }: AttackMatrixBlockProps) {
  const classes = useStyles();
  return (
    <div className={classes.attack_bloc}>
      <span className={classes.attack_title}>{attack.replace(/-/g, ' ')}</span>
      {Object.keys(items).map((cat, idx) =>
        items[cat].h_type === 'safe' ? null : (
          <div key={idx}>
            <TextVerdict verdict={items[cat].h_type} mono />
            <span style={{ verticalAlign: 'middle' }}>{cat}</span>
          </div>
        )
      )}
    </div>
  );
}

function AttackMatrixSkel() {
  const classes = useStyles();
  const theme = useTheme();
  return (
    <div className={classes.attack_bloc}>
      <Skeleton style={{ height: '2rem' }} />
      <div style={{ display: 'flex', flexDirection: 'row' }}>
        <Skeleton style={{ height: '2rem', width: '1.5rem', marginRight: theme.spacing(2) }} />
        <Skeleton style={{ height: '2rem', flexGrow: 1 }} />
      </div>
      <div style={{ display: 'flex', flexDirection: 'row' }}>
        <Skeleton style={{ height: '2rem', width: '1.5rem', marginRight: theme.spacing(2) }} />
        <Skeleton style={{ height: '2rem', flexGrow: 1 }} />
      </div>
    </div>
  );
}

type AttackProps = {
  report: TSubmissionReport;
};

function WrappedAttack({ report }: AttackProps) {
  const { t } = useTranslation(['submissionReport']);
  const classes = useStyles();

  return (
    (!report || Object.keys(report.attack_matrix).length !== 0) && (
      <div className={classes.section}>
        <div className={classes.section_title}>
          <Typography variant="h6">{t('attack')}</Typography>
          <Divider className={classes.divider} />
        </div>
        <div
          className={classes.section_content}
          style={{
            columnWidth: '20rem',
            columnGap: '1rem'
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
