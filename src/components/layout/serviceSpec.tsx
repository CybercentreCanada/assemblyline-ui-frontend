import {
  Checkbox,
  FormControlLabel,
  makeStyles,
  MenuItem,
  Select,
  TextField,
  Typography,
  useTheme
} from '@material-ui/core';

const useStyles = makeStyles(theme => ({
  no_pad: {
    padding: 0
  },
  item: {
    marginLeft: 0,
    width: '100%',
    '&:hover': {
      background: theme.palette.action.hover
    }
  }
}));

type ServiceSpecProps = {
  service_spec: any[];
  setParam: (service_id: number, param_id: number, param_value: any) => void;
  setParamAsync: (service_id: number, param_id: number, param_value: any) => void;
  isSelected?: (name: string) => boolean;
  compressed?: boolean;
};

function ServiceSpec({ service_spec, setParam, setParamAsync, isSelected, compressed }: ServiceSpecProps) {
  const classes = useStyles();
  const theme = useTheme();
  return (
    <div
      style={
        compressed
          ? {
              paddingTop: theme.spacing(2),
              paddingBottom: theme.spacing(2),
              columnWidth: '18rem',
              columnGap: '1rem',
              columnRuleWidth: '1px',
              columnRuleStyle: 'dotted',
              columnRuleColor: theme.palette.divider
            }
          : null
      }
    >
      {service_spec.map(
        (service, idx) =>
          isSelected(service.name) && (
            <div
              key={idx}
              style={{ paddingTop: theme.spacing(1), paddingBottom: theme.spacing(1), pageBreakInside: 'avoid' }}
            >
              <Typography variant="subtitle1" gutterBottom>
                <b>{service.name}</b>
              </Typography>
              {service.params.map((param, pidx) => (
                <div key={pidx} style={{ paddingBottom: theme.spacing(1) }}>
                  {param.type === 'bool' ? (
                    <div style={{ paddingLeft: theme.spacing(1) }}>
                      <FormControlLabel
                        control={
                          <Checkbox
                            size="small"
                            checked={param.value === 'true' || param.value === true}
                            name="label"
                            onChange={() => setParam(idx, pidx, !param.value)}
                          />
                        }
                        label={
                          <Typography variant="body2" style={{ textTransform: 'capitalize' }}>
                            {param.name.replace(/_/g, ' ')}
                          </Typography>
                        }
                        className={classes.item}
                      />
                    </div>
                  ) : (
                    <>
                      <div>
                        <Typography variant="caption" gutterBottom style={{ textTransform: 'capitalize' }}>
                          {param.name.replace(/_/g, ' ')}
                        </Typography>
                      </div>
                      {param.type === 'list' ? (
                        <Select
                          margin="dense"
                          value={param.value}
                          variant="outlined"
                          onChange={event => setParam(idx, pidx, event.target.value)}
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
                      ) : (
                        <TextField
                          variant="outlined"
                          type={param.type === 'int' ? 'number' : 'text'}
                          size="small"
                          fullWidth
                          defaultValue={param.value}
                          onChange={event => setParamAsync(idx, pidx, event.target.value)}
                        />
                      )}
                    </>
                  )}
                </div>
              ))}
            </div>
          )
      )}
    </div>
  );
}

ServiceSpec.defaultProps = {
  isSelected: (name: string) => true,
  compressed: false
};

export default ServiceSpec;
