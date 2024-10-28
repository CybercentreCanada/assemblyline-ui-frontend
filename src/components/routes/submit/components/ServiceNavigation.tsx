import {
  Checkbox,
  Divider,
  FormControl,
  FormControlLabel,
  Grid,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  MenuItem,
  Select,
  Skeleton,
  Slider,
  Switch,
  TextField,
  Typography,
  useTheme
} from '@mui/material';
import { makeStyles } from '@mui/styles';
import useALContext from 'components/hooks/useALContext';
import type { UserSettings } from 'components/models/base/user_settings';
import { DEFAULT_SETTINGS } from 'components/routes/submit/settings';
import MetadataInputField from 'components/visual/MetadataInputField';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useForm } from '../form';
import { ResetButton } from './ServiceAccordion';

const useStyles = makeStyles(theme => ({
  no_pad: {
    padding: 0
  },
  meta_key: {
    overflowX: 'hidden',
    whiteSpace: 'nowrap',
    textOverflow: 'ellipsis'
  },
  item: {
    marginLeft: 0,
    width: '100%',
    '&:hover': {
      background: theme.palette.action.hover
    }
  },
  buttonProgress: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginTop: -12,
    marginLeft: -12
  },
  tweaked_tabs: {
    [theme.breakpoints.only('xs')]: {
      '& [role=tab]': {
        minWidth: '90px'
      }
    }
  }
}));

type ServiceAccordionProps = {
  settings?: UserSettings;
};

const WrappedServiceNavigation = ({ settings = DEFAULT_SETTINGS }: ServiceAccordionProps) => {
  const { t, i18n } = useTranslation(['submit', 'settings']);
  const theme = useTheme();
  const classes = useStyles();
  const form = useForm();
  const { user: currentUser, c12nDef, configuration } = useALContext();

  console.log(settings);

  const sp1 = theme.spacing(1);
  const sp2 = theme.spacing(2);
  const sp4 = theme.spacing(4);

  return (
    <div style={{ display: 'flex', flexDirection: 'row', flexWrap: 'nowrap', columnGap: sp2 }}>
      <div>
        <List
          dense
          sx={{
            bgcolor: 'background.paper',
            '& ul': { padding: 0 }
          }}
        >
          {settings?.services
            .sort((a, b) => a.name.localeCompare(b.name))
            .map((category, cat_id) => (
              <>
                <ListItem
                  key={cat_id}
                  secondaryAction={
                    <Checkbox
                      edge="end"
                      // onChange={handleToggle(value)}
                      // checked={checked.includes(value)}

                      inputProps={{ 'aria-labelledby': category.name }}
                    />
                  }
                  disablePadding
                  sx={{ marginTop: sp1 }}
                >
                  <ListItemButton>
                    <ListItemText
                      id={cat_id}
                      primary={category.name}
                      primaryTypographyProps={{ color: 'textSecondary' }}
                    />
                  </ListItemButton>
                </ListItem>

                {category.services
                  .sort((a, b) => a.name.localeCompare(b.name))
                  .map((service, svr_id) => (
                    <ListItem
                      key={svr_id}
                      secondaryAction={
                        <Checkbox
                          edge="end"
                          // onChange={handleToggle(value)}
                          // checked={checked.includes(value)}
                          inputProps={{ 'aria-labelledby': service.name }}
                        />
                      }
                      disablePadding
                      sx={
                        {
                          // borderLeft: `1px solid ${theme.palette.primary.main}`
                        }
                      }
                    >
                      <ListItemButton>
                        <ListItemText
                          id={svr_id}
                          primary={service.name}
                          // primaryTypographyProps={{ color: 'primary.main' }}
                          style={{ marginLeft: sp2, marginRight: sp2 }}
                        />
                      </ListItemButton>
                    </ListItem>
                  ))}
              </>
            ))}
        </List>
      </div>

      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          textAlign: 'start',
          marginTop: sp2
          // rowGap: sp2
        }}
      >
        <div style={{ marginBottom: theme.spacing(2) }}>
          <Typography variant="h5">Submission</Typography>
          <Divider />
        </div>

        <div>
          <Typography variant="h6" gutterBottom>
            {t('options.submission')}
          </Typography>
        </div>

        <div style={{ padding: `${sp1} ${sp2}` }}>
          <Typography variant="body1">{t('options.submission.desc')}</Typography>
          <form.Field
            field={store => store.settings.description.toPath()}
            children={({ state, handleBlur, handleChange }) =>
              !form.state.values.settings ? (
                <Skeleton style={{ height: '3rem' }} />
              ) : (
                <TextField
                  id="desc"
                  size="small"
                  type="text"
                  defaultValue={state.value}
                  onBlur={handleBlur}
                  onChange={event => handleChange(event.target.value)}
                  InputLabelProps={{
                    shrink: true
                  }}
                  variant="outlined"
                  fullWidth
                />
              )
            }
          />
        </div>

        <div style={{ padding: `${sp1} ${sp2}` }}>
          <Typography variant="body1">{t('options.submission.priority')}</Typography>
          <form.Field
            field={store => store.settings.priority.toPath()}
            children={({ state, handleBlur, handleChange }) =>
              !form.state.values.settings ? (
                <Skeleton style={{ height: '3rem' }} />
              ) : (
                <div style={{ marginLeft: '20px', marginRight: '20px' }}>
                  <Slider
                    value={state.value}
                    valueLabelDisplay={'auto'}
                    size="small"
                    min={500}
                    max={1500}
                    marks={[
                      { label: t('options.submission.priority.low'), value: 500 },
                      { label: t('options.submission.priority.medium'), value: 1000 },
                      { label: t('options.submission.priority.high'), value: 1500 }
                    ]}
                    step={null}
                    onBlur={handleBlur}
                    onChange={(_, value) => handleChange(value)}
                    disabled={
                      !currentUser.roles.includes('submission_customize') &&
                      form.state.values.submissionProfile?.priority !== undefined
                    }
                  />
                </div>
              )
            }
          />
        </div>

        <div>
          <form.Field
            field={store => store.settings.generate_alert.toPath()}
            children={({ state, handleBlur, handleChange }) => (
              <ListItemButton onClick={e => handleChange(!state.value)}>
                <ListItemText
                  primary={t('settings:submissions.generate_alert')}
                  secondary={t('settings:submissions.generate_alert_desc')}
                />
                {!form.state.values.settings ? (
                  <Skeleton style={{ height: '2rem', width: '1.5rem', marginLeft: sp2, marginRight: sp2 }} />
                ) : (
                  <Switch checked={state.value} edge="end" />
                )}
              </ListItemButton>
            )}
          />
        </div>

        <div>
          <form.Field
            field={store => store.settings.ignore_dynamic_recursion_prevention.toPath()}
            children={({ state, handleBlur, handleChange }) => (
              <ListItemButton onClick={e => handleChange(!state.value)}>
                <ListItemText
                  primary={t('settings:submissions.dynamic_recursion')}
                  secondary={t('settings:submissions.dynamic_recursion_desc')}
                />
                {!form.state.values.settings ? (
                  <Skeleton style={{ height: '2rem', width: '1.5rem', marginLeft: sp2, marginRight: sp2 }} />
                ) : (
                  <Switch checked={state.value} edge="end" />
                )}
              </ListItemButton>
            )}
          />
        </div>

        <div>
          <form.Field
            field={store => store.settings.ignore_filtering.toPath()}
            children={({ state, handleBlur, handleChange }) => (
              <ListItemButton onClick={e => handleChange(!state.value)}>
                <ListItemText
                  primary={t('settings:submissions.filtering')}
                  secondary={t('settings:submissions.filtering_desc')}
                />
                {!form.state.values.settings ? (
                  <Skeleton style={{ height: '2rem', width: '1.5rem', marginLeft: sp2, marginRight: sp2 }} />
                ) : (
                  <Switch checked={state.value} edge="end" />
                )}
              </ListItemButton>
            )}
          />
        </div>

        <div>
          <form.Field
            field={store => store.settings.ignore_cache.toPath()}
            children={({ state, handleBlur, handleChange }) => (
              <ListItemButton onClick={e => handleChange(!state.value)}>
                <ListItemText
                  primary={t('settings:submissions.result_caching')}
                  secondary={t('settings:submissions.result_caching_desc')}
                />
                {!form.state.values.settings ? (
                  <Skeleton style={{ height: '2rem', width: '1.5rem', marginLeft: sp2, marginRight: sp2 }} />
                ) : (
                  <Switch checked={state.value} edge="end" />
                )}
              </ListItemButton>
            )}
          />
        </div>

        <div>
          <form.Field
            field={store => store.settings.deep_scan.toPath()}
            children={({ state, handleBlur, handleChange }) => (
              <ListItemButton onClick={e => handleChange(!state.value)}>
                <ListItemText
                  primary={t('settings:submissions.deep_scan')}
                  secondary={t('settings:submissions.deep_scan_desc')}
                />
                {!form.state.values.settings ? (
                  <Skeleton style={{ height: '2rem', width: '1.5rem', marginLeft: sp2, marginRight: sp2 }} />
                ) : (
                  <Switch checked={state.value} edge="end" />
                )}
              </ListItemButton>
            )}
          />
        </div>

        <div
          style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: `${sp1} ${sp2}` }}
        >
          <Typography variant="body1">
            {`${t('options.submission.ttl')} (${
              configuration.submission.max_dtl !== 0
                ? `${t('options.submission.ttl.max')}: ${configuration.submission.max_dtl}`
                : t('options.submission.ttl.forever')
            })`}
          </Typography>
          <form.Field
            field={store => store.settings.ttl.toPath()}
            children={({ state, handleBlur, handleChange }) =>
              !form.state.values.settings ? (
                <Skeleton style={{ height: '3rem' }} />
              ) : (
                <TextField
                  id="ttl"
                  type="number"
                  margin="dense"
                  size="small"
                  inputProps={{
                    min: configuration.submission.max_dtl !== 0 ? 1 : 0,
                    max: configuration.submission.max_dtl !== 0 ? configuration.submission.max_dtl : 365
                  }}
                  defaultValue={form.state.values.submissionProfile?.ttl}
                  value={state.value}
                  onChange={event => handleChange(event.target.value)}
                  variant="outlined"
                  fullWidth
                  disabled={
                    !currentUser.roles.includes('submission_customize') &&
                    form.state.values.submissionProfile?.ttl !== undefined
                  }
                  style={{ width: '100px' }}
                />
              )
            }
          />
        </div>

        {configuration.submission.metadata &&
          configuration.submission.metadata.submit &&
          Object.keys(configuration.submission.metadata.submit).length !== 0 && (
            <>
              <div>
                <Typography variant="h6" gutterBottom>
                  {t('options.submission.metadata')}
                </Typography>
              </div>

              {Object.entries(configuration.submission.metadata.submit).map(([field_name, field_cfg], i) => (
                <div key={i} style={{ padding: `${sp1} ${sp2}` }}>
                  <form.Field
                    key={i}
                    field={() => `$.submissionMetadata.${field_name}`}
                    children={({ state, handleBlur, handleChange }) => (
                      <MetadataInputField
                        key={field_name}
                        name={field_name}
                        configuration={field_cfg}
                        value={state.value}
                        onChange={v => {
                          form.setStore(s => {
                            const cleanMetadata = s.submissionMetadata;
                            if (v === undefined || v === null || v === '') {
                              // Remove field from metadata if value is null
                              delete cleanMetadata[field_name];
                            } else {
                              // Otherwise add/overwrite value
                              cleanMetadata[field_name] = v;
                            }

                            return { ...s, submissionMetadata: { ...cleanMetadata } };
                          });
                        }}
                        onReset={() => {
                          form.setStore(s => {
                            const cleanMetadata = s.submissionMetadata;
                            delete cleanMetadata[field_name];
                            return { ...s, submissionMetadata: { ...cleanMetadata } };
                          });
                        }}
                      />
                    )}
                  />
                </div>
              ))}
            </>
          )}

        {settings?.services
          .sort((a, b) => a.name.localeCompare(b.name))
          .map((category, cat_id) => (
            <>
              <div style={{ marginBottom: theme.spacing(2) }}>
                <Typography variant="h5">{category.name}</Typography>
                <Divider />
              </div>

              {category.services
                .sort((a, b) => a.name.localeCompare(b.name))
                .map((service, svr_id) => (
                  <>
                    <div>
                      <form.Field
                        field={store => store.settings.deep_scan.toPath()}
                        children={({ state, handleBlur, handleChange }) => (
                          <ListItemButton onClick={e => handleChange(!state.value)}>
                            <ListItemText primary={service.name} secondary={service.description} />
                            {!form.state.values.settings ? (
                              <Skeleton
                                style={{ height: '2rem', width: '1.5rem', marginLeft: sp2, marginRight: sp2 }}
                              />
                            ) : (
                              <Checkbox
                                size="small"
                                // checked={param.value}
                                name="label"
                                // onChange={() => setParam(idx, pidx, !param.value)}
                              />
                            )}
                          </ListItemButton>
                        )}
                      />
                    </div>

                    {settings.service_spec
                      .find(spec => spec.name === service.name)
                      ?.params.map((param, p_id) => (
                        <div key={p_id}>
                          {param.type === 'bool' ? (
                            <div>
                              <FormControlLabel
                                control={
                                  <Checkbox
                                    size="small"
                                    // checked={param.value}
                                    name="label"
                                    // onChange={() => setParam(idx, pidx, !param.value)}
                                  />
                                }
                                label={
                                  <Typography variant="body2" style={{ textTransform: 'capitalize' }}>
                                    {param.name.replace(/_/g, ' ')}
                                    <ResetButton
                                      value={param.value}
                                      defaultValue={param.default}
                                      // hasResetButton={hasResetButton}
                                      // reset={() => setParam(idx, pidx, param.default)}
                                    />
                                  </Typography>
                                }
                                // className={classes.item}
                                // disabled={disabled}
                              />
                            </div>
                          ) : (
                            <>
                              <div>
                                <Typography
                                  variant="caption"
                                  gutterBottom
                                  style={{ textTransform: 'capitalize' }}
                                  color="textSecondary"
                                >
                                  {param.name.replace(/_/g, ' ')}
                                  <ResetButton
                                    value={param.value}
                                    defaultValue={param.default}
                                    // hasResetButton={hasResetButton}
                                    // reset={() => {
                                    //   setValue(param.default);
                                    //   setParam(idx, pidx, param.default);
                                    // }}
                                  />
                                </Typography>
                              </div>
                              {param.type === 'list' ? (
                                <FormControl size="small" fullWidth>
                                  <Select
                                    // disabled={disabled}
                                    value={param.value}
                                    variant="outlined"
                                    // onChange={event => setParam(idx, pidx, event.target.value)}
                                    fullWidth
                                  >
                                    {param.list ? (
                                      param.list.map((item, i) => (
                                        <MenuItem key={i} value={item}>
                                          {item}
                                        </MenuItem>
                                      ))
                                    ) : (
                                      <MenuItem value="" />
                                    )}
                                  </Select>
                                </FormControl>
                              ) : param.type === 'str' ? (
                                <TextField
                                  variant="outlined"
                                  // disabled={disabled}
                                  type="text"
                                  size="small"
                                  value={param.value}
                                  // onChange={event => setParam(idx, pidx, event.target.value)}
                                  fullWidth
                                />
                              ) : (
                                <TextField
                                  variant="outlined"
                                  // disabled={disabled}
                                  type="number"
                                  size="small"
                                  // value={parsedValue}
                                  // onChange={handleIntChange}
                                  fullWidth
                                />
                              )}
                            </>
                          )}
                        </div>
                      ))}
                  </>
                ))}
            </>
          ))}
      </div>
    </div>
  );

  return (
    <Grid container textAlign="left" spacing={1}>
      <Grid item xs={12} md={5}>
        {settings.services
          .sort((a, b) => a.name.localeCompare(b.name))
          .map((category, cat_id) => (
            <div key={cat_id}>
              <Typography color="primary" variant="body1">
                {category.name}
              </Typography>
              <div>
                {category.services
                  .sort((a, b) => a.name.localeCompare(b.name))
                  .map((service, svr_id) => (
                    <div key={svr_id}>
                      <Typography color="textPrimary" variant="body2">
                        {service.name}
                      </Typography>
                    </div>
                  ))}
              </div>
            </div>
          ))}
      </Grid>
      <Grid item xs={12} md={7}>
        asd
      </Grid>
    </Grid>
  );
};

export const ServiceNavigation = React.memo(WrappedServiceNavigation);
