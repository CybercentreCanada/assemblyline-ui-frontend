import { Collapse, Divider, Grid, makeStyles, Typography, useTheme } from '@material-ui/core';
import { Skeleton } from '@material-ui/lab';
import { bytesToSize } from 'helpers/utils';
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

type IdentificationSectionProps = {
  fileinfo: any;
};

const WrappedIdentificationSection: React.FC<IdentificationSectionProps> = ({ fileinfo }) => {
  const { t } = useTranslation(['fileDetail']);
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
        {t('identification')}
      </Typography>
      <Divider />
      <Collapse in={open} timeout="auto">
        {useMemo(
          () => (
            <div style={{ paddingBottom: sp2, paddingTop: sp2 }}>
              <Grid container>
                <Grid item xs={4} sm={3} lg={2}>
                  <span style={{ fontWeight: 500 }}>MD5</span>
                </Grid>
                <Grid
                  item
                  xs={8}
                  sm={9}
                  lg={10}
                  style={{ fontSize: '110%', fontFamily: 'monospace', wordBreak: 'break-word' }}
                >
                  {fileinfo ? fileinfo.md5 : <Skeleton />}
                </Grid>

                <Grid item xs={4} sm={3} lg={2}>
                  <span style={{ fontWeight: 500 }}>SHA1</span>
                </Grid>
                <Grid
                  item
                  xs={8}
                  sm={9}
                  lg={10}
                  style={{ fontSize: '110%', fontFamily: 'monospace', wordBreak: 'break-word' }}
                >
                  {fileinfo ? fileinfo.sha1 : <Skeleton />}
                </Grid>

                <Grid item xs={4} sm={3} lg={2}>
                  <span style={{ fontWeight: 500 }}>SHA256</span>
                </Grid>
                <Grid
                  item
                  xs={8}
                  sm={9}
                  lg={10}
                  style={{ fontSize: '110%', fontFamily: 'monospace', wordBreak: 'break-word' }}
                >
                  {fileinfo ? fileinfo.sha256 : <Skeleton />}
                </Grid>

                <Grid item xs={4} sm={3} lg={2}>
                  <span style={{ fontWeight: 500 }}>SSDEEP</span>
                </Grid>
                <Grid
                  item
                  xs={8}
                  sm={9}
                  lg={10}
                  style={{ fontSize: '110%', fontFamily: 'monospace', wordBreak: 'break-word' }}
                >
                  {fileinfo ? fileinfo.ssdeep : <Skeleton />}
                </Grid>

                <Grid item xs={4} sm={3} lg={2}>
                  <span style={{ fontWeight: 500 }}>{t('size')}</span>
                </Grid>
                <Grid item xs={8} sm={9} lg={10}>
                  {fileinfo ? (
                    <span>
                      {fileinfo.size}
                      <span style={{ fontWeight: 300 }}> ({bytesToSize(fileinfo.size)})</span>
                    </span>
                  ) : (
                    <Skeleton />
                  )}
                </Grid>

                <Grid item xs={4} sm={3} lg={2}>
                  <span style={{ fontWeight: 500 }}>{t('type')}</span>
                </Grid>
                <Grid item xs={8} sm={9} lg={10} style={{ wordBreak: 'break-word' }}>
                  {fileinfo ? fileinfo.type : <Skeleton />}
                </Grid>

                <Grid item xs={4} sm={3} lg={2}>
                  <span style={{ fontWeight: 500 }}>{t('mime')}</span>
                </Grid>
                <Grid item xs={8} sm={9} lg={10} style={{ wordBreak: 'break-word' }}>
                  {fileinfo ? fileinfo.mime : <Skeleton />}
                </Grid>

                <Grid item xs={4} sm={3} lg={2}>
                  <span style={{ fontWeight: 500 }}>{t('magic')}</span>
                </Grid>
                <Grid item xs={8} sm={9} lg={10} style={{ wordBreak: 'break-word' }}>
                  {fileinfo ? fileinfo.magic : <Skeleton />}
                </Grid>

                <Grid item xs={4} sm={3} lg={2}>
                  <span style={{ fontWeight: 500 }}>{t('entropy')}</span>
                </Grid>
                <Grid item xs={8} sm={9} lg={10}>
                  {fileinfo ? fileinfo.entropy : <Skeleton />}
                </Grid>
              </Grid>
            </div>
          ),
          // eslint-disable-next-line react-hooks/exhaustive-deps
          [fileinfo]
        )}
      </Collapse>
    </div>
  );
};

const IdentificationSection = React.memo(WrappedIdentificationSection);
export default IdentificationSection;
