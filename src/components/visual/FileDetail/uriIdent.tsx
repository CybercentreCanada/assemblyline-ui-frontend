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

const WrappedURIIdentificationSection: React.FC<URIIdentificationSectionProps> = ({ fileinfo, promotedSections = [] }) => {
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
              <span style={{ fontWeight: 500, marginRight: theme.spacing(0.5), display: 'flex' }}>Scheme</span>
            </Grid>
            <Grid item xs={8} sm={9} lg={10} style={{ fontFamily: 'monospace', wordBreak: 'break-word' }}>
              {fileinfo?.uri_info ? fileinfo.uri_info.scheme : <Skeleton />}
            </Grid>

            <Grid item xs={4} sm={3} lg={2}>
              <span style={{ fontWeight: 500, marginRight: theme.spacing(0.5), display: 'flex' }}>Netloc</span>
            </Grid>
            <Grid item xs={8} sm={9} lg={10} style={{ fontFamily: 'monospace', wordBreak: 'break-word' }}>
              {fileinfo?.uri_info ? fileinfo.uri_info.netloc : <Skeleton />}
            </Grid>

            {fileinfo?.uri_info?.path ?
              <>
                <Grid item xs={4} sm={3} lg={2}>
                  <span style={{ fontWeight: 500, marginRight: theme.spacing(0.5), display: 'flex' }}>Path</span>
                </Grid>
                <Grid item xs={8} sm={9} lg={10} style={{ fontFamily: 'monospace', wordBreak: 'break-word' }}>
                  {fileinfo.uri_info.path}
                </Grid>
              </>
              :
              <></>
            }

            {fileinfo?.uri_info?.params ?
              <>
                <Grid item xs={4} sm={3} lg={2}>
                  <span style={{ fontWeight: 500, marginRight: theme.spacing(0.5), display: 'flex' }}>Params</span>
                </Grid>
                <Grid item xs={8} sm={9} lg={10} style={{ fontFamily: 'monospace', wordBreak: 'break-word' }}>
                  {fileinfo.uri_info.params}
                </Grid>
              </>
              :
              <></>
            }

            {fileinfo?.uri_info?.query ?
              <>
                <Grid item xs={4} sm={3} lg={2}>
                  <span style={{ fontWeight: 500, marginRight: theme.spacing(0.5), display: 'flex' }}>Query</span>
                </Grid>
                <Grid item xs={8} sm={9} lg={10} style={{ fontFamily: 'monospace', wordBreak: 'break-word' }}>
                  {fileinfo.uri_info.query}
                </Grid>
              </>
              :
              <></>
            }

            {fileinfo?.uri_info?.fragment ?
              <>
                <Grid item xs={4} sm={3} lg={2}>
                  <span style={{ fontWeight: 500, marginRight: theme.spacing(0.5), display: 'flex' }}>Fragment</span>
                </Grid>
                <Grid item xs={8} sm={9} lg={10} style={{ fontFamily: 'monospace', wordBreak: 'break-word' }}>
                  {fileinfo.uri_info.fragment}
                </Grid>
              </>
              :
              <></>
            }

            {fileinfo?.uri_info?.username ?
              <>
                <Grid item xs={4} sm={3} lg={2}>
                  <span style={{ fontWeight: 500, marginRight: theme.spacing(0.5), display: 'flex' }}>Username</span>
                </Grid>
                <Grid item xs={8} sm={9} lg={10} style={{ fontFamily: 'monospace', wordBreak: 'break-word' }}>
                  {fileinfo.uri_info.username}
                </Grid>
              </>
              :
              <></>
            }

            {fileinfo?.uri_info?.password ?
              <>
                <Grid item xs={4} sm={3} lg={2}>
                  <span style={{ fontWeight: 500, marginRight: theme.spacing(0.5), display: 'flex' }}>Password</span>
                </Grid>
                <Grid item xs={8} sm={9} lg={10} style={{ fontFamily: 'monospace', wordBreak: 'break-word' }}>
                  {fileinfo.uri_info.password}
                </Grid>
              </>
              :
              <></>
            }

            {fileinfo?.uri_info?.hostname ?
              <>
                <Grid item xs={4} sm={3} lg={2}>
                  <span style={{ fontWeight: 500, marginRight: theme.spacing(0.5), display: 'flex' }}>Hostname</span>
                </Grid>
                <Grid item xs={8} sm={9} lg={10} style={{ fontFamily: 'monospace', wordBreak: 'break-word' }}>
                  {fileinfo.uri_info.hostname}
                </Grid>
              </>
              :
              <></>
            }

            {fileinfo?.uri_info?.port ?
              <>
                <Grid item xs={4} sm={3} lg={2}>
                  <span style={{ fontWeight: 500, marginRight: theme.spacing(0.5), display: 'flex' }}>Port</span>
                </Grid>
                <Grid item xs={8} sm={9} lg={10} style={{ fontFamily: 'monospace', wordBreak: 'break-word' }}>
                  {fileinfo.uri_info.port}
                </Grid>
              </>
              :
              <></>
            }
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
