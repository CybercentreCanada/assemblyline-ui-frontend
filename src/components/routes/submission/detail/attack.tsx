import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import { Collapse, Divider, Grid, Skeleton, Typography, useTheme } from '@mui/material';
import makeStyles from '@mui/styles/makeStyles';
import useHighlighter from 'components/hooks/useHighlighter';
import { AttackMatrix } from 'components/models/ui/file';
import Attack from 'components/visual/Attack';
import React from 'react';
import { useTranslation } from 'react-i18next';

const useStyles = makeStyles(theme => ({
  title: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    cursor: 'pointer',
    '&:hover, &:focus': {
      color: theme.palette.text.secondary
    }
  }
}));

type AttackSectionProps = {
  attack_matrix: AttackMatrix;
  force?: boolean;
};

const WrappedAttackSection: React.FC<AttackSectionProps> = ({ attack_matrix, force = false }) => {
  const { t } = useTranslation(['submissionDetail']);
  const [open, setOpen] = React.useState(true);
  const theme = useTheme();
  const classes = useStyles();
  const sp2 = theme.spacing(2);
  const { getKey } = useHighlighter();

  return !attack_matrix || Object.keys(attack_matrix).length !== 0 ? (
    <div style={{ paddingTop: sp2 }}>
      <Typography
        variant="h6"
        onClick={() => {
          setOpen(!open);
        }}
        className={classes.title}
      >
        <span>{t('attack_matrix')}</span>
        {open ? <ExpandLess /> : <ExpandMore />}
      </Typography>
      <Divider />
      <Collapse in={open} timeout="auto">
        <div style={{ paddingBottom: sp2, paddingTop: sp2 }}>
          {attack_matrix
            ? Object.keys(attack_matrix).map((cat, i) => (
                <Grid container key={i}>
                  <Grid item xs={12} sm={3} lg={2}>
                    <span style={{ fontWeight: 500, textTransform: 'capitalize' }}>{cat.replace(/-/g, ' ')}</span>
                  </Grid>
                  <Grid item xs={12} sm={9} lg={10}>
                    {attack_matrix[cat].map(([cid, name, lvl], idx) => (
                      <Attack
                        key={`${cid}_${idx}`}
                        text={name}
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
