import {
  Card,
  Collapse,
  Divider,
  Drawer,
  Grid,
  IconButton,
  makeStyles,
  Tooltip,
  Typography,
  useTheme
} from '@material-ui/core';
import AddCircleOutlineOutlinedIcon from '@material-ui/icons/AddCircleOutlineOutlined';
import CloseOutlinedIcon from '@material-ui/icons/CloseOutlined';
import { Skeleton } from '@material-ui/lab';
import PageCenter from 'commons/components/layout/pages/PageCenter';
import useMyAPI from 'components/hooks/useMyAPI';
import Classification from 'components/visual/Classification';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

const useStyles = makeStyles(theme => ({
  card: {
    backgroundColor: theme.palette.type === 'dark' ? '#ffffff05' : '#00000005',
    border: `1px solid ${theme.palette.divider}`,
    borderRadius: '4px',
    padding: '8px',
    margin: '0.25rem 0',
    overflow: 'auto',
    wordBreak: 'break-word',
    '&:hover': {
      backgroundColor: theme.palette.type === 'dark' ? '#ffffff15' : '#00000015',
      cursor: 'pointer'
    }
  },
  drawerPaper: {
    width: '80%',
    maxWidth: '800px',
    [theme.breakpoints.down('sm')]: {
      width: '100%'
    }
  },
  label: {
    fontWeight: 600
  },
  mono: {
    fontSize: 'larger',
    fontFamily: 'monospace'
  },
  searchresult: {
    fontStyle: 'italic',
    paddingTop: theme.spacing(0.5),
    display: 'flex',
    flexWrap: 'wrap'
  },
  title: {
    cursor: 'pointer',
    '&:hover, &:focus': {
      color: theme.palette.text.secondary
    }
  },
  uri: {
    fontSize: 'large',
    fontFamily: 'monospace',
    paddingBottom: theme.spacing(2)
  }
}));

const SourceCard = ({ source, onClick }) => {
  const { t } = useTranslation(['manageSignatureSources']);
  const theme = useTheme();
  const classes = useStyles();

  return (
    <div style={{ paddingTop: theme.spacing(1) }}>
      <Card className={classes.card} onClick={onClick}>
        <div className={classes.uri}>{source.uri}</div>
        <table style={{ borderSpacing: 0 }}>
          <tbody>
            <tr>
              <td className={classes.label}>{`${t('filename')}:`}&nbsp;</td>
              <td className={classes.mono}>{source.name}&nbsp;</td>
            </tr>
            {source.command && (
              <tr>
                <td className={classes.label}>{`${t('command')}:`}&nbsp;</td>
                <td className={classes.mono}>{source.command}</td>
              </tr>
            )}
            {source.pattern && (
              <tr>
                <td className={classes.label}>{`${t('pattern')}:`}&nbsp;</td>
                <td className={classes.mono}>{source.pattern}</td>
              </tr>
            )}
            {source.username && (
              <tr>
                <td className={classes.label}>{`${t('username')}:`}&nbsp;</td>
                <td className={classes.mono}>{source.username}</td>
              </tr>
            )}
            {source.password && (
              <tr>
                <td className={classes.label}>{`${t('password')}:`}&nbsp;</td>
                <td className={classes.mono}>******</td>
              </tr>
            )}
            <tr>
              <td className={classes.label}>{`${t('classification')}:`}&nbsp;</td>
              <td>
                <Classification type="text" c12n={source.default_classification} />
              </td>
            </tr>
          </tbody>
        </table>
        {source.private_key && (
          <div className={classes.label}>
            <label>{`${t('private_key')}`}</label>
          </div>
        )}
        {source.headers && (
          <div>
            <div className={classes.label}>{`${t('headers')}:`}&nbsp;</div>
            {source.headers.map((item, id) => {
              return (
                <div key={id} className={classes.mono} style={{ paddingLeft: '2rem' }}>
                  {`${item.name}: ${item.value}`}
                </div>
              );
            })}
          </div>
        )}
      </Card>
    </div>
  );
};

const SourceDetail = ({ service, sources }) => {
  const { t } = useTranslation(['manageSignatureSources']);
  const [open, setOpen] = React.useState(true);
  const theme = useTheme();
  const [drawer, setDrawer] = useState(false);
  const [editSource, setEditSource] = useState(null);
  const classes = useStyles();

  const closeDrawer = () => {
    setDrawer(false);
  };

  return (
    <div style={{ paddingTop: theme.spacing(2) }}>
      <Drawer anchor="right" classes={{ paper: classes.drawerPaper }} open={drawer} onClose={closeDrawer}>
        <div id="drawerTop" style={{ padding: theme.spacing(1) }}>
          <IconButton onClick={closeDrawer}>
            <CloseOutlinedIcon />
          </IconButton>
        </div>
        <div style={{ paddingLeft: theme.spacing(2), paddingRight: theme.spacing(2) }}>
          {JSON.stringify(editSource)}
        </div>
      </Drawer>
      <Grid container>
        <Grid item xs={10} style={{ alignSelf: 'center' }}>
          <Typography
            variant="h6"
            className={classes.title}
            onClick={() => {
              setOpen(!open);
            }}
          >
            {service}
          </Typography>
        </Grid>
        <Grid item xs={2} style={{ textAlign: 'right' }}>
          <Tooltip title={t('add_source')}>
            <IconButton
              style={{ color: theme.palette.action.active, margin: '-4px 0' }}
              onClick={() => {
                setEditSource(null);
                setDrawer(true);
              }}
            >
              <AddCircleOutlineOutlinedIcon />
            </IconButton>
          </Tooltip>
        </Grid>
      </Grid>
      <Divider />
      <Collapse in={open} timeout="auto">
        <div>
          {sources.length !== 0 ? (
            sources.map((source, id) => {
              return (
                <SourceCard
                  key={id}
                  source={source}
                  onClick={() => {
                    setEditSource(source);
                    setDrawer(true);
                  }}
                />
              );
            })
          ) : (
            <div>{t('no_sources')}</div>
          )}
        </div>
      </Collapse>
    </div>
  );
};

export default function SignatureSources() {
  const { t } = useTranslation(['manageSignatureSources']);
  const theme = useTheme();
  const [sources, setSources] = useState(null);
  const apiCall = useMyAPI();

  useEffect(() => {
    apiCall({
      url: '/api/v4/signature/sources/',
      onSuccess: api_data => {
        setSources(api_data.api_response);
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <PageCenter margin={4} width="100%">
      <div style={{ textAlign: 'left' }}>
        <div style={{ paddingBottom: theme.spacing(2) }}>
          <Typography variant="h4">{t('title')}</Typography>
          <Typography variant="caption">
            {sources ? `${Object.keys(sources).length} ${t('caption')}` : <Skeleton />}
          </Typography>
        </div>

        {sources
          ? Object.keys(sources).map((key, id) => {
              return <SourceDetail key={id} service={key} sources={sources[key]} />;
            })
          : [...Array(2)].map((item, i) => {
              return (
                <div key={i} style={{ marginTop: theme.spacing(2) }}>
                  <Typography variant="h6" style={{ marginTop: theme.spacing(0.5), marginBottom: theme.spacing(0.5) }}>
                    <Skeleton />
                  </Typography>
                  <Divider />
                  <Skeleton variant="rect" height="6rem" style={{ marginTop: theme.spacing(2), borderRadius: '4px' }} />
                </div>
              );
            })}
      </div>
    </PageCenter>
  );
}
