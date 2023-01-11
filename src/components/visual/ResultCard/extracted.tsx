import { Box, Collapse } from '@mui/material';
import makeStyles from '@mui/styles/makeStyles';
import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import ExtractedFile, { ExtractedFiles } from './extracted_file';

const useStyles = makeStyles(theme => ({
  title: {
    cursor: 'pointer',
    '&:hover, &:focus': {
      color: theme.palette.text.secondary
    }
  }
}));

type ExtractedSectionProps = {
  extracted: ExtractedFiles[];
  sid: string;
};

const WrappedExtractedSection: React.FC<ExtractedSectionProps> = ({ extracted, sid }) => {
  const { t } = useTranslation(['fileDetail']);
  const [open, setOpen] = React.useState(true);
  const classes = useStyles();

  return (
    <div>
      <Box
        className={classes.title}
        onClick={() => {
          setOpen(!open);
        }}
      >
        <h3>{t('extracted')}</h3>
      </Box>
      <Collapse in={open} timeout="auto">
        {useMemo(() => extracted.map((file, id) => <ExtractedFile key={id} file={file} sid={sid} />), [extracted, sid])}
      </Collapse>
    </div>
  );
};

const ExtractedSection = React.memo(WrappedExtractedSection);
export default ExtractedSection;
