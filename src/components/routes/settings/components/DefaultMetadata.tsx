import { List, useTheme } from '@mui/material';
import useALContext from 'components/hooks/useALContext';
import { PageSection } from 'components/visual/Layouts/PageSection';
import { TextListInput } from 'components/visual/ListInputs/TextListInput';
import React from 'react';
import { useTranslation } from 'react-i18next';

export const DefaultMetadataSection = React.memo(() => {
  const { t } = useTranslation(['settings']);
  const theme = useTheme();
  const { settings } = useALContext();

  return Object.keys(settings.default_metadata).length === 0 ? null : (
    <div style={{ display: 'flex', flexDirection: 'column', rowGap: theme.spacing(1) }}>
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
          '&>:not(:last-child)': {
            borderBottom: `thin solid ${theme.palette.divider}`
          }
        }}
      >
        {Object.entries(settings.default_metadata).map(([key, value]) => (
          <TextListInput id={key} primary={key} key={key} value={value} disabled={true} />
        ))}
      </List>
    </div>
  );
});

export default DefaultMetadataSection;
