import ManageSearchIcon from '@mui/icons-material/ManageSearch';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  IconButton,
  Paper,
  Tooltip,
  Typography,
  useTheme
} from '@mui/material';
import useMySnackbar from 'components/hooks/useMySnackbar';
import { ALERT_DEFAULT_PARAMS, ALERT_STORAGE_KEY, type AlertSearchParams } from 'components/routes/alerts';
import AlertFiltersSelected from 'components/routes/alerts/components/FiltersSelected';
import { useSearchParams } from 'components/routes/alerts/contexts/SearchParamsContext';
import { SearchParser, type SearchResult } from 'components/routes/alerts/utils/SearchParser';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

const IGNORED_PARAMETERS: (keyof AlertSearchParams)[] = [
  'q',
  'no_delay',
  'tc_start',
  'track_total_hits',
  'refresh',
  'offset',
  'rows'
];

const WrappedAlertDefaultSearchParameters = () => {
  const { t } = useTranslation('alerts');
  const theme = useTheme();
  const { showSuccessMessage } = useMySnackbar();
  const { search } = useSearchParams<AlertSearchParams>();

  const [storageData, setStorageData] = useState<string>(null);
  const [open, setOpen] = useState<boolean>(false);
  const [fromStorage, seFromStorage] = useState<boolean>(() => !!localStorage.getItem(ALERT_STORAGE_KEY));

  const parser = useMemo(() => new SearchParser<AlertSearchParams>(ALERT_DEFAULT_PARAMS, { enforced: ['rows'] }), []);

  const defaults = useMemo<SearchResult<AlertSearchParams>>(
    () => parser.fullParams(storageData).filter(k => ['fq', 'group_by', 'sort', 'tc'].includes(k)),
    [parser, storageData]
  );

  const filteredSearch = useMemo<SearchResult<AlertSearchParams>>(
    () => search.filter(k => ['fq', 'group_by', 'sort', 'tc'].includes(k)),
    [search]
  );

  const isSameParams = useMemo<boolean>(
    () => filteredSearch.toString() === defaults.toString(),
    [defaults, filteredSearch]
  );

  const onDefaultChange = useCallback(
    (value: URLSearchParams) => {
      const params = parser.deltaParams(value).filter(k => !IGNORED_PARAMETERS.includes(k));
      localStorage.setItem(ALERT_STORAGE_KEY, params.toString());
    },
    [parser]
  );

  const onDefaultClear = useCallback(() => {
    localStorage.removeItem(ALERT_STORAGE_KEY);
  }, []);

  useEffect(() => {
    if (!open) return;
    const value = localStorage.getItem(ALERT_STORAGE_KEY);
    setStorageData(value || '');
    seFromStorage(!!value);
  }, [defaults, filteredSearch, open]);

  return (
    <>
      <Tooltip title={t('session.tooltip')}>
        <div>
          <IconButton size="large" onClick={() => setOpen(true)}>
            <ManageSearchIcon />
          </IconButton>
        </div>
      </Tooltip>
      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        slotProps={{
          paper: {
            sx: {
              maxWidth: '1000px'
            }
          }
        }}
      >
        <DialogTitle>{t('session.title')}</DialogTitle>
        <DialogContent
          sx={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: theme.spacing(2),
            '@media (max-width:850px)': {
              gridTemplateColumns: '1fr'
            }
          }}
        >
          <Box
            sx={{
              gridColumn: 'span 2',
              '@media (max-width:850px)': {
                gridColumn: 'span 1'
              }
            }}
          >
            {t('session.description')}
          </Box>

          <Grid style={{ width: '100%' }}>
            <Typography variant="subtitle2">{t('session.existing')}</Typography>
            <Paper
              component="pre"
              variant="outlined"
              sx={{
                display: 'grid',
                gridTemplateColumns: 'auto 1fr',
                columnGap: theme.spacing(1),
                margin: 0,
                padding: theme.spacing(1.5),
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word',
                backgroundColor: theme.palette.mode === 'dark' ? theme.palette.grey[900] : theme.palette.grey[200]
              }}
            >
              {defaults.toString() === '' ? (
                <div>{t('none')}</div>
              ) : (
                <AlertFiltersSelected value={defaults.toObject()} visible={['fq', 'group_by', 'sort', 'tc']} disabled />
              )}
            </Paper>
          </Grid>

          <Grid style={{ width: '100%' }}>
            <Typography variant="subtitle2">{t('session.current')}</Typography>
            <Paper
              component="pre"
              variant="outlined"
              sx={{
                display: 'grid',
                gridTemplateColumns: 'auto 1fr',
                columnGap: theme.spacing(1),
                margin: 0,
                padding: theme.spacing(1.5),
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word',
                backgroundColor: theme.palette.mode === 'dark' ? theme.palette.grey[900] : theme.palette.grey[200]
              }}
            >
              {filteredSearch.toString() === '' ? (
                <div>{t('none')}</div>
              ) : (
                <AlertFiltersSelected value={search.toObject()} visible={['fq', 'group_by', 'sort', 'tc']} disabled />
              )}
            </Paper>
          </Grid>

          <div>{fromStorage ? t('session.clear.confirm') : t('session.clear.none')}</div>

          <div>
            {isSameParams
              ? t('session.save.same')
              : filteredSearch.toString() === ''
                ? t('session.save.none')
                : t('session.save.confirm')}
          </div>
        </DialogContent>
        <DialogActions>
          <Button
            color="primary"
            disabled={!fromStorage}
            children={t('session.clear')}
            onClick={() => {
              onDefaultClear();
              showSuccessMessage(t('session.clear.success'));
              setOpen(false);
            }}
          />
          <div style={{ flex: 1 }} />
          <Button autoFocus color="secondary" children={t('session.cancel')} onClick={() => setOpen(false)} />
          <Button
            color="primary"
            disabled={filteredSearch.toString() === '' || isSameParams}
            children={t('session.save')}
            onClick={() => {
              onDefaultChange(search.toParams());
              showSuccessMessage(t('session.save.success'));
              setOpen(false);
            }}
          />
        </DialogActions>
      </Dialog>
    </>
  );
};

export const AlertDefaultSearchParameters = React.memo(WrappedAlertDefaultSearchParameters);
export default AlertDefaultSearchParameters;
