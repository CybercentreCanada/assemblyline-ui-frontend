import BlockIcon from '@mui/icons-material/Block';
import Typography from '@mui/material/Typography';
import { makeStyles } from '@mui/styles';
import clsx from 'clsx';
import useAppUser from 'commons/components/app/hooks/useAppUser';
import { CustomUser } from 'components/hooks/useMyUser';
import { memo, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { useTranslation } from 'react-i18next';
import { AiOutlineSecurityScan } from 'react-icons/ai';

type FileDropperProps = {
  file: File;
  setFile: (file: File) => void;
  disabled: boolean;
};

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
    color: theme.palette.action.disabled
  },
  drag_enter: {
    border: `2px ${theme.palette.text.disabled} dashed`,
    backgroundColor: theme.palette.action.selected,
    color: theme.palette.text.disabled
  },
  drop_zone_hover_enabled: {
    transition: '150ms cubic-bezier(0.4, 0, 0.2, 1) 0ms',
    '-webkit-transition': '150ms cubic-bezier(0.4, 0, 0.2, 1) 0ms',
    '&:hover': {
      border: `2px ${theme.palette.text.disabled} dashed`,
      backgroundColor: theme.palette.action.selected,
      color: theme.palette.text.disabled,
      cursor: 'pointer'
    }
  }
}));

const FileDropper: React.FC<FileDropperProps> = ({ file, setFile, disabled }) => {
  const { t } = useTranslation(['submit']);
  const { acceptedFiles, getRootProps, getInputProps, isDragActive } = useDropzone({ disabled });
  const { user: currentUser } = useAppUser<CustomUser>();
  const classes = useStyles();

  useEffect(() => {
    if (acceptedFiles.length !== 0) {
      setFile(acceptedFiles[0]);
    }
    // eslint-disable-next-line
  }, [acceptedFiles]);

  return (
    <div
      {...getRootProps()}
      className={clsx(
        classes.drop_zone,
        isDragActive && !disabled && classes.drag_enter,
        !disabled && classes.drop_zone_hover_enabled
      )}
    >
      <input {...getInputProps()} />
      {currentUser.roles.includes('submission_create') ? (
        <AiOutlineSecurityScan style={{ fontSize: '140px' }} />
      ) : (
        <BlockIcon style={{ fontSize: '140px' }} />
      )}
      <div style={{ minHeight: '44px', textAlign: 'center' }}>
        <Typography variant="body1" style={{ wordBreak: 'break-word' }}>
          <b>
            {isDragActive && !disabled
              ? t('file.drophere')
              : file
              ? file.name
              : t(currentUser.roles.includes('submission_create') ? 'file.dragzone' : 'file.disabled')}
          </b>
        </Typography>
        {file && (!isDragActive || disabled) && (
          <Typography variant="body2" align="center">
            {file.size} {t('file.dragzone.byte')}
          </Typography>
        )}
      </div>
    </div>
  );
};

export default memo(FileDropper);
