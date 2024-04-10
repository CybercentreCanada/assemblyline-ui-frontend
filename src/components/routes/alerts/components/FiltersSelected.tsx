import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import DateRangeIcon from '@mui/icons-material/DateRange';
import ReplayOutlinedIcon from '@mui/icons-material/ReplayOutlined';
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
import { ChipList } from 'components/visual/ChipList';
import SimpleSearchQuery from 'components/visual/SearchBar/simple-search-query';
import React, { ReactNode, useCallback, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';
import { useLocation } from 'react-router-dom';
import { useFavorites } from '../contexts/FavoritesContext';
import { Favorite } from './Favorites';
import { GROUPBY_OPTIONS, Option, TC_OPTIONS } from './Filters';
import { SORT_OPTIONS } from './Sorts';

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
    color: `${theme.palette.text.primary} !important`
  }
}));

type Filters = {
  statuses: string[];
  priorities: string[];
  labels: string[];
  favorites: Favorite[];
  others: string[];
};

type MenuFilterProps = {
  param: string;
  hide: boolean;
  disabled: boolean;
  classes?: ChipProps['classes'];
  variant?: ChipProps['variant'];
  size?: ChipProps['size'] | 'tiny';

  icon: ChipProps['icon'];
  deleteIcon: ChipProps['deleteIcon'];

  subHeader: ReactNode;
  options: Option[];
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
    size = 'medium',
    icon = null,
    deleteIcon = null,
    subHeader = null,
    options = [],
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
        <div ref={ref} style={{ display: 'inline-block' }}>
          <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'baseline' }}>
            <ChipList
              items={[param].map(v => ({
                classes: classes,
                variant: variant,
                label: getLabel(v),
                size: size,
                icon: icon,
                deleteIcon: deleteIcon,
                onClick: disabled ? null : () => setOpen(o => !o),
                onDelete: disabled ? null : event => onDelete(event)
              }))}
            />
            <Menu
              anchorEl={ref.current}
              keepMounted
              open={open}
              anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
              transformOrigin={{ vertical: 'top', horizontal: 'left' }}
              onClose={() => setOpen(o => !o)}
            >
              <ListSubheader style={{ lineHeight: 'inherit' }}>{subHeader}</ListSubheader>
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
        </div>
      )
    );
  }
);

type FilterItem = {
  value: string;
  not: boolean;
};

type ListFilterProps = {
  query: SimpleSearchQuery;
  prefix: string;
  filter: string;
  disabled: boolean;
  hide: boolean;
  variant?: ChipProps['variant'];
  size?: ChipProps['size'] | 'tiny';
  label: string;

  onClick?: (event: any) => void;
  onDelete?: (event: any) => void;
};

const ListFilter: React.FC<ListFilterProps> = React.memo(
  ({
    query = null,
    prefix = null,
    filter = null,
    hide = false,
    variant = 'outlined',
    size = 'small',
    disabled = false,
    label = null,
    onClick = null,
    onDelete = null
  }: ListFilterProps) => {
    const { t } = useTranslation('alerts');
    const theme = useTheme();
    const location = useLocation();
    const navigate = useNavigate();

    const filters = useMemo<FilterItem[]>(
      () =>
        filter
          .replace(`${prefix}(`, '')
          .slice(0, -1)
          .split(/\sor\s|\sOR\s/)
          .filter((v: string) => v && v !== '')
          .map((v: string) => {
            const not = v.startsWith('NOT(') && v.endsWith(')');
            return { value: not ? v.substring(4, v.length - 1) : v, not };
          }),
      [filter, prefix]
    );

    const handleClick = useCallback(
      (item: FilterItem, index: number, array: FilterItem[]) => {
        const values = array
          .map(a => (a.value !== item.value ? a : { ...a, not: !a.not }))
          .map(a => (a.not ? `NOT(${a.value})` : a.value));

        query.replace('fq', filter, `${label}:(${values.join(' OR ')})`);
        navigate(`${location.pathname}?${query.getDeltaString()}${location.hash}`);
      },
      [filter, label, location.hash, location.pathname, navigate, query]
    );

    const handleDelete = useCallback(
      (item: FilterItem, index: number, array: FilterItem[]) => {
        const values = array.filter(a => a.value !== item.value).map(a => (a.not ? `NOT(${a.value})` : a.value));
        if (values.length > 0) query.replace('fq', filter, `${label}:(${values.join(' OR ')})`);
        else query.remove('fq', filter);
        navigate(`${location.pathname}?${query.getDeltaString()}${location.hash}`);
      },
      [filter, location.hash, location.pathname, navigate, label, query]
    );

    return (
      !hide &&
      filters.length > 0 && (
        <div style={{ display: 'inline-block' }}>
          <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'baseline' }}>
            <b style={{ wordBreak: 'initial', paddingRight: theme.spacing(1) }}>{`${t(label)}: `}</b>
            <ChipList
              items={filters.map((f, i) => ({
                variant: variant,
                label: f.value,
                color: f.not ? 'error' : 'default',
                size: size,
                onClick: disabled ? null : () => handleClick(f, i, filters),
                onDelete: disabled ? null : () => handleDelete(f, i, filters)
              }))}
            />
          </div>
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
  hideSort?: boolean;
  disableActions?: boolean;
};

const WrappedAlertFiltersSelected = ({
  query,
  hideQuery = false,
  hideTC = false,
  hideGroupBy = false,
  hideSort = false,
  disableActions = false
}: Props) => {
  const { t } = useTranslation('alerts');
  const theme = useTheme();
  const classes = useStyles();
  const location = useLocation();
  const navigate = useNavigate();

  const { userFavorites, globalFavorites } = useFavorites();

  const allFavorites = useMemo<Favorite[]>(
    () => [...userFavorites, ...globalFavorites],
    [globalFavorites, userFavorites]
  );

  const params = useMemo<{ [key: string]: string }>(() => query.getParams(), [query]);

  const { statuses, priorities, labels, favorites, others } = useMemo<Filters>(() => {
    let filters = { statuses: [], priorities: [], labels: [], favorites: [], others: [] };
    query.getAll('fq', []).forEach(filter => {
      if (filter.startsWith('status:')) filters.statuses.push(filter);
      else if (filter.startsWith('priority:')) filters.priorities.push(filter);
      else if (filter.startsWith('label:')) filters.labels.push(filter);
      else {
        const favorite = allFavorites.find(f => f.query === filter || `NOT(${f.query})` === filter);
        if (favorite) filters.favorites.push({ ...favorite, query: filter });
        else filters.others.push(filter);
      }
    });
    return filters;
  }, [allFavorites, query]);

  return (
    <div
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        flexDirection: 'row',
        columnGap: theme.spacing(1),
        rowGap: theme.spacing(0.5)
      }}
    >
      {!hideQuery && query.get('q', null) && (
        <div style={{ display: 'inline-block' }}>
          <ChipList
            items={[query.get('q')].map(v => ({
              variant: 'outlined',
              label: `${v}`,
              onDelete: disableActions
                ? null
                : () => {
                    query.delete('q');
                    navigate(`${location.pathname}?${query.getDeltaString()}${location.hash}`);
                  }
            }))}
          />
        </div>
      )}

      <MenuFilter
        classes={{
          deleteIcon: clsx(classes.deleteIcon, classes.desc, params.sort && params.sort.endsWith('asc') && classes.asc)
        }}
        getLabel={item => (
          <div style={{ display: 'flex', flexDirection: 'row', gap: theme.spacing(0.5), alignItems: 'center' }}>
            <span>{`${t('sorts.title')}: ${t(item.substring(0, item.indexOf(' ')))}`}</span>
            {disableActions && <ArrowDownwardIcon style={{ fontSize: 'medium' }} />}
          </div>
        )}
        getListItemIcon={option =>
          params.sort.startsWith(option.value) && (
            <ArrowDownwardIcon className={clsx(classes.desc, params.sort.endsWith('asc') && classes.asc)} />
          )
        }
        param={params.sort}
        hide={hideSort}
        disabled={disableActions}
        getSelected={option => params.sort.startsWith(option.value)}
        icon={<SortIcon />}
        deleteIcon={<ArrowDownwardIcon />}
        subHeader={t('sorts.title')}
        options={SORT_OPTIONS}
        disableCloseOnSelect
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

      <MenuFilter
        getLabel={() => {
          const option = TC_OPTIONS.find(o => o.value === params.tc);
          return option && option.value !== '' ? `${t('tc')}: ${t(option.label)}` : `${t('tc')}: ${t('none')}`;
        }}
        param={params.tc}
        hide={hideTC}
        disabled={disableActions}
        getSelected={option => params.tc === option.value}
        icon={<DateRangeIcon />}
        deleteIcon={<ReplayOutlinedIcon />}
        subHeader={t('tc')}
        options={TC_OPTIONS}
        onClick={(event, option) => {
          query.set('tc', option.value);
          navigate(`${location.pathname}?${query.getDeltaString()}${location.hash}`);
        }}
        onDelete={() => {
          query.delete('tc');
          navigate(`${location.pathname}?${query.getDeltaString()}${location.hash}`);
        }}
      />

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
        icon={<SourceIcon />}
        deleteIcon={<ReplayOutlinedIcon />}
        subHeader={t('groupBy')}
        options={GROUPBY_OPTIONS}
        onClick={(event, option) => {
          query.set('group_by', option.value);
          navigate(`${location.pathname}?${query.getDeltaString()}${location.hash}`);
        }}
        onDelete={() => {
          query.delete('group_by');
          navigate(`${location.pathname}?${query.getDeltaString()}${location.hash}`);
        }}
      />

      {statuses.map((filter, i) => (
        <ListFilter
          key={`status-${i}`}
          filter={filter}
          query={query}
          disabled={disableActions}
          hide={false}
          label={'status'}
          prefix={'status:'}
        />
      ))}

      {priorities.map((filter, i) => (
        <ListFilter
          key={`priority-${i}`}
          filter={filter}
          query={query}
          disabled={disableActions}
          hide={false}
          label={'priority'}
          prefix={'priority:'}
        />
      ))}

      {labels.map((filter, i) => (
        <ListFilter
          key={`label-${i}`}
          filter={filter}
          query={query}
          disabled={disableActions}
          hide={false}
          label={'label'}
          prefix={'label:'}
        />
      ))}

      {favorites.length !== 0 && (
        <div>
          <ChipList
            items={favorites.map(v =>
              v.query.startsWith('NOT(') && v.query.endsWith(')')
                ? {
                    icon: (
                      <StarIcon
                        style={{
                          color: theme.palette.mode === 'dark' ? theme.palette.error.light : theme.palette.error.dark
                        }}
                      />
                    ),
                    variant: 'outlined',
                    color: 'error',
                    label: <b>{v.name}</b>,
                    tooltip: `${v.query} (${v.created_by})`,
                    onClick: disableActions
                      ? null
                      : () => {
                          const value = v.query.substring(4, v.query.length - 1);
                          query.replace('fq', `NOT(${value})`, value);
                          navigate(`${location.pathname}?${query.getDeltaString()}${location.hash}`);
                        },
                    onDelete: disableActions
                      ? null
                      : () => {
                          query.remove('fq', v.query);
                          navigate(`${location.pathname}?${query.getDeltaString()}${location.hash}`);
                        }
                  }
                : {
                    icon: <StarIcon />,
                    variant: 'outlined',
                    label: <b>{v.name}</b>,
                    tooltip: `${v.query} (${v.created_by})`,
                    onClick: disableActions
                      ? null
                      : () => {
                          query.replace('fq', v.query, `NOT(${v.query})`);
                          navigate(`${location.pathname}?${query.getDeltaString()}${location.hash}`);
                        },
                    onDelete: disableActions
                      ? null
                      : () => {
                          query.remove('fq', v.query);
                          navigate(`${location.pathname}?${query.getDeltaString()}${location.hash}`);
                        }
                  }
            )}
          />
        </div>
      )}

      {others.length !== 0 && (
        <div>
          <ChipList
            items={others.map(v => {
              const isNot = v.startsWith('NOT(') && v.endsWith(')');
              const value = isNot ? v.substring(4, v.length - 1) : v;

              return {
                variant: 'outlined',
                label: value,
                color: isNot ? 'error' : 'default',
                onClick: disableActions
                  ? null
                  : () => {
                      if (isNot) query.replace('fq', v, value);
                      else query.replace('fq', v, `NOT(${v})`);
                      navigate(`${location.pathname}?${query.getDeltaString()}${location.hash}`);
                    },
                onDelete: disableActions
                  ? null
                  : () => {
                      query.remove('fq', v);
                      navigate(`${location.pathname}?${query.getDeltaString()}${location.hash}`);
                    }
              };
            })}
          />
        </div>
      )}
    </div>
  );
};

export const AlertFiltersSelected = React.memo(WrappedAlertFiltersSelected);
export default AlertFiltersSelected;
