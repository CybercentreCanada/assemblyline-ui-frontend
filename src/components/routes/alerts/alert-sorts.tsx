import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import {
  Button,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  useTheme
} from '@mui/material';
import makeStyles from '@mui/styles/makeStyles';
import clsx from 'clsx';
import SimpleSearchQuery from 'components/visual/SearchBar/simple-search-query';
import React, { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router';

const useStyles = makeStyles(theme => ({
  option: {
    backgroundColor: theme.palette.background.default
  },
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
];

const DEFAULT_SORT = 'reporting_ts desc';

type Props = {
  onSubmit?: (value: string) => void;
};

const WrappedAlertsSorts: React.FC<Props> = ({ onSubmit = () => null }) => {
  const theme = useTheme();
  const classes = useStyles();
  const { t } = useTranslation('alerts');
  const location = useLocation();

  const [currentSort, setCurrentSort] = useState<string>(
    new SimpleSearchQuery(location.search).get('sort', DEFAULT_SORT)
  );

  const handleSort = useCallback(
    (value: string) => () => {
      setCurrentSort(sort => {
        if (sort.startsWith(value) && sort.endsWith('desc')) return `${value} asc`;
        else return `${value} desc`;
      });
    },
    []
  );

  return (
    <div>
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
        <Button variant="outlined" onClick={() => setCurrentSort(DEFAULT_SORT)}>
          {t('reset')}
        </Button>
        <Button variant="contained" color="primary" onClick={() => onSubmit(currentSort)}>
          {t('apply')}
        </Button>
      </div>
    </div>
  );
};

export const AlertsSorts = React.memo(WrappedAlertsSorts);

export default AlertsSorts;
