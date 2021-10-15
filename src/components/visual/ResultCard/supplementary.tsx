import { Box, Collapse, makeStyles } from '@material-ui/core';
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

type SupplementarySectionProps = {
  extracted: ExtractedFiles[];
};

const WrappedSupplementarySection: React.FC<SupplementarySectionProps> = ({ extracted }) => {
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
        <h3>{t('supplementary')}</h3>
      </Box>
      <Collapse in={open} timeout="auto">
        {useMemo(
          () =>
            extracted.map((file, id) =>
              file.is_section_image ? null : <ExtractedFile key={id} file={file} download />
            ),
          [extracted]
        )}
      </Collapse>
    </div>
  );
};

const SupplementarySection = React.memo(WrappedSupplementarySection);
export default SupplementarySection;
