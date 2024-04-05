import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import ReplayOutlinedIcon from '@mui/icons-material/ReplayOutlined';
import makeStyles from '@mui/styles/makeStyles';
import clsx from 'clsx';
import { DEFAULT_QUERY } from 'components/routes/alerts';
import { ChipList } from 'components/visual/ChipList';
import SimpleSearchQuery from 'components/visual/SearchBar/simple-search-query';
import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router-dom';

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
  }
}));

type Props = {
  hideQuery?: boolean;
  hideGroupBy?: boolean;
  hideSort?: boolean;
  disableActions?: boolean;
};

const WrappedAlertFiltersSelected = ({
  hideQuery = false,
  hideGroupBy = false,
  hideSort = false,
  disableActions = false
}: Props) => {
  const { t } = useTranslation('alerts');
  const classes = useStyles();
  const location = useLocation();
  const navigate = useNavigate();

  const query = useMemo<SimpleSearchQuery>(
    () => new SimpleSearchQuery(location.search, DEFAULT_QUERY),
    [location.search]
  );
  const params = useMemo<{ [key: string]: string }>(() => query.getParams(), [query]);
  const filters = useMemo<string[]>(() => query.getAll('fq', []), [query]);
  const statuses = useMemo<string[]>(() => filters.filter(filter => filter.startsWith('status:')), [filters]);
  const priorities = useMemo<string[]>(() => filters.filter(filter => filter.startsWith('priority:')), [filters]);
  const labels = useMemo<string[]>(() => filters.filter(filter => filter.startsWith('label:')), [filters]);
  const others = useMemo<string[]>(
    () =>
      filters.filter(
        filter => !filter.startsWith('status:') && !filter.startsWith('priority:') && !filter.startsWith('label:')
      ),
    [filters]
  );

  return (
    <div>
      <div>
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
        {!hideSort && params.sort && (
          <div style={{ display: 'inline-block' }}>
            <ChipList
              items={[params.sort].map(v => ({
                classes: {
                  icon: clsx(classes.desc, params.sort.endsWith('asc') && classes.asc)
                },
                variant: 'outlined',
                label: `${t('sortBy')}=${t(v.substring(0, v.indexOf(' ')))}`,
                icon: <ArrowDownwardIcon />,
                deleteIcon: <ReplayOutlinedIcon />,
                onClick: disableActions
                  ? null
                  : () => {
                      query.set(
                        'sort',
                        params.sort.endsWith('desc')
                          ? params.sort.replace('desc', 'asc')
                          : params.sort.replace('asc', 'desc')
                      );
                      navigate(`${location.pathname}?${query.getDeltaString()}${location.hash}`);
                    },
                onDelete: disableActions
                  ? null
                  : () => {
                      query.delete('sort');
                      navigate(`${location.pathname}?${query.getDeltaString()}${location.hash}`);
                    }
              }))}
            />
          </div>
        )}
        {params.tc && (
          <div style={{ display: 'inline-block' }}>
            <ChipList
              items={[params.tc].map(v => ({
                variant: 'outlined',
                label: `${t('tc')}=${v}`,
                deleteIcon: <ReplayOutlinedIcon />,
                onDelete: disableActions
                  ? null
                  : () => {
                      query.delete('tc');
                      navigate(`${location.pathname}?${query.getDeltaString()}${location.hash}`);
                    }
              }))}
            />
          </div>
        )}
        {!hideGroupBy && params.group_by && (
          <div style={{ display: 'inline-block' }}>
            <ChipList
              items={[params.group_by].map(v => ({
                variant: 'outlined',
                label: `${t('groupBy')}=${v}`,
                onDelete: disableActions
                  ? null
                  : () => {
                      query.delete('group_by');
                      navigate(`${location.pathname}?${query.getDeltaString()}${location.hash}`);
                    }
              }))}
            />
          </div>
        )}
        {statuses.length !== 0 && (
          <div style={{ display: 'inline-block' }}>
            <ChipList
              items={statuses.map(v => ({
                variant: 'outlined',
                label: v,
                onDelete: disableActions
                  ? null
                  : () => {
                      query.remove('fq', v);
                      navigate(`${location.pathname}?${query.getDeltaString()}${location.hash}`);
                    }
              }))}
            />
          </div>
        )}
        {priorities.length !== 0 && (
          <div style={{ display: 'inline-block' }}>
            <ChipList
              items={priorities.map(v => ({
                variant: 'outlined',
                label: v,
                onDelete: disableActions
                  ? null
                  : () => {
                      query.remove('fq', v);
                      navigate(`${location.pathname}?${query.getDeltaString()}${location.hash}`);
                    }
              }))}
            />
          </div>
        )}
        {labels.length !== 0 && (
          <div style={{ display: 'inline-block' }}>
            <ChipList
              items={labels.map(v => ({
                variant: 'outlined',
                label: v,
                onDelete: disableActions
                  ? null
                  : () => {
                      query.remove('fq', v);
                      navigate(`${location.pathname}?${query.getDeltaString()}${location.hash}`);
                    }
              }))}
            />
          </div>
        )}
        {others.length !== 0 && (
          <div style={{ display: 'inline-block' }}>
            <ChipList
              items={others.map(v => ({
                variant: 'outlined',
                label: v,
                onDelete: disableActions
                  ? null
                  : () => {
                      query.remove('fq', v);
                      navigate(`${location.pathname}?${query.getDeltaString()}${location.hash}`);
                    }
              }))}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export const AlertFiltersSelected = React.memo(WrappedAlertFiltersSelected);
export default AlertFiltersSelected;
