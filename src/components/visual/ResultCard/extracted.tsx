import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import { Box, Collapse, useTheme } from '@mui/material';
import { File } from 'components/models/base/result';
import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import ExtractedFile from './extracted_file';

type ExtractedSectionProps = {
  extracted: File[];
  sid: string;
};

const WrappedExtractedSection: React.FC<ExtractedSectionProps> = ({ extracted, sid }) => {
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
        <h3>{t('extracted')}</h3>
        {open ? <ExpandLess /> : <ExpandMore />}
      </Box>
      <Collapse in={open} timeout="auto">
        {useMemo(() => extracted.map((file, id) => <ExtractedFile key={id} file={file} sid={sid} />), [extracted, sid])}
      </Collapse>
    </div>
  );
};

const ExtractedSection = React.memo(WrappedExtractedSection);
export default ExtractedSection;
