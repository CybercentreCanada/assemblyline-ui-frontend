import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import { Button, Collapse, Divider, Link as MaterialLink, Typography, useTheme } from '@mui/material';
import makeStyles from '@mui/styles/makeStyles';
import { ParsedErrors } from 'components/models/base/error';
import { getErrorTypeFromKey, getHashFromKey, getServiceFromKey } from 'helpers/errors';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

const useStyles = makeStyles(theme => ({
  title: {
    flexGrow: 1
  }
}));

type ErrorSectionProps = {
  sid: string;
  parsed_errors: ParsedErrors;
};

const WrappedErrorSection: React.FC<ErrorSectionProps> = ({ sid, parsed_errors }) => {
  const { t } = useTranslation(['submissionDetail']);
  const [detailled, setDetailed] = React.useState(false);
  const theme = useTheme();
  const classes = useStyles();
  const sp2 = theme.spacing(2);
  return (
    <div style={{ paddingBottom: sp2, paddingTop: sp2 }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-end',
          justifyContent: 'space-between'
        }}
      >
        <Typography
          variant="h6"
          style={{
            color: theme.palette.mode === 'dark' ? theme.palette.error.light : theme.palette.error.dark
          }}
          className={classes.title}
        >
          <span>{t('errors')}</span>
        </Typography>
        <Button size="small" onClick={() => setDetailed(!detailled)} style={{ color: theme.palette.text.secondary }}>
          {!detailled ? (
            <>
              {t('errors.detailed')}
              <KeyboardArrowDownIcon style={{ marginLeft: theme.spacing(1) }} />
            </>
          ) : (
            <>
              {t('errors.summary')}
              <KeyboardArrowUpIcon style={{ marginLeft: theme.spacing(1) }} />
            </>
          )}
        </Button>
      </div>
      <Divider />
      <div style={{ paddingBottom: sp2, paddingTop: sp2 }}>
        <Collapse in={!detailled} timeout="auto">
          {Object.keys(parsed_errors.aggregated).map(
            (errorType, i) =>
              parsed_errors.aggregated[errorType].length > 0 && (
                <div
                  key={i}
                  style={{
                    color: theme.palette.mode === 'dark' ? theme.palette.error.light : theme.palette.error.dark
                  }}
                >
                  {`${t('errors.aggregated').replace(
                    '{errorType}',
                    t(`errors.type.${errorType}`)
                  )}: ${parsed_errors.aggregated[errorType].join(' | ')}`}
                </div>
              )
          )}
        </Collapse>
        <Collapse in={detailled} timeout="auto">
          <div>
            {parsed_errors.listed.map((error, i) => (
              <div
                key={i}
                style={{
                  color: theme.palette.mode === 'dark' ? theme.palette.error.light : theme.palette.error.dark
                }}
              >
                <strong>{getServiceFromKey(error)}</strong>
                {t('errors.listed')}
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
              </div>
            ))}
          </div>
        </Collapse>
      </div>
    </div>
  );
};
const ErrorSection = React.memo(WrappedErrorSection);

export default ErrorSection;
