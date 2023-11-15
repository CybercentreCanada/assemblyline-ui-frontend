import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import { Collapse, Divider, Grid, Skeleton, Typography, useMediaQuery, useTheme } from '@mui/material';
import makeStyles from '@mui/styles/makeStyles';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { ImageInlineBody } from '../image_inline';

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

type URIIdentificationSectionProps = {
  fileinfo: any;
  promotedSections?: any[];
};

const parseValue = value => {
  if (value instanceof Array) {
    return value.join(' | ');
  } else if (value === true) {
    return 'true';
  } else if (value === false) {
    return 'false';
  } else if (typeof value === 'object') {
    return JSON.stringify(value);
  }
  return value;
};

const KVItem = ({ name, value }) => (
  <>
    <Grid item xs={4} sm={3} lg={2}>
      <span style={{ fontWeight: 500, marginRight: '4px', display: 'flex', textTransform: 'capitalize' }}>{name}</span>
    </Grid>
    <Grid item xs={8} sm={9} lg={10} style={{ fontFamily: 'monospace', wordBreak: 'break-word' }}>
      {parseValue(value)}
    </Grid>
  </>
);

const WrappedOrderedKVExtra = ({ body }) => (
  <>
    {Object.keys(body).map(id => {
      const item = body[id];
      return <KVItem key={id} name={item[0]} value={item[1]} />;
    })}
  </>
);

const OrderedKVExtra = React.memo(WrappedOrderedKVExtra);

const WrappedKVExtra = ({ body }) => (
  <>
    {Object.keys(body).map((key, id) => {
      return <KVItem key={id} name={key} value={body[key]} />;
    })}
  </>
);

const KVExtra = React.memo(WrappedKVExtra);

const WrappedURIIdentificationSection: React.FC<URIIdentificationSectionProps> = ({
  fileinfo,
  promotedSections = []
}) => {
  const { t } = useTranslation(['fileDetail']);
  const [open, setOpen] = React.useState(true);
  const theme = useTheme();
  const classes = useStyles();
  const sp2 = theme.spacing(2);
  const upSM = useMediaQuery(theme.breakpoints.up('sm'));

  return (
    <div style={{ paddingBottom: sp2, paddingTop: sp2 }}>
      <Typography
        variant="h6"
        onClick={() => {
          setOpen(!open);
        }}
        className={classes.title}
      >
        <span>{t('uri_identification')}</span>
        {open ? <ExpandLess /> : <ExpandMore />}
      </Typography>
      <Divider />
      <Collapse in={open} timeout="auto">
        <div
          style={{
            paddingBottom: sp2,
            paddingTop: sp2,
            display: 'flex',
            alignItems: upSM ? 'start' : 'center',
            flexDirection: upSM ? 'row' : 'column',
            rowGap: sp2
          }}
        >
          <Grid container>
            <Grid item xs={4} sm={3} lg={2}>
              <span style={{ fontWeight: 500, marginRight: theme.spacing(0.5), display: 'flex' }}>{t('scheme')}</span>
            </Grid>
            <Grid item xs={8} sm={9} lg={10} style={{ fontFamily: 'monospace', wordBreak: 'break-word' }}>
              {fileinfo?.uri_info ? fileinfo.uri_info.scheme : <Skeleton />}
            </Grid>

            {fileinfo?.uri_info?.username && (
              <>
                <Grid item xs={4} sm={3} lg={2}>
                  <span style={{ fontWeight: 500, marginRight: theme.spacing(0.5), display: 'flex' }}>{t('username')}</span>
                </Grid>
                <Grid item xs={8} sm={9} lg={10} style={{ fontFamily: 'monospace', wordBreak: 'break-word' }}>
                  {fileinfo.uri_info.username}
                </Grid>
              </>
            )}

            {fileinfo?.uri_info?.password && (
              <>
                <Grid item xs={4} sm={3} lg={2}>
                  <span style={{ fontWeight: 500, marginRight: theme.spacing(0.5), display: 'flex' }}>{t('password')}</span>
                </Grid>
                <Grid item xs={8} sm={9} lg={10} style={{ fontFamily: 'monospace', wordBreak: 'break-word' }}>
                  {fileinfo.uri_info.password}
                </Grid>
              </>
            )}

            <Grid item xs={4} sm={3} lg={2}>
              <span style={{ fontWeight: 500, marginRight: theme.spacing(0.5), display: 'flex' }}>{t('hostname')}</span>
            </Grid>
            <Grid item xs={8} sm={9} lg={10} style={{ fontFamily: 'monospace', wordBreak: 'break-word' }}>
              {fileinfo.uri_info.hostname}
            </Grid>

            {fileinfo?.uri_info?.port && (
              <>
                <Grid item xs={4} sm={3} lg={2}>
                  <span style={{ fontWeight: 500, marginRight: theme.spacing(0.5), display: 'flex' }}>{t('port')}</span>
                </Grid>
                <Grid item xs={8} sm={9} lg={10} style={{ fontFamily: 'monospace', wordBreak: 'break-word' }}>
                  {fileinfo.uri_info.port}
                </Grid>
              </>
            )}

            {fileinfo?.uri_info?.path && (
              <>
                <Grid item xs={4} sm={3} lg={2}>
                  <span style={{ fontWeight: 500, marginRight: theme.spacing(0.5), display: 'flex' }}>{t('path')}</span>
                </Grid>
                <Grid item xs={8} sm={9} lg={10} style={{ fontFamily: 'monospace', wordBreak: 'break-word' }}>
                  {fileinfo.uri_info.path}
                </Grid>
              </>
            )}

            {fileinfo?.uri_info?.params && (
              <>
                <Grid item xs={4} sm={3} lg={2}>
                  <span style={{ fontWeight: 500, marginRight: theme.spacing(0.5), display: 'flex' }}>{t('params')}</span>
                </Grid>
                <Grid item xs={8} sm={9} lg={10} style={{ fontFamily: 'monospace', wordBreak: 'break-word' }}>
                  {fileinfo.uri_info.params}
                </Grid>
              </>
            )}

            {fileinfo?.uri_info?.query && (
              <>
                <Grid item xs={4} sm={3} lg={2}>
                  <span style={{ fontWeight: 500, marginRight: theme.spacing(0.5), display: 'flex' }}>{t('query')}</span>
                </Grid>
                <Grid item xs={8} sm={9} lg={10} style={{ fontFamily: 'monospace', wordBreak: 'break-word' }}>
                  {fileinfo.uri_info.query}
                </Grid>
              </>
            )}

            {fileinfo?.uri_info?.fragment && (
              <>
                <Grid item xs={4} sm={3} lg={2}>
                  <span style={{ fontWeight: 500, marginRight: theme.spacing(0.5), display: 'flex' }}>{t('fragment')}</span>
                </Grid>
                <Grid item xs={8} sm={9} lg={10} style={{ fontFamily: 'monospace', wordBreak: 'break-word' }}>
                  {fileinfo.uri_info.fragment}
                </Grid>
              </>
            )}

            {promotedSections
              ? promotedSections
                .filter(section => section.promote_to === 'URI_PARAMS')
                .map((section, idx) =>
                  section.body_format === 'KEY_VALUE' ? (
                    <KVExtra key={idx} body={section.body} />
                  ) : (
                    <OrderedKVExtra key={idx} body={section.body} />
                  )
                )
              : null}
          </Grid>

          <div>
            {promotedSections
              ? promotedSections
                .filter(section => section.promote_to === 'SCREENSHOT')
                .map((section, idx) => <ImageInlineBody key={idx} body={section.body} />)
              : null}
          </div>
        </div>
      </Collapse>
    </div>
  );
};

const URIIdentificationSection = React.memo(WrappedURIIdentificationSection);
export default URIIdentificationSection;
