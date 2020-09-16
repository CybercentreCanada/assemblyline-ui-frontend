import { makeStyles } from '@material-ui/core';
import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';
import React from 'react';
import { useDropzone } from 'react-dropzone';
import { useTranslation } from 'react-i18next';
import { AiOutlineSecurityScan } from 'react-icons/ai';

export default function FileDropper() {
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

  let dropperText;
  if (acceptedFiles.length > 0) {
    dropperText = (
      <Box textAlign="center">
        <Typography variant="body1">
          <b>{acceptedFiles[0].name}</b>
        </Typography>
        <Typography variant="body2" align="center">
          {acceptedFiles[0].size} {t('file.dragzon.byte')}
        </Typography>
      </Box>
    );
  } else {
    dropperText = (
      <Typography variant="body1">
        <b>{t('file.dragzone')}</b>
      </Typography>
    );
  }

  return (
    <Box>
      <div
        {...getRootProps()}
        className={
          acceptedFiles.length > 0 || isDragActive ? `${classes.drop_zone} ${classes.drag_enter}` : classes.drop_zone
        }
      >
        <input {...getInputProps()} />
        <AiOutlineSecurityScan style={{ fontSize: '140px' }} />
        {dropperText}
      </div>
      <Box marginTop="2rem">
        {acceptedFiles.length === 0 ? (
          ''
        ) : (
          <Button color="primary" variant="contained">
            {t('file.button')}
          </Button>
        )}
      </Box>
    </Box>
  );
}
