import { Divider, Grid, Skeleton, Typography, useTheme } from '@mui/material';
import 'moment/locale/fr';
import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { DEFAULT_RETROHUNT } from '.';
import { Retrohunt } from '../retrohunt_detail';

type ItemProps = {
  isLoading?: boolean;
  title?: string;
  value: string;
};

type Props = {
  retrohunt: Retrohunt;
  setRetrohunt?: React.Dispatch<React.SetStateAction<Retrohunt>>;
  setModified?: (value: boolean) => void;
};

export const WrappedRetrohuntView = ({ retrohunt = { ...DEFAULT_RETROHUNT } }: Props) => {
  const { t } = useTranslation(['retrohunt']);
  const theme = useTheme();

  const Item = useCallback(
    ({ isLoading = true, title = '', value = null }: ItemProps) => (
      <>
        <Grid item xs={4} sm={3} lg={2}>
          <span style={{ fontWeight: 500 }}>{t(`${title}`)}</span>
        </Grid>
        <Grid item xs={8} sm={9} lg={10} style={{ wordBreak: 'break-word' }}>
          {isLoading ? <Skeleton /> : `${value}`}
        </Grid>
      </>
    ),
    [t]
  );

  return (
    <Grid container spacing={1}>
      <Grid item xs={12}>
        <Typography variant="h6">{t('general')}</Typography>
        <Divider sx={{ '@media print': { backgroundColor: '#0000001f !important' } }} />
      </Grid>
      <Item title="details.code" value={retrohunt.code} isLoading={!retrohunt} />
      <Item title="details.raw_query" value={retrohunt.raw_query} isLoading={!retrohunt} />
      <Item title="details.classification" value={retrohunt.classification} isLoading={!retrohunt} />
      <Item title="details.description" value={retrohunt.description} isLoading={!retrohunt} />
      <Grid item xs={12} style={{ height: theme.spacing(2) }} />
      <Item title="details.created" value={retrohunt.created} isLoading={!retrohunt} />
      <Item title="details.creator" value={retrohunt.creator} isLoading={!retrohunt} />
      <Item title="details.tags" value={retrohunt.tags} isLoading={!retrohunt} />
    </Grid>
  );
};

export const RetrohuntView = React.memo(WrappedRetrohuntView);
