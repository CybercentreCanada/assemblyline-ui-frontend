import MoreHorizOutlinedIcon from '@mui/icons-material/MoreHorizOutlined';
import { Divider, Grid, IconButton, Tooltip, Typography, useTheme } from '@mui/material';
import makeStyles from '@mui/styles/makeStyles';
import useAppUser from 'commons/components/app/hooks/useAppUser';
import PageFullWidth from 'commons/components/pages/PageFullWidth';
import useALContext from 'components/hooks/useALContext';
import { CustomUser } from 'components/hooks/useMyUser';
import { DetailedItem, detailedItemCompare } from 'components/routes/alerts/hooks/useAlerts';
import { ChipList } from 'components/visual/ChipList';
import Classification from 'components/visual/Classification';
import { CustomChipProps } from 'components/visual/CustomChip';
import { verdictToColor } from 'helpers/utils';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { ExternalEnrichmentSource } from './useExternalLookup';

const TARGET_RESULT_COUNT = 10;

const useStyles = makeStyles(theme => ({
  section: {
    marginBottom: theme.spacing(2),
    '& > hr': {
      marginBottom: theme.spacing(1)
    }
  },
  sectionTitle: {
    fontWeight: 'bold'
  },
  sectionContent: {},
  sourceTitle: {
    fontWeight: 'bold'
  }
}));

type AutoHideChipListProps = {
  items: DetailedItem[];
  type?: string;
};

type AutoHideChipListState = {
  showExtra: boolean;
  fullChipList: CustomChipProps[];
};

type TagEnrichmentDetailsProps = {
  enrichmentState: ExternalEnrichmentSource;
};

const WrappedAutoHideChipList: React.FC<AutoHideChipListProps> = ({ items, type = null }) => {
  const { t } = useTranslation();
  const [state, setState] = useState<AutoHideChipListState | null>(null);
  const [shownChips, setShownChips] = useState<CustomChipProps[]>([]);

  useEffect(() => {
    const fullChipList = items.sort(detailedItemCompare).map(item => ({
      category: 'tag',
      data_type: type,
      label: item.subtype ? `${item.value} - ${item.subtype}` : item.value,
      variant: 'outlined' as 'outlined',
      color: verdictToColor(item.verdict)
    }));
    const showExtra = items.length <= TARGET_RESULT_COUNT;

    setState({ showExtra, fullChipList });
  }, [items, type]);

  useEffect(() => {
    if (state !== null) {
      if (state.showExtra) {
        setShownChips(state.fullChipList);
      } else {
        setShownChips(state.fullChipList.slice(0, TARGET_RESULT_COUNT));
      }
    }
  }, [state]);

  return (
    <>
      <ChipList items={shownChips} />
      {state && !state.showExtra && (
        <Tooltip title={t('more')}>
          <IconButton size="small" onClick={() => setState({ ...state, showExtra: true })} style={{ padding: 0 }}>
            <MoreHorizOutlinedIcon />
          </IconButton>
        </Tooltip>
      )}
    </>
  );
};

const AutoHideChipList = React.memo(WrappedAutoHideChipList);

const WrappedTagEnrichmentDetails: React.FC<TagEnrichmentDetailsProps> = ({ enrichmentState }) => {
  const theme = useTheme();
  const classes = useStyles();
  const { c12nDef } = useALContext();
  const { user: currentUser } = useAppUser<CustomUser>();
  const { t, i18n } = useTranslation(['alerts']);

  // determine max classification of all return results
  let classification = null;

  // group up details
  // {src: {..., enrichment: [{group: str, name: str, name_description: str, value: str, value_description}]}}
  //   -> {source: [[key, desc], [[value, desc], ...]]}
  let enrichmentInfo = [];
  for (const [source, enrichmentResults] of Object.entries(enrichmentState)) {
    let k = {};
    let details = [];
    for (const result of enrichmentResults.items) {
      // gather values
      for (const item of result.enrichment) {
        k_d = [item.name, item.name_description];
        v_d = [item.value, item.value_description];
      }
      // arrange in order
      for (const item of result.enrichment) {
      }
    }
  }

  return (
    <PageFullWidth margin={!alert ? 4 : 1}>
      {c12nDef.enforce && (
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: theme.spacing(2) }}>
          <div style={{ flex: 1 }}>
            <Classification c12n={classification} type="outlined" />
          </div>
        </div>
      )}
      <div className={classes.section}>
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'space-between'
          }}
        >
          {Object.entries(enrichmentState).map(([source, enrichmentResults]) => (
            <>
              <Typography variant="h2">{source}</Typography>
              {enrichmentResults.items?.map((item, i) => (
                <>
                  {(() => {
                    let prevGroup = null;
                    item.enrichment?.map((enrichmentResult, j) => (
                      <>
                        {enrichmentResult.group !== prevGroup
                          ? (prevGroup = enrichmentResult.group && (
                              <>
                                <Typography className={classes.sectionTitle}>{enrichmentResult.group}</Typography>
                                <Divider />
                              </>
                            ))
                          : null}

                        <Grid container spacing={1} key={`${j}`} style={{ marginTop: theme.spacing(1) }}>
                          <Grid
                            item
                            xs={3}
                            sm={2}
                            style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}
                          >
                            {enrichmentResult.name}
                          </Grid>
                          <Grid item xs={9} sm={10}>
                            <div className={classes.sectionContent}>
                              <AutoHideChipList items={enrichmentResult.value} />
                            </div>
                          </Grid>
                        </Grid>
                      </>
                    ));
                  })()}
                </>
              ))}
            </>
          ))}
        </div>
      </div>
    </PageFullWidth>
  );
};

const TagEnrichmentDetails = React.memo(WrappedTagEnrichmentDetails);
export default TagEnrichmentDetails;
