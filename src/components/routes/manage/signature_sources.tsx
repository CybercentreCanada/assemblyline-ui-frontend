import { Drawer, Grid, IconButton, makeStyles, Tooltip, Typography, useTheme } from '@material-ui/core';
import AddCircleOutlineOutlinedIcon from '@material-ui/icons/AddCircleOutlineOutlined';
import CloseOutlinedIcon from '@material-ui/icons/CloseOutlined';
import { Skeleton } from '@material-ui/lab';
import PageCenter from 'commons/components/layout/pages/PageCenter';
import useMyAPI from 'components/hooks/useMyAPI';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

const useStyles = makeStyles(theme => ({
  searchresult: {
    fontStyle: 'italic',
    paddingTop: theme.spacing(0.5),
    display: 'flex',
    flexWrap: 'wrap'
  },
  drawerPaper: {
    width: '80%',
    maxWidth: '800px',
    [theme.breakpoints.down('sm')]: {
      width: '100%'
    }
  }
}));

export default function SignatureSources() {
  const { t } = useTranslation(['manageSignatureSources']);
  const theme = useTheme();
  const classes = useStyles();
  const [sources, setSources] = useState(null);
  const [drawer, setDrawer] = useState(false);
  const apiCall = useMyAPI();

  const closeDrawer = () => {
    setDrawer(false);
  };

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
      <Drawer anchor="right" classes={{ paper: classes.drawerPaper }} open={drawer} onClose={closeDrawer}>
        <div id="drawerTop" style={{ padding: theme.spacing(1) }}>
          <IconButton onClick={closeDrawer}>
            <CloseOutlinedIcon />
          </IconButton>
        </div>
        <div style={{ paddingLeft: theme.spacing(2), paddingRight: theme.spacing(2) }}>
          <Skeleton />
        </div>
      </Drawer>

      <div style={{ textAlign: 'left' }}>
        <div style={{ paddingBottom: theme.spacing(2) }}>
          <Grid container alignItems="center">
            <Grid item xs sm={8}>
              <Typography variant="h4">{t('title')}</Typography>
              <Typography variant="caption">
                {sources ? `${Object.keys(sources).length} ${t('caption')}` : <Skeleton />}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={4} style={{ textAlign: 'right' }}>
              <Tooltip title={t('add_source')}>
                <IconButton
                  style={{ color: theme.palette.action.active }}
                  onClick={() => {
                    setDrawer(true);
                  }}
                >
                  <AddCircleOutlineOutlinedIcon />
                </IconButton>
              </Tooltip>
            </Grid>
          </Grid>
        </div>
      </div>
    </PageCenter>
  );
}
