import { makeStyles } from '@material-ui/core';
import Typography from '@material-ui/core/Typography';
import React, { useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { useTranslation } from 'react-i18next';
import { AiOutlineSecurityScan } from 'react-icons/ai';

type FileDropperProps = {
  file: File;
  setFile: (file: File) => void;
  disabled: boolean;
};

export default function FileDropper({ file, setFile, disabled }: FileDropperProps) {
  const { t } = useTranslation(['submit']);
  const { acceptedFiles, getRootProps, getInputProps, isDragActive } = useDropzone({ disabled });
  const useStyles = ctrlDisabled => {
    return makeStyles(theme => ({
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
          border: !ctrlDisabled ? `2px ${theme.palette.text.disabled} dashed` : null,
          backgroundColor: !ctrlDisabled ? theme.palette.action.selected : null,
          color: !ctrlDisabled ? theme.palette.text.disabled : null,
          cursor: !ctrlDisabled ? 'pointer' : null
        }
      },
      drag_enter: {
        border: `2px ${theme.palette.text.disabled} dashed`,
        backgroundColor: theme.palette.action.selected,
        color: theme.palette.text.disabled
      }
    }))();
  };
  const classes = useStyles(disabled);

  useEffect(() => {
    if (acceptedFiles.length !== 0) {
      setFile(acceptedFiles[0]);
    }
    // eslint-disable-next-line
  }, [acceptedFiles]);

  return (
    <div
      {...getRootProps()}
      className={isDragActive && !disabled ? `${classes.drop_zone} ${classes.drag_enter}` : classes.drop_zone}
    >
      <input {...getInputProps()} />
      <AiOutlineSecurityScan style={{ fontSize: '140px' }} />
      <div style={{ height: '44px', textAlign: 'center' }}>
        <Typography variant="body1">
          <b>{isDragActive && !disabled ? t('file.drophere') : file ? file.name : t('file.dragzone')}</b>
        </Typography>
        {file && (!isDragActive || disabled) && (
          <Typography variant="body2" align="center">
            {file.size} {t('file.dragzone.byte')}
          </Typography>
        )}
      </div>
    </div>
  );
}
