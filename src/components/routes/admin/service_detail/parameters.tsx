import { Grid, IconButton, MenuItem, Select, TextField, Tooltip, Typography, useTheme } from '@material-ui/core';
import AddCircleOutlineIcon from '@material-ui/icons/AddCircleOutline';
import RemoveCircleOutlineOutlinedIcon from '@material-ui/icons/RemoveCircleOutlineOutlined';
import 'moment/locale/fr';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ServiceDetail } from '../service_detail';

const DEFAULT_USER_PARAM = {
  name: '',
  type: 'bool',
  default: 'false',
  value: 'false',
  list: []
};

type ServiceParamsProps = {
  service: ServiceDetail;
  setService: (value: ServiceDetail) => void;
  setModified: (value: boolean) => void;
};

const ServiceParams = ({ service, setService, setModified }: ServiceParamsProps) => {
  const { t } = useTranslation(['adminServices']);
  const [tempUserParams, setTempUserParams] = useState(DEFAULT_USER_PARAM);
  const theme = useTheme();

  const handleSubmissionParamUpdate = (value, id) => {
    const newSP = [...service.submission_params];
    const param = newSP[id];

    if (param.type === 'bool') {
      newSP[id] = { ...param, default: value === 'true', value: value === 'true' };
    } else if (param.type === 'list' || param.type === 'str') {
      newSP[id] = { ...param, default: value, value };
    } else {
      newSP[id] = { ...param, default: parseInt(value) || 0, value: parseInt(value) || 0 };
    }

    setModified(true);
    setService({ ...service, submission_params: newSP });
  };

  const handleSubmissionParamListUpdate = (value, id) => {
    const newSP = [...service.submission_params];
    const newList = value.split(',');
    let newDefault = newList[0];
    if (newList.indexOf(newSP[id].default) !== -1) {
      newDefault = newSP[id].default;
    }
    newSP[id] = { ...newSP[id], list: newList, default: newDefault, value: newDefault };

    setModified(true);
    setService({ ...service, submission_params: newSP });
  };

  const handleSubmissionParamDelete = id => {
    const newSP = [...service.submission_params];
    newSP.splice(id, 1);
    setModified(true);
    setService({ ...service, submission_params: newSP });
  };

  const addUserSubmissionParam = param => {
    const newSP = [...service.submission_params];

    if (param.type === 'bool') {
      newSP.push({ ...param, default: param.default === 'true', value: param.default === 'true' });
    } else if (param.type === 'list' || param.type === 'str') {
      newSP.push({ ...param, default: param.default, value: param.default });
    } else {
      newSP.push({ ...param, default: parseInt(param.default) || 0, value: parseInt(param.default) || 0 });
    }

    setModified(true);
    setService({ ...service, submission_params: newSP });
    setTempUserParams(DEFAULT_USER_PARAM);
  };

  const handleSPNameChange = event => {
    setTempUserParams({ ...tempUserParams, name: event.target.value });
  };

  const handleSPTypeChange = event => {
    const type = event.target.value;
    setTempUserParams({ ...tempUserParams, type, default: type === 'int' ? '1' : type === 'bool' ? 'false' : '' });
  };

  const handleSPDefaultChange = event => {
    setTempUserParams({ ...tempUserParams, default: event.target.value });
  };

  const handleSPListChange = event => {
    const newList = event.target.value.split(',');
    let newDefault = newList[0];
    if (newList.indexOf(tempUserParams.default) !== -1) {
      newDefault = tempUserParams.default;
    }
    setTempUserParams({ ...tempUserParams, list: newList, default: newDefault, value: newDefault });
  };

  return (
    <div>
      <Grid container spacing={1} alignItems="center">
        <Grid item xs={12}>
          <Typography variant="h6">{t('params.user')}</Typography>
        </Grid>
        <Grid item xs={12}>
          <Typography variant="subtitle2">{t('params.user.current')}</Typography>
        </Grid>
        {service.submission_params.length !== 0 ? (
          service.submission_params.map((param, i) => {
            return (
              <Grid item key={i} xs={12}>
                <Grid container spacing={1} alignItems="center">
                  <Grid item xs={10} sm={3} style={{ wordBreak: 'break-word' }}>
                    {`${param.name} [${param.type}]:`}
                  </Grid>
                  {param.type === 'list' && (
                    <Grid item xs={10} sm={5}>
                      <TextField
                        fullWidth
                        size="small"
                        margin="dense"
                        variant="outlined"
                        onChange={evt => handleSubmissionParamListUpdate(evt.target.value, i)}
                        value={param.list}
                        style={{ margin: 0 }}
                      />
                    </Grid>
                  )}
                  <Grid item xs={10} sm={param.type === 'list' ? 3 : 8}>
                    {param.type === 'bool' ? (
                      <Select
                        id="user_spec_params"
                        fullWidth
                        value={param.default}
                        onChange={evt => handleSubmissionParamUpdate(evt.target.value, i)}
                        variant="outlined"
                        margin="dense"
                      >
                        <MenuItem value="false">{t('params.false')}</MenuItem>
                        <MenuItem value="true">{t('params.true')}</MenuItem>
                      </Select>
                    ) : param.type === 'list' ? (
                      <Select
                        id="user_spec_params"
                        fullWidth
                        value={param.default}
                        onChange={evt => handleSubmissionParamUpdate(evt.target.value, i)}
                        variant="outlined"
                        margin="dense"
                      >
                        {param.list.map((value, x) => {
                          return (
                            <MenuItem key={x} value={value}>
                              {value}
                            </MenuItem>
                          );
                        })}
                      </Select>
                    ) : (
                      <TextField
                        fullWidth
                        type={param.type === 'int' ? 'number' : 'text'}
                        size="small"
                        margin="dense"
                        variant="outlined"
                        value={param.default}
                        onChange={evt => handleSubmissionParamUpdate(evt.target.value, i)}
                        style={{ margin: 0 }}
                      />
                    )}
                  </Grid>
                  <Grid item xs={2} sm={1}>
                    <Tooltip title={t('params.user.remove')}>
                      <IconButton
                        style={{
                          color: theme.palette.type === 'dark' ? theme.palette.error.light : theme.palette.error.dark
                        }}
                        onClick={() => handleSubmissionParamDelete(i)}
                      >
                        <RemoveCircleOutlineOutlinedIcon />
                      </IconButton>
                    </Tooltip>
                  </Grid>
                </Grid>
              </Grid>
            );
          })
        ) : (
          <Grid item xs={12}>
            <Typography variant="caption" color="textSecondary">
              {t('params.user.none')}
            </Typography>
          </Grid>
        )}
        <Grid item xs={12} style={{ marginTop: theme.spacing(2) }}>
          <Typography variant="subtitle2">{t('params.user.new')}</Typography>
        </Grid>
        <Grid item xs={10} sm={3}>
          <TextField
            fullWidth
            size="small"
            margin="dense"
            variant="outlined"
            onChange={handleSPNameChange}
            value={tempUserParams.name}
            style={{ margin: 0 }}
          />
        </Grid>
        <Grid item xs={10} sm={2}>
          <Select
            id="user_spec_params"
            fullWidth
            value={tempUserParams.type}
            onChange={handleSPTypeChange}
            variant="outlined"
            margin="dense"
          >
            <MenuItem value="bool">bool</MenuItem>
            <MenuItem value="int">int</MenuItem>
            <MenuItem value="list">list ({t('params.comma')})</MenuItem>
            <MenuItem value="str">str</MenuItem>
          </Select>
        </Grid>
        {tempUserParams.type === 'list' && (
          <Grid item xs={10} sm={4}>
            <TextField
              fullWidth
              size="small"
              margin="dense"
              variant="outlined"
              value={tempUserParams.list}
              onChange={handleSPListChange}
              style={{ margin: 0 }}
            />
          </Grid>
        )}
        <Grid item xs={10} sm={tempUserParams.type === 'list' ? 2 : 6}>
          {tempUserParams.type === 'bool' ? (
            <Select
              id="user_spec_params"
              fullWidth
              value={tempUserParams.default}
              onChange={handleSPDefaultChange}
              variant="outlined"
              margin="dense"
            >
              <MenuItem value="false">{t('params.false')}</MenuItem>
              <MenuItem value="true">{t('params.true')}</MenuItem>
            </Select>
          ) : tempUserParams.type === 'list' ? (
            <Select
              id="user_spec_params"
              fullWidth
              value={tempUserParams.default}
              onChange={handleSPDefaultChange}
              variant="outlined"
              margin="dense"
            >
              {tempUserParams.list.map((value, x) => {
                return (
                  <MenuItem key={x} value={value}>
                    {value}
                  </MenuItem>
                );
              })}
            </Select>
          ) : (
            <TextField
              fullWidth
              type={tempUserParams.type === 'int' ? 'number' : 'text'}
              size="small"
              margin="dense"
              variant="outlined"
              value={tempUserParams.default}
              onChange={handleSPDefaultChange}
              style={{ margin: 0 }}
            />
          )}
        </Grid>
        <Grid item xs={2} sm={1} style={{ height: theme.spacing(8) }}>
          {tempUserParams.name !== '' && (
            <Tooltip title={t('params.user.add')}>
              <IconButton
                style={{
                  color: theme.palette.type === 'dark' ? theme.palette.success.light : theme.palette.success.dark
                }}
                onClick={() => addUserSubmissionParam(tempUserParams)}
              >
                <AddCircleOutlineIcon />
              </IconButton>
            </Tooltip>
          )}
        </Grid>
      </Grid>
    </div>
  );
};

export default ServiceParams;
