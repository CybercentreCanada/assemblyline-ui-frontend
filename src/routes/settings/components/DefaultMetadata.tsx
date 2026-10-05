import { List, useTheme } from '@mui/material';
import useALContext from 'deprecated/legacy/components/hooks/useALContext';
import { PageSection } from 'ui/layouts/PageSection';
import { TextListInput } from 'ui/list-inputs/TextListInput';
import React from 'react';
import { useTranslation } from 'react-i18next';

export const DefaultMetadataSection = React.memo(() => {
  const { t } = useTranslation(['settings']);
  const theme = useTheme();
  const { settings } = useALContext();

  const metadata = settings?.default_metadata;
  if (!metadata || Object.keys(metadata || {}).length === 0) return null;

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        rowGap: theme.spacing(1)
      }}
    >
      <PageSection
        id="default_metadata"
        primary={t('submissions.default_metadata')}
        secondary={t('submissions.default_metadata_desc')}
        primaryProps={{ variant: 'h6' }}
        subheader
        anchor
      />
      <List
        disablePadding
        sx={{
          bgcolor: 'background.paper',
          '& > :not(:last-child)': {
            borderBottom: `thin solid ${theme.palette.divider}`
          }
        }}
      >
        {Object.entries(metadata).map(([key, value]) => (
          <TextListInput key={key} id={key} primary={key} value={value} disabled overflowHidden />
        ))}
      </List>
    </div>
  );
});

DefaultMetadataSection.displayName = 'DefaultMetadataSection';

export default DefaultMetadataSection;
