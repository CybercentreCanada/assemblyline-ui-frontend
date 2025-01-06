import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import type { ButtonProps, SvgIconProps } from '@mui/material';
import {
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
import makeStyles from '@mui/styles/makeStyles';
import type { Submission } from 'components/models/base/submission';
import { getErrorIDFromKey, getErrorTypeFromKey, getHashFromKey, getServiceFromKey } from 'helpers/errors';
import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

const MAX_ERROR_COUNT = 500;

const useStyles = makeStyles(theme => ({
  title: {
    color: theme.palette.mode === 'dark' ? theme.palette.error.light : theme.palette.error.dark,
    flexGrow: 1
  },
  startIcon: {
    marginRight: theme.spacing(1)
  },
  content: {
    '& *': {
      color: theme.palette.mode === 'dark' ? theme.palette.error.light : theme.palette.error.dark
    },
    '& *:not(strong, a, svg, path)': {
      fontSize: '14px',
      fontWeight: 400
    }
  }
}));

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

interface ExpandMoreProps extends SvgIconProps {
  expand: boolean;
}

const ExpandMore = styled(({ expand, ...other }: ExpandMoreProps) => {
  return <KeyboardArrowDownIcon {...other} />;
})(({ theme }) => ({
  marginLeft: 'auto',
  transition: theme.transitions.create('transform', {
    duration: theme.transitions.duration.shortest
  }),
  variants: [
    { props: ({ expand }) => !expand, style: { transform: 'rotate(-90deg)' } },
    { props: ({ expand }) => !!expand, style: { transform: 'rotate(0deg)' } }
  ]
}));

interface ExpandButtonProps extends ButtonProps {
  expand: boolean;
  hideIcon?: boolean;
}

const ExpandButton = styled((props: ExpandButtonProps) => {
  const { expand, hideIcon = false, ...other } = props;
  return (
    <Button
      {...other}
      startIcon={<ExpandMore expand={expand} style={{ visibility: hideIcon ? 'hidden' : 'inherit' }} />}
    />
  );
})(() => ({
  '&.MuiButton-root': {
    textTransform: 'none',
    paddingTop: 0,
    paddingBottom: 0
  }
}));

type ParsedErrors = Record<ErrorTypeValues, Record<string, string[]>>;

const parseErrors = (errors: string[]): ParsedErrors =>
  errors.reduce((prev, error) => {
    const service = getServiceFromKey(error);
    const errorID = getErrorIDFromKey(error);

    let type: ErrorTypeValues = null;
    switch (errorID) {
      case '20':
        type = 'busy';
        break;
      case '21':
        type = 'down';
        break;
      case '12':
        type = 'retry';
        break;
      case '10':
        type = 'depth';
        break;
      case '11':
        type = 'files';
        break;
      case '30':
        type = 'preempted';
        break;
      case '0':
        type = 'unknown';
        break;
      case '1':
        type = 'exception';
        break;
    }

    if (!(type in prev)) {
      return { ...prev, [type]: { [service]: [error] } } as ParsedErrors;
    } else if (!(service in prev[type])) {
      return { ...prev, [type]: { ...prev[type], [service]: [error] } } as ParsedErrors;
    } else {
      return { ...prev, [type]: { ...prev[type], [service]: [...prev[type][service], error] } } as ParsedErrors;
    }
  }, {} as ParsedErrors);

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
            <span>{' files'}</span>
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
  const classes = useStyles();
  const sp2 = theme.spacing(2);

  const parsed = useMemo<ParsedErrors>(() => parseErrors(errors), [errors]);

  return (
    <div style={{ paddingBottom: sp2, paddingTop: sp2 }}>
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
        <Typography className={classes.title} variant="h6">
          <span>{t('errors')}</span>
        </Typography>
      </div>
      <Divider />
      <div className={classes.content} style={{ paddingBottom: sp2, paddingTop: sp2 }}>
        {Object.entries(parsed).map(([type, services]: [ErrorTypeValues, Record<string, string[]>], i) => (
          <ErrorTypes key={i} sid={sid} type={type} services={services} />
        ))}
      </div>
    </div>
  );
};
const ErrorSection = React.memo(WrappedErrorSection);

export default ErrorSection;
