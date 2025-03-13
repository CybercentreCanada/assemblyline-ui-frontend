import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import SettingsEthernetIcon from '@mui/icons-material/SettingsEthernet';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import Badge from '@mui/material/Badge';
import JSONEditor from 'components/visual/JSONEditor';

import {
  Checkbox,
  FormControlLabel,
  Grid,
  IconButton,
  InputAdornment,
  MenuItem,
  OutlinedInput,
  Select,
  Skeleton,
  Slider,
  TextField,
  Typography,
  useTheme
} from '@mui/material';
import makeStyles from '@mui/styles/makeStyles';
import useALContext from 'components/hooks/useALContext';
import { FETCH_METHODS, type EnvironmentVariable, type UpdateSource } from 'components/models/base/service';
import ResetButton from 'components/routes/admin/service_detail/reset_button';
import Classification from 'components/visual/Classification';
import Moment from 'components/visual/Moment';
import { TabContainer } from 'components/visual/TabContainer';
import React, { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

const useStyles = makeStyles(theme => ({
  checkbox: {
    marginLeft: 0,
    width: '100%',
    '&:hover': {
      background: theme.palette.action.hover
    }
  },
  label: {
    fontWeight: 500
  }
}));

type Props = {
  source: UpdateSource;
  defaults: UpdateSource;
  addMode: boolean;
  showDetails: boolean;
  setSource: (value: UpdateSource) => void;
  setModified: (value: boolean) => void;
};

const WrappedSourceDetail = ({
  source,
  defaults,
  setSource,
  addMode = false,
  setModified = null,
  showDetails = true
}: Props) => {
  const { t } = useTranslation(['manageSignatureSources']);
  const theme = useTheme();
  const classes = useStyles();
  const { c12nDef } = useALContext();

  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showPrivateKey, setShowPrivateKey] = useState<boolean>(false);

  const gitFetch = useMemo<boolean>(() => source.fetch_method === 'GIT', [source.fetch_method]);
  const postFetch = useMemo<boolean>(() => source.fetch_method === 'POST', [source.fetch_method]);

  const handleFieldChange = useCallback(
    event => {
      if (!event.target?.type) {
        // For Select components
        setSource({
          ...source,
          [event.target.name]: event.target.value
        });
      } else {
        // For all other components
        setSource({
          ...source,
          [event.target.id]: event.target?.type === 'checkbox' ? event.target.checked : event.target.value
        });
      }
      setModified(true);
    },
    [setModified, setSource, source]
  );

  const resetField = useCallback(
    field => {
      setSource({ ...source, [field]: defaults[field] });
      setModified(true);
    },
    [defaults, setModified, setSource, source]
  );

  const handleClassificationChange = useCallback(
    c12n => {
      setSource({ ...source, default_classification: c12n });
      setModified(true);
    },
    [setModified, setSource, source]
  );

  const handleHeaderValueChange = useCallback(
    event => {
      setSource({
        ...source,
        headers: Object.entries(event.updated_src).map(header => {
          return { name: header[0], value: header[1] } as EnvironmentVariable;
        })
      });
      setModified(true);
    },
    [setModified, setSource, source]
  );

  const handlePostDataChange = useCallback(
    event => {
      setSource({ ...source, data: event.updated_src });
      setModified(true);
    },
    [setModified, setSource, source]
  );

  const handleUpdateIntervalChange = useCallback(
    event => {
      if (!event.target.value) {
        // If the field is cleared or zero, default to the minimum acceptable value
        event.target.value = 1;
      }
      setSource({ ...source, update_interval: event.target.value as number });
      setModified(true);
    },
    [setModified, setSource, source]
  );

  const handleConfigurationChange = useCallback(
    event => {
      setSource({ ...source, configuration: event.updated_src });
      setModified(true);
    },
    [setModified, setSource, source]
  );

  return (
    source && (
      <>
        {c12nDef.enforce && (
          <Grid item xs={12}>
            <div className={classes.label}>
              {t('classification')}
              <ResetButton service={source} defaults={defaults} field="default_classification" reset={resetField} />
            </div>
            <Classification
              c12n={source.default_classification}
              type="picker"
              setClassification={handleClassificationChange}
            />
          </Grid>
        )}
        <TabContainer
          paper
          centered
          variant="standard"
          tabs={{
            general: {
              label: t('general'),
              icon: (
                <Badge color="error" variant="dot" invisible={source.name !== ''}>
                  <InfoOutlinedIcon />
                </Badge>
              ),
              iconPosition: 'start',
              inner: (
                <>
                  <Grid container spacing={1}>
                    <Grid item xs={12} sm={6}>
                      <Badge color="error" variant="dot" invisible={source.name !== ''}>
                        <div className={classes.label} style={{ whiteSpace: 'pre-wrap' }}>{`${t('name')} `}</div>
                      </Badge>
                      <TextField
                        id="name"
                        disabled={!addMode}
                        size="small"
                        value={source.name}
                        fullWidth
                        variant="outlined"
                        onChange={handleFieldChange}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <div className={classes.label}>
                        {t('pattern')}
                        <ResetButton service={source} defaults={defaults} field="pattern" reset={resetField} />
                      </div>
                      <TextField
                        id="pattern"
                        size="small"
                        value={source.pattern}
                        fullWidth
                        variant="outlined"
                        onChange={handleFieldChange}
                        InputProps={{
                          style: { fontFamily: 'monospace' }
                        }}
                      />
                    </Grid>
                  </Grid>
                  <Grid container spacing={1} style={{ paddingTop: theme.spacing(1) }}>
                    <Grid item xs={12} md={12}>
                      <div className={classes.label}>
                        {t('update_interval')}
                        <ResetButton service={source} defaults={defaults} field="update_interval" reset={resetField} />
                      </div>
                      <Grid container spacing={2}>
                        <Grid item xs={12} sm={9}>
                          <div style={{ marginLeft: theme.spacing(1), marginRight: theme.spacing(1) }}>
                            <Slider
                              min={3600}
                              max={86400}
                              defaultValue={3600}
                              valueLabelDisplay="off"
                              aria-labelledby="discrete-slider-custom"
                              step={null}
                              value={source.update_interval}
                              marks={[
                                {
                                  value: 3600,
                                  label: '1h'
                                },
                                {
                                  value: 14400,
                                  label: '4h'
                                },
                                {
                                  value: 21600,
                                  label: '6h'
                                },
                                {
                                  value: 43200,
                                  label: '12h'
                                },
                                {
                                  value: 86400,
                                  label: '24h'
                                }
                              ]}
                              onChange={handleUpdateIntervalChange}
                              valueLabelFormat={x => x / 3600}
                            />
                          </div>
                        </Grid>
                        <Grid item xs={12} sm={3}>
                          {source ? (
                            <OutlinedInput
                              fullWidth
                              type="number"
                              margin="dense"
                              size="small"
                              value={source.update_interval}
                              onChange={handleUpdateIntervalChange}
                              endAdornment={<InputAdornment position="end">sec</InputAdornment>}
                            />
                          ) : (
                            <Skeleton style={{ height: '2.5rem' }} />
                          )}
                        </Grid>
                      </Grid>
                    </Grid>
                    <Grid item xs={12}>
                      <div className={classes.label}>{t('configuration')}</div>
                      <JSONEditor
                        src={source.configuration}
                        onAdd={handleConfigurationChange}
                        onDelete={handleConfigurationChange}
                        onEdit={handleConfigurationChange}
                        style={{
                          border: `1px solid ${theme.palette.divider}`,
                          borderRadius: '4px',
                          fontSize: '1rem',
                          minHeight: theme.spacing(5),
                          padding: '4px',
                          overflowX: 'auto',
                          width: '100%'
                        }}
                      />
                    </Grid>
                    {['ignore_cache', 'override_classification', 'sync'].map(field => {
                      return (
                        <Grid key={field} item xs={6}>
                          <FormControlLabel
                            control={
                              <Checkbox
                                id={field}
                                size="small"
                                checked={source[field]}
                                name="label"
                                onChange={handleFieldChange}
                              />
                            }
                            label={
                              <Typography variant="body2">
                                {t(field)}
                                <ResetButton service={source} defaults={defaults} field={field} reset={resetField} />
                              </Typography>
                            }
                            className={classes.checkbox}
                          />
                        </Grid>
                      );
                    })}
                  </Grid>
                </>
              )
            },
            network: {
              label: t('network'),
              icon: (
                <Badge color="error" variant="dot" invisible={source.uri !== ''}>
                  <SettingsEthernetIcon />
                </Badge>
              ),
              iconPosition: 'start',
              inner: (
                <>
                  <Grid container spacing={1}>
                    <Grid item xs={12} sm={2}>
                      <div className={classes.label}>
                        {t('fetch_method')}
                        <ResetButton service={source} defaults={defaults} field="fetch_method" reset={resetField} />
                      </div>
                      <Select
                        name="fetch_method"
                        value={source.fetch_method}
                        onChange={handleFieldChange}
                        size="small"
                        fullWidth
                      >
                        {FETCH_METHODS.map(method => {
                          return (
                            <MenuItem key={method} value={method}>
                              {method}
                            </MenuItem>
                          );
                        })}
                      </Select>
                    </Grid>
                    <Grid item xs={12} sm={gitFetch ? 7 : 10}>
                      <Badge color="error" variant="dot" invisible={source.uri !== ''}>
                        <div className={classes.label} style={{ whiteSpace: 'pre-wrap' }}>
                          {`${t('uri')} `}
                          <ResetButton service={source} defaults={defaults} field="uri" reset={resetField} />
                        </div>
                      </Badge>

                      <TextField
                        id="uri"
                        size="small"
                        value={source.uri}
                        fullWidth
                        variant="outlined"
                        onChange={handleFieldChange}
                      />
                    </Grid>
                    {gitFetch && (
                      <Grid item xs={12} sm={3}>
                        <div className={classes.label}>{t('git_branch')}</div>
                        <TextField
                          id="git_branch"
                          size="small"
                          value={source.git_branch}
                          fullWidth
                          variant="outlined"
                          onChange={handleFieldChange}
                        />
                      </Grid>
                    )}
                    <Grid item xs={12} md={6} style={{ paddingTop: theme.spacing(1) }}>
                      <div className={classes.label}>
                        {t('username')}
                        <ResetButton service={source} defaults={defaults} field="username" reset={resetField} />
                      </div>
                      <TextField
                        id="username"
                        size="small"
                        value={source.username}
                        fullWidth
                        variant="outlined"
                        onChange={handleFieldChange}
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <div className={classes.label}>
                        {t('password')}
                        <ResetButton service={source} defaults={defaults} field="password" reset={resetField} />
                      </div>
                      <TextField
                        autoComplete="new-password"
                        id="password"
                        size="small"
                        value={source.password}
                        fullWidth
                        variant="outlined"
                        onChange={handleFieldChange}
                        type={showPassword ? 'text' : 'password'}
                        InputProps={{
                          endAdornment: (
                            <InputAdornment position="end">
                              <IconButton
                                aria-label={showPassword ? 'hide the password' : 'display the password'}
                                onClick={() => setShowPassword(!showPassword)}
                                edge="end"
                              >
                                {showPassword ? <VisibilityOff /> : <Visibility />}
                              </IconButton>
                            </InputAdornment>
                          )
                        }}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <div className={classes.label}>
                        {t('private_key')}
                        <ResetButton service={source} defaults={defaults} field="private_key" reset={resetField} />
                      </div>
                      <TextField
                        id="private_key"
                        size="small"
                        value={source.private_key}
                        fullWidth
                        variant="outlined"
                        onChange={handleFieldChange}
                        type={showPrivateKey ? 'text' : 'password'}
                        multiline={showPrivateKey}
                        rows={6}
                        InputProps={{
                          style: { fontFamily: 'monospace' },
                          endAdornment: (
                            <InputAdornment position="end">
                              <IconButton
                                aria-label={showPrivateKey ? 'hide the password' : 'display the password'}
                                onClick={() => setShowPrivateKey(!showPrivateKey)}
                                edge="end"
                              >
                                {showPrivateKey ? <VisibilityOff /> : <Visibility />}
                              </IconButton>
                            </InputAdornment>
                          )
                        }}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <div className={classes.label}>{t('headers')}</div>
                      <JSONEditor
                        name={false}
                        src={Object.fromEntries(source.headers.map(x => [x.name, x.value]))}
                        enableClipboard={false}
                        groupArraysAfterLength={10}
                        displayDataTypes={false}
                        displayObjectSize={false}
                        onAdd={handleHeaderValueChange}
                        onDelete={handleHeaderValueChange}
                        onEdit={handleHeaderValueChange}
                        collapsed={true}
                        style={{
                          border: `1px solid ${theme.palette.divider}`,
                          borderRadius: '4px',
                          fontSize: '1rem',
                          minHeight: theme.spacing(5),
                          padding: '4px',
                          overflowX: 'auto',
                          width: '100%'
                        }}
                      />
                    </Grid>
                    {postFetch && (
                      <Grid item xs={12}>
                        <div className={classes.label}>{t('post_data')}</div>
                        <TextField
                          id="data"
                          size="small"
                          value={source.data}
                          multiline
                          rows={6}
                          fullWidth
                          variant="outlined"
                          InputProps={{ style: { fontFamily: 'monospace' } }}
                          onChange={handleFieldChange}
                        />
                      </Grid>
                    )}
                    <Grid item xs={12}>
                      <div className={classes.label}>
                        {t('proxy')}
                        <ResetButton service={source} defaults={defaults} field="proxy" reset={resetField} />
                      </div>
                      <TextField
                        id="proxy"
                        size="small"
                        value={source.proxy}
                        placeholder={t('proxy.placeholder')}
                        fullWidth
                        variant="outlined"
                        onChange={handleFieldChange}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <div className={classes.label}>
                        {t('ca')}
                        <ResetButton service={source} defaults={defaults} field="ca_cert" reset={resetField} />
                      </div>
                      <TextField
                        id="ca_cert"
                        size="small"
                        value={source.ca_cert}
                        multiline
                        rows={6}
                        fullWidth
                        variant="outlined"
                        InputProps={{ style: { fontFamily: 'monospace' } }}
                        onChange={handleFieldChange}
                      />
                    </Grid>
                    <Grid item xs={6}>
                      <FormControlLabel
                        control={
                          <Checkbox
                            id="ssl_ignore_errors"
                            size="small"
                            checked={source.ssl_ignore_errors}
                            name="label"
                            onChange={handleFieldChange}
                          />
                        }
                        label={
                          <Typography variant="body2">
                            {t('ignore_ssl')}
                            <ResetButton
                              service={source}
                              defaults={defaults}
                              field="ssl_ignore_errors"
                              reset={resetField}
                            />
                          </Typography>
                        }
                        className={classes.checkbox}
                      />
                    </Grid>

                    {showDetails && (
                      <div style={{ textAlign: 'center', paddingTop: theme.spacing(3), flexGrow: 1 }}>
                        <Typography variant="subtitle2" color="textSecondary">
                          {`${t('update.label.last_successful')}: `}
                          <Moment variant="fromNow">{source.status.last_successful_update}</Moment>
                        </Typography>
                        <Typography variant="subtitle2" color="textSecondary">
                          {`${t('update.label.status')}: ${source.status.message}`}
                        </Typography>
                      </div>
                    )}
                  </Grid>
                </>
              )
            }
          }}
        />
      </>
    )
  );
};

export const SourceDetail = React.memo(WrappedSourceDetail);
