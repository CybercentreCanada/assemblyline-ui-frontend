import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import { Collapse, Divider, Grid, Skeleton, Typography, useTheme } from '@mui/material';
import makeStyles from '@mui/styles/makeStyles';
import { bytesToSize } from 'helpers/utils';
import React from 'react';
import { useTranslation } from 'react-i18next';
import ActionableText from '../ActionableText';

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
        <span>{t('identification')}</span>
        {open ? <ExpandLess /> : <ExpandMore />}
      </Typography>
      <Divider />
      <Collapse in={open} timeout="auto">
        <div style={{ paddingBottom: sp2, paddingTop: sp2 }}>
          <Grid container>
            <Grid item xs={4} sm={3} lg={2}>
              <span style={{ fontWeight: 500, marginRight: theme.spacing(0.5), display: 'flex' }}>MD5</span>
            </Grid>
            <Grid item xs={8} sm={9} lg={10} style={{ fontFamily: 'monospace', wordBreak: 'break-word' }}>
              <ActionableText
                category="hash"
                type="md5"
                value={fileinfo?.md5}
                classification={fileinfo?.classification}
              />
            </Grid>

            <Grid item xs={4} sm={3} lg={2}>
              <span style={{ fontWeight: 500, marginRight: theme.spacing(0.5), display: 'flex' }}>SHA1</span>
            </Grid>
            <Grid item xs={8} sm={9} lg={10} style={{ fontFamily: 'monospace', wordBreak: 'break-word' }}>
              <ActionableText
                category="hash"
                type="sha1"
                value={fileinfo?.sha1}
                classification={fileinfo?.classification}
              />
            </Grid>

            <Grid item xs={4} sm={3} lg={2}>
              <span style={{ fontWeight: 500, marginRight: theme.spacing(0.5), display: 'flex' }}>SHA256</span>
            </Grid>
            <Grid item xs={8} sm={9} lg={10} style={{ fontFamily: 'monospace', wordBreak: 'break-word' }}>
              <ActionableText
                category="hash"
                type="sha256"
                value={fileinfo?.sha256}
                classification={fileinfo?.classification}
              />
            </Grid>

            <Grid item xs={4} sm={3} lg={2}>
              <span style={{ fontWeight: 500, marginRight: theme.spacing(0.5), display: 'flex' }}>SSDEEP</span>
            </Grid>
            <Grid item xs={8} sm={9} lg={10} style={{ fontFamily: 'monospace', wordBreak: 'break-word' }}>
              <ActionableText
                category="hash"
                type="ssdeep"
                value={fileinfo?.ssdeep}
                classification={fileinfo?.classification}
              />
            </Grid>

            <Grid item xs={4} sm={3} lg={2}>
              <span style={{ fontWeight: 500 }}>TLSH</span>
            </Grid>
            <Grid item xs={8} sm={9} lg={10} style={{ fontFamily: 'monospace', wordBreak: 'break-word' }}>
              {fileinfo ? (
                (
                  <ActionableText
                    category="hash"
                    type="tlsh"
                    value={fileinfo?.tlsh}
                    classification={fileinfo?.classification}
                  />
                ) || <span style={{ color: theme.palette.text.disabled }}>{t('not_available')}</span>
              ) : (
                <Skeleton />
              )}
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
      </Collapse>
    </div>
  );
};

const IdentificationSection = React.memo(WrappedIdentificationSection);
export default IdentificationSection;
