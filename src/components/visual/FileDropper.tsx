import { makeStyles } from '@material-ui/core';
import Box from '@material-ui/core/Box';
import Typography from '@material-ui/core/Typography';
import React, { useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { useTranslation } from 'react-i18next';
import { AiOutlineSecurityScan } from 'react-icons/ai';

type FileDropperProps = {
  file: File;
  setFile: (file: File) => void;
};

export default function FileDropper({ file, setFile }: FileDropperProps) {
  const { t } = useTranslation(['submit']);
  const { acceptedFiles, getRootProps, getInputProps, isDragActive } = useDropzone();
  const useStyles = makeStyles(theme => ({
    drop_zone: {
      flex: '1',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      padding: theme.spacing(3),
      backgroundColor: theme.palette.action.hover,
      outline: 'none',
      border: `2px ${theme.palette.action.disabled} dashed`,
      borderRadius: '6px',
      color: theme.palette.action.disabled,
      '&:hover': {
        border: `2px ${theme.palette.text.disabled} dashed`,
        backgroundColor: theme.palette.action.selected,
        color: theme.palette.text.disabled,
        cursor: 'pointer'
      }
    },
    drag_enter: {
      border: `2px ${theme.palette.text.disabled} dashed`,
      backgroundColor: theme.palette.action.selected,
      color: theme.palette.text.disabled
    }
  }));
  const classes = useStyles();

  useEffect(() => {
    if (acceptedFiles.length !== 0) {
      setFile(acceptedFiles[0]);
    }
    // eslint-disable-next-line
  }, [acceptedFiles]);

  return (
    <Box>
      <div
        {...getRootProps()}
        className={file || isDragActive ? `${classes.drop_zone} ${classes.drag_enter}` : classes.drop_zone}
      >
        <input {...getInputProps()} />
        <AiOutlineSecurityScan style={{ fontSize: '140px' }} />
        {file ? (
          <Box textAlign="center">
            <Typography variant="body1">
              <b>{file.name}</b>
            </Typography>
            <Typography variant="body2" align="center">
              {file.size} {t('file.dragzone.byte')}
            </Typography>
          </Box>
        ) : (
          <Typography variant="body1">
            <b>{t('file.dragzone')}</b>
          </Typography>
        )}
      </div>
    </Box>
  );
}
