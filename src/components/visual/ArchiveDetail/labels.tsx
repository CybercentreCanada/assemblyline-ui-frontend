import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import {
  Button,
  Collapse,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Grid,
  IconButton,
  MenuItem,
  Paper,
  Select,
  TextField,
  Tooltip,
  Typography,
  useTheme
} from '@mui/material';
import makeStyles from '@mui/styles/makeStyles';
import useMyAPI from 'components/hooks/useMyAPI';
import useMySnackbar from 'components/hooks/useMySnackbar';
import ConfirmationDialog from 'components/visual/ConfirmationDialog';
import 'moment/locale/fr';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ChipList } from '../ChipList';

const useStyles = makeStyles(theme => ({
  container: {
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
  preview: {
    margin: 0,
    padding: theme.spacing(0.75, 1),
    whiteSpace: 'pre-wrap',
    wordBreak: 'break-word'
  }
}));

const DEFAULT_LABELS = {
  attribution: [],
  technique: [],
  info: []
};

const LABELS: Record<
  keyof typeof DEFAULT_LABELS,
  { color: 'default' | 'primary' | 'error' | 'info' | 'success' | 'warning' | 'secondary' }
> = {
  attribution: { color: 'primary' },
  technique: { color: 'secondary' },
  info: { color: 'default' }
};

type Labels = Partial<Record<keyof typeof DEFAULT_LABELS, string[]>>;

type NewLabel = Record<'value' | 'category', string>;

type Props = {
  sha256: string;
  labels: Labels;
};

const WrappedLabelSection: React.FC<Props> = ({ sha256 = null, labels: propLabels = null }) => {
  const { t } = useTranslation(['archive']);
  const theme = useTheme();
  const classes = useStyles();
  const { apiCall } = useMyAPI();
  const { showSuccessMessage, showErrorMessage } = useMySnackbar();

  const [labels, setLabels] = useState<Labels>(null);
  const [newLabel, setNewLabel] = useState<NewLabel>({ value: '', category: '' });
  const [isCollapsed, setIsCollapsed] = useState<boolean>(false);
  const [addDialog, setAddDialog] = useState<boolean>(false);
  const [saveConfirmation, setSaveConfirmation] = useState<boolean>(false);
  const [waiting, setWaiting] = useState<boolean>(false);

  const prevLabels = useRef<Labels>(null);

  const sortedLabels = useMemo<Labels>(() => {
    if (!labels || typeof labels !== 'object') return DEFAULT_LABELS;
    return Object.fromEntries(
      Object.keys(DEFAULT_LABELS).map(cat => [
        cat,
        Array.isArray(labels[cat]) ? labels[cat].sort((a, b) => a.localeCompare(b)) : []
      ])
    );
  }, [labels]);

  const hasDifferentLabels = useMemo<boolean>(
    () =>
      !labels
        ? false
        : Object.keys(prevLabels.current).some(
            cat =>
              labels[cat].filter(l => !prevLabels.current[cat].includes(l)).length > 0 ||
              prevLabels.current[cat].filter(l => !labels[cat].includes(l)).length > 0
          ),
    [labels]
  );

  const handleDeleteLabel = useCallback((category: keyof typeof DEFAULT_LABELS, label: string) => {
    setLabels(lbs => ({ ...lbs, [category]: lbs[category].filter(l => l !== label) }));
  }, []);

  const handleAddDialogOpen = useCallback((event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    event.preventDefault();
    event.stopPropagation();
    setAddDialog(true);
  }, []);

  const handleCloseAddDialog = useCallback(() => {
    setAddDialog(false);
    setNewLabel({ value: '', category: '' });
  }, []);

  const handleAddLabel = useCallback(({ value, category }: NewLabel) => {
    setAddDialog(false);
    setNewLabel({ value: '', category: '' });
    setLabels(lbs => ({ ...lbs, [category]: [...lbs[category], value] }));
  }, []);

  const handleNewLabelChange = useCallback(
    (key: keyof NewLabel) => event => setNewLabel(l => ({ ...l, [key]: event.target.value })),
    []
  );

  const handleRevertLabels = useCallback(() => {
    setLabels(prevLabels.current);
  }, []);

  const handleAcceptConfirmation = useCallback(
    (data: Labels) => {
      if (!sha256) return;
      apiCall({
        method: 'POST',
        url: `/api/v4/file/label/${sha256}/`,
        body: { ...data },
        onSuccess: api_data => {
          setLabels(data);
          prevLabels.current = data;
          showSuccessMessage(t('labels.success'));
          setTimeout(() => window.dispatchEvent(new CustomEvent('reloadArchive')), 1000);
        },
        onFailure: api_data => showErrorMessage(api_data.api_response),
        onEnter: () => setWaiting(true),
        onExit: () => {
          setWaiting(false);
          setSaveConfirmation(false);
        }
      });
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [sha256, showErrorMessage, showSuccessMessage, t]
  );

  const LabelItem: React.FC<{ category: string; prev: string[]; next: string[] }> = useCallback(
    ({ category = '', prev = [], next = [] }) => {
      const added = next.filter(l => !prev.includes(l));
      const removed = prev.filter(l => !next.includes(l));

      return (
        added.concat(removed).length > 0 && (
          <Grid item>
            <Typography variant="subtitle2" children={t(category)} />
            <Paper component="pre" variant="outlined" className={classes.preview}>
              <ChipList
                items={removed.map((value, i) => ({
                  key: i,
                  color: 'error',
                  label: value,
                  size: 'small',
                  variant: 'outlined'
                }))}
              />
              <ChipList
                items={added.map((value, i) => ({
                  key: i,
                  color: 'success',
                  label: value,
                  size: 'small',
                  variant: 'outlined'
                }))}
              />
            </Paper>
          </Grid>
        )
      );
    },
    [classes.preview, t]
  );

  useEffect(() => {
    setLabels(propLabels);
    prevLabels.current = propLabels;
  }, [propLabels]);

  return (
    <div className={classes.container}>
      <Dialog open={addDialog} onClose={handleCloseAddDialog}>
        <DialogTitle>{t('label.add.header')}</DialogTitle>
        <DialogContent>
          <Grid container flexDirection="column" spacing={2}>
            <Grid item children={t('label.add.content')} />
            <Grid item>
              <Typography variant="subtitle2" children={t('label')} />
              <TextField
                value={newLabel.value}
                variant="outlined"
                fullWidth
                autoFocus
                onChange={handleNewLabelChange('value')}
              />
            </Grid>
            <Grid item>
              <Typography variant="subtitle2" children={t('category')} />
              <Select value={newLabel.category} fullWidth onChange={handleNewLabelChange('category')}>
                <MenuItem value={'attribution'} children={t('attribution')} />
                <MenuItem value={'info'} children={t('info')} />
                <MenuItem value={'technique'} children={t('technique')} />
              </Select>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button color="secondary" children={t('cancel')} onClick={handleCloseAddDialog} />
          <Button
            color="primary"
            autoFocus
            disabled={
              [null, undefined, ''].includes(newLabel?.value) || [null, undefined, ''].includes(newLabel?.category)
            }
            children={t('label.add.ok')}
            onClick={() => handleAddLabel(newLabel)}
          />
        </DialogActions>
      </Dialog>

      <ConfirmationDialog
        open={saveConfirmation}
        waiting={waiting}
        title={t('label.save.header')}
        acceptText={t('label.save.ok')}
        cancelText={t('cancel')}
        handleAccept={() => handleAcceptConfirmation(sortedLabels)}
        handleClose={() => setSaveConfirmation(false)}
        handleCancel={() => setSaveConfirmation(false)}
        text={
          <Grid container flexDirection="column" spacing={theme.spacing(2)}>
            <Grid item children={t('label.save.content')} />
            {labels &&
              Object.keys(DEFAULT_LABELS).map((category, i) => (
                <LabelItem key={i} category={category} prev={prevLabels.current[category]} next={labels[category]} />
              ))}
            <Grid item children={t('label.save.confirm')} />
          </Grid>
        }
      />
      <Typography className={classes.title} variant="h6" onClick={() => setIsCollapsed(c => !c)}>
        <span>{t('labels')}</span>
        <div style={{ flex: 1 }} />
        <Tooltip title={t('add')}>
          <IconButton
            size="large"
            style={{
              color: theme.palette.mode === 'dark' ? theme.palette.success.light : theme.palette.success.dark
            }}
            onClick={handleAddDialogOpen}
          >
            <AddCircleOutlineIcon />
          </IconButton>
        </Tooltip>
        {!isCollapsed ? <ExpandLess /> : <ExpandMore />}
      </Typography>
      <Divider />
      <Collapse in={!isCollapsed} timeout="auto">
        <div style={{ padding: `${theme.spacing(2)} 0` }}>
          {Object.entries(sortedLabels).map(([cat, values], i) => (
            <Grid key={i} container>
              <Grid item xs={12} sm={3} lg={2}>
                <span style={{ fontWeight: 500 }}>{t(cat)}</span>
              </Grid>
              <Grid item xs={12} sm={9} lg={10}>
                <ChipList
                  items={values.map((value, j) => ({
                    key: `${i}-${j}`,
                    color: cat in LABELS ? LABELS[cat].color : 'primary',
                    label: value,
                    size: 'small',
                    variant: 'outlined',
                    onDelete: () => handleDeleteLabel(cat as keyof typeof DEFAULT_LABELS, value)
                  }))}
                />
              </Grid>
            </Grid>
          ))}
        </div>
        {hasDifferentLabels && (
          <Grid container gap={1} justifyContent="flex-end">
            <Tooltip title={t('label.discard.tooltip')}>
              <span>
                <Button variant="outlined" color="primary" onClick={handleRevertLabels}>
                  {t('label.discard.button')}
                </Button>
              </span>
            </Tooltip>
            <Tooltip title={t('label.save.tooltip')}>
              <span>
                <Button variant="contained" color="primary" onClick={() => setSaveConfirmation(true)}>
                  {t('label.save.button')}
                </Button>
              </span>
            </Tooltip>
          </Grid>
        )}
      </Collapse>
    </div>
  );
};

const LabelSection = React.memo(WrappedLabelSection);
export default LabelSection;
