import ClearIcon from '@mui/icons-material/Clear';
import { Grid, IconButton, Tooltip, Typography, useTheme } from '@mui/material';
import { useForm } from 'components/routes/submit/submit.form';
import React from 'react';
import { useTranslation } from 'react-i18next';

const WrappedMetadataSummary = () => {
  const { t } = useTranslation(['submit']);
  const theme = useTheme();
  const form = useForm();

  return (
    <form.Subscribe
      selector={state => [Object.entries(state.values.metadata || {})]}
      children={([metadata]) =>
        metadata.length === 0 ? null : (
          <div
            style={{ width: '100%', textAlign: 'start', marginTop: theme.spacing(3), marginBottom: theme.spacing(3) }}
          >
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <Typography style={{ flexGrow: 1 }} variant="subtitle1">
                {t('options.submission.metadata')}
              </Typography>
              <Tooltip title={t('options.submission.metadata.clear')}>
                <IconButton
                  onClick={() =>
                    form.setStore(s => {
                      s.metadata = {};
                      return s;
                    })
                  }
                >
                  <ClearIcon />
                </IconButton>
              </Tooltip>
            </div>
            <div>
              {metadata.map(([key, value], i) => (
                <Grid container key={i}>
                  <Grid
                    item
                    xs={12}
                    sm={3}
                    lg={2}
                    sx={{ overflowX: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}
                  >
                    <span style={{ fontWeight: 500, textTransform: 'capitalize' }}>{key.replace('_', ' ')}</span>
                  </Grid>
                  <Grid item xs={12} sm={9} lg={10} style={{ wordBreak: 'break-word' }}>
                    {value.toString()}
                  </Grid>
                </Grid>
              ))}
            </div>
          </div>
        )
      }
    />
  );
};

export const MetadataSummary = React.memo(WrappedMetadataSummary);
