import YoutubeSearchedForIcon from '@mui/icons-material/YoutubeSearchedFor';
import SettingsBackupRestoreIcon from '@mui/icons-material/SettingsBackupRestore';
import {
  Grid,
  IconButton,
  Paper,
  Skeleton,
  Tooltip,
  Typography,
  useTheme,
  TextField,
  Button, CircularProgress
} from '@mui/material';
import makeStyles from '@mui/styles/makeStyles';
import useAppUser from 'commons/components/app/hooks/useAppUser';
import PageCenter from 'commons/components/pages/PageCenter';
import useALContext from 'components/hooks/useALContext';
import useMyAPI from 'components/hooks/useMyAPI';
import type { Heuristic } from 'components/models/base/heuristic';
import { DEFAULT_STATS, type Statistic } from 'components/models/base/statistic';
import type { CustomUser } from 'components/models/ui/user';
import ForbiddenPage from 'components/routes/403';
import Classification from 'components/visual/Classification';
import Histogram from 'components/visual/Histogram';
import Moment from 'components/visual/Moment';
import ResultsTable from 'components/visual/SearchResult/results';
import { safeFieldValueURI } from 'helpers/utils';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useParams } from 'react-router-dom';
import React from 'react';
import { RouterPrompt } from '../../visual/RouterPrompt.tsx';

const useStyles = makeStyles(theme => ({
  preview: {
    margin: 0,
    padding: theme.spacing(0.75, 1),
    whiteSpace: 'pre-wrap',
    wordBreak: 'break-word'
  },
  input: {
    width: '100%'
  },
  inputContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(1)
  },
  drawerPaper: {
    maxWidth: '1200px',
    [theme.breakpoints.down('sm')]: {
      width: '100%'
    }
  },
  buttonProgress: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginTop: -12,
    marginLeft: -12
  },
  saveButton: {
    marginTop: theme.spacing(2)
  }
}));

type ParamProps = {
  id: string;
};

type HeuristicDetailProps = {
  heur_id?: string;
};

type EditableFieldProps = {
  label: string;
  value: string;
  originalValue: string;
  isEditable: boolean;
  onChange?: (value: string) => void;
  multiline?: boolean;
  type?: string;
  placeholder?: string;
  helperText?: string;
  translationKey?: string;
};

type StatItem = {
  key: string;
  value: React.ReactNode;
};

type StatsDisplayProps = {
  label: string;
  stats: StatItem[];
  t: (key: string) => string;
};

// Component for editable field with reset button
const EditableField = ({
                         label,
                         value,
                         originalValue,
                         isEditable,
                         onChange,
                         multiline = false,
                         type = 'text',
                         placeholder = '',
                         helperText = '',
                         translationKey = ''
                       }: EditableFieldProps) => {
  const classes = useStyles();
  const { t } = useTranslation(['manageHeuristicDetail']);
  const isDifferent = value !== originalValue;

  const handleReset = () => {
    onChange(originalValue);
  };

  const resetIconStyle: React.CSSProperties = type === 'number'
    ? { cursor: 'pointer', position: 'absolute', right: 32 }
    : { cursor: 'pointer' };

  return (
    <>
      <Typography variant="subtitle2">{label}</Typography>
      <TextField
        className={classes.input}
        variant="outlined"
        size="small"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={!isEditable}
        multiline={multiline}
        rows={multiline ? 4 : 1}
        type={type}
        placeholder={placeholder}
        helperText={helperText}
        InputProps={{
          endAdornment: isEditable && isDifferent && (
            <Tooltip title={t(translationKey || 'restore_value', { default: originalValue })}>
              <SettingsBackupRestoreIcon
                fontSize="small"
                onClick={handleReset}
                style={resetIconStyle}
              />
            </Tooltip>
          )
        }}
      />
    </>
  );
};

// Component for stats display
const StatsDisplay = ({ label, stats, t }: StatsDisplayProps) => {
  return (
    <>
      <Typography variant="subtitle1" style={{ fontWeight: 600, fontStyle: 'italic' }}>
        {label}
      </Typography>
      <Grid container>
        {stats.map(stat => (
          <React.Fragment key={stat.key}>
            <Grid item xs={3} sm={4} md={3} lg={2}>
              <span style={{ fontWeight: 500 }}>{t(stat.key)}</span>
            </Grid>
            <Grid item xs={9} sm={8} md={9} lg={10}>
              {stat.value}
            </Grid>
          </React.Fragment>
        ))}
      </Grid>
    </>
  );
};

type HeuristicForm = {
  name: string;
  description: string;
  filetype: string;
  score: string;
  max_score: string;
  attack_id: string;
}

const HeuristicDetail = ({ heur_id = null }: HeuristicDetailProps) => {
  const { t } = useTranslation(['manageHeuristicDetail']);
  const { id } = useParams<ParamProps>();
  const theme = useTheme();
  const [heuristic, setHeuristic] = useState<Heuristic>(null);
  const [stats, setStats] = useState<Statistic>(DEFAULT_STATS);
  const [histogram, setHistogram] = useState<any>(null);
  const [results, setResults] = useState<any>(null);
  const { apiCall } = useMyAPI();
  const classes = useStyles();
  const { c12nDef } = useALContext();
  const { user: currentUser } = useAppUser<CustomUser>();

  // Form state
  const [formValues, setFormValues] = useState<HeuristicForm>();

  // Check if user has admin privileges
  const isAdmin = currentUser.is_admin;

  // State to track if values have changed from their defaults
  const [hasChanges, setHasChanges] = useState(false);
  const [buttonLoading, setButtonLoading] = useState<boolean>(false);

  // Handle form field changes
  const handleFieldChange = (field: string, value: string) => {
    // Clamp score to max_score
    if (field === 'score' && (Number(value) > Number(formValues.max_score))) {
      value = formValues.max_score;
    }

    setFormValues(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Load heuristic data
  const loadHeuristicData = () => {
    if (currentUser.roles.includes('heuristic_view')) {
      apiCall({
        url: `/api/v4/heuristics/${heur_id || id}/`,
        onSuccess: api_data => {
          const data = api_data.api_response;
          setHeuristic(data);

          // Initialize form values
          setFormValues({
            name: data.name || '',
            description: data.description || '',
            filetype: data.filetype || '',
            score: data.score?.toString() || '',
            max_score: data.max_score?.toString() || '',
            attack_id: data.attack_id?.join(', ') || ''
          });
        }
      });
    }
  };

  // Load related data (stats, histogram, results)
  const loadRelatedData = () => {
    if (!heuristic) return;

    if (currentUser.roles.includes('submission_view')) {
      // Load stats if not already included
      if (!heuristic.stats) {
        apiCall({
          method: 'POST',
          url: '/api/v4/search/stats/result/result.score/',
          body: { query: `result.sections.heuristic.heur_id:${heur_id || id}` },
          onSuccess: api_data => {
            setStats(api_data.api_response);
          }
        });
      } else {
        setStats(heuristic.stats);
      }

      // Load histogram data
      apiCall({
        method: 'POST',
        url: '/api/v4/search/histogram/result/created/',
        body: {
          query: `result.sections.heuristic.heur_id:${heur_id || id}`,
          mincount: 0,
          start: 'now-30d/d',
          end: 'now+1d/d-1s',
          gap: '+1d'
        },
        onSuccess: api_data => {
          setHistogram(api_data.api_response);
        }
      });

      // Load results data
      apiCall({
        method: 'GET',
        url: `/api/v4/search/result/?query=result.sections.heuristic.heur_id:${heur_id || id}&rows=10`,
        onSuccess: api_data => {
          setResults(api_data.api_response);
        }
      });
    } else if (heuristic.stats) {
      setStats(heuristic.stats);
    }
  };

  // Save changes
  const saveHeuristic = () => {
    if (!isAdmin || !hasChanges) return;

    // Parse attackId back to array
    const attack_id_array = formValues.attack_id ? formValues.attack_id.split(',').map(id => id.trim()) : [];

    const updatedHeuristic = {
      ...heuristic,
      name: formValues.name,
      description: formValues.description,
      filetype: formValues.filetype,
      score: formValues.score,
      max_score: formValues.max_score,
      attack_id: attack_id_array.length > 0 ? attack_id_array : null
    };

    apiCall({
      method: 'PUT',
      url: `/api/v4/heuristics/${heur_id || id}/`,
      body: updatedHeuristic,
      onSuccess: api_data => {
        setHeuristic(api_data.api_response);
      },
      onEnter: () => setButtonLoading(true),
      onExit: () => setButtonLoading(false)
    });
  };

  // Check for changes in form values
  useEffect(() => {
    if (heuristic) {
      const originalValues: HeuristicForm = {
        name: heuristic.name || '',
        description: heuristic.description || '',
        filetype: heuristic.filetype || '',
        score: heuristic.score.toString(10) || '',
        max_score: heuristic.max_score.toString(10) || '',
        attack_id: heuristic.attack_id?.join(', ') || ''
      };

      const hasFormChanges = Object.keys(formValues).some(key => {
        return formValues[key] !== originalValues[key];
      });
      setHasChanges(hasFormChanges);
    }
  }, [formValues, heuristic]);

  // Initial load
  useEffect(() => {
    loadHeuristicData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [heur_id, id]);

  // Load related data when heuristic changes
  useEffect(() => {
    loadRelatedData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [heuristic]);

  // Create hit stats data for the StatsDisplay component
  const getHitStats = () => {
    if (!heuristic || !stats) return [];

    return [
      {
        key: 'hit.count',
        value: stats.count || <Skeleton />
      },
      {
        key: 'hit.first',
        value: stats.first_hit ?
          <Moment variant="fromNow">{stats.first_hit}</Moment> :
          t('hit.none')
      },
      {
        key: 'hit.last',
        value: stats.last_hit ?
          <Moment variant="fromNow">{stats.last_hit}</Moment> :
          t('hit.none')
      }
    ];
  };

  // Create contribution stats data for the StatsDisplay component
  const getContributionStats = () => {
    if (!heuristic || !stats) return [];

    return [
      {
        key: 'score.min',
        value: stats.min || <Skeleton />
      },
      {
        key: 'score.avg',
        value: stats.avg ? Number(stats.avg).toFixed(0) : <Skeleton />
      },
      {
        key: 'score.max',
        value: stats.max || <Skeleton />
      }
    ];
  };

  // Memoizing the stats data just in case
  const hitStats = React.useMemo(() => getHitStats(), [heuristic, stats]);
  const contributionStats = React.useMemo(() => getContributionStats(), [heuristic, stats]);

  if (!currentUser.roles.includes('heuristic_view')) {
    return <ForbiddenPage />;
  }

  return (
    <PageCenter margin={!id ? 2 : 4} width="100%">
      {c12nDef.enforce && (
        <div style={{ paddingBottom: theme.spacing(4) }}>
          <Classification size="tiny" c12n={heuristic ? heuristic.classification : null} />
        </div>
      )}
      <div style={{ textAlign: 'left' }}>
        <div style={{ paddingBottom: theme.spacing(4) }}>
          <Grid container alignItems="center">
            <Grid item xs>
              <Typography variant="h4">{t('title')}</Typography>
              <Typography variant="caption">
                {heuristic ? heuristic.heur_id : <Skeleton style={{ width: '10rem' }} />}
              </Typography>
            </Grid>
            {currentUser.roles.includes('submission_view') && (
              <Grid item xs={12} sm style={{ textAlign: 'right', flexGrow: 0 }}>
                {heuristic ? (
                  <Tooltip title={t('usage')}>
                    <IconButton
                      component={Link}
                      style={{ color: theme.palette.action.active }}
                      to={`/search/result/?query=result.sections.heuristic.heur_id:${safeFieldValueURI(
                        heuristic.heur_id
                      )}`}
                      size="large"
                    >
                      <YoutubeSearchedForIcon />
                    </IconButton>
                  </Tooltip>
                ) : (
                  <Skeleton variant="circular" height="2.5rem" width="2.5rem" style={{ margin: theme.spacing(0.5) }} />
                )}
              </Grid>
            )}
          </Grid>
        </div>

        <Grid container spacing={3}>
          {/* Name Field */}
          <Grid item xs={12} sm={6}>
            {heuristic ? (
              <EditableField
                label={t('name')}
                value={formValues.name}
                originalValue={heuristic.name}
                onChange={(value) => handleFieldChange('name', value)}
                isEditable={isAdmin}
              />
            ) : (
              <>
                <Typography variant="subtitle2">{t('name')}</Typography>
                <Skeleton style={{ height: '2.5rem' }} />
              </>
            )}
          </Grid>

          {/* Filetype Field */}
          <Grid item xs={12} sm={6}>
            {heuristic ? (
              <EditableField
                label={t('filetype')}
                value={formValues.filetype}
                originalValue={heuristic.filetype}
                onChange={(value) => handleFieldChange('filetype', value)}
                isEditable={isAdmin}
              />
            ) : (
              <>
                <Typography variant="subtitle2">{t('filetype')}</Typography>
                <Skeleton style={{ height: '2.5rem' }} />
              </>
            )}
          </Grid>

          {/* Description Field */}
          <Grid item xs={12}>
            {heuristic ? (
              <EditableField
                label={t('desc')}
                value={formValues.description}
                originalValue={heuristic.description}
                onChange={(value) => handleFieldChange('description', value)}
                isEditable={isAdmin}
                multiline={true}
              />
            ) : (
              <>
                <Typography variant="subtitle2">{t('desc')}</Typography>
                <Skeleton style={{ height: '2.5rem' }} />
              </>
            )}
          </Grid>

          {/* Score Field */}
          <Grid item xs={12} sm={6} md={4}>
            {heuristic ? (
              <EditableField
                label={t('score')}
                value={formValues.score}
                originalValue={heuristic.score?.toString()}
                onChange={(value) => handleFieldChange('score', value)}
                isEditable={isAdmin}
                type="number"
              />
            ) : (
              <>
                <Typography variant="subtitle2">{t('score')}</Typography>
                <Skeleton style={{ height: '2.5rem' }} />
              </>
            )}
          </Grid>

          {/* Max Score Field */}
          <Grid item xs={12} sm={6} md={4}>
            {heuristic ? (
              <EditableField
                label={t('max_score')}
                value={heuristic.max_score?.toString() || ''}
                originalValue={heuristic.max_score?.toString() || ''}
                isEditable={false}
                type="number"
                placeholder={t('no_max')}
              />
            ) : (
              <>
                <Typography variant="subtitle2">{t('max_score')}</Typography>
                <Skeleton style={{ height: '2.5rem' }} />
              </>
            )}
          </Grid>

          {/* Attack ID Field */}
          <Grid item xs={12} sm={6} md={4}>
            {heuristic ? (
              <EditableField
                label={t('attack_id')}
                value={formValues.attack_id}
                originalValue={heuristic.attack_id?.join(', ') || ''}
                onChange={(value) => handleFieldChange('attack_id', value)}
                isEditable={isAdmin}
                placeholder={t('no_attack_id')}
                helperText={isAdmin ? t('attack_id.helper') : ''}
              />
            ) : (
              <>
                <Typography variant="subtitle2">{t('attack_id')}</Typography>
                <Skeleton style={{ height: '2.5rem' }} />
              </>
            )}
          </Grid>

          {/* Signature Score Map */}
          <Grid item xs={12}>
            <Typography variant="subtitle2">{t('signature_score_map')}</Typography>
            {heuristic ? (
              <Paper component="pre" variant="outlined" className={classes.preview}>
                {heuristic.signature_score_map && Object.keys(heuristic.signature_score_map).length !== 0 ? (
                  <Grid container spacing={1}>
                    {Object.keys(heuristic.signature_score_map).map((key, i) => (
                      <Grid key={i} item xs={12} sm={6} md={4}>
                        {`${key} = ${heuristic.signature_score_map[key]}`}
                      </Grid>
                    ))}
                  </Grid>
                ) : (
                  t('no_sigs')
                )}
              </Paper>
            ) : (
              <Skeleton style={{ height: '2.5rem' }} />
            )}
          </Grid>

          {/* Statistics Header */}
          <Grid item xs={12}>
            <Typography variant="h6">{t('statistics')}</Typography>
          </Grid>

          {/* Hit Statistics */}
          <Grid item xs={12} sm={6}>
            {heuristic && stats ? (
              <StatsDisplay
                label={t('hits')}
                stats={hitStats}
                t={t}
              />
            ) : (
              <Skeleton />
            )}
          </Grid>

          {/* Contribution Statistics */}
          <Grid item xs={12} sm={6}>
            {heuristic && stats ? (
              <StatsDisplay
                label={t('contribution')}
                stats={contributionStats}
                t={t}
              />
            ) : (
              <Skeleton />
            )}
          </Grid>

          {/* Additional components for users with submission_view role */}
          {currentUser.roles.includes('submission_view') && (
            <>
              <Grid item xs={12}>
                <Histogram
                  dataset={histogram}
                  height="300px"
                  isDate
                  title={t('chart.title')}
                  datatype={heur_id || id}
                  verticalLine
                />
              </Grid>
              <Grid item xs={12}>
                <Typography variant="h6">{t('last10')}</Typography>
              </Grid>
              <Grid item xs={12}>
                <ResultsTable resultResults={results} allowSort={false} />
              </Grid>
            </>
          )}
        </Grid>

        <RouterPrompt when={hasChanges} />

        {/* Save Button */}
        {isAdmin && hasChanges && (
          <div
            style={{
              paddingTop: theme.spacing(1),
              paddingBottom: theme.spacing(1),
              position: 'fixed',
              bottom: 0,
              left: 0,
              width: '100%',
              textAlign: 'center',
              zIndex: theme.zIndex.drawer - 1,
              backgroundColor: theme.palette.background.default,
              boxShadow: theme.shadows[4]
            }}
          >
            <Button
              variant="contained"
              color="primary"
              disabled={buttonLoading}
              onClick={saveHeuristic}
            >
              {t('save')}
              {buttonLoading && <CircularProgress size={24} className={classes.buttonProgress} />}
            </Button>
          </div>
        )}
      </div>
    </PageCenter>
  );
};

export default HeuristicDetail;