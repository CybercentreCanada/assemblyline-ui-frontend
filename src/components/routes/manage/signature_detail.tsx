import { Grid, IconButton, makeStyles, Paper, Tooltip, Typography, useTheme } from '@material-ui/core';
import ClearOutlinedIcon from '@material-ui/icons/ClearOutlined';
import YoutubeSearchedForIcon from '@material-ui/icons/YoutubeSearchedFor';
import { Skeleton } from '@material-ui/lab';
import PageCenter from 'commons/components/layout/pages/PageCenter';
import useMyAPI from 'components/hooks/useMyAPI';
import Classification from 'components/visual/Classification';
import SignatureStatus from 'components/visual/SignatureStatus';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useParams } from 'react-router-dom';

export type Signature = {
  classification: string;
  data: string;
  last_modified: string;
  name: string;
  order: number;
  revision: string;
  signature_id: string;
  source: string;
  state_change_data: string;
  state_change_user: string;
  status: 'DEPLOYED' | 'NOISY' | 'DISALBED';
  type: string;
};

type ParamProps = {
  id: string;
};

const useStyles = makeStyles(theme => ({
  preview: {
    padding: theme.spacing(2),
    whiteSpace: 'pre-wrap',
    wordBreak: 'break-word'
  }
}));

export default function SignatureDetail() {
  const { t } = useTranslation(['manageSignatureDetail']);
  const { id } = useParams<ParamProps>();
  const theme = useTheme();
  const [signature, setSignature] = useState<Signature>(null);
  const apiCall = useMyAPI();
  const classes = useStyles();

  useEffect(() => {
    apiCall({
      url: `/api/v4/signature/${id}/`,
      onSuccess: api_data => {
        setSignature(api_data.api_response);
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  return (
    <PageCenter margin={4}>
      <div style={{ paddingBottom: theme.spacing(4), paddingTop: theme.spacing(2) }}>
        <Classification size="tiny" c12n={signature ? signature.classification : null} />
      </div>
      <div style={{ textAlign: 'left' }}>
        <Grid container alignItems="center">
          <Grid item xs>
            <Typography variant="h4">{t('title')}</Typography>
            <Typography variant="caption">
              {signature ? (
                `${signature.type}_${signature.source}_${signature.signature_id}`
              ) : (
                <Skeleton style={{ width: '10rem' }} />
              )}
            </Typography>
          </Grid>
          <Grid item xs style={{ textAlign: 'right', flexGrow: 0 }}>
            {signature ? (
              <>
                <div style={{ display: 'flex', marginBottom: theme.spacing(1) }}>
                  <Tooltip title={t('usage')}>
                    <IconButton
                      component={Link}
                      style={{ color: theme.palette.action.active }}
                      to={`/search/result/?query=result.sections.tags.file.rule.suricata:"${signature.source}.${signature.name}"`}
                    >
                      <YoutubeSearchedForIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title={t('remove')}>
                    <IconButton style={{ color: theme.palette.action.active }} onClick={() => console.log('remove!')}>
                      <ClearOutlinedIcon />
                    </IconButton>
                  </Tooltip>
                </div>
                <SignatureStatus status={signature.status} />
              </>
            ) : (
              <>
                <div style={{ display: 'flex' }}>
                  <Skeleton variant="circle" height="2.5rem" width="2.5rem" style={{ margin: theme.spacing(0.5) }} />
                  <Skeleton variant="circle" height="2.5rem" width="2.5rem" style={{ margin: theme.spacing(0.5) }} />
                </div>
                <Skeleton
                  variant="rect"
                  height="1rem"
                  width="6rem"
                  style={{
                    marginBottom: theme.spacing(1),
                    marginTop: theme.spacing(1),
                    borderRadius: theme.spacing(1)
                  }}
                />
              </>
            )}
          </Grid>
        </Grid>
        {signature ? (
          <Paper component="pre" variant="outlined" className={classes.preview}>
            {signature.data}
          </Paper>
        ) : (
          <Skeleton variant="rect" height="6rem" />
        )}
      </div>
    </PageCenter>
  );
}
