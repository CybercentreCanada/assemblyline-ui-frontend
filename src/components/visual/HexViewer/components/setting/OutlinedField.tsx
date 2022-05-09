import { FormControl, Grid, TextField, Tooltip, Typography, useMediaQuery, useTheme } from '@material-ui/core';
import { default as React, memo, PropsWithChildren } from 'react';

export type OutlinedFieldProps = {
  label?: string;
  description?: string;
  items?: Array<{
    value: number;
    label: string;
  }>;
  value?: string;
  onChange?: (event: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement | any>) => void;
};

export const WrappedOutlinedField = ({
  label = '',
  description = '',
  items = [],
  value = null,
  onChange = () => null
}: OutlinedFieldProps) => {
  const theme = useTheme();
  const upSM = useMediaQuery(theme.breakpoints.up('sm'));

  return (
    <>
      <Grid item sm={4} xs={12} style={{ wordBreak: 'break-word' }}>
        <Tooltip title={description} placement={upSM ? 'right' : 'bottom-start'}>
          <Typography variant="subtitle2">{label}</Typography>
        </Tooltip>
      </Grid>
      <Grid item sm={8} xs={12} style={{ textAlign: 'right' }}>
        <FormControl style={{ width: '100%' }}>
          <TextField
            variant="outlined"
            size="small"
            value={value}
            onChange={(event: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement | any>) => onChange(event)}
          />
        </FormControl>
      </Grid>
    </>
  );
};

export const OutlinedField = memo(
  WrappedOutlinedField,
  (
    prevProps: Readonly<PropsWithChildren<OutlinedFieldProps>>,
    nextProps: Readonly<PropsWithChildren<OutlinedFieldProps>>
  ) =>
    prevProps.value === nextProps.value &&
    prevProps.items === nextProps.items &&
    prevProps.label === nextProps.label &&
    prevProps.description === nextProps.description
);

export default OutlinedField;
