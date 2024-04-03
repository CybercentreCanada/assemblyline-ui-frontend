import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import CloseOutlinedIcon from '@mui/icons-material/CloseOutlined';
import SortIcon from '@mui/icons-material/Sort';
import {
  Button,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Tooltip,
  Typography,
  useMediaQuery,
  useTheme
} from '@mui/material';
import makeStyles from '@mui/styles/makeStyles';
import clsx from 'clsx';
import SimpleSearchQuery from 'components/visual/SearchBar/simple-search-query';
import React, { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';
import { useLocation } from 'react-router-dom';

const useStyles = makeStyles(theme => ({
  desc: {
    transform: 'rotate(0deg)',
    transition: theme.transitions.create('transform', {
      easing: theme.transitions.easing.easeInOut,
      duration: theme.transitions.duration.shortest
    })
  },
  asc: {
    transform: 'rotate(180deg)'
  },
  actions: {
    display: 'flex',
    gap: theme.spacing(1),
    justifyContent: 'flex-end',
    flexWrap: 'wrap',
    marginTop: theme.spacing(1)
  },
  drawerInner: {
    display: 'flex',
    flexDirection: 'column',
    padding: theme.spacing(3),
    width: '600px',
    [theme.breakpoints.only('xs')]: {
      width: '100vw'
    }
  }
}));

const SORT_OPTIONS = [
  { value: 'alert_id', label: 'alert_id' },
  { value: 'type', label: 'type' },
  { value: 'ts', label: 'received_ts' },
  { value: 'reporting_ts', label: 'alerted_ts' },
  { value: 'owner', label: 'owner' },
  { value: 'priority', label: 'priority' },
  { value: 'status', label: 'status' }
] as const;

const DEFAULT_SORT = 'reporting_ts desc' as const;

const WrappedAlertSorts = () => {
  const { t } = useTranslation('alerts');
  const classes = useStyles();
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  const [currentSort, setCurrentSort] = useState<string>(
    new SimpleSearchQuery(location.search).get('sort', DEFAULT_SORT)
  );
  const [open, setOpen] = useState<boolean>(false);

  const isMDUp = useMediaQuery(theme.breakpoints.up('md'));

  const handleSort = useCallback(
    (value: string) => () => {
      setCurrentSort(sort => {
        if (sort.startsWith(value) && sort.endsWith('desc')) return `${value} asc`;
        else return `${value} desc`;
      });
    },
    []
  );

  const handleSubmit = useCallback(
    (sort: string) => {
      const query = new SimpleSearchQuery(location.search);
      query.set('sort', sort);
      navigate(`${location.pathname}?${query.toString([])}${location.hash}`);
      setOpen(false);
    },
    [location.hash, location.pathname, location.search, navigate]
  );

  useEffect(() => {
    setCurrentSort(new SimpleSearchQuery(location.search).get('sort', DEFAULT_SORT));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  return (
    <>
      <Tooltip title={t('sorts')}>
        <span>
          <IconButton size="large" onClick={() => setOpen(true)} style={{ marginRight: 0 }}>
            <SortIcon fontSize={isMDUp ? 'medium' : 'small'} />
          </IconButton>
        </span>
      </Tooltip>

      <Drawer open={open} anchor="right" onClose={() => setOpen(false)}>
        <div style={{ padding: theme.spacing(1) }}>
          <IconButton onClick={() => setOpen(false)} size="large">
            <CloseOutlinedIcon />
          </IconButton>
        </div>
        <div className={classes.drawerInner}>
          <div style={{ paddingBottom: theme.spacing(2) }}>
            <Typography variant="h4">{t('sorts.title')}</Typography>
          </div>
          <div style={{ marginBottom: theme.spacing(2), marginTop: theme.spacing(2) }}>
            <List>
              {SORT_OPTIONS.map((option, i) => (
                <ListItem key={i} disablePadding>
                  <ListItemButton onClick={handleSort(option.value)} selected={currentSort.startsWith(option.value)}>
                    <ListItemIcon>
                      {currentSort.startsWith(option.value) && (
                        <ArrowDownwardIcon className={clsx(classes.desc, currentSort.endsWith('asc') && classes.asc)} />
                      )}
                    </ListItemIcon>

                    <ListItemText primary={t(option.label)} />
                  </ListItemButton>
                </ListItem>
              ))}
            </List>
          </div>
          <div className={classes.actions}>
            <Tooltip title={t('sorts.reset')}>
              <Button variant="outlined" onClick={() => setCurrentSort(DEFAULT_SORT)}>
                {t('reset')}
              </Button>
            </Tooltip>
            <Tooltip title={t('sorts.apply')}>
              <Button variant="contained" color="primary" onClick={() => handleSubmit(currentSort)}>
                {t('apply')}
              </Button>
            </Tooltip>
          </div>
        </div>
      </Drawer>
    </>
  );
};

export const AlertSorts = React.memo(WrappedAlertSorts);
export default AlertSorts;
