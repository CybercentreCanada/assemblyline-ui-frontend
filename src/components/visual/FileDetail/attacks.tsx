import { Collapse, Divider, Grid, Typography, useTheme } from '@mui/material';
import makeStyles from '@mui/styles/makeStyles';
import { Skeleton } from '@mui/material';
import useHighlighter from 'components/hooks/useHighlighter';
import React from 'react';
import { useTranslation } from 'react-i18next';
import Attack from '../Attack';

const useStyles = makeStyles(theme => ({
  title: {
    cursor: 'pointer',
    '&:hover, &:focus': {
      color: theme.palette.text.secondary
    }
  }
}));

type AttackSectionProps = {
  attacks: any;
  force?: boolean;
};

const WrappedAttackSection: React.FC<AttackSectionProps> = ({ attacks, force = false }) => {
  const { t } = useTranslation(['fileDetail']);
  const [open, setOpen] = React.useState(true);
  const theme = useTheme();
  const classes = useStyles();
  const sp2 = theme.spacing(2);
  const { getKey } = useHighlighter();

  return !attacks || Object.keys(attacks).length !== 0 ? (
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
        <div style={{ paddingBottom: sp2, paddingTop: sp2 }}>
          {attacks
            ? Object.keys(attacks).map((cat, i) => (
                <Grid container key={i}>
                  <Grid item xs={12} sm={3} lg={2}>
                    <span style={{ fontWeight: 500, textTransform: 'capitalize' }}>{cat.replace(/-/g, ' ')}</span>
                  </Grid>
                  <Grid item xs={12} sm={9} lg={10}>
                    {attacks[cat].map(([cid, mat, lvl], idx) => (
                      <Attack
                        key={`${cid}_${idx}`}
                        text={mat}
                        lvl={lvl}
                        highlight_key={getKey('attack_pattern', cid)}
                        force={force}
                      />
                    ))}
                  </Grid>
                </Grid>
              ))
            : [...Array(3)].map((_, i) => (
                <Grid container key={i} spacing={1}>
                  <Grid item xs={12} sm={3} lg={2}>
                    <Skeleton style={{ height: '2rem' }} />
                  </Grid>
                  <Grid item xs={12} sm={9} lg={10}>
                    <Skeleton style={{ height: '2rem' }} />
                  </Grid>
                </Grid>
              ))}
        </div>
      </Collapse>
    </div>
  ) : null;
};

const AttackSection = React.memo(WrappedAttackSection);
export default AttackSection;
