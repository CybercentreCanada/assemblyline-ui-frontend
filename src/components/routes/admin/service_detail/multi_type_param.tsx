import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import RemoveCircleOutlineOutlinedIcon from '@mui/icons-material/RemoveCircleOutlineOutlined';
import StarIcon from '@mui/icons-material/Star';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import {
  Autocomplete,
  Checkbox,
  FormControlLabel,
  Grid,
  IconButton,
  MenuItem,
  Select,
  TextField,
  Tooltip,
  Typography,
  useTheme
} from '@mui/material';
import FormControl from '@mui/material/FormControl';
import CustomChip from 'components/visual/CustomChip';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { SubmissionParams } from '../service_detail';

type SimpleSubmissionParams = {
  name: string;
  type: 'int' | 'bool' | 'str' | 'list';
  default: string;
  value: string;
  list: string[];
  hide: string;
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
  list: [],
  hide: 'false'
};

const WrappedMultiTypeParam = ({ param, id, onAdd, onUpdate, onDelete }: MultiTypeParamProps) => {
  const { t } = useTranslation(['adminServices']);
  const [tempUserParams, setTempUserParams] = useState(DEFAULT_USER_PARAM);
  const theme = useTheme();

  const handleSubmissionParamUpdate = event => {
    const { value } = event.target;
    if (param.type === 'bool') {
      onUpdate({ ...param, default: value === 'true', value: value === 'true' }, id);
    } else if (param.type === 'str') {
      onUpdate({ ...param, default: value, value }, id);
    } else {
      onUpdate({ ...param, default: parseInt(value) || 0, value: parseInt(value) || 0 }, id);
    }
  };

  const handleParamHide = () => {
    onUpdate({ ...param, hide: !param.hide }, id);
  };

  const handleSubmissionParamListUpdate = selections => {
    let newDefault = selections[0];
    if (selections.indexOf(param.default) !== -1) {
      newDefault = param.default;
    }
    onUpdate({ ...param, list: selections, default: newDefault, value: newDefault }, id);
  };

  const addUserSubmissionParam = () => {
    if (tempUserParams.type === 'bool') {
      onAdd({
        ...tempUserParams,
        default: tempUserParams.default === 'true',
        value: tempUserParams.default === 'true',
        hide: tempUserParams.hide === 'true'
      });
    } else if (tempUserParams.type === 'list' || tempUserParams.type === 'str') {
      onAdd({
        ...tempUserParams,
        default: tempUserParams.default,
        value: tempUserParams.default,
        hide: tempUserParams.hide === 'true'
      });
    } else {
      onAdd({
        ...tempUserParams,
        default: parseInt(tempUserParams.default) || 0,
        value: parseInt(tempUserParams.default) || 0,
        hide: tempUserParams.hide === 'true'
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

  const handleSPAdvancedChange = () => {
    setTempUserParams({ ...tempUserParams, hide: tempUserParams.hide === 'false' ? 'true' : 'false' });
  };

  const handleSPListChange = selections => {
    let newDefault = selections[0];
    if (selections.indexOf(tempUserParams.default) !== -1) {
      newDefault = tempUserParams.default;
    }
    setTempUserParams({ ...tempUserParams, list: selections, default: newDefault, value: newDefault });
  };

  const renderParamLabelTags = (values: string[]) => {
    return values.map(value => (
      <CustomChip
        label={
          <div style={{ display: 'flex' }}>
            {value === param.default ? (
              <StarIcon fontSize="small" style={{ marginLeft: '-6px', marginRight: '6px', marginTop: '1px' }} />
            ) : null}
            {value}
          </div>
        }
        // Render labels to show what are options to the user and what is selected by default
        style={{ marginRight: theme.spacing(0.5) }}
        onClick={() => onUpdate({ ...param, default: value, value }, id)}
        onDelete={() =>
          handleSubmissionParamListUpdate(
            param.list.filter(v => {
              return v !== value;
            })
          )
        }
        color={value === param.default ? 'primary' : null}
      />
    ));
  };

  const renderSPLabelTags = (values: string[]) => {
    return values.map(value => (
      <CustomChip
        label={
          <div style={{ display: 'flex' }}>
            {value === tempUserParams.default ? (
              <StarIcon fontSize="small" style={{ marginLeft: '-6px', marginRight: '6px', marginTop: '1px' }} />
            ) : null}
            {value}
          </div>
        }
        // Render labels to show what are options to the user and what is selected by default
        style={{ marginRight: theme.spacing(0.5) }}
        onClick={() => setTempUserParams({ ...tempUserParams, default: value, value })}
        onDelete={() =>
          handleSPListChange(
            tempUserParams.list.filter(v => {
              return v !== value;
            })
          )
        }
        color={value === tempUserParams.default ? 'primary' : null}
      />
    ));
  };

  return param ? (
    <Grid container spacing={1} alignItems="center">
      <Grid item xs={10} sm={3} style={{ wordBreak: 'break-word' }}>
        {`${param.name} [${param.type}]:`}
      </Grid>
      <Grid item xs={2} sm={1}>
        <Tooltip title={t(param.hide ? 'params.user.show' : 'params.user.hide')}>
          <IconButton onClick={handleParamHide} size="large">
            {param.hide ? <VisibilityOffIcon /> : <VisibilityIcon />}
          </IconButton>
        </Tooltip>
      </Grid>
      <Grid item xs={10} sm={7}>
        {param.type === 'bool' ? (
          <FormControl size="small" fullWidth>
            <Select
              id="user_spec_params"
              fullWidth
              value={param.default}
              onChange={handleSubmissionParamUpdate}
              variant="outlined"
            >
              <MenuItem value="false">{t('params.false')}</MenuItem>
              <MenuItem value="true">{t('params.true')}</MenuItem>
            </Select>
          </FormControl>
        ) : param.type === 'list' ? (
          <Autocomplete
            fullWidth
            freeSolo
            multiple
            size="small"
            options={[]}
            renderInput={params => <TextField {...params}></TextField>}
            onChange={(event, value, reason) => handleSubmissionParamListUpdate(value as string[])}
            renderTags={(value, getTagProps, ownerState) => renderParamLabelTags(value)}
            value={param.list}
          />
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
              color: theme.palette.mode === 'dark' ? theme.palette.error.light : theme.palette.error.dark
            }}
            onClick={() => onDelete(id)}
            size="large"
          >
            <RemoveCircleOutlineOutlinedIcon />
          </IconButton>
        </Tooltip>
      </Grid>
    </Grid>
  ) : (
    <Grid container spacing={1} alignItems="center">
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
        <FormControl size="small" fullWidth>
          <Select
            id="user_spec_params"
            fullWidth
            value={tempUserParams.type}
            onChange={handleSPTypeChange}
            variant="outlined"
          >
            <MenuItem value="bool">bool</MenuItem>
            <MenuItem value="int">int</MenuItem>
            <MenuItem value="list">list</MenuItem>
            <MenuItem value="str">str</MenuItem>
          </Select>
        </FormControl>
      </Grid>
      <Grid item xs={10} sm={6}>
        {tempUserParams.type === 'bool' ? (
          <FormControl size="small" fullWidth>
            <Select
              id="user_spec_params"
              fullWidth
              value={tempUserParams.default}
              onChange={handleSPDefaultChange}
              variant="outlined"
            >
              <MenuItem value="false">{t('params.false')}</MenuItem>
              <MenuItem value="true">{t('params.true')}</MenuItem>
            </Select>
          </FormControl>
        ) : tempUserParams.type === 'list' ? (
          <Autocomplete
            fullWidth
            freeSolo
            multiple
            size="small"
            options={[]}
            value={tempUserParams.list}
            renderInput={params => <TextField {...params}></TextField>}
            renderTags={(value, getTagProps, ownerState) => renderSPLabelTags(value)}
            onChange={(event, value, reason) => handleSPListChange(value as string[])}
          />
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
                color: theme.palette.mode === 'dark' ? theme.palette.success.light : theme.palette.success.dark
              }}
              onClick={addUserSubmissionParam}
              size="large"
            >
              <AddCircleOutlineIcon />
            </IconButton>
          </Tooltip>
        )}
      </Grid>
      <Grid item xs={12}>
        <FormControlLabel
          control={
            <Checkbox
              size="small"
              checked={tempUserParams.hide === 'true'}
              name="label"
              onChange={handleSPAdvancedChange}
            />
          }
          label={<Typography variant="subtitle2">{t('params.user.hide')}</Typography>}
        />
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
