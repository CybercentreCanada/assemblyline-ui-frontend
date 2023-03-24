import { Checkbox, Grid, Skeleton, TextField, Typography } from '@mui/material';
import useALContext from 'components/hooks/useALContext';
import Classification from 'components/visual/Classification';
import 'moment/locale/fr';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router';
import { DEFAULT_RETROHUNT, Retrohunt } from '.';

type SubmitState = {
  hash: string;
  tabContext: string;
  c12n: string;
  metadata?: any;
};

type Props = {
  retrohunt: Retrohunt;
  setRetrohunt: React.Dispatch<React.SetStateAction<Retrohunt>>;
  setModified?: (value: boolean) => void;
};

export const WrappedRetrohuntAdd = (props: Props) => {
  const { retrohunt = { ...DEFAULT_RETROHUNT }, setRetrohunt = () => null, setModified = () => null } = props;

  const { t } = useTranslation(['retrohunt']);

  const { user: currentUser, c12nDef, configuration } = useALContext();
  const location = useLocation();
  const state: SubmitState = location.state as SubmitState;
  const [settings, setSettings] = useState(null);
  const classification = useState(state ? state.c12n : null)[0];

  function setClassification(c12n) {
    if (settings) {
      setSettings({ ...settings, classification: c12n });
    }
  }

  return (
    <Grid container spacing={2}>
      <Grid item xs={12}>
        <Typography variant="subtitle2">{t('details.classification')}</Typography>
        {retrohunt ? (
          <Classification
            format="long"
            type="picker"
            c12n={classification ? classification : settings ? settings.classification : null}
            setClassification={setClassification}
            disabled={!currentUser.roles.includes('retrohunt_run')}
          />
        ) : (
          // <TextField
          //   fullWidth
          //   size="small"
          //   margin="dense"
          //   variant="outlined"
          //   value={retrohunt.classification}
          //   onChange={event => {
          //     setModified(true);
          //     setRetrohunt(r => ({ ...r, classification: event.target.value }));
          //   }}
          // />
          <Skeleton style={{ height: '2.5rem' }} />
        )}
      </Grid>
      <Grid item xs={12}>
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

export const RetrohuntAdd = React.memo(WrappedRetrohuntAdd);
