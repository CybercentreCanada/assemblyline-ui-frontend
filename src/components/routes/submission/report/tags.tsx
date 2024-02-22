import { Divider, Grid, Typography, useTheme } from '@mui/material';
import makeStyles from '@mui/styles/makeStyles';
import { TSubmissionReport } from 'components/models/ui/submission_report';
import TextVerdict from 'components/visual/TextVerdict';
import React from 'react';
import { useTranslation } from 'react-i18next';

const useStyles = makeStyles(theme => ({
  tag_type: {
    fontSize: '110%',
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

type TagTableProps = {
  group: string;
  items: boolean;
};

function TagTable({ group, items }: TagTableProps) {
  const { t } = useTranslation(['submissionReport']);
  const theme = useTheme();
  const orderedItems = {};
  const classes = useStyles();

  Object.keys(items).map(tagType =>
    Object.keys(items[tagType]).map(tagValue => {
      const key = `${items[tagType][tagValue].h_type}_${tagType}`;
      if (!Object.hasOwnProperty.call(orderedItems, key)) {
        orderedItems[key] = { verdict: items[tagType][tagValue].h_type, type: tagType, values: [] };
      }
      orderedItems[key].values.push(tagValue);
      return null;
    })
  );

  return Object.keys(orderedItems).length !== 0 ? (
    <div className={classes.section}>
      <div className={classes.section_title}>
        <Typography variant="h6">{t(`tag.${group}`)}</Typography>
        <Divider className={classes.divider} />
      </div>
      <div className={classes.section_content}>
        <Grid container spacing={0.5}>
          {Object.keys(orderedItems).map((k, idx) => (
            <Grid
              key={idx}
              item
              xs={12}
              style={{
                marginBottom: theme.spacing(2)
              }}
            >
              <div style={{ display: 'flex', gap: theme.spacing(0.5) }}>
                <TextVerdict verdict={orderedItems[k].verdict} mono />
                <span className={classes.tag_type}>{t(orderedItems[k].type)}</span>
              </div>

              <div
                style={{ marginLeft: theme.spacing(3.5), display: 'flex', flexWrap: 'wrap', gap: theme.spacing(1.5) }}
              >
                {orderedItems[k].values.map((v, vidx) => (
                  <div
                    key={vidx}
                    style={{
                      minWidth: '18rem',
                      marginBottom: theme.spacing(0.5),
                      wordBreak: 'break-word'
                    }}
                  >
                    {v}
                  </div>
                ))}
              </div>
            </Grid>
          ))}
        </Grid>
      </div>
    </div>
  ) : null;
}

type Props = {
  report: TSubmissionReport;
};

function WrappedTags({ report }: Props) {
  return (
    report && (
      <>
        {Object.keys(report.tags).length !== 0 &&
          Object.keys(report.tags).map((tagGroup, groupIdx) => (
            <TagTable key={groupIdx} group={tagGroup} items={report.tags[tagGroup]} />
          ))}
      </>
    )
  );
}

const Tags = React.memo(WrappedTags);
export default Tags;
