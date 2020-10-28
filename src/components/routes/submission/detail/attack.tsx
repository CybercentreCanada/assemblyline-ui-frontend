import { Collapse, Divider, Grid, makeStyles, Typography, useTheme } from '@material-ui/core';
import { Skeleton } from '@material-ui/lab';
import Attack from 'components/visual/Attack';
import React, { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

const useStyles = makeStyles(theme => ({
  title: {
    cursor: 'pointer',
    '&:hover, &:focus': {
      color: theme.palette.text.secondary
    }
  }
}));

type AttackSectionProps = {
  attack_matrix: any;
  isHighlighted: (key: string) => boolean;
  triggerHighlight: (key: string) => void;
  getKey: (type: string, value: string) => string;
};

const WrappedAttackSection: React.FC<AttackSectionProps> = ({
  attack_matrix,
  isHighlighted,
  triggerHighlight,
  getKey
}) => {
  const { t } = useTranslation(['submissionDetail']);
  const [open, setOpen] = React.useState(true);
  const theme = useTheme();
  const classes = useStyles();
  const sp2 = theme.spacing(2);

  const trigger = useCallback(
    event => {
      triggerHighlight(event.currentTarget.dataset.triggerkey);
    },
    [triggerHighlight]
  );

  return (
    <div style={{ paddingBottom: sp2, paddingTop: sp2 }}>
      <Typography
        variant="h6"
        onClick={() => {
          setOpen(!open);
        }}
        className={classes.title}
      >
        {t('attack_matrix')}
      </Typography>
      <Divider />
      <Collapse in={open} timeout="auto">
        {useMemo(
          () => (
            <div style={{ paddingBottom: sp2, paddingTop: sp2 }}>
              {attack_matrix
                ? Object.keys(attack_matrix).map((cat, i) => {
                    return (
                      <Grid container key={i}>
                        <Grid item xs={12} sm={3} lg={2}>
                          <span style={{ fontWeight: 500, textTransform: 'capitalize' }}>{cat.replace(/-/g, ' ')}</span>
                        </Grid>
                        <Grid item xs={12} sm={9} lg={10}>
                          {attack_matrix[cat].map(([cid, name, lvl], idx) => {
                            const key = getKey('attack_pattern', cid);
                            return (
                              <Attack
                                key={`${cid}_${idx}`}
                                triggerkey={key}
                                text={name}
                                lvl={lvl}
                                highlighted={isHighlighted(key)}
                                onClick={trigger}
                              />
                            );
                          })}
                        </Grid>
                      </Grid>
                    );
                  })
                : [...Array(3)].map((_, i) => {
                    return (
                      <Grid container key={i} spacing={1}>
                        <Grid item xs={12} sm={3} lg={2}>
                          <Skeleton style={{ height: '2rem' }} />
                        </Grid>
                        <Grid item xs={12} sm={9} lg={10}>
                          <Skeleton style={{ height: '2rem' }} />
                        </Grid>
                      </Grid>
                    );
                  })}
            </div>
          ),
          // eslint-disable-next-line react-hooks/exhaustive-deps
          [attack_matrix, getKey, isHighlighted, trigger]
        )}
      </Collapse>
    </div>
  );
};
const AttackSection = React.memo(WrappedAttackSection);

export default AttackSection;
