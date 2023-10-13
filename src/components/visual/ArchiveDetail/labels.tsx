import ClearOutlinedIcon from '@mui/icons-material/ClearOutlined';
import CreateOutlinedIcon from '@mui/icons-material/CreateOutlined';
import SaveOutlinedIcon from '@mui/icons-material/SaveOutlined';
import { Autocomplete, Collapse, Grid, GridSize, IconButton, Skeleton, TextField } from '@mui/material';
import makeStyles from '@mui/styles/makeStyles';
import useMyAPI from 'components/hooks/useMyAPI';
import useMySnackbar from 'components/hooks/useMySnackbar';
import CustomChip from 'components/visual/CustomChip';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

const useStyles = makeStyles(theme => ({
  title: {
    display: 'flex',
    alignItems: 'center'
  },
  label: {
    fontWeight: 500,
    marginRight: theme.spacing(0.5)
  },
  content: {
    display: 'flex',
    gap: theme.spacing(1),
    flexWrap: 'wrap'
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

type Props = {
  sha256: string;
  labels: Labels;
  xs?: boolean | GridSize;
  sm?: boolean | GridSize;
  md?: boolean | GridSize;
  lg?: boolean | GridSize;
  xl?: boolean | GridSize;
};

const WrappedArchiveLabels: React.FC<Props> = ({ sha256 = null, labels: propLabels = null, xs, sm, md, lg, xl }) => {
  const { t } = useTranslation(['fileDetail']);
  const classes = useStyles();
  const { apiCall } = useMyAPI();
  const { showSuccessMessage, showErrorMessage } = useMySnackbar();

  const [labels, setLabels] = useState<Labels>(null);
  const [isEditing, setIsEditing] = useState<boolean>(false);

  const prevLabels = useRef<Labels>(null);

  const sortedLabels = useMemo<Labels>(() => {
    if (!labels || typeof labels !== 'object') return DEFAULT_LABELS;
    return Object.fromEntries(
      Object.keys(DEFAULT_LABELS).map(category => [
        category,
        Array.isArray(labels[category]) ? labels[category].sort((a, b) => a.localeCompare(b)) : []
      ])
    );
  }, [labels]);

  const handleEditingLabels = useCallback((data: Labels) => {
    setIsEditing(true);
    prevLabels.current = data;
  }, []);

  const handleSaveLabels = useCallback(
    (data: Labels) => {
      if (!sha256) return;
      apiCall({
        method: 'POST',
        url: `/api/v4/file/label/${sha256}/`,
        body: { ...data },
        onSuccess: api_data => {
          showSuccessMessage(t('labels.success'));
          setLabels(api_data.api_response?.response?.label_categories);
          setTimeout(() => window.dispatchEvent(new CustomEvent('reloadArchive')), 1000);
        },
        onFailure: api_data => showErrorMessage(api_data.api_response),
        onExit: () => setIsEditing(false)
      });
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [sha256, showErrorMessage, showSuccessMessage, t]
  );

  const handleCancelLabels = useCallback(() => {
    setLabels(prevLabels.current);
    setIsEditing(false);
  }, []);

  useEffect(() => {
    if (propLabels) {
      setIsEditing(false);
      setLabels(propLabels);
    }
  }, [propLabels, sha256]);

  return (
    <>
      <Grid item xs={xs} sm={sm} md={md} lg={lg} xl={xl}>
        <div className={classes.title}>
          <span className={classes.label}>{t('labels')}</span>
          {!isEditing && (
            <IconButton
              children={<CreateOutlinedIcon fontSize="small" />}
              size="small"
              onClick={() => handleEditingLabels(sortedLabels)}
            />
          )}
          {isEditing && (
            <IconButton
              children={<SaveOutlinedIcon fontSize="small" />}
              size="small"
              onClick={() => handleSaveLabels(sortedLabels)}
            />
          )}
          {isEditing && (
            <IconButton
              children={<ClearOutlinedIcon fontSize="small" />}
              size="small"
              onClick={() => handleCancelLabels()}
            />
          )}
        </div>
      </Grid>
      <Grid
        item
        xs={typeof xs === 'number' ? 12 - xs : xs}
        sm={typeof sm === 'number' ? 12 - sm : sm}
        md={typeof md === 'number' ? 12 - md : md}
        lg={typeof lg === 'number' ? 12 - lg : lg}
        xl={typeof xl === 'number' ? 12 - xl : xl}
      >
        {!sha256 ? (
          <Skeleton />
        ) : (
          <>
            <Collapse in={!isEditing} timeout="auto">
              <div className={classes.content}>
                {sortedLabels &&
                  Object.keys(sortedLabels)?.map(category =>
                    sortedLabels[category]?.map((label, i) => (
                      <CustomChip
                        key={i}
                        wrap
                        variant="outlined"
                        size="tiny"
                        type="rounded"
                        color={category in LABELS ? LABELS[category].color : 'primary'}
                        label={label}
                        style={{ height: 'auto', minHeight: '20px' }}
                      />
                    ))
                  )}
              </div>
            </Collapse>
            <Collapse in={isEditing} timeout="auto">
              <div className={classes.content}>
                {sortedLabels &&
                  Object.keys(sortedLabels)?.map(category => (
                    <Autocomplete
                      key={category}
                      options={[]}
                      multiple
                      fullWidth
                      freeSolo
                      value={sortedLabels[category]}
                      onChange={(e, newValue) => setLabels(l => ({ ...l, [category]: newValue }))}
                      renderInput={p => <TextField {...p} variant="standard" />}
                      renderTags={(value: readonly string[], getTagProps) =>
                        value.map((option: string, index: number) => (
                          <CustomChip
                            key={`${category}-${index}`}
                            component="div"
                            wrap
                            variant="outlined"
                            size="small"
                            type="rounded"
                            color={category in LABELS ? LABELS[category].color : 'primary'}
                            label={option}
                            style={{ height: 'auto', minHeight: '20px' }}
                            {...getTagProps({ index })}
                          />
                        ))
                      }
                    />
                  ))}
              </div>
            </Collapse>
          </>
        )}
      </Grid>
    </>
  );
};

const ArchiveLabels = React.memo(WrappedArchiveLabels);
export default ArchiveLabels;
