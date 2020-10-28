import { Collapse, Divider, Grid, makeStyles, Typography, useTheme } from '@material-ui/core';
import { Skeleton } from '@material-ui/lab';
import Heuristic from 'components/visual/Heuristic';
import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

const useStyles = makeStyles(theme => ({
  title: {
    cursor: 'pointer',
    '&:hover, &:focus': {
      color: theme.palette.text.secondary
    }
  }
}));

type HeuristicSectionProps = {
  heuristics: any;
  isHighlighted: (key: string) => boolean;
  triggerHighlight: (key: string) => void;
  getKey: (type: string, value: string) => string;
};

const WrappedHeuristicSection: React.FC<HeuristicSectionProps> = ({
  heuristics,
  isHighlighted,
  triggerHighlight,
  getKey
}) => {
  const { t } = useTranslation(['submissionDetail']);
  const [open, setOpen] = React.useState(true);
  const theme = useTheme();
  const classes = useStyles();
  const sp2 = theme.spacing(2);
  return (
    <div style={{ paddingBottom: sp2, paddingTop: sp2 }}>
      <Typography
        variant="h6"
        onClick={() => {
          setOpen(!open);
        }}
        className={classes.title}
      >
        {t('heuristics')}
      </Typography>
      <Divider />
      <Collapse in={open} timeout="auto">
        {useMemo(
          () => (
            <div style={{ paddingBottom: sp2, paddingTop: sp2 }}>
              {heuristics
                ? Object.keys(heuristics).map((lvl, i) => {
                    return (
                      <Grid container key={i}>
                        <Grid item xs={12} sm={3} lg={2}>
                          <span style={{ fontWeight: 500, wordBreak: 'break-word' }}>{t(`verdict.${lvl}`)}</span>
                        </Grid>
                        <Grid item xs={12} sm={9} lg={10}>
                          {heuristics[lvl].map(([cid, name], idx) => {
                            const key = getKey('heuristic', cid);
                            return (
                              <Heuristic
                                key={`${cid}_${idx}`}
                                text={name}
                                lvl={lvl}
                                highlighted={isHighlighted(key)}
                                onClick={() => triggerHighlight(key)}
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
          [getKey, isHighlighted, heuristics, triggerHighlight]
        )}
      </Collapse>
    </div>
  );
};
const HeuristicSection = React.memo(WrappedHeuristicSection);

export default HeuristicSection;
