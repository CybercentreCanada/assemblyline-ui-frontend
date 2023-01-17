import {
  Button,
  Checkbox,
  FormControlLabel,
  makeStyles,
  MenuItem,
  Select,
  TextField,
  Tooltip,
  Typography,
  useTheme
} from '@material-ui/core';
import MoreHorizIcon from '@material-ui/icons/MoreHoriz';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

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

function Service({ disabled, service, idx, setParam, setParamAsync }) {
  const theme = useTheme();
  const [showMore, setShowMore] = useState(false);
  const { t } = useTranslation();
  return (
    <div key={idx} style={{ paddingTop: theme.spacing(1), paddingBottom: theme.spacing(1), pageBreakInside: 'avoid' }}>
      <Typography variant="subtitle1" gutterBottom>
        <b>{service.name}</b>
      </Typography>
      {service.params.map(
        (param, pidx) =>
          !param.hide && (
            <Param
              key={pidx}
              disabled={disabled}
              param={param}
              pidx={pidx}
              idx={idx}
              setParam={setParam}
              setParamAsync={setParamAsync}
            />
          )
      )}
      {showMore
        ? service.params.map(
            (param, pidx) =>
              param.hide && (
                <Param
                  key={pidx}
                  disabled={disabled}
                  param={param}
                  pidx={pidx}
                  idx={idx}
                  setParam={setParam}
                  setParamAsync={setParamAsync}
                />
              )
          )
        : service.params.filter(param => param.hide).length !== 0 && (
            <Tooltip title={t('show_more')}>
              <Button size="small" onClick={() => setShowMore(true)} style={{ padding: 0 }}>
                <MoreHorizIcon />
              </Button>
            </Tooltip>
          )}
    </div>
  );
}

function Param({ disabled, param, pidx, idx, setParam, setParamAsync }) {
  const classes = useStyles();
  const theme = useTheme();
  return (
    <div key={pidx} style={{ paddingBottom: theme.spacing(1) }}>
      {param.type === 'bool' ? (
        <div style={{ paddingLeft: theme.spacing(1) }}>
          <FormControlLabel
            control={
              <Checkbox
                size="small"
                disabled={disabled}
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
            className={!disabled ? classes.item : null}
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
              disabled={disabled}
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
              disabled={disabled}
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
  );
}

type ServiceSpecProps = {
  service_spec: any[];
  setParam: (service_id: number, param_id: number, param_value: any) => void;
  setParamAsync: (service_id: number, param_id: number, param_value: any) => void;
  isSelected?: (name: string) => boolean;
  disabled?: boolean;
  compressed?: boolean;
};

function ServiceSpec({ service_spec, setParam, setParamAsync, isSelected, disabled, compressed }: ServiceSpecProps) {
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
            <Service
              key={idx}
              disabled={disabled}
              service={service}
              idx={idx}
              setParam={setParam}
              setParamAsync={setParamAsync}
            />
          )
      )}
    </div>
  );
}

ServiceSpec.defaultProps = {
  isSelected: (name: string) => true,
  disabled: false,
  compressed: false
};

export default ServiceSpec;
