import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import { Collapse, Divider, Grid, Skeleton, Typography, useMediaQuery, useTheme } from '@mui/material';
import makeStyles from '@mui/styles/makeStyles';
import { bytesToSize } from 'helpers/utils';
import React from 'react';
import { useTranslation } from 'react-i18next';
import ActionableText from '../ActionableText';
import { GraphBody } from '../ResultCard/graph_body';
import { ImageInline } from './image_inline';

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
  promotedSections?: any[];
};

const WrappedIdentificationSection: React.FC<IdentificationSectionProps> = ({ fileinfo, promotedSections = [] }) => {
  const { t } = useTranslation(['fileDetail']);
  const [open, setOpen] = React.useState(true);
  const theme = useTheme();
  const classes = useStyles();
  const sp2 = theme.spacing(2);
  const upMD = useMediaQuery(theme.breakpoints.up('md'));

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
        <div
          style={{
            paddingBottom: sp2,
            paddingTop: sp2,
            display: 'flex',
            alignItems: upMD ? 'start' : 'center',
            flexDirection: upMD ? 'row' : 'column'
          }}
        >
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
                fileinfo?.tlsh ? (
                  <ActionableText
                    category="hash"
                    type="tlsh"
                    value={fileinfo?.tlsh}
                    classification={fileinfo?.classification}
                  />
                ) : (
                  <span style={{ color: theme.palette.text.disabled }}>{t('not_computable')}</span>
                )
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
            <Grid item xs={0} sm={3} lg={2} />
            <Grid item xs={12} sm={9} lg={10}>
              {promotedSections
                ? promotedSections
                    .filter(section => section.promote_to === 'ENTROPY')
                    .map((section, idx) => <GraphBody key={idx} body={section.body} />)
                : null}
            </Grid>
          </Grid>

          <div>
            {promotedSections
              ? promotedSections
                  .filter(section => section.promote_to === 'SCREENSHOT')
                  .map((section, idx) => <ImageInline key={idx} body={section.body} />)
              : null}
          </div>
        </div>
      </Collapse>
    </div>
  );
};

const IdentificationSection = React.memo(WrappedIdentificationSection);
export default IdentificationSection;
