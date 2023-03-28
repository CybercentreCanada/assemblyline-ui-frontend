import { Checkbox, Grid, Skeleton, TextField, Typography } from '@mui/material';
import useALContext from 'components/hooks/useALContext';
import Classification from 'components/visual/Classification';
import 'moment/locale/fr';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { DEFAULT_RETROHUNT, Retrohunt } from '.';

type Props = {
  retrohunt: Retrohunt;
  setRetrohunt: React.Dispatch<React.SetStateAction<Retrohunt>>;
  setModified?: (value: boolean) => void;
};

export const WrappedRetrohuntAdd = ({
  retrohunt = { ...DEFAULT_RETROHUNT },
  setRetrohunt = null,
  setModified = () => null
}: Props) => {
  const { t } = useTranslation(['retrohunt']);
  const { user: currentUser } = useALContext();

  return (
    <Grid container spacing={2}>
      <Grid item xs={12} sm={6}>
        <Typography variant="subtitle2">{t('details.classification')}</Typography>
        {retrohunt ? (
          <Classification
            format="long"
            type="picker"
            c12n={retrohunt ? retrohunt?.classification : null}
            setClassification={(c12n: string) => {
              if (setRetrohunt) {
                setRetrohunt(rh => ({ ...rh, classification: c12n }));
                setModified(true);
              }
            }}
            disabled={!currentUser.roles.includes('retrohunt_run')}
          />
        ) : (
          <Skeleton style={{ height: '2.5rem' }} />
        )}
      </Grid>
      <Grid item xs={12} sm={6}>
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
      <Grid item xs={12}>
        <Typography variant="subtitle2">{t('details.description')}</Typography>
        {retrohunt ? (
          <TextField
            fullWidth
            size="small"
            multiline
            minRows={3}
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

export const RetrohuntAdd = React.memo(WrappedRetrohuntAdd);
