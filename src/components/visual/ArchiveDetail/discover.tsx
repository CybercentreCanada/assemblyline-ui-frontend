import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import { Collapse, Divider, Grid, Typography, useTheme } from '@mui/material';
import makeStyles from '@mui/styles/makeStyles';
import useMyAPI from 'components/hooks/useMyAPI';
import useMySnackbar from 'components/hooks/useMySnackbar';
import { File } from 'components/visual/ArchiveDetail';
import { safeFieldValueURI } from 'helpers/utils';
import 'moment/locale/fr';
import React, { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

const useStyles = makeStyles(theme => ({
  container: {
    display: 'flex',
    flexDirection: 'column'
  },
  sp2: {
    paddingBottom: theme.spacing(2),
    paddingTop: theme.spacing(2)
  },
  title: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    cursor: 'pointer',
    '&:hover, &:focus': {
      color: theme.palette.text.secondary
    }
  },
  labels: {
    display: 'flex',
    alignItems: 'center'
  },
  clickable: {
    color: 'inherit',
    display: 'block',
    textDecoration: 'none',
    cursor: 'pointer',
    '&:hover, &:focus': {
      backgroundColor: theme.palette.action.hover
    }
  }
}));

const DEFAULT_DISCOVER = {
  tlsh: { label: 'TLSH' },
  ssdeep1: { label: 'SSDEEP' },
  ssdeep2: { label: 'SSDEEP' },
  vector: { label: 'Vector' }
};

type Discover = Record<keyof typeof DEFAULT_DISCOVER, Record<string, { sha256: string; type: string }>>;

type SectionProps = {
  file: File;
};

const WrappedDiscoverSection: React.FC<SectionProps> = ({ file }) => {
  const { t } = useTranslation(['fileDetail']);
  const theme = useTheme();
  const classes = useStyles();

  // const location = useLocation();
  // const navigate = useNavigate();
  const { apiCall } = useMyAPI();
  // const { user: currentUser, configuration } = useALContext();
  const { showErrorMessage } = useMySnackbar();
  // const { closeGlobalDrawer, setGlobalDrawer, globalDrawerOpened } = useDrawer();

  const [data, setData] = useState<Discover>(null);
  const [open, setOpen] = useState<boolean>(true);

  const discover = useMemo<Record<keyof typeof DEFAULT_DISCOVER, { value: string; to: string }>>(() => {
    let base = {
      tlsh: { value: '', to: '' },
      ssdeep1: { value: '', to: '' },
      ssdeep2: { value: '', to: '' },
      vector: { value: '', to: '' }
    };
    if (!file) return base;

    const tlsh = file?.file_info?.tlsh ? file?.file_info?.tlsh : '';
    base = { ...base, tlsh: { value: tlsh, to: `/search/file?query=tlsh:${safeFieldValueURI(tlsh + '~')}` } };

    const ssdeep = file?.file_info?.ssdeep?.split(':');
    base = {
      ...base,
      ssdeep1: { value: ssdeep[1], to: `/search/file?query=ssdeep:${safeFieldValueURI(ssdeep[1]) + '~'}` },
      ssdeep2: { value: ssdeep[2], to: `/search/file?query=ssdeep:${safeFieldValueURI(ssdeep[2]) + '~'}` }
    };

    const vector = file?.tags?.vector?.join(' ') ? file?.tags?.vector?.join(' ') : '';
    base = {
      ...base,
      vector: {
        value: ssdeep[1],
        to: `/search/file?query=result.sections.tags.vector:${safeFieldValueURI(vector)}`
      }
    };

    return base;
  }, [file]);

  useEffect(() => {
    if (!file) return;
    apiCall({
      method: 'GET',
      url: `/api/v4/archive/details/${file?.file_info?.sha256}/`,
      onSuccess: api_data => setData(api_data.api_response),
      onFailure: api_data => showErrorMessage(api_data.api_error_message)
    });
    // eslint-disable-next-line
  }, [file]);

  return data ? (
    <div className={classes.sp2}>
      <Typography className={classes.title} variant="h6" onClick={() => setOpen(!open)}>
        <span>{t('discover')}</span>
        {open ? <ExpandLess /> : <ExpandMore />}
      </Typography>
      <Divider />
      <Collapse in={open} timeout="auto">
        <Grid container paddingBottom={2} paddingTop={2} flexDirection={'column'} gap={2}>
          {Object.keys(DEFAULT_DISCOVER).map(
            (k, i) =>
              Object.entries(data[k]).length >= 0 && (
                <Grid key={i} container flexDirection="column">
                  <Grid item fontWeight={500}>
                    <Link className={classes.clickable} to={discover[k].to} replace style={{ wordBreak: 'break-word' }}>
                      <span>{t(DEFAULT_DISCOVER[k].label)}</span>
                      <span
                        style={{ fontSize: '80%', color: theme.palette.text.secondary }}
                      >{` :: ${discover[k].value}`}</span>
                    </Link>
                  </Grid>
                  {k in data &&
                    Object.entries(data[k]).map(([sha256, values]: [string, { sha256: string; type: string }], j) => (
                      <Grid key={`${i}-${j}`} item marginLeft={2}>
                        <Link
                          className={classes.clickable}
                          to={`/file/detail/${sha256}`}
                          style={{ wordBreak: 'break-word' }}
                          replace
                        >
                          <span>{sha256}</span>
                          <span
                            style={{ fontSize: '80%', color: theme.palette.text.secondary }}
                          >{` :: ${values?.type}`}</span>
                        </Link>
                      </Grid>
                    ))}
                </Grid>
              )
          )}
        </Grid>
      </Collapse>
    </div>
  ) : null;
};

export const DiscoverSection = React.memo(WrappedDiscoverSection);
export default DiscoverSection;
