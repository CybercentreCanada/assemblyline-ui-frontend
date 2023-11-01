import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import SearchOutlinedIcon from '@mui/icons-material/SearchOutlined';
import {
  AlertTitle,
  Collapse,
  Divider,
  Grid,
  IconButton,
  Skeleton,
  Tooltip,
  Typography,
  useTheme
} from '@mui/material';
import makeStyles from '@mui/styles/makeStyles';
import useMyAPI from 'components/hooks/useMyAPI';
import useMySnackbar from 'components/hooks/useMySnackbar';
import { File } from 'components/routes/archive/detail';
import { safeFieldValueURI } from 'helpers/utils';
import 'moment/locale/fr';
import React, { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import InformativeAlert from '../InformativeAlert';

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
  },
  card: {
    backgroundColor: theme.palette.background.default,
    border: `solid 1px ${theme.palette.mode === 'dark' ? '#393939' : '#ddd'}`,
    borderRadius: '4px',
    width: '100%'
  },
  card_title: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'nowrap',
    backgroundColor: theme.palette.mode === 'dark' ? '#393939' : '#f0f0f0',
    padding: '6px',
    borderRadius: '4px 4px 0px 0px',
    '&:hover': {
      backgroundColor: theme.palette.mode === 'dark' ? '#505050' : '#e6e6e6',
      cursor: 'pointer'
    }
  },
  content: {
    padding: '6px'
  },
  muted: {
    color: theme.palette.text.secondary,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap'
  },
  primary: {
    color: theme.palette.primary.main
  }
}));

const DEFAULT_SIMILAR = {
  tlsh: { label: 'TLSH' },
  ssdeep1: { label: 'SSDEEP' },
  ssdeep2: { label: 'SSDEEP' },
  vector: { label: 'Vector' }
};

type Similar = Record<keyof typeof DEFAULT_SIMILAR, Record<string, { sha256: string; type: string }>>;

type SectionProps = {
  file: File;
  show?: boolean;
  title?: string;
  visible?: boolean;
};

const WrappedSimilarSection: React.FC<SectionProps> = ({ file, show = false, title = null, visible = true }) => {
  const { t } = useTranslation(['archive']);
  const theme = useTheme();
  const classes = useStyles();

  const { apiCall } = useMyAPI();
  const { showErrorMessage } = useMySnackbar();

  const [data, setData] = useState<Similar>(null);
  const [open, setOpen] = useState<boolean>(true);

  const nbOfValues = useMemo<number | null>(
    () =>
      data &&
      Object.keys(DEFAULT_SIMILAR)
        .map(k => (Object.entries(data[k]) ? Object.entries(data[k]).length : 0))
        .reduce((a, v) => a + v),
    [data]
  );

  const similar = useMemo<Record<keyof typeof DEFAULT_SIMILAR, { value: string; to: string }>>(() => {
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
        value: vector,
        to: `/search/file?query=result.sections.tags.vector:${safeFieldValueURI(vector)}`
      }
    };

    return base;
  }, [file]);

  useEffect(() => {
    if (!file || !visible) return;
    apiCall({
      method: 'GET',
      url: `/api/v4/archive/details/${file?.file_info?.sha256}/`,
      onSuccess: api_data => setData(api_data.api_response),
      onFailure: api_data => showErrorMessage(api_data.api_error_message)
    });
    // eslint-disable-next-line
  }, [file, visible]);

  useEffect(() => {
    return () => {
      setData(null);
    };
  }, [file]);

  const Card: React.FC<{
    label: string;
    value: string;
    size: number;
    to: string;
    files: Record<string, { sha256: string; type: string }>;
  }> = ({ label = null, value = null, size = 0, to = null, files = {} }) => {
    const [expand, setExpand] = useState<boolean>(true);

    return (
      <div className={classes.card}>
        <div className={classes.card_title} onClick={() => setExpand(v => !v)}>
          <b>{label}</b>&nbsp;
          <small className={classes.muted}>{` :: ${value}`}</small>
          <div style={{ flexGrow: 1 }} />
          <small className={classes.primary}>
            &nbsp;{size}&nbsp;{t(`result${size === 1 ? '' : 's'}`)}
          </small>
          <Tooltip title={t('search')}>
            <span style={{ margin: `0 ${theme.spacing(0.5)}` }}>
              <IconButton component={Link} size="small" to={to} onClick={e => e.stopPropagation()}>
                <SearchOutlinedIcon />
              </IconButton>
            </span>
          </Tooltip>
          {expand ? <ExpandLess className={classes.muted} /> : <ExpandMore className={classes.muted} />}
        </div>
        <Collapse in={expand} timeout="auto">
          <div className={classes.content} style={{ color: theme.palette.text.secondary }}>
            {Object.entries(files).map(([sha256, values], i) => (
              <Link
                key={i}
                className={classes.clickable}
                to={`/file/detail/${sha256}`}
                style={{ wordBreak: 'break-word' }}
                replace
              >
                <span style={{ color: theme.palette.text.primary }}>{values?.type}</span>
                <span style={{ fontSize: '80%', color: theme.palette.text.secondary }}>{` :: ${sha256}`}</span>
              </Link>
            ))}
          </div>
        </Collapse>
      </div>
    );
  };

  return show || (data && nbOfValues > 0) ? (
    <div className={classes.sp2}>
      <Typography className={classes.title} variant="h6" onClick={() => setOpen(!open)}>
        <span>{title ?? t('similar')}</span>
        {open ? <ExpandLess /> : <ExpandMore />}
      </Typography>
      <Divider />
      <Collapse in={open} timeout="auto">
        <Grid container paddingBottom={2} paddingTop={2} flexDirection={'column'} gap={2}>
          {!data ? (
            <Skeleton variant="rectangular" style={{ height: '6rem', borderRadius: '4px' }} />
          ) : nbOfValues === 0 ? (
            <div style={{ width: '100%' }}>
              <InformativeAlert>
                <AlertTitle>{t('no_similar_title')}</AlertTitle>
                {t('no_similar_desc')}
              </InformativeAlert>
            </div>
          ) : (
            Object.keys(DEFAULT_SIMILAR).map(
              (k, i) =>
                Object.entries(data[k]).length > 0 && (
                  <Card
                    key={i}
                    label={t(DEFAULT_SIMILAR[k].label)}
                    value={similar[k].value}
                    size={Object.keys(data[k]).length}
                    to={similar[k].to}
                    files={data[k]}
                  />
                )
            )
          )}
        </Grid>
      </Collapse>
    </div>
  ) : null;
};

export const SimilarSection = React.memo(WrappedSimilarSection);
export default SimilarSection;
