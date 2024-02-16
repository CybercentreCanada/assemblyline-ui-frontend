import { Grid, Skeleton } from '@mui/material';
import { Metadata } from 'components/models/ui/file';
import CustomChip from 'components/visual/CustomChip';
import SectionContainer from 'components/visual/SectionContainer';
import React from 'react';
import { useTranslation } from 'react-i18next';

type MetadataSectionProps = {
  metadata: Metadata;
  nocollapse?: boolean;
};

const WrappedMetadataSection: React.FC<MetadataSectionProps> = ({ metadata, nocollapse = false }) => {
  const { t } = useTranslation(['fileDetail']);

  return !metadata || Object.keys(metadata).length !== 0 ? (
    <SectionContainer title={t('metadata')} nocollapse={nocollapse}>
      {metadata
        ? Object.keys(metadata).map((meta, i) => (
            <Grid container key={i}>
              <Grid item xs={12} sm={3} lg={2}>
                <span style={{ fontWeight: 500, wordBreak: 'break-word' }}>{meta}</span>
              </Grid>
              <Grid item xs={12} sm={9} lg={10}>
                {Object.keys(metadata[meta]).map((item, key) => (
                  <CustomChip size="tiny" key={key} label={`${metadata[meta][item]}x ${item}`} />
                ))}
              </Grid>
            </Grid>
          ))
        : [...Array(3)].map((_, i) => (
            <Grid container key={i} spacing={1}>
              <Grid item xs={12} sm={3} lg={2}>
                <Skeleton style={{ height: '2rem' }} />
              </Grid>
              <Grid item xs={12} sm={9} lg={10}>
                <Skeleton style={{ height: '2rem' }} />
              </Grid>
            </Grid>
          ))}
    </SectionContainer>
  ) : null;
};

const MetadataSection = React.memo(WrappedMetadataSection);
export default MetadataSection;
