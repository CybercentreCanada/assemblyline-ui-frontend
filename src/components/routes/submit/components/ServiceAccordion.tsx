import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import {
  Button,
  Checkbox,
  FormControlLabel,
  MenuItem,
  Select,
  TextField,
  Tooltip,
  Typography,
  useTheme
} from '@mui/material';
import Accordion from '@mui/material/Accordion';
import AccordionDetails from '@mui/material/AccordionDetails';
import AccordionSummary from '@mui/material/AccordionSummary';
import FormControl from '@mui/material/FormControl';
import { UserSettings } from 'components/models/base/user_settings';
import React from 'react';
import { useTranslation } from 'react-i18next';

type ResetButtonProps = {
  value: any;
  defaultValue: any;
  hasResetButton?: boolean;
  reset?: () => void;
};

export const ResetButton: React.FC<ResetButtonProps> = React.memo(
  ({ value, defaultValue, hasResetButton = false, reset }: ResetButtonProps) => {
    const { t } = useTranslation(['adminServices']);
    const theme = useTheme();

    return hasResetButton && value !== defaultValue ? (
      <Tooltip title={t('reset.tooltip')} placement="right">
        <Button
          style={{ marginLeft: theme.spacing(1), padding: 0, lineHeight: '1rem' }}
          onClick={event => {
            event.stopPropagation();
            event.preventDefault();
            reset();
          }}
          size="small"
          color="secondary"
          variant="outlined"
        >
          {t('reset')}
        </Button>
      </Tooltip>
    ) : null;
  }
);

type ServiceAccordionProps = {
  settings?: UserSettings;
};

const WrappedServiceAccordion = ({ settings = DEFAULT_SETTINGS }: ServiceAccordionProps) => {
  const theme = useTheme();

  console.log(settings);

  return (
    <>
      {settings?.services
        .sort((a, b) => a.name.localeCompare(b.name))
        .map((category, cat_id) => (
          <Accordion key={cat_id}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>{category.name}</AccordionSummary>
            <AccordionDetails>
              {category.services
                .sort((a, b) => a.name.localeCompare(b.name))
                .map((service, svr_id) => (
                  <Accordion key={cat_id} style={{ backgroundColor: theme.palette.background.default }}>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <div>{service.name}</div>
                      </div>
                    </AccordionSummary>
                    <AccordionDetails>
                      <Typography variant="caption" color="textSecondary">
                        {service.description}
                      </Typography>

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
                    </AccordionDetails>
                  </Accordion>
                ))}
            </AccordionDetails>
          </Accordion>
        ))}
    </>
  );
};

export const ServiceAccordion = React.memo(WrappedServiceAccordion);
