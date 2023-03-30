import { Grid, Skeleton, TextField, Typography, useTheme } from '@mui/material';
import FormControlLabel from '@mui/material/FormControlLabel';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import 'moment/locale/fr';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Retrohunt } from '../retrohunt_detail';

type Props = {
  retrohunt?: Retrohunt;
  onRetrohuntChange?: (rh: Partial<Retrohunt>) => void;
};

export const WrappedRetrohuntAdd = ({
  retrohunt = null,
  onRetrohuntChange = (rh: Partial<Retrohunt>) => null
}: Props) => {
  const { t } = useTranslation(['retrohunt']);
  const theme = useTheme();

  return (
    <Grid container spacing={2}>
      <Grid item xs={12}>
        <Typography variant="subtitle2">{t('details.description')}</Typography>
        {retrohunt && 'description' in retrohunt ? (
          <TextField
            fullWidth
            size="small"
            multiline
            rows={6}
            margin="dense"
            variant="outlined"
            value={retrohunt.description}
            onChange={event => onRetrohuntChange({ description: event.target.value })}
          />
        ) : (
          <Skeleton style={{ height: '8rem', transform: 'none', marginTop: theme.spacing(1) }} />
        )}
      </Grid>
      <Grid item xs={12}>
        <Typography variant="subtitle2">{t('details.search')}</Typography>
        {retrohunt && 'archive_only' in retrohunt ? (
          <RadioGroup
            row
            value={retrohunt.archive_only ? 'archive_only' : 'all'}
            onChange={(event, value) => onRetrohuntChange({ archive_only: value === 'archive_only' })}
          >
            <FormControlLabel value="all" control={<Radio />} label={t('details.all')} />
            <FormControlLabel value="archive_only" control={<Radio />} label={t('details.archive_only')} />
          </RadioGroup>
        ) : (
          <Skeleton style={{ height: '2rem', transform: 'none', marginTop: theme.spacing(1) }} />
        )}
      </Grid>
    </Grid>
  );
};

export const RetrohuntAdd = React.memo(WrappedRetrohuntAdd);
