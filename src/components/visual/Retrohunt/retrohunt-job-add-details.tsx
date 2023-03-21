import { Checkbox, Grid, Skeleton, TextField, Typography } from '@mui/material';
import 'moment/locale/fr';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { DEFAULT_RETROHUNT, Retrohunt } from '.';

export const test = null;

type Props = {
  retrohunt: Retrohunt;
  setRetrohunt: React.Dispatch<React.SetStateAction<Retrohunt>>;
  setModified?: (value: boolean) => void;
};

export const RetrohuntJobAddDetails = (props: Props) => {
  const { retrohunt = { ...DEFAULT_RETROHUNT }, setRetrohunt = () => null, setModified = () => null } = props;

  const { t } = useTranslation(['retrohunt']);

  return (
    <Grid container spacing={2}>
      <Grid item xs={12} spacing={2}>
        <Typography variant="subtitle2">{t('details.classification')}</Typography>
        {retrohunt ? (
          <TextField
            fullWidth
            size="small"
            margin="dense"
            variant="outlined"
            value={retrohunt.classification}
            onChange={event => {
              setModified(true);
              setRetrohunt(r => ({ ...r, classification: event.target.value }));
            }}
          />
        ) : (
          <Skeleton style={{ height: '2.5rem' }} />
        )}
      </Grid>
      <Grid item xs={12} spacing={2}>
        <Typography variant="subtitle2">{t('details.archive_only')}</Typography>
        {retrohunt ? (
          <Checkbox
            size="small"
            value={retrohunt.archive_only}
            onChange={(event, checked) => {
              setModified(true);
              setRetrohunt(r => ({ ...r, archive_only: checked }));
            }}
          />
        ) : (
          <Skeleton style={{ height: '2.5rem' }} />
        )}
      </Grid>
      <Grid item xs={12} spacing={2}>
        <Typography variant="subtitle2">{t('details.description')}</Typography>
        {retrohunt ? (
          <TextField
            fullWidth
            size="small"
            multiline
            minRows={6}
            margin="dense"
            variant="outlined"
            value={retrohunt.description}
            onChange={event => {
              setModified(true);
              setRetrohunt(r => ({ ...r, description: event.target.value }));
            }}
          />
        ) : (
          <Skeleton style={{ height: '2.5rem' }} />
        )}
      </Grid>
    </Grid>
  );
};
