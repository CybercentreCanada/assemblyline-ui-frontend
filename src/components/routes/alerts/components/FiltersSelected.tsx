import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import DateRangeIcon from '@mui/icons-material/DateRange';
import SearchOutlinedIcon from '@mui/icons-material/SearchOutlined';
import SortIcon from '@mui/icons-material/Sort';
import SourceIcon from '@mui/icons-material/Source';
import StarIcon from '@mui/icons-material/Star';
import type { ChipProps, MenuItemProps } from '@mui/material';
import { ListItemIcon, ListItemText, Menu, MenuItem, useTheme } from '@mui/material';
import makeStyles from '@mui/styles/makeStyles';
import clsx from 'clsx';
import type { AlertSearchParams } from 'components/routes/alerts';
import { useAlerts } from 'components/routes/alerts/contexts/AlertsContext';
import CustomChip from 'components/visual/CustomChip';
import Moment from 'components/visual/Moment';
import type { ReactNode } from 'react';
import React, { useCallback, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { Favorite } from './Favorites';
import type { Option } from './Filters';
import { GROUPBY_OPTIONS, SORT_OPTIONS, TC_OPTIONS } from './Filters';

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
  },
  icon: {
    marginLeft: `${theme.spacing(0.5)} !important`
  },
  other: {
    '&>.MuiChip-icon': {
      marginLeft: `${theme.spacing(0.5)} !important`
    }
  }
}));

type Filter = {
  value: string;
  filter: string;
  not: boolean;
};

type Filters = {
  status: Filter[];
  priority: Filter[];
  labels: Filter[];
  favorites: (Favorite & Filter)[];
  others: Filter[];
};

type MenuFilterProps = {
  param: string;
  visible: boolean;
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
    visible = true,
    disabled = false,
    classes = null,
    variant = 'outlined',
    size = 'small',
    icon = null,
    deleteIcon = null,
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

    return !visible || param === null || param === undefined ? null : (
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
    );
  }
);

type Props = {
  params: AlertSearchParams;
  onChange?: (value: AlertSearchParams) => void;
  visible?: (keyof AlertSearchParams)[];
  disabled?: boolean;
};

const WrappedAlertFiltersSelected = ({ params = null, onChange = null, visible = [], disabled = false }: Props) => {
  const { t } = useTranslation('alerts');
  const theme = useTheme();
  const classes = useStyles();
  const alertValues = useAlerts();

  const allFavorites = useMemo<Favorite[]>(
    () => (!alertValues ? [] : [...alertValues.userFavorites, ...alertValues.globalFavorites]),
    [alertValues]
  );

  const filters = useMemo<Filters>(() => {
    const defaults = { status: [], priority: [], labels: [], favorites: [], others: [] };
    if (!params) return defaults;

    params.fq.forEach(filter => {
      const not = filter.startsWith('NOT(') && filter.endsWith(')');
      const value = not ? filter.substring(4, filter.length - 1) : filter;

      const favorite = allFavorites.find(f => f.query === filter || `NOT(${f.query})` === filter);

      if (favorite) defaults.favorites.push({ ...favorite, filter, not, value });
      else if (value.startsWith('status:')) defaults.status.push({ filter, not, value });
      else if (value.startsWith('priority:')) defaults.priority.push({ filter, not, value });
      else if (value.startsWith('label:')) defaults.labels.push({ filter, not, value });
      else defaults.others.push({ filter, not, value });
    });
    return defaults;
  }, [allFavorites, params]);

  const handleChange = useCallback(
    (input: AlertSearchParams | ((params: AlertSearchParams) => AlertSearchParams)) => {
      if (disabled) return;
      onChange(typeof input === 'function' ? input(params) : params);
    },
    [disabled, onChange, params]
  );

  const handleQueryChange = useCallback(
    (filter: Filter) => {
      if (disabled) return;
      handleChange(v => ({
        ...v,
        fq: v.fq.map(f =>
          filter.filter !== f
            ? f
            : filter.not
            ? f.replace(`NOT(${filter.value})`, filter.value)
            : f.replace(filter.value, `NOT(${filter.value})`)
        )
      }));
    },
    [disabled, handleChange]
  );

  const handleQueryRemove = useCallback(
    (filter: Filter) => {
      if (disabled) return;
      handleChange(v => ({ ...v, fq: v.fq.filter(f => f !== filter.filter) }));
    },
    [disabled, handleChange]
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
      {visible.includes('q') && params.q && (
        <CustomChip
          icon={<SearchOutlinedIcon fontSize="small" />}
          label={
            <div style={{ display: 'flex', flexDirection: 'row', gap: theme.spacing(0.5), alignItems: 'center' }}>
              <span>{`${t('query')}: ${params.q}`}</span>
            </div>
          }
          size="small"
          style={{ minHeight: '25px' }}
          variant="outlined"
          wrap
          onDelete={() =>
            handleChange(v => {
              delete v.q;
              return v;
            })
          }
        />
      )}

      <MenuFilter
        classes={{
          icon: classes.icon,
          deleteIcon: clsx(classes.deleteIcon, classes.desc, params.sort && params.sort.endsWith('asc') && classes.asc)
        }}
        getLabel={item => (
          <div style={{ display: 'flex', flexDirection: 'row', gap: theme.spacing(0.5), alignItems: 'center' }}>
            <span>{`${t('sorts.title')}: ${t(item.substring(0, item.indexOf(' ')))}`}</span>
            {disabled && <ArrowDownwardIcon fontSize="small" />}
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
        visible={visible.includes('sort')}
        disabled={disabled}
        getSelected={option => params.sort.startsWith(option.value)}
        icon={<SortIcon fontSize="small" />}
        deleteIcon={<ArrowDownwardIcon />}
        title={t('sorts.title')}
        options={SORT_OPTIONS}
        disableCloseOnSelect
        style={{ minHeight: '25px' }}
        onClick={(_, option) =>
          handleChange(v => ({
            ...v,
            sort:
              v.sort.startsWith(option.value) && v.sort.endsWith('desc')
                ? `${option.value} asc`
                : `${option.value} desc`
          }))
        }
        onDelete={() =>
          handleChange(v => ({
            ...v,
            sort: v.sort.endsWith('desc') ? v.sort.replace('desc', 'asc') : v.sort.replace('asc', 'desc')
          }))
        }
      />

      <MenuFilter
        classes={{ icon: classes.icon }}
        getLabel={() => {
          const option = GROUPBY_OPTIONS.find(o => o.value === params.group_by);
          return option && option.value !== ''
            ? `${t('groupBy')}: ${t(option.label)}`
            : `${t('groupBy')}: ${t('none')}`;
        }}
        param={params.group_by}
        visible={visible.includes('group_by')}
        disabled={disabled}
        getSelected={option => params.group_by === option.value}
        icon={<SourceIcon fontSize="small" />}
        title={t('groupBy')}
        options={GROUPBY_OPTIONS}
        style={{ minHeight: '25px' }}
        onClick={(_, option) => handleChange(v => ({ ...v, group_by: option.value }))}
      />

      <MenuFilter
        classes={{ icon: classes.icon }}
        getLabel={() => {
          const option = TC_OPTIONS.find(o => o.value === params.tc);
          return option && option.value !== '' ? `${t('tc')}: ${t(option.label)}` : `${t('tc')}: ${t('none')}`;
        }}
        param={params.tc}
        visible={visible.includes('tc')}
        disabled={disabled}
        getSelected={option => params.tc === option.value}
        icon={<DateRangeIcon fontSize="small" />}
        title={t('tc')}
        options={TC_OPTIONS}
        style={{ minHeight: '25px' }}
        onClick={(_, option) => handleChange(v => ({ ...v, tc: option.value }))}
      />

      {visible.includes('tc_start') && params.tc_start && (
        <CustomChip
          classes={{ icon: classes.icon }}
          variant="outlined"
          size="small"
          wrap
          style={{ minHeight: '25px' }}
          icon={<DateRangeIcon fontSize="small" />}
          label={
            <div>
              <span>{t('tc_start')}: </span>
              <Moment variant="localeDateTime">{params.tc_start}</Moment>
            </div>
          }
          onDelete={() =>
            handleChange(v => {
              delete v.tc_start;
              return v;
            })
          }
        />
      )}

      {filters.favorites.map((favorite, i) => (
        <CustomChip
          key={`${favorite.filter}-${i}`}
          className={classes.other}
          variant="outlined"
          size="small"
          wrap
          style={{ minHeight: '25px' }}
          color={favorite.not ? 'error' : 'default'}
          label={favorite.name}
          icon={
            <StarIcon
              style={{
                ...(favorite.not && {
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
          onClick={() => handleQueryChange(favorite)}
          onDelete={() => handleQueryRemove(favorite)}
        />
      ))}

      {filters.status.map((status, i) => (
        <CustomChip
          key={`${status.filter}-${i}`}
          variant="outlined"
          size="small"
          wrap
          style={{ minHeight: '25px' }}
          color={status.not ? 'error' : 'default'}
          label={status.value}
          onClick={() => handleQueryChange(status)}
          onDelete={() => handleQueryRemove(status)}
        />
      ))}

      {filters.priority.map((priority, i) => (
        <CustomChip
          key={`${priority.filter}-${i}`}
          variant="outlined"
          size="small"
          wrap
          style={{ minHeight: '25px' }}
          color={priority.not ? 'error' : 'default'}
          label={priority.value}
          onClick={() => handleQueryChange(priority)}
          onDelete={() => handleQueryRemove(priority)}
        />
      ))}

      {filters.labels.map((label, i) => (
        <CustomChip
          key={`${label.filter}-${i}`}
          variant="outlined"
          size="small"
          wrap
          style={{ minHeight: '25px' }}
          color={label.not ? 'error' : 'default'}
          label={label.value}
          onClick={() => handleQueryChange(label)}
          onDelete={() => handleQueryRemove(label)}
        />
      ))}

      {filters.others.map((other, i) => (
        <CustomChip
          key={`${other.filter}-${i}`}
          className={classes.other}
          variant="outlined"
          size="small"
          wrap
          style={{ minHeight: '25px' }}
          color={other.not ? 'error' : 'default'}
          label={other.value}
          onClick={() => handleQueryChange(other)}
          onDelete={() => handleQueryRemove(other)}
        />
      ))}
    </div>
  );
};

export const AlertFiltersSelected = React.memo(WrappedAlertFiltersSelected);
export default AlertFiltersSelected;
