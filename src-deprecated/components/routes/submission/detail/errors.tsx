import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import type { ButtonProps } from '@mui/material';
import {
  Box,
  Button,
  Collapse,
  Divider,
  IconButton,
  Link as MaterialLink,
  Tooltip,
  Typography,
  useTheme
} from '@mui/material';
import { styled } from '@mui/material/styles';
import type { Submission } from 'components/models/base/submission';
import { getErrorIDFromKey, getErrorTypeFromKey, getHashFromKey, getServiceFromKey } from 'helpers/errors';
import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

const MAX_ERROR_COUNT = 500;

export const ERROR_TYPE_MAP = {
  UNKNOWN: 'unknown',
  EXCEPTION: 'exception',
  'MAX DEPTH REACHED': 'depth',
  'MAX FILES REACHED': 'files',
  'MAX RETRY REACHED': 'retry',
  'SERVICE BUSY': 'busy',
  'SERVICE DOWN': 'down',
  'TASK PRE-EMPTED': 'preempted'
} as const;

export type ErrorTypeValues = (typeof ERROR_TYPE_MAP)[keyof typeof ERROR_TYPE_MAP];

const ExpandMore = styled(KeyboardArrowDownIcon, {
  shouldForwardProp: prop => prop !== 'expand'
})<{ expand: boolean }>(({ theme, expand }) => ({
  marginLeft: 'auto',
  transition: theme.transitions.create('transform', {
    duration: theme.transitions.duration.shortest
  }),
  transform: expand ? 'rotate(0deg)' : 'rotate(-90deg)'
}));

interface ExpandButtonProps extends ButtonProps {
  expand: boolean;
  hideIcon?: boolean;
}

const ExpandButton = styled(({ expand, hideIcon, ...other }: ExpandButtonProps) => (
  <Button {...other} startIcon={<ExpandMore expand={expand} sx={{ visibility: hideIcon ? 'hidden' : 'visible' }} />} />
))({
  textTransform: 'none',
  paddingTop: 0,
  paddingBottom: 0,
  marginLeft: '-7px'
});

const ERROR_ID_TO_TYPE: Record<string, ErrorTypeValues> = {
  '20': 'busy',
  '21': 'down',
  '12': 'retry',
  '10': 'depth',
  '11': 'files',
  '30': 'preempted',
  '1': 'exception'
};

type ParsedErrors = Record<ErrorTypeValues, Record<string, string[]>>;

const parseErrors = (errors: string[]) => {
  const result = {} as ParsedErrors;

  for (const error of errors) {
    const service = getServiceFromKey(error);
    const errorID = getErrorIDFromKey(error);
    const type = ERROR_ID_TO_TYPE?.[errorID] ?? 'unknown';

    let typeBucket = result[type];
    if (!typeBucket) {
      typeBucket = {};
      result[type] = typeBucket;
    }

    let serviceBucket = typeBucket[service];
    if (!serviceBucket) {
      serviceBucket = [];
      typeBucket[service] = serviceBucket;
    }

    serviceBucket.push(error);
  }

  return result;
};

type ErrorsProps = {
  sid: string;
  service: string;
  errors: string[];
};

const Errors = ({ sid = null, service = null, errors = [] }: ErrorsProps) => {
  const { t, i18n } = useTranslation(['submissionDetail']);
  const theme = useTheme();

  const [open, setOpen] = useState<boolean>(false);
  const [render, setRender] = useState<boolean>(false);
  const [maxErrors, setMaxErrors] = useState<number>(MAX_ERROR_COUNT);

  if (errors.length <= 1)
    return (
      <div>
        <ExpandButton
          expand={open}
          disableElevation
          disableFocusRipple
          disableRipple
          disableTouchRipple
          hideIcon
          style={{
            cursor: 'auto',
            userSelect: 'text',
            backgroundColor: 'transparent'
          }}
        >
          <span>{getServiceFromKey(errors[0])}</span>
          &nbsp;::&nbsp;
          <strong>
            <MaterialLink
              component={Link}
              color={theme.palette.mode === 'dark' ? theme.palette.error.light : theme.palette.error.dark}
              to={`/submission/detail/${sid}/${getHashFromKey(errors[0])}`}
            >
              {getHashFromKey(errors[0])}
            </MaterialLink>
          </strong>
          <span style={{ fontSize: 'smaller' }}>
            &nbsp;::&nbsp;{t(`errors.type.${getErrorTypeFromKey(errors[0])}`)}
          </span>
        </ExpandButton>
      </div>
    );
  else
    return (
      <div style={{ marginLeft: theme.spacing(0) }}>
        <ExpandButton expand={open} size="small" onClick={() => setOpen(o => !o)}>
          <div>
            <span>{service}</span>
            <span>{' :: '}</span>
            <span>{errors.length.toLocaleString(i18n.language === 'fr' ? 'fr-FR' : 'en-US')}</span>
            <span>{` ${t('files')}`}</span>
          </div>
        </ExpandButton>

        <Collapse in={open} timeout="auto" onEnter={() => setRender(true)}>
          {render && (
            <ul
              style={{
                marginTop: 0,
                listStyleType: 'none',
                marginBottom: theme.spacing(1),
                marginLeft: theme.spacing(0.5)
              }}
            >
              {errors
                .filter((e, i) => i <= maxErrors)
                .map((error, i) => (
                  <li key={i}>
                    <span style={{ fontSize: 'smaller' }}>{getServiceFromKey(error)}</span>
                    &nbsp;::&nbsp;
                    <strong>
                      <MaterialLink
                        component={Link}
                        color={theme.palette.mode === 'dark' ? theme.palette.error.light : theme.palette.error.dark}
                        to={`/submission/detail/${sid}/${getHashFromKey(error)}`}
                      >
                        {getHashFromKey(error)}
                      </MaterialLink>
                    </strong>
                    <span style={{ fontSize: 'smaller' }}>
                      &nbsp;::&nbsp;{t(`errors.type.${getErrorTypeFromKey(error)}`)}
                    </span>
                  </li>
                ))}
              {errors.length <= maxErrors ? null : (
                <Tooltip title={t('show_more')}>
                  <IconButton
                    color="inherit"
                    size="small"
                    style={{ padding: 0 }}
                    onClick={() => setMaxErrors(v => v + MAX_ERROR_COUNT)}
                  >
                    <MoreHorizIcon />
                  </IconButton>
                </Tooltip>
              )}
            </ul>
          )}
        </Collapse>
      </div>
    );
};

type ErrorTypesProps = {
  sid: string;
  type: ErrorTypeValues;
  services: Record<string, string[]>;
};

const ErrorTypes = ({ sid = null, type = null, services = {} }: ErrorTypesProps) => {
  const { t } = useTranslation(['submissionDetail']);
  const theme = useTheme();

  const [open, setOpen] = useState<boolean>(type === 'exception');

  return (
    <div style={{ marginLeft: theme.spacing(0), ...(open && { marginBottom: theme.spacing(1) }) }}>
      <ExpandButton expand={open} onClick={() => setOpen(o => !o)}>
        {`${t('errors.aggregated').replace('{errorType}', t(`errors.type.${type}`))}: ${
          open ? '' : Object.keys(services).sort().join(' | ')
        }`}
      </ExpandButton>

      <Collapse in={open} timeout="auto">
        <div style={{ marginLeft: theme.spacing(2) }}>
          {Object.entries(services)
            .sort()
            .map(([service, errors], i) => (
              <Errors key={i} sid={sid} service={service} errors={errors} />
            ))}
        </div>
      </Collapse>
    </div>
  );
};

type Props = {
  sid: string;
  errors: Submission['errors'];
};

const WrappedErrorSection: React.FC<Props> = ({ sid, errors }) => {
  const { t } = useTranslation(['submissionDetail']);
  const theme = useTheme();
  const sp2 = theme.spacing(2);

  const parsed = useMemo<ParsedErrors>(() => parseErrors(errors), [errors]);

  return (
    <div style={{ paddingBottom: sp2, paddingTop: sp2 }}>
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
        <Typography
          variant="h6"
          sx={{
            color: theme.palette.mode === 'dark' ? theme.palette.error.light : theme.palette.error.dark,
            flexGrow: 1
          }}
        >
          <span>{t('errors')}</span>
        </Typography>
      </div>
      <Divider />
      <Box
        sx={{
          paddingBottom: sp2,
          paddingTop: sp2,
          '& *': {
            color: `${theme.palette.mode === 'dark' ? theme.palette.error.light : theme.palette.error.dark} !important`
          },
          '& *:not(strong, a, svg, path)': {
            fontSize: '14px',
            fontWeight: 400
          }
        }}
      >
        {Object.entries(parsed).map(([type, services]: [ErrorTypeValues, Record<string, string[]>], i) => (
          <ErrorTypes key={i} sid={sid} type={type} services={services} />
        ))}
      </Box>
    </div>
  );
};
const ErrorSection = React.memo(WrappedErrorSection);

export default ErrorSection;
