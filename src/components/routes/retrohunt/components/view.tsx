import { Divider, Grid, Skeleton, Typography, useMediaQuery, useTheme } from '@mui/material';
import 'moment/locale/fr';
import React, { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import Moment from 'react-moment';
import { DEFAULT_RETROHUNT } from '.';
import { Retrohunt } from '../retrohunt_detail';

type Sizes = {
  max: number;
  xl: number;
  lg: number;
  md: number;
  sm: number;
  xs: number;
};

type ItemProps = {
  children?: React.ReactNode;
  text?: string;
  isLoading?: boolean;
  title?: string;
  sizes?: Sizes;
};

type Props = {
  retrohunt: Retrohunt;
  setRetrohunt?: React.Dispatch<React.SetStateAction<Retrohunt>>;
  setModified?: (value: boolean) => void;
};

export const WrappedRetrohuntView = ({ retrohunt = { ...DEFAULT_RETROHUNT } }: Props) => {
  const { t, i18n } = useTranslation(['retrohunt']);
  const theme = useTheme();
  const isSMUp = useMediaQuery(theme.breakpoints.up('md'));

  const lgSizes = useMemo<Sizes>(() => ({ max: 6, xl: 5, lg: 5, md: 4, sm: 4, xs: 4 }), []);
  const smSizes = useMemo<Sizes>(() => ({ max: 12, xl: 11, lg: 10, md: 10, sm: 9, xs: 8 }), []);

  const Item = useCallback(
    ({
      children = null,
      text = null,
      isLoading = true,
      title = '',
      sizes = { max: 12, xl: 11, lg: 10, md: 8, sm: 8, xs: 6 }
    }: ItemProps) => (
      <>
        <Grid
          item
          xs={sizes.max - sizes.xs}
          sm={sizes.max - sizes.sm}
          md={sizes.max - sizes.md}
          lg={sizes.max - sizes.lg}
          xl={sizes.max - sizes.xl}
        >
          <span style={{ fontWeight: 500 }}>{t(`${title}`)}</span>
        </Grid>
        <Grid
          item
          xs={sizes.xs}
          sm={sizes.sm}
          md={sizes.md}
          lg={sizes.lg}
          xl={sizes.xl}
          style={{ wordBreak: 'break-word' }}
        >
          {isLoading ? <Skeleton /> : text ? `${text}` : children ? children : null}
        </Grid>
      </>
    ),
    [t]
  );

  return (
    <Grid container spacing={1}>
      <Grid item xs={12}>
        <Typography variant="h6">{t('details.general')}</Typography>
        <Divider sx={{ '@media print': { backgroundColor: '#0000001f !important' } }} />
      </Grid>

      {isSMUp ? (
        <>
          <Item
            title="details.tags"
            text={Object.keys(retrohunt.tags).length > 0 ? Object.keys(retrohunt.tags).join(', ') : t('details.none')}
            isLoading={!retrohunt}
            sizes={lgSizes}
          />
          <Item title="details.creator" text={retrohunt.creator} isLoading={!retrohunt} sizes={lgSizes} />
          <Item title="details.description" text={retrohunt.description} isLoading={!retrohunt} sizes={lgSizes} />
          <Item
            title="details.created"
            children={<Moment fromNow locale={i18n.language} children={retrohunt.created} />}
            isLoading={!retrohunt}
            sizes={lgSizes}
          />
        </>
      ) : (
        <>
          <Item title="details.creator" text={retrohunt.creator} isLoading={!retrohunt} sizes={smSizes} />
          <Item
            title="details.created"
            children={<Moment fromNow locale={i18n.language} children={retrohunt.created} />}
            isLoading={!retrohunt}
            sizes={smSizes}
          />
          <Item
            title="details.tags"
            text={Object.keys(retrohunt.tags).length > 0 ? Object.keys(retrohunt.tags).join(', ') : t('details.none')}
            isLoading={!retrohunt}
            sizes={smSizes}
          />
          <Item title="details.description" text={retrohunt.description} isLoading={!retrohunt} sizes={smSizes} />
        </>
      )}
    </Grid>
  );
};

export const RetrohuntView = React.memo(WrappedRetrohuntView);
