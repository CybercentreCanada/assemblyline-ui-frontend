import BackspaceIcon from '@mui/icons-material/Backspace';
import ReplayOutlinedIcon from '@mui/icons-material/ReplayOutlined';
import {
  Checkbox,
  Divider,
  Grid,
  IconButton,
  InputAdornment,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Paper,
  TextField,
  Theme,
  Tooltip,
  useTheme
} from '@mui/material';
import ListItemIcon from '@mui/material/ListItemIcon';
import makeStyles from '@mui/styles/makeStyles';
import useALContext from 'components/hooks/useALContext';
import useMyAPI from 'components/hooks/useMyAPI';
import CustomChip from 'components/visual/CustomChip';
import SimpleSearchQuery from 'components/visual/SearchBar/simple-search-query';
import 'moment/locale/fr';
import React, { useCallback, useDeferredValue, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';
import { useLocation, useParams } from 'react-router-dom';
import { DEFAULT_QUERY, Field, FIELDS, Params } from './models';

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    display: 'flex',
    flexDirection: 'column',
    rowGap: theme.spacing(1),
    paddingTop: theme.spacing(1),
    paddingBottom: theme.spacing(1)
  },
  item: {
    paddingLeft: theme.spacing(2),
    paddingRight: theme.spacing(2)
  },
  title: {
    paddingLeft: theme.spacing(2)
  },
  list: {
    // width: '100%',
    // bgcolor: 'background.paper',
    // paddingTop: theme.spacing(2),
    // borderRadius: '4px',
    // height: '100%',
    // overflowY: 'auto'
  },
  searchresult: {
    paddingLeft: theme.spacing(1),
    color: theme.palette.primary.main,
    fontStyle: 'italic'
  },
  chipRoot: {
    paddingTop: '6px'
  },
  chipLabel: {
    paddingLeft: theme.spacing(0.25),
    paddingRight: theme.spacing(0.25),
    fontSize: '18px'
  },
  tooltip: {
    opacity: 1
  }
}));

type Props = {};

export const WrappedFields = (props: Props) => {
  const { t } = useTranslation(['search']);
  const theme = useTheme();
  const classes = useStyles();
  const location = useLocation();
  const navigate = useNavigate();
  const { apiCall } = useMyAPI();
  const { index: paramIndex, field: paramField } = useParams<Params>();
  const { indexes } = useALContext();

  const [fieldStats, setFieldStats] = useState<Record<string, number>>(null);
  const [filter, setFilter] = useState<string>('');
  const deferredFilter = useDeferredValue<string>(filter);

  const fieldKeys = useMemo<string[]>(
    () =>
      paramIndex
        ? Object.entries(indexes[paramIndex])
            .filter(([key, value]: [string, Field]) => value.indexed)
            .map(([key, value]) => key)
        : [],
    [indexes, paramIndex]
  );

  const currentField = useMemo<string>(
    () => (!paramIndex && paramField in indexes[paramIndex] ? paramField : null),
    [indexes, paramField, paramIndex]
  );

  const queryFields = useMemo<Record<string, null>>(() => {
    const fl = new SimpleSearchQuery(location.search, DEFAULT_QUERY).get('fl', null);

    if (fl) return Object.fromEntries(fl.split(',').map(key => [key, null]));
    else
      return Object.fromEntries(
        Object.entries(indexes[paramIndex])
          .filter(([key, value]: [string, Field]) => value.stored)
          .map(([key, value]) => [key, null])
      );
  }, [indexes, location.search, paramIndex]);

  const handleIndexClick = useCallback(
    (field: string) => (event: React.MouseEvent<any>) => {
      navigate(`/fieldsearch/${paramIndex}/${field}/${location.search}${location.hash}`);
    },
    [location.hash, location.search, navigate, paramIndex]
  );

  const handleCheckClick = useCallback(
    (field: string) => () => {
      const keys = Object.keys(queryFields);
      const fl = field in queryFields ? keys.filter(i => i !== field) : [...keys, field];

      const query = new SimpleSearchQuery(location.search, DEFAULT_QUERY);
      query.set('fl', fl.join(','));

      navigate(`/fieldsearch/${paramIndex}/${paramField}/?${query.toString()}${location.hash}`);
    },
    [location.hash, location.search, navigate, paramField, paramIndex, queryFields]
  );

  const handleResetClick = useCallback(() => {
    const query = new SimpleSearchQuery(location.search, DEFAULT_QUERY);
    query.delete('fl');
    navigate(`/fieldsearch/${paramIndex}/${paramField}/?${query.toString()}${location.hash}`);
  }, [location.hash, location.search, navigate, paramField, paramIndex]);

  useEffect(() => {
    if (paramIndex) {
      const query = new SimpleSearchQuery(location.search, DEFAULT_QUERY);
      apiCall({
        method: 'POST',
        url: `/api/v4/search/doc_count/${paramIndex}/`,
        body: {
          // ...Object.fromEntries(Object.entries(query.getParams()).filter(([k, v]) => ['query'].includes(k))),
          query: query.get('query', '*'),
          fl: Object.keys(indexes[paramIndex]).join(','),
          filters: query.getAll('filters', [])
        },
        onSuccess: api_data => setFieldStats(api_data.api_response),
        onFailure: () => setFieldStats(null)
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [indexes, location.search, paramIndex]);

  return (
    <Grid className={classes.root} component={Paper}>
      <ListItem
        className={classes.title}
        disablePadding
        secondaryAction={
          <IconButton edge="end" aria-label="delete" onClick={handleResetClick}>
            <ReplayOutlinedIcon />
          </IconButton>
        }
      >
        <ListItemText primary={`${t(paramIndex)} ${t(`Fields`)}`} secondary={`${fieldKeys.length} indexed fields`} />
      </ListItem>

      <div className={classes.item}>
        <TextField
          size="small"
          fullWidth
          placeholder="filter..."
          value={filter}
          onChange={e => setFilter(e.target.value)}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton size="small" onClick={() => setFilter('')}>
                  <BackspaceIcon fontSize="small" />
                </IconButton>
              </InputAdornment>
            )
          }}
        />
      </div>

      <Divider />
      <List className={classes.list} dense disablePadding>
        {React.useMemo(
          () => (
            <>
              {fieldKeys
                .filter(field => field.indexOf(deferredFilter) !== -1)
                .map((field, i) => (
                  <Tooltip
                    classes={{ tooltip: classes.tooltip }}
                    title={t('notification.title')}
                    arrow
                    placement="right"
                  >
                    <ListItem
                      key={`${field}-${i}`}
                      disablePadding
                      secondaryAction={
                        queryFields && (
                          <Checkbox size="small" checked={field in queryFields} onChange={handleCheckClick(field)} />
                        )
                      }
                    >
                      <ListItemButton
                        dense
                        selected={field === currentField}
                        disabled={['text', 'ip'].includes(indexes[paramIndex][field].type)}
                        onClick={handleIndexClick(field)}
                      >
                        <ListItemIcon>
                          <CustomChip
                            size="small"
                            type="rounded"
                            variant="outlined"
                            color={
                              indexes[paramIndex][field].type in FIELDS
                                ? FIELDS[indexes[paramIndex][field].type].color
                                : 'default'
                            }
                            icon={
                              indexes[paramIndex][field].type in FIELDS
                                ? FIELDS[indexes[paramIndex][field].type].icon
                                : null
                            }
                            label={`${fieldStats && field in fieldStats ? fieldStats[field] : ''}`}
                          />
                        </ListItemIcon>
                        <ListItemText primary={field} style={{ paddingRight: theme.spacing(1) }} />
                      </ListItemButton>
                    </ListItem>
                  </Tooltip>
                ))}
            </>
          ),
          [
            classes,
            currentField,
            deferredFilter,
            fieldKeys,
            fieldStats,
            handleCheckClick,
            handleIndexClick,
            indexes,
            paramIndex,
            queryFields,
            t,
            theme
          ]
        )}
      </List>
    </Grid>
  );
};

export const Fields = React.memo<Props>(WrappedFields);
