import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import { Box, Collapse, useTheme } from '@mui/material';
import type { File } from 'components/models/base/result';
import ExtractedFile from 'components/visual/ResultCard/extracted_file';
import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

type SupplementarySectionProps = {
  supplementary: File[];
  sid: string;
};

const WrappedSupplementarySection: React.FC<SupplementarySectionProps> = ({ supplementary, sid }) => {
  const { t } = useTranslation(['fileDetail']);
  const theme = useTheme();

  const [open, setOpen] = useState<boolean>(true);

  return (
    <div>
      <Box
        onClick={() => setOpen(!open)}
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          cursor: 'pointer',
          '&:hover, &:focus': {
            color: theme.palette.text.secondary
          }
        }}
      >
        <h3>{t('supplementary')}</h3>
        {open ? <ExpandLess /> : <ExpandMore />}
      </Box>
      <Collapse in={open} timeout="auto">
        {useMemo(
          () =>
            supplementary.map((file, id) =>
              file.is_section_image ? null : <ExtractedFile key={id} file={file} sid={sid} download />
            ),
          [supplementary, sid]
        )}
      </Collapse>
    </div>
  );
};

const SupplementarySection = React.memo(WrappedSupplementarySection);
export default SupplementarySection;
