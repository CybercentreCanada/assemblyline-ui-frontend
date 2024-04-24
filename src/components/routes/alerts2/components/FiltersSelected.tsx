import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import DateRangeIcon from '@mui/icons-material/DateRange';
import SortIcon from '@mui/icons-material/Sort';
import SourceIcon from '@mui/icons-material/Source';
import StarIcon from '@mui/icons-material/Star';
import {
  ChipProps,
  ListItemIcon,
  ListItemText,
  ListSubheader,
  Menu,
  MenuItem,
  MenuItemProps,
  useTheme
} from '@mui/material';
import makeStyles from '@mui/styles/makeStyles';
import clsx from 'clsx';
import { DEFAULT_QUERY } from 'components/routes/alerts';
import CustomChip from 'components/visual/CustomChip';
import SimpleSearchQuery from 'components/visual/SearchBar/simple-search-query';
import React, { ReactNode, useCallback, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import Moment from 'react-moment';
import { useNavigate } from 'react-router';
import { useLocation } from 'react-router-dom';
import { useAlerts } from '../contexts/AlertsContext';
import { Favorite } from './Favorites';
import { GROUPBY_OPTIONS, Option, SORT_OPTIONS, TC_OPTIONS } from './Filters';

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
  deleteIcon: {
    fontSize: 'large !important',
    color: `${theme.palette.text.primary} !important`
  }
}));

type Filter = {
  value: string;
  filter: string;
  not: boolean;
};

type Filters = {
  status: Filter;
  priority: Filter;
  labels: Filter[];
  favorites: (Favorite & Filter)[];
  others: Filter[];
};

type MenuFilterProps = {
  param: string;
  hide: boolean;
  disabled: boolean;
  classes?: ChipProps['classes'];
  variant?: ChipProps['variant'];
  size?: ChipProps['size'] | 'tiny';

  icon: ChipProps['icon'];
  deleteIcon?: ChipProps['deleteIcon'];

  title: ReactNode;
  options: Option[];
  style?: ChipProps['style'];
  disableCloseOnSelect?: boolean;

  getLabel?: (item: string) => ChipProps['label'];
  getSelected?: (option: Option) => MenuItemProps['selected'];
  getListItemIcon?: (option: Option) => ReactNode;

  onClick?: (event: React.MouseEvent, option: Option) => void;
  onDelete?: ChipProps['onDelete'];
};

const MenuFilter: React.FC<MenuFilterProps> = React.memo(
  ({
    param = null,
    hide = false,
    disabled = false,
    classes = null,
    variant = 'outlined',
    size = 'small',
    icon = null,
    deleteIcon = null,
    title = null,
    options = [],
    style = null,
    disableCloseOnSelect = false,

    getLabel = null,
    getSelected = null,
    getListItemIcon = null,

    onClick = null,
    onDelete = null
  }: MenuFilterProps) => {
    const { t } = useTranslation('alerts');

    const [open, setOpen] = useState<boolean>(false);

    const ref = useRef<HTMLDivElement>(null);

    return (
      !hide && (
        <div ref={ref}>
          <CustomChip
            classes={classes}
            variant={variant}
            label={getLabel(param)}
            size={size}
            icon={icon}
            deleteIcon={deleteIcon}
            style={{ minHeight: '25px', ...style }}
            onClick={disabled ? null : () => setOpen(o => !o)}
            onDelete={!deleteIcon || disabled ? null : event => onDelete(event)}
          />
          <Menu
            anchorEl={ref.current}
            keepMounted
            open={open}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
            transformOrigin={{ vertical: 'top', horizontal: 'left' }}
            onClose={() => setOpen(o => !o)}
          >
            <ListSubheader style={{ lineHeight: 'inherit' }}>{title}</ListSubheader>
            {options.map((option, i) => (
              <MenuItem
                key={`${param}-${i}`}
                dense
                selected={getSelected(option)}
                onClick={event => {
                  onClick(event, option);
                  !disableCloseOnSelect && setOpen(false);
                }}
              >
                {getListItemIcon && <ListItemIcon>{getListItemIcon(option)}</ListItemIcon>}
                <ListItemText primary={t(option.label)} />
              </MenuItem>
            ))}
          </Menu>
        </div>
      )
    );
  }
);

type Props = {
  query: SimpleSearchQuery;
  hideQuery?: boolean;
  hideGroupBy?: boolean;
  hideTC?: boolean;
  hideTCStart?: boolean;
  hideSort?: boolean;
  disableActions?: boolean;
};

const WrappedAlertFiltersSelected = ({
  query = new SimpleSearchQuery('', DEFAULT_QUERY),
  hideQuery = false,
  hideTC = false,
  hideTCStart = false,
  hideGroupBy = false,
  hideSort = false,
  disableActions = false
}: Props) => {
  const { t, i18n } = useTranslation('alerts');
  const theme = useTheme();
  const classes = useStyles();
  const location = useLocation();
  const navigate = useNavigate();

  const { userFavorites, globalFavorites } = useAlerts();

  const allFavorites = useMemo<Favorite[]>(
    () => [...userFavorites, ...globalFavorites],
    [globalFavorites, userFavorites]
  );

  const params = useMemo<{ [key: string]: string }>(() => (!query ? {} : query.getParams()), [query]);

  const { status, priority, labels, favorites, others } = useMemo<Filters>(() => {
    let filters = { status: null, priority: null, labels: [], favorites: [], others: [] };
    if (!query) return filters;

    query.getAll('fq', []).forEach(filter => {
      const not = filter.startsWith('NOT(') && filter.endsWith(')');
      const value = not ? filter.substring(4, filter.length - 1) : filter;

      if (value.startsWith('status:')) filters.status = { filter, not, value };
      else if (value.startsWith('priority:')) filters.priority = { filter, not, value };
      else if (value.startsWith('label:')) filters.labels.push({ filter, not, value });
      else {
        const favorite = allFavorites.find(f => f.query === filter || `NOT(${f.query})` === filter);
        if (favorite) filters.favorites.push({ ...favorite, filter, not, value });
        else filters.others.push({ filter, not, value });
      }
    });
    return filters;
  }, [allFavorites, query]);

  const handleQueryChange = useCallback(
    (filter: Filter) => {
      filter.not
        ? query.replace('fq', `NOT(${filter.value})`, filter.value)
        : query.replace('fq', filter.value, `NOT(${filter.value})`);
      navigate(`${location.pathname}?${query.getDeltaString()}${location.hash}`);
    },
    [location.hash, location.pathname, navigate, query]
  );

  const handleQueryRemove = useCallback(
    (filter: Filter) => {
      query.remove('fq', filter.filter);
      navigate(`${location.pathname}?${query.getDeltaString()}${location.hash}`);
    },
    [location.hash, location.pathname, navigate, query]
  );

  return (
    <div
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        flexDirection: 'row',
        columnGap: theme.spacing(1),
        rowGap: theme.spacing(1)
      }}
    >
      {!hideQuery && query.has('q') && (
        <CustomChip
          variant="outlined"
          size="small"
          style={{ minHeight: '25px' }}
          label={query.get('q')}
          onDelete={
            disableActions
              ? null
              : () => {
                  query.delete('q');
                  navigate(`${location.pathname}?${query.getDeltaString()}${location.hash}`);
                }
          }
        />
      )}

      {!hideSort && query.has('sort') && (
        <MenuFilter
          classes={{
            deleteIcon: clsx(
              classes.deleteIcon,
              classes.desc,
              params.sort && params.sort.endsWith('asc') && classes.asc
            )
          }}
          getLabel={item => (
            <div style={{ display: 'flex', flexDirection: 'row', gap: theme.spacing(0.5), alignItems: 'center' }}>
              <span>{`${t('sorts.title')}: ${t(item.substring(0, item.indexOf(' ')))}`}</span>
              {disableActions && <ArrowDownwardIcon />}
            </div>
          )}
          getListItemIcon={option =>
            params.sort.startsWith(option.value) && (
              <ArrowDownwardIcon
                className={clsx(classes.desc, params.sort.endsWith('asc') && classes.asc)}
                fontSize="small"
              />
            )
          }
          param={params.sort}
          hide={hideSort}
          disabled={disableActions}
          getSelected={option => params.sort.startsWith(option.value)}
          icon={<SortIcon fontSize="small" />}
          deleteIcon={<ArrowDownwardIcon />}
          title={t('sorts.title')}
          options={SORT_OPTIONS}
          disableCloseOnSelect
          style={{ minHeight: '25px' }}
          onClick={(event, option) => {
            const newSort =
              params.sort.startsWith(option.value) && params.sort.endsWith('desc')
                ? `${option.value} asc`
                : `${option.value} desc`;
            query.set('sort', newSort);
            navigate(`${location.pathname}?${query.getDeltaString()}${location.hash}`);
          }}
          onDelete={() => {
            query.set(
              'sort',
              params.sort.endsWith('desc') ? params.sort.replace('desc', 'asc') : params.sort.replace('asc', 'desc')
            );
            navigate(`${location.pathname}?${query.getDeltaString()}${location.hash}`);
          }}
        />
      )}

      <MenuFilter
        getLabel={() => {
          const option = GROUPBY_OPTIONS.find(o => o.value === params.group_by);
          return option && option.value !== ''
            ? `${t('groupBy')}: ${t(option.label)}`
            : `${t('groupBy')}: ${t('none')}`;
        }}
        param={params.group_by}
        hide={hideGroupBy}
        disabled={disableActions}
        getSelected={option => params.group_by === option.value}
        icon={<SourceIcon fontSize="small" />}
        title={t('groupBy')}
        options={GROUPBY_OPTIONS}
        style={{ minHeight: '25px' }}
        onClick={(event, option) => {
          query.set('group_by', option.value);
          navigate(`${location.pathname}?${query.getDeltaString()}${location.hash}`);
        }}
      />

      <MenuFilter
        getLabel={() => {
          const option = TC_OPTIONS.find(o => o.value === params.tc);
          return option && option.value !== '' ? `${t('tc')}: ${t(option.label)}` : `${t('tc')}: ${t('none')}`;
        }}
        param={params.tc}
        hide={hideTC}
        disabled={disableActions}
        getSelected={option => params.tc === option.value}
        icon={<DateRangeIcon fontSize="small" />}
        title={t('tc')}
        options={TC_OPTIONS}
        style={{ minHeight: '25px' }}
        onClick={(event, option) => {
          query.set('tc', option.value);
          navigate(`${location.pathname}?${query.getDeltaString()}${location.hash}`);
        }}
      />

      {!hideTCStart && query.has('tc_start') && (
        <CustomChip
          variant="outlined"
          size="small"
          style={{ minHeight: '25px' }}
          icon={<DateRangeIcon fontSize="small" />}
          label={
            <div>
              <span>{t('tc_start')}: </span>
              <Moment
                locale={i18n.language}
                format={i18n.language === 'fr' ? 'Do MMMM YYYY H[h]mm' : 'MMMM D YYYY, h:mm a'}
              >
                {query.get('tc_start')}
              </Moment>
            </div>
          }
          onDelete={
            disableActions
              ? null
              : () => {
                  query.delete('tc_start');
                  navigate(`${location.pathname}?${query.getDeltaString()}${location.hash}`);
                }
          }
        />
      )}

      {status && (
        <CustomChip
          variant="outlined"
          size="small"
          style={{ minHeight: '25px' }}
          color={status.not ? 'error' : 'default'}
          label={status.value}
          onClick={disableActions ? null : () => handleQueryChange(status)}
          onDelete={disableActions ? null : () => handleQueryRemove(status)}
        />
      )}

      {priority && (
        <CustomChip
          variant="outlined"
          size="small"
          style={{ minHeight: '25px' }}
          color={priority.not ? 'error' : 'default'}
          label={priority.value}
          onClick={disableActions ? null : () => handleQueryChange(priority)}
          onDelete={disableActions ? null : () => handleQueryRemove(priority)}
        />
      )}

      {labels.map(label => (
        <CustomChip
          variant="outlined"
          size="small"
          style={{ minHeight: '25px' }}
          color={label.not ? 'error' : 'default'}
          label={label.value}
          onClick={disableActions ? null : () => handleQueryChange(label)}
          onDelete={disableActions ? null : () => handleQueryRemove(label)}
        />
      ))}

      {favorites.map(favorite => (
        <CustomChip
          variant="outlined"
          size="small"
          style={{ minHeight: '25px' }}
          color={favorite.not ? 'error' : 'default'}
          label={favorite.value}
          icon={
            <StarIcon
              style={{
                ...(favorite.not && {
                  fontSize: 'small',
                  color: theme.palette.mode === 'dark' ? theme.palette.error.light : theme.palette.error.dark
                })
              }}
            />
          }
          tooltip={
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <div style={{ fontStyle: 'normal' }}>{favorite.query}</div>
              <div
                style={{ placeSelf: 'flex-end', color: theme.palette.text.secondary }}
              >{`(${favorite.created_by})`}</div>
            </div>
          }
          onClick={disableActions ? null : () => handleQueryChange(favorite)}
          onDelete={disableActions ? null : () => handleQueryRemove(favorite)}
        />
      ))}

      {others.map(other => (
        <CustomChip
          variant="outlined"
          size="small"
          style={{ minHeight: '25px' }}
          color={other.not ? 'error' : 'default'}
          label={other.value}
          onClick={disableActions ? null : () => handleQueryChange(other)}
          onDelete={disableActions ? null : () => handleQueryRemove(other)}
        />
      ))}
    </div>
  );
};

export const AlertFiltersSelected = React.memo(WrappedAlertFiltersSelected);
export default AlertFiltersSelected;
