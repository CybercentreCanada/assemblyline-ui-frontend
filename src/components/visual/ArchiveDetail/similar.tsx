import AssignmentOutlinedIcon from '@mui/icons-material/AssignmentOutlined';
import CompareIcon from '@mui/icons-material/Compare';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import SearchOutlinedIcon from '@mui/icons-material/SearchOutlined';
import {
  AlertTitle,
  Collapse,
  Divider,
  Grid,
  IconButton,
  Menu,
  MenuItem,
  Skeleton,
  Tooltip,
  Typography,
  useTheme
} from '@mui/material';
import makeStyles from '@mui/styles/makeStyles';
import useClipboard from 'commons/components/utils/hooks/useClipboard';
import useMyAPI from 'components/hooks/useMyAPI';
import useMySnackbar from 'components/hooks/useMySnackbar';
import { File, Tab } from 'components/routes/archive/detail';
import SimpleSearchQuery from 'components/visual/SearchBar/simple-search-query';
import { safeFieldValueURI } from 'helpers/utils';
import 'moment/locale/fr';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';
import { Link, useLocation } from 'react-router-dom';
import { DIFF_QUERY } from '../FileViewer';
import InformativeAlert from '../InformativeAlert';

const CLIPBOARD_ICON = <AssignmentOutlinedIcon style={{ marginRight: '16px' }} />;
const COMPARE_ICON = <CompareIcon style={{ marginRight: '16px' }} />;
const INITIAL_MENU = {
  mouseX: null,
  mouseY: null
};

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

type Result = {
  sha256: string;
  type: string;
};

type Similar = Record<keyof typeof DEFAULT_SIMILAR, Record<string, Result>>;

type SectionProps = {
  file: File;
  show?: boolean;
  title?: string;
  visible?: boolean;
  onTabChange?: (event: any, value: Tab) => void;
};

const WrappedSimilarSection: React.FC<SectionProps> = ({
  file,
  show = false,
  title = null,
  visible = true,
  onTabChange = () => null
}) => {
  const { t } = useTranslation(['archive']);
  const theme = useTheme();
  const classes = useStyles();
  const location = useLocation();
  const navigate = useNavigate();

  const { copy } = useClipboard();
  const { apiCall } = useMyAPI();
  const { showErrorMessage } = useMySnackbar();

  const [data, setData] = useState<Similar>(null);
  const [open, setOpen] = useState<boolean>(true);
  const [menu, setMenu] = useState<{ mouseX: number; mouseY: number }>(INITIAL_MENU);
  const [selectedResult, setSelectedResult] = useState<Result>(null);

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

  const handleClose = useCallback(() => {
    setMenu(INITIAL_MENU);
  }, []);

  const handleMenuCopy = useCallback(
    (value: Result) => () => {
      copy(value?.sha256, 'sha256');
      handleClose();
    },
    [copy, handleClose]
  );

  const handleCompareClick = useCallback(
    (value: Result) => () => {
      const query = new SimpleSearchQuery(location.search, null);
      query.add(DIFF_QUERY, value?.sha256);
      navigate(`${location.pathname}?${query.getDeltaString()}${location.hash}`);
      onTabChange(null, 'ascii');
      handleClose();
    },
    [handleClose, location.hash, location.pathname, location.search, navigate, onTabChange]
  );

  const handleFileClick = useCallback((event: React.MouseEvent<HTMLAnchorElement, MouseEvent>, value: Result) => {
    event.preventDefault();
    setSelectedResult(value);
    setMenu({
      mouseX: event.clientX - 2,
      mouseY: event.clientY - 4
    });
  }, []);

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
    files: Record<string, Result>;
    onContextMenu?: (event: React.MouseEvent<HTMLAnchorElement, MouseEvent>, value: Result) => void;
  }> = ({ label = null, value = null, size = 0, to = null, files = {}, onContextMenu = () => null }) => {
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
                <SearchOutlinedIcon fontSize="small" />
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
                onContextMenu={event => onContextMenu(event, values)}
              >
                <span style={{ color: theme.palette.text.primary }}>{values?.type}</span>&nbsp;
                <small>{` :: ${sha256}`}</small>
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
                    onContextMenu={handleFileClick}
                  />
                )
            )
          )}
          <Menu
            open={menu.mouseY !== null}
            onClose={handleClose}
            anchorReference="anchorPosition"
            anchorPosition={
              menu.mouseY !== null && menu.mouseX !== null ? { top: menu.mouseY, left: menu.mouseX } : undefined
            }
          >
            <MenuItem dense onClick={handleMenuCopy(selectedResult)}>
              {CLIPBOARD_ICON}
              {t('clipboard')}
            </MenuItem>
            <MenuItem dense onClick={handleCompareClick(selectedResult)}>
              {COMPARE_ICON}
              {t('compare')}
            </MenuItem>
          </Menu>
        </Grid>
      </Collapse>
    </div>
  ) : null;
};

export const SimilarSection = React.memo(WrappedSimilarSection);
export default SimilarSection;
