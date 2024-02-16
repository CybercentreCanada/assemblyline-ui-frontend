import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import { Box, Collapse } from '@mui/material';
import makeStyles from '@mui/styles/makeStyles';
import { File } from 'components/models/base/result';
import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import ExtractedFile from './extracted_file';

const useStyles = makeStyles(theme => ({
  title: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    cursor: 'pointer',
    '&:hover, &:focus': {
      color: theme.palette.text.secondary
    }
  }
}));

type SupplementarySectionProps = {
  supplementary: File[];
  sid: string;
};

const WrappedSupplementarySection: React.FC<SupplementarySectionProps> = ({ supplementary, sid }) => {
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
