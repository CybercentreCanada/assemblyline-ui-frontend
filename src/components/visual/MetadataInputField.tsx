import { Autocomplete, MenuItem, TextField, Tooltip, Typography } from '@mui/material';
import { MetadataConfiguration } from 'components/hooks/useMyUser';
import DatePicker from 'components/visual/DatePicker';
import { matchURL } from 'helpers/utils';

interface MetadataInputFieldProps {
  name: string;
  configuration: MetadataConfiguration;
  value: any;
  onChange: (value: any) => void;
  options?: string[];
}

const isValid = (input: string, field_cfg: MetadataConfiguration) => {
  if (!input) {
    // No input provided or is unset at the moment
    // Validity depends on whether or not the field is required
    return !field_cfg.required;
  }

  if (field_cfg.validator_type === 'boolean' || field_cfg.validator_type === 'enum') {
    // Limited selection so should always be valid
    return true;
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

const MetadataInputField: React.FC<MetadataInputFieldProps> = ({
  name,
  configuration,
  value,
  onChange,
  options = []
}) => {
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
      configuration.validator_type === 'boolean'
        ? onChange(event.target.value === 'true')
        : onChange(event.target.value);
    },
    required: configuration.required,
    fullWidth: true,
    value: value,
    error: !isValid(value, configuration)
  };

  const defaultAutoCompleteProps = {
    options: options,
    autoComplete: true,
    freeSolo: true,
    onInputChange: (_, v, __) => onChange(v)
  };

  if (configuration.validator_type === 'boolean' || configuration.validator_type === 'enum') {
    return (
      <TextField select {...defaultTextFieldProps}>
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
        <Autocomplete
          {...defaultAutoCompleteProps}
          renderInput={params => <TextField {...params} {...defaultTextFieldProps} />}
        />
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
    return <DatePicker date={value} setDate={onChange} type="input" textFieldProps={{ ...defaultTextFieldProps }} />;
  }
  return (
    <Autocomplete
      {...defaultAutoCompleteProps}
      renderInput={params => <TextField {...params} {...defaultTextFieldProps} />}
    />
  );
};

export default MetadataInputField;
