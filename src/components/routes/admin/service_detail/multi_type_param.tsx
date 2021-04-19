import { Grid, IconButton, MenuItem, Select, TextField, Tooltip, useTheme } from '@material-ui/core';
import AddCircleOutlineIcon from '@material-ui/icons/AddCircleOutline';
import RemoveCircleOutlineOutlinedIcon from '@material-ui/icons/RemoveCircleOutlineOutlined';
import 'moment/locale/fr';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { SubmissionParams } from '../service_detail';

type SimpleSubmissionParams = {
  name: string;
  type: 'int' | 'bool' | 'str' | 'list';
  default: string;
  value: string;
  list: string[];
};

type MultiTypeParamProps = {
  param?: SubmissionParams;
  id?: number;
  onAdd?: (param: SubmissionParams) => void;
  onUpdate?: (param: SubmissionParams, id: number) => void;
  onDelete?: (id: number) => void;
};

const DEFAULT_USER_PARAM: SimpleSubmissionParams = {
  name: '',
  type: 'bool',
  default: 'false',
  value: 'false',
  list: []
};

const WrappedMultiTypeParam = ({ param, id, onAdd, onUpdate, onDelete }: MultiTypeParamProps) => {
  const { t } = useTranslation(['adminServices']);
  const [tempUserParams, setTempUserParams] = useState(DEFAULT_USER_PARAM);
  const theme = useTheme();

  const handleSubmissionParamUpdate = event => {
    const { value } = event.target;
    if (param.type === 'bool') {
      onUpdate({ ...param, default: value === 'true', value: value === 'true' }, id);
    } else if (param.type === 'list' || param.type === 'str') {
      onUpdate({ ...param, default: value, value }, id);
    } else {
      onUpdate({ ...param, default: parseInt(value) || 0, value: parseInt(value) || 0 }, id);
    }
  };

  const handleSubmissionParamListUpdate = event => {
    const { value } = event.target;
    const newList = value.split(',');
    let newDefault = newList[0];
    if (newList.indexOf(param.default) !== -1) {
      newDefault = param.default;
    }
    onUpdate({ ...param, list: newList, default: newDefault, value: newDefault }, id);
  };

  const addUserSubmissionParam = () => {
    if (tempUserParams.type === 'bool') {
      onAdd({
        ...tempUserParams,
        default: tempUserParams.default === 'true',
        value: tempUserParams.default === 'true'
      });
    } else if (tempUserParams.type === 'list' || tempUserParams.type === 'str') {
      onAdd({ ...tempUserParams, default: tempUserParams.default, value: tempUserParams.default });
    } else {
      onAdd({
        ...tempUserParams,
        default: parseInt(tempUserParams.default) || 0,
        value: parseInt(tempUserParams.default) || 0
      });
    }

    setTempUserParams(DEFAULT_USER_PARAM);
  };

  const handleSPNameChange = event => {
    setTempUserParams({ ...tempUserParams, name: event.target.value });
  };

  const handleSPTypeChange = event => {
    const type = event.target.value;
    setTempUserParams({
      ...tempUserParams,
      type,
      list: [],
      default: type === 'int' ? '1' : type === 'bool' ? 'false' : '',
      value: type === 'int' ? '1' : type === 'bool' ? 'false' : ''
    });
  };

  const handleSPDefaultChange = event => {
    setTempUserParams({ ...tempUserParams, default: event.target.value, value: event.target.value });
  };

  const handleSPListChange = event => {
    const newList = event.target.value.split(',');
    let newDefault = newList[0];
    if (newList.indexOf(tempUserParams.default) !== -1) {
      newDefault = tempUserParams.default;
    }
    setTempUserParams({ ...tempUserParams, list: newList, default: newDefault, value: newDefault });
  };

  return param ? (
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
            onChange={handleSubmissionParamListUpdate}
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
            onChange={handleSubmissionParamUpdate}
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
            onChange={handleSubmissionParamUpdate}
            variant="outlined"
            margin="dense"
          >
            {param.list ? (
              param.list.map((value, x) => (
                <MenuItem key={x} value={value}>
                  {value}
                </MenuItem>
              ))
            ) : (
              <MenuItem value="" />
            )}
          </Select>
        ) : (
          <TextField
            fullWidth
            type={param.type === 'int' ? 'number' : 'text'}
            size="small"
            margin="dense"
            variant="outlined"
            value={param.default}
            onChange={handleSubmissionParamUpdate}
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
            onClick={() => onDelete(id)}
          >
            <RemoveCircleOutlineOutlinedIcon />
          </IconButton>
        </Tooltip>
      </Grid>
    </Grid>
  ) : (
    <Grid container spacing={1}>
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
            {tempUserParams.list.map((value, x) => (
              <MenuItem key={x} value={value}>
                {value}
              </MenuItem>
            ))}
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
              onClick={addUserSubmissionParam}
            >
              <AddCircleOutlineIcon />
            </IconButton>
          </Tooltip>
        )}
      </Grid>
    </Grid>
  );
};

WrappedMultiTypeParam.defaultProps = {
  param: null,
  id: null,
  onAdd: () => null,
  onUpdate: () => null,
  onDelete: () => null
};

const MultiTypeParam = React.memo(WrappedMultiTypeParam);
export default MultiTypeParam;
