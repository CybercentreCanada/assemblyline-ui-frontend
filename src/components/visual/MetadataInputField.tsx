import { MenuItem, TextField, Tooltip, Typography } from '@mui/material';
import { MetadataConfiguration } from 'components/hooks/useMyUser';
import DatePicker from 'components/visual/DatePicker';
import { matchURL } from 'helpers/utils';

interface MetadataInputFieldProps {
  name: string;
  configuration: MetadataConfiguration;
  value: any;
  onChange: (value: any) => void;
}

const isValid = (input: string, field_cfg) => {
  if (!input) {
    // No input provided or is unset at the moment
    return false;
  }

  if (field_cfg.validator_type === 'uri' && matchURL(input)) {
    return true;
  } else if (
    field_cfg.validator_type !== 'uri' &&
    input.match(new RegExp(field_cfg.validator_params.validation_regex))
  ) {
    return true;
  }
  return false;
};

const MetadataInputField: React.FC<MetadataInputFieldProps> = ({ name, configuration, value, onChange }) => {
  // Default set of properties that apply to all text fields
  const defaultTextFieldProps = {
    id: `metadata.${name}`,
    margin: 'dense' as const,
    size: 'small' as const,
    variant: 'outlined' as const,
    label: (
      <Typography variant="caption" gutterBottom>
        {`${name} [ ${configuration.validator_type.toUpperCase()} ]`}
      </Typography>
    ),
    onChange: (event: any) => {
      onChange(event.target.value);
    },
    required: configuration.required,
    fullWidth: true
  };

  if (configuration.validator_type === 'boolean' || configuration.validator_type === 'enum') {
    return (
      <TextField
        select
        {...defaultTextFieldProps}
        onChange={e =>
          configuration.validator_type === 'boolean' ? onChange(e.target.value === 'true') : onChange(e.target.value)
        }
      >
        {(configuration.validator_type === 'boolean' ? ['true', 'false'] : configuration.validator_params.values).map(
          v => (
            <MenuItem key={v} value={v}>
              {v}
            </MenuItem>
          )
        )}
      </TextField>
    );
  } else if (configuration.validator_params?.validation_regex || configuration.validator_type === 'uri') {
    return (
      <Tooltip
        title={configuration.validator_type === 'regex' ? configuration.validator_params?.validation_regex : null}
        placement="right"
      >
        <TextField {...defaultTextFieldProps} error={!isValid(value, configuration)} />
      </Tooltip>
    );
  } else if (configuration.validator_type === 'integer') {
    return (
      <TextField
        {...defaultTextFieldProps}
        type="number"
        InputProps={{
          inputProps: { max: configuration.validator_params.max, min: configuration.validator_params.min }
        }}
      />
    );
  } else if (configuration.validator_type === 'date') {
    return <DatePicker date={value} setDate={onChange} type="input" textFieldProps={defaultTextFieldProps} />;
  }
  return <TextField {...defaultTextFieldProps}></TextField>;
};

export default MetadataInputField;
