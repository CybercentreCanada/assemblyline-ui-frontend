import { Collapse, Divider, Link as MaterialLink, makeStyles, Typography, useTheme } from '@material-ui/core';
import { getErrorTypeFromKey, getHashFromKey, getServiceFromKey } from 'helpers/errors';
import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

const useStyles = makeStyles(theme => ({
  title: {
    cursor: 'pointer',
    '&:hover, &:focus': {
      color: theme.palette.text.secondary
    }
  },
  meta_key: {
    overflowX: 'hidden',
    whiteSpace: 'nowrap',
    textOverflow: 'ellipsis'
  }
}));

type ErrorSectionProps = {
  sid: string;
  parsed_errors: {
    aggregated: {
      depth: string[];
      files: string[];
      retry: string[];
      down: string[];
      busy: string[];
    };
    listed: string[];
  };
};

const WrappedErrorSection: React.FC<ErrorSectionProps> = ({ sid, parsed_errors }) => {
  const { t } = useTranslation(['submissionDetail']);
  const [open, setOpen] = React.useState(true);
  const theme = useTheme();
  const classes = useStyles();
  const sp2 = theme.spacing(2);
  return (
    <div style={{ paddingBottom: sp2, paddingTop: sp2 }}>
      <Typography
        variant="h6"
        style={{
          color: theme.palette.type === 'dark' ? theme.palette.error.light : theme.palette.error.dark
        }}
        onClick={() => {
          setOpen(!open);
        }}
        className={classes.title}
      >
        {t('errors')}
      </Typography>
      <Divider />
      <Collapse in={open} timeout="auto">
        {useMemo(
          () => (
            <div style={{ paddingBottom: sp2, paddingTop: sp2 }}>
              <div>
                {Object.keys(parsed_errors.aggregated).map((errorType, i) => {
                  return (
                    parsed_errors.aggregated[errorType].length > 0 && (
                      <div
                        key={i}
                        style={{
                          color: theme.palette.type === 'dark' ? theme.palette.error.light : theme.palette.error.dark
                        }}
                      >
                        {`${t('errors.aggregated').replace(
                          '{errorType}',
                          t(`errors.type.${errorType}`)
                        )}: ${parsed_errors.aggregated[errorType].join(' | ')}`}
                      </div>
                    )
                  );
                })}
                {parsed_errors.listed.map((error, i) => {
                  return (
                    <div
                      key={i}
                      style={{
                        color: theme.palette.type === 'dark' ? theme.palette.error.light : theme.palette.error.dark
                      }}
                    >
                      <strong>{getServiceFromKey(error)}</strong>
                      {t('errors.listed')}
                      <strong>
                        <MaterialLink
                          component={Link}
                          style={{
                            color: theme.palette.type === 'dark' ? theme.palette.error.light : theme.palette.error.dark
                          }}
                          to={`/submission/detail/${sid}/${getHashFromKey(error)}`}
                        >
                          {getHashFromKey(error)}
                        </MaterialLink>
                      </strong>
                      <span style={{ fontSize: 'smaller' }}>
                        &nbsp;::&nbsp;{t(`errors.type.${getErrorTypeFromKey(error)}`)}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          ),
          // eslint-disable-next-line react-hooks/exhaustive-deps
          [parsed_errors]
        )}
      </Collapse>
    </div>
  );
};
const ErrorSection = React.memo(WrappedErrorSection);

export default ErrorSection;
