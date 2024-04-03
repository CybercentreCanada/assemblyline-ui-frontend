import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import { Alert, Button, CircularProgress, TextField, Tooltip, Typography, useTheme } from '@mui/material';
import Autocomplete from '@mui/material/Autocomplete';
import CustomChip from 'components/visual/CustomChip';
import SearchQuery, { SearchFilter } from 'components/visual/SearchBar/search-query';
import React, { SyntheticEvent, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import AlertsFiltersSelected from './alerts-filters-selected';

const POSSIBLE_STATUS = ['ASSESS', 'MALICIOUS', 'NON-MALICIOUS'];
const POSSIBLE_PRIORITY = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];
const DEFAULT_LABELS = [
  'PHISHING',
  'CRIME',
  'ATTRIBUTED',
  'WHITELISTED',
  'FALSE_POSITIVE',
  'REPORTED',
  'MITIGATED',
  'PENDING'
];

interface AlertsWorkflowActionsProps {
  searchQuery: SearchQuery;
  alert: any;
  labelFilters: SearchFilter[];
  onApplyBtnClick: (status: string, selectedPriority: string, addedLabels: string[], removedLabels: string[]) => void;
}

const AlertsWorkflowActions: React.FC<AlertsWorkflowActionsProps> = ({
  searchQuery,
  alert,
  labelFilters,
  onApplyBtnClick
}) => {
  const { t } = useTranslation('alerts');
  const theme = useTheme();
  const [formValid, setFormValid] = useState<boolean>(false);
  const [applying, setApplying] = useState<boolean>(false);
  const [possibleLabels] = useState<string[]>([
    ...DEFAULT_LABELS,
    ...labelFilters.filter(lbl => DEFAULT_LABELS.indexOf(lbl.label) === -1).map(val => val.label)
  ]);
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
  const [selectedPriority, setSelectedPriority] = useState<string | null>(null);
  const [addedLabels, setAddedLabels] = useState<string[]>([]);
  const [removedLabels, setRemovedLabels] = useState<string[]>([]);

  const validateForm = (status: string, priority: string, labels: string[]) => {
    const valid = (status || priority || (labels && labels.length > 0)) as boolean;
    setFormValid(valid);
  };

  const onStatusChange = (selection: string) => {
    validateForm(selection, selectedPriority, [...addedLabels, ...removedLabels]);
    setSelectedStatus(selection);
  };

  const onPriorityChange = (selection: string) => {
    validateForm(selectedStatus, selection, [...addedLabels, ...removedLabels]);
    setSelectedPriority(selection);
  };

  const renderLabelTags = (values: string[]) => {
    return values.map(value => (
      <CustomChip
        label={
          <div style={{ display: 'flex' }}>
            {removedLabels.indexOf(value) > -1 ? (
              <RemoveIcon fontSize="small" style={{ marginLeft: '-6px', marginRight: '4px', marginTop: '1px' }} />
            ) : (
              <AddIcon fontSize="small" style={{ marginLeft: '-6px', marginRight: '4px', marginTop: '1px' }} />
            )}
            {value}
          </div>
        }
        // Render adding labels as positive, removed labels as negative
        style={{ marginRight: theme.spacing(0.5) }}
        onDelete={() => onLabelDelete(value)}
        onClick={() => onLabelClick(value)}
        color={removedLabels.indexOf(value) > -1 ? 'error' : 'success'}
        variant="outlined"
      />
    ));
  };

  const onLabelChange = (selections: string[], reason: string) => {
    if (reason === 'clear') {
      // On clear, we'll reset all the label lists to factory values
      setAddedLabels([]);
      setRemovedLabels([]);
    } else {
      setAddedLabels(
        selections.filter(s => {
          return removedLabels.indexOf(s) === -1;
        })
      );
    }
  };

  const onLabelClick = (name: string) => {
    // Toggle between added and removed labels
    if (removedLabels.indexOf(name) > -1) {
      // Remove from removed label list only and add to added list
      setRemovedLabels(
        removedLabels.filter(label => {
          return label !== name;
        })
      );
      setAddedLabels([...addedLabels, name]);
    } else {
      // Remove from added label list only and add to removed list
      setAddedLabels(
        addedLabels.filter(label => {
          return label !== name;
        })
      );
      setRemovedLabels([...removedLabels, name]);
    }
  };

  const onLabelDelete = (name: string) => {
    // If we're trying to undo removing an existing label, then we need to revert it's visual state
    if (removedLabels.indexOf(name) > -1) {
      // Remove from removed label list only
      setRemovedLabels(
        removedLabels.filter(label => {
          return label !== name;
        })
      );
    }
    // If the label being deleted was a new label, then we can get rid of it
    else if (addedLabels.indexOf(name) > -1) {
      // Remove from added label list
      setAddedLabels(
        addedLabels.filter(label => {
          return label !== name;
        })
      );
    }
  };

  const _onApplyBtnClick = () => {
    if (formValid) {
      setApplying(true);
      onApplyBtnClick(selectedStatus, selectedPriority, addedLabels, removedLabels);
    }
  };

  const emptyFilters = () => {
    const filters = searchQuery.parseFilters();
    if (
      filters.tc === '' &&
      filters.labels.length === 0 &&
      filters.priorities.length === 0 &&
      filters.queries.length === 0 &&
      filters.statuses.length === 0
    ) {
      return true;
    }

    return false;
  };

  const query = searchQuery.getQuery();

  useEffect(() => {
    validateForm(selectedStatus, selectedPriority, [...addedLabels, ...removedLabels]);
  }, [selectedStatus, selectedPriority, addedLabels, removedLabels]);

  return (
    <div>
      <div style={{ margin: theme.spacing(1), marginBottom: theme.spacing(2) }}>
        <Typography variant="h4">{t('workflow.title')}</Typography>
      </div>
      <div style={{ margin: theme.spacing(1) }}>
        <Alert severity={query && query.startsWith('alert_id') && alert ? 'info' : 'warning'}>
          {query || !emptyFilters()
            ? query && query.startsWith('alert_id') && alert
              ? t('workflow.impact.low')
              : t('workflow.impact.high')
            : t('workflow.impact.all')}
        </Alert>
      </div>

      {(query || !emptyFilters()) && (
        <div style={{ margin: theme.spacing(1) }}>
          <div
            style={{
              wordBreak: 'break-word',
              marginTop: theme.spacing(1),
              padding: theme.spacing(2),
              color: theme.palette.primary.light,
              backgroundColor: theme.palette.mode === 'dark' ? theme.palette.grey[900] : theme.palette.grey[200]
            }}
          >
            <AlertsFiltersSelected searchQuery={searchQuery} disableActions hideGroupBy />
          </div>
        </div>
      )}

      <div style={{ margin: theme.spacing(1), marginTop: theme.spacing(2) }}>
        <div style={{ marginBottom: theme.spacing(2) }}>
          <Autocomplete
            fullWidth
            multiple={false}
            options={POSSIBLE_STATUS}
            value={selectedStatus}
            onChange={(event: SyntheticEvent<Element, Event>, value: string) => onStatusChange(value as string)}
            renderInput={params => <TextField {...params} label={t('status')} variant="outlined" />}
          />
        </div>
        <div style={{ marginBottom: theme.spacing(2) }}>
          <Autocomplete
            fullWidth
            multiple={false}
            options={POSSIBLE_PRIORITY}
            value={selectedPriority}
            onChange={(event: SyntheticEvent<Element, Event>, value: string) => onPriorityChange(value as string)}
            renderInput={params => <TextField {...params} label={t('priority')} variant="outlined" />}
          />
        </div>
        <div style={{ marginBottom: theme.spacing(2) }}>
          <Autocomplete
            fullWidth
            multiple
            freeSolo
            options={possibleLabels}
            filterSelectedOptions={true}
            value={[...addedLabels, ...removedLabels].sort()}
            renderInput={params => <TextField {...params} label={t('labels')} variant="outlined" />}
            onChange={(event, value, reason) => onLabelChange(value as string[], reason)}
            renderTags={(value, getTagProps, ownerState) => renderLabelTags(value)}
          />
        </div>
      </div>
      <div style={{ textAlign: 'right', marginTop: theme.spacing(1) }}>
        <Tooltip title={t('workflow.apply')}>
          <Button
            variant="contained"
            color="primary"
            onClick={_onApplyBtnClick}
            startIcon={applying ? <CircularProgress size={20} /> : null}
            disabled={applying || !formValid}
          >
            {t('apply')}
          </Button>
        </Tooltip>
      </div>
    </div>
  );
};

export default AlertsWorkflowActions;
