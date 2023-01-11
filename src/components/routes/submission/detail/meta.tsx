import { Button, Collapse, Divider, Grid, Typography, useTheme } from '@mui/material';
import makeStyles from '@mui/styles/makeStyles';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import { Skeleton } from '@mui/material';
import useALContext from 'components/hooks/useALContext';
import React from 'react';
import { useTranslation } from 'react-i18next';

const useStyles = makeStyles(theme => ({
  title: {
    cursor: 'pointer',
    '&:hover, &:focus': {
      color: theme.palette.text.secondary
    },
    flexGrow: 1
  },
  meta_key: {
    overflowX: 'hidden',
    whiteSpace: 'nowrap',
    textOverflow: 'ellipsis'
  },
  alert: {
    '@media print': {
      backgroundColor: '#00000005',
      border: '1px solid #DDD',
      color: '#888'
    },
    backgroundColor: theme.palette.mode === 'dark' ? '#ffffff05' : '#00000005',
    border: `1px solid ${theme.palette.divider}`,
    borderRadius: '4px',
    color: theme.palette.text.secondary,
    margin: '0.25rem 0',
    padding: '16px 8px',
    textAlign: 'center',
    whiteSpace: 'pre-wrap'
  }
}));

type MetaSectionProps = {
  metadata: any;
};

const WrappedMetaSection: React.FC<MetaSectionProps> = ({ metadata }) => {
  const { t } = useTranslation(['submissionDetail']);
  const [open, setOpen] = React.useState(true);
  const theme = useTheme();
  const classes = useStyles();
  const { configuration } = useALContext();
  const [metaOpen, setMetaOpen] = React.useState(false);

  return !metadata || Object.keys(metadata).length !== 0 ? (
    <div style={{ paddingBottom: theme.spacing(2), paddingTop: theme.spacing(2) }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-end',
          justifyContent: 'space-between'
        }}
      >
        <Typography
          variant="h6"
          onClick={() => {
            setOpen(!open);
          }}
          className={classes.title}
        >
          {t('metadata')}
        </Typography>
        {metadata &&
          Object.keys(metadata).filter(k => configuration.ui.alerting_meta.important.indexOf(k) === -1).length !==
            0 && (
            <Button size="small" onClick={() => setMetaOpen(!metaOpen)} style={{ color: theme.palette.text.secondary }}>
              {!metaOpen ? (
                <>
                  {t('meta.more')}
                  <KeyboardArrowDownIcon style={{ marginLeft: theme.spacing(1) }} />
                </>
              ) : (
                <>
                  {t('meta.less')}
                  <KeyboardArrowUpIcon style={{ marginLeft: theme.spacing(1) }} />
                </>
              )}
            </Button>
          )}
      </div>
      <Divider />
      <Collapse in={open} timeout="auto">
        <div style={{ paddingBottom: theme.spacing(2), paddingTop: theme.spacing(2) }}>
          {metadata ? (
            Object.keys(metadata).filter(k => configuration.ui.alerting_meta.important.indexOf(k) !== -1).length !==
            0 ? (
              Object.keys(metadata)
                .filter(k => configuration.ui.alerting_meta.important.indexOf(k) !== -1)
                .map((meta, i) => (
                  <Grid container key={i}>
                    <Grid className={classes.meta_key} item xs={12} sm={3} lg={2}>
                      <span style={{ fontWeight: 500 }}>{meta}</span>
                    </Grid>
                    <Grid item xs={12} sm={9} lg={10} style={{ wordBreak: 'break-word' }}>
                      {metadata[meta]}
                    </Grid>
                  </Grid>
                ))
            ) : (
              <Collapse in={!metaOpen} timeout="auto">
                <pre className={classes.alert}>{t('meta.empty')}</pre>
              </Collapse>
            )
          ) : (
            [...Array(3)].map((_, i) => (
              <Grid container key={i} spacing={1}>
                <Grid item xs={12} sm={3} lg={2}>
                  <Skeleton style={{ height: '2rem' }} />
                </Grid>
                <Grid item xs={12} sm={9} lg={10}>
                  <Skeleton style={{ height: '2rem' }} />
                </Grid>
              </Grid>
            ))
          )}
          {metadata &&
            Object.keys(metadata).filter(k => configuration.ui.alerting_meta.important.indexOf(k) === -1).length !==
              0 && (
              <Collapse in={metaOpen} timeout="auto">
                {Object.keys(metadata)
                  .filter(k => configuration.ui.alerting_meta.important.indexOf(k) === -1)
                  .map((meta, i) => (
                    <Grid container key={i}>
                      <Grid className={classes.meta_key} item xs={12} sm={3} lg={2}>
                        <span style={{ fontWeight: 500 }}>{meta}</span>
                      </Grid>
                      <Grid item xs={12} sm={9} lg={10} style={{ wordBreak: 'break-word' }}>
                        {metadata[meta]}
                      </Grid>
                    </Grid>
                  ))}
              </Collapse>
            )}
        </div>
      </Collapse>
    </div>
  ) : null;
};
const MetaSection = React.memo(WrappedMetaSection);

export default MetaSection;
