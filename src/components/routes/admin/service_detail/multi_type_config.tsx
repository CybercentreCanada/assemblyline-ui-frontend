import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import RemoveCircleOutlineOutlinedIcon from '@mui/icons-material/RemoveCircleOutlineOutlined';
import { Grid, IconButton, MenuItem, Select, TextField, Tooltip, useTheme } from '@mui/material';
import FormControl from '@mui/material/FormControl';
import 'moment/locale/fr';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import ReactJson from 'react-json-view';

type ServiceConfig = {
  name: string;
  value: any;
};

type ExtendedServiceConfig = {
  name: string;
  type: 'bool' | 'int' | 'list' | 'str' | 'json';
  value: any;
};

type MultiTypeConfigProps = {
  config?: ServiceConfig;
  onAdd?: (config: ServiceConfig) => void;
  onUpdate?: (config: ServiceConfig) => void;
  onDelete?: (config: ServiceConfig) => void;
};

const DEFAULT_CONFIG: ExtendedServiceConfig = {
  name: '',
  type: 'bool',
  value: 'false'
};

const WrappedMultiTypeConfig = ({ config, onAdd, onUpdate, onDelete }: MultiTypeConfigProps) => {
  const { t } = useTranslation(['adminServices']);
  const [tempConfig, setTempConfig] = useState(DEFAULT_CONFIG);
  const theme = useTheme();

  const jsonTheme = {
    base00: 'transparent', // Background
    base01: theme.palette.grey[theme.palette.mode === 'dark' ? 900 : 300], // Add key title + Edit value background
    base02: theme.palette.grey[theme.palette.mode === 'dark' ? 700 : 400], // Borders and DataType Background
    base03: '#444', // Unused
    base04: theme.palette.grey[theme.palette.mode === 'dark' ? 700 : 400], // Object size and Add key border
    base05: theme.palette.grey[theme.palette.mode === 'dark' ? 400 : 600], // Undefined and Add key background
    base06: '#444', // Unused
    base07: theme.palette.text.primary, // Brace, Key and Borders
    base08: theme.palette.text.secondary, // NaN
    base09: theme.palette.mode === 'dark' ? theme.palette.warning.light : theme.palette.warning.dark, // Strings and Icons
    base0A: theme.palette.grey[theme.palette.mode === 'dark' ? 300 : 800], // Null, Regex and edit text color
    base0B: theme.palette.mode === 'dark' ? theme.palette.error.light : theme.palette.error.dark, // Float
    base0C: theme.palette.mode === 'dark' ? theme.palette.secondary.light : theme.palette.secondary.dark, // Array Key
    base0D: theme.palette.mode === 'dark' ? theme.palette.info.light : theme.palette.info.dark, // Date, function, expand icon
    base0E: theme.palette.mode === 'dark' ? theme.palette.info.light : theme.palette.info.dark, // Boolean
    base0F: theme.palette.mode === 'dark' ? theme.palette.error.light : theme.palette.error.dark // Integer
  };

  const detectConfigType = (cfg: ServiceConfig): ExtendedServiceConfig => {
    if (cfg.value === null || cfg.value === undefined) {
      return { ...cfg, value: '', type: 'str' };
    }

    if (typeof cfg.value === 'number') {
      return { ...cfg, type: 'int' };
    }

    if (typeof cfg.value === 'object') {
      if (Array.isArray(cfg.value)) {
        return { ...cfg, type: 'list', value: cfg.value.toString() };
      }
      return { ...cfg, type: 'json' };
    }

    if (typeof cfg.value === 'boolean') {
      return { ...cfg, type: 'bool' };
    }
    return { ...cfg, type: 'str' };
  };

  const parsedConfig = config ? detectConfigType(config) : null;

  const handleConfigUpdate = event => {
    const { value } = event.target;
    if (parsedConfig.type === 'bool') {
      onUpdate({ ...parsedConfig, value: value === 'true' });
    } else if (parsedConfig.type === 'list') {
      onUpdate({ ...parsedConfig, value: value.split(',') });
    } else if (parsedConfig.type === 'str') {
      onUpdate({ ...parsedConfig, value });
    } else if (parsedConfig.type === 'int') {
      onUpdate({ ...parsedConfig, value: parseInt(value) || 0 });
    }
  };

  const handleConfigUpdateJSON = data => {
    const { updated_src: value } = data;
    onUpdate({ ...parsedConfig, value });
  };

  const addConfig = () => {
    if (tempConfig.type === 'bool') {
      onAdd({ ...tempConfig, value: tempConfig.value === 'true' });
    } else if (tempConfig.type === 'list') {
      onAdd({ ...tempConfig, value: tempConfig.value.split(',') });
    } else if (tempConfig.type === 'str') {
      onAdd({ ...tempConfig, value: tempConfig.value });
    } else if (tempConfig.type === 'int') {
      onAdd({ ...tempConfig, value: parseInt(tempConfig.value) || 0 });
    } else {
      onAdd({ ...tempConfig, value: tempConfig.value });
    }
    setTempConfig(DEFAULT_CONFIG);
  };

  const handleConfigNameChange = event => {
    setTempConfig({ ...tempConfig, name: event.target.value });
  };

  const handleConfigTypeChange = event => {
    const type = event.target.value;
    setTempConfig({
      ...tempConfig,
      type,
      value: type === 'int' ? '1' : type === 'bool' ? 'false' : type === 'json' ? {} : ''
    });
  };

  const handleConfigChange = event => {
    setTempConfig({ ...tempConfig, value: event.target.value });
  };

  const handleConfigChangeJSON = data => {
    const { updated_src: value } = data;
    setTempConfig({ ...tempConfig, value });
  };

  return config ? (
    <Grid container spacing={1} alignItems="center">
      <Grid item xs={10} sm={3} style={{ wordBreak: 'break-word' }}>
        {`${parsedConfig.name} [${parsedConfig.type}]:`}
      </Grid>
      <Grid item xs={10} sm={8}>
        {parsedConfig.type === 'bool' ? (
          <FormControl size="small" fullWidth>
            <Select
              id="user_spec_params"
              fullWidth
              value={parsedConfig.value}
              onChange={handleConfigUpdate}
              variant="outlined"
            >
              <MenuItem value="false">{t('params.false')}</MenuItem>
              <MenuItem value="true">{t('params.true')}</MenuItem>
            </Select>
          </FormControl>
        ) : parsedConfig.type === 'json' ? (
          <ReactJson
            name={false}
            src={parsedConfig.value}
            theme={jsonTheme}
            enableClipboard={false}
            groupArraysAfterLength={10}
            displayDataTypes={false}
            displayObjectSize={false}
            onAdd={handleConfigUpdateJSON}
            onDelete={handleConfigUpdateJSON}
            onEdit={handleConfigUpdateJSON}
            style={{
              border: `1px solid ${theme.palette.divider}`,
              borderRadius: '4px',
              fontSize: '1rem',
              minHeight: theme.spacing(5),
              padding: '4px'
            }}
          />
        ) : (
          <TextField
            fullWidth
            type={parsedConfig.type === 'int' ? 'number' : 'text'}
            size="small"
            margin="dense"
            variant="outlined"
            value={parsedConfig.value}
            onChange={handleConfigUpdate}
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
            onClick={() => onDelete(parsedConfig)}
            size="large"
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
          onChange={handleConfigNameChange}
          value={tempConfig.name}
          style={{ margin: 0 }}
        />
      </Grid>
      <Grid item xs={10} sm={2}>
        <FormControl size="small" fullWidth>
          <Select
            id="user_spec_params"
            fullWidth
            value={tempConfig.type}
            onChange={handleConfigTypeChange}
            variant="outlined"
          >
            <MenuItem value="bool">bool</MenuItem>
            <MenuItem value="int">int</MenuItem>
            <MenuItem value="json">json</MenuItem>
            <MenuItem value="list">list ({t('params.comma')})</MenuItem>
            <MenuItem value="str">str</MenuItem>
          </Select>
        </FormControl>
      </Grid>
      <Grid item xs={10} sm={6}>
        {tempConfig.type === 'bool' ? (
          <FormControl size="small" fullWidth>
            <Select
              id="user_spec_params"
              fullWidth
              value={tempConfig.value}
              onChange={handleConfigChange}
              variant="outlined"
            >
              <MenuItem value="false">{t('params.false')}</MenuItem>
              <MenuItem value="true">{t('params.true')}</MenuItem>
            </Select>
          </FormControl>
        ) : tempConfig.type === 'json' ? (
          <ReactJson
            name={false}
            src={tempConfig.value}
            theme={jsonTheme}
            enableClipboard={false}
            groupArraysAfterLength={10}
            displayDataTypes={false}
            displayObjectSize={false}
            onAdd={handleConfigChangeJSON}
            onDelete={handleConfigUpdateJSON}
            onEdit={handleConfigChangeJSON}
            style={{
              border: `1px solid ${theme.palette.divider}`,
              borderRadius: '4px',
              fontSize: '1rem',
              minHeight: theme.spacing(5),
              padding: '4px'
            }}
          />
        ) : (
          <TextField
            fullWidth
            type={tempConfig.type === 'int' ? 'number' : 'text'}
            size="small"
            margin="dense"
            variant="outlined"
            value={tempConfig.value}
            onChange={handleConfigChange}
            style={{ margin: 0 }}
          />
        )}
      </Grid>
      <Grid item xs={2} sm={1} style={{ height: theme.spacing(8) }}>
        {tempConfig.name !== '' && (
          <Tooltip title={t('params.user.add')}>
            <IconButton
              style={{
                color: theme.palette.mode === 'dark' ? theme.palette.success.light : theme.palette.success.dark
              }}
              onClick={addConfig}
              size="large"
            >
              <AddCircleOutlineIcon />
            </IconButton>
          </Tooltip>
        )}
      </Grid>
    </Grid>
  );
};

WrappedMultiTypeConfig.defaultProps = {
  config: null,
  // eslint-disable-next-line no-console
  onAdd: config => console.log('ADD', config),
  // eslint-disable-next-line no-console
  onUpdate: config => console.log('UPDATE', config),
  // eslint-disable-next-line no-console
  onDelete: config => console.log('DELETE', config)
};

const MultiTypeConfig = React.memo(WrappedMultiTypeConfig);
export default MultiTypeConfig;
