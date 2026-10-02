import BlockIcon from '@mui/icons-material/Block';
import { styled } from '@mui/material';
import Typography from '@mui/material/Typography';
import useALContext from 'components/hooks/useALContext';
import { ByteNumber } from 'components/visual/ByteNumber';
import React, { memo, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { useTranslation } from 'react-i18next';
import { AiOutlineSecurityScan } from 'react-icons/ai';

type DropZoneProps = {
  enter?: boolean;
  hover?: boolean;
};

const DropZone = styled('div', {
  shouldForwardProp: prop => prop !== 'enter' && prop !== 'hover'
})<DropZoneProps>(({ theme, enter = false, hover = false }) => ({
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

  ...(enter && {
    border: `2px ${theme.palette.text.disabled} dashed`,
    backgroundColor: theme.palette.action.selected,
    color: theme.palette.text.disabled
  }),

  ...(hover && {
    transition: '150ms cubic-bezier(0.4, 0, 0.2, 1) 0ms',
    // '-webkit-transition': '150ms cubic-bezier(0.4, 0, 0.2, 1) 0ms',
    '&:hover': {
      border: `2px ${theme.palette.text.disabled} dashed`,
      backgroundColor: theme.palette.action.selected,
      color: theme.palette.text.disabled,
      cursor: 'pointer'
    }
  })
}));

type FileDropperProps = {
  file: File;
  setFile: (file: File) => void;
  disabled: boolean;
};

const FileDropper: React.FC<FileDropperProps> = ({ file, setFile, disabled }) => {
  const { t } = useTranslation(['submit']);
  const { acceptedFiles, getRootProps, getInputProps, isDragActive } = useDropzone({ disabled });
  const { user: currentUser, configuration } = useALContext();

  useEffect(() => {
    if (acceptedFiles.length !== 0) {
      setFile(acceptedFiles[0]);
    }
    // eslint-disable-next-line
  }, [acceptedFiles]);

  return (
    <DropZone {...getRootProps()} enter={isDragActive && !disabled} hover={!disabled}>
      <input id="file_dropper" {...getInputProps()} />
      {currentUser.roles.includes('submission_create') ? (
        <AiOutlineSecurityScan style={{ fontSize: '140px' }} />
      ) : (
        <BlockIcon style={{ fontSize: '140px' }} />
      )}
      <div style={{ minHeight: '44px', textAlign: 'center' }}>
        <Typography htmlFor="file_dropper" component="label" variant="body1" style={{ wordBreak: 'break-word' }}>
          <b>
            {isDragActive && !disabled
              ? t('file_dropper.drophere')
              : file
                ? file.name
                : t(
                    currentUser.roles.includes('submission_create') ? 'file_dropper.dragzone' : 'file_dropper.disabled'
                  )}
          </b>
        </Typography>
        {file && (!isDragActive || disabled) ? (
          <ByteNumber bytes={file.size} variant="body2" align="center" />
        ) : (
          <ByteNumber bytes={configuration.submission.max_file_size} variant="body2" align="center">
            {size => `${t('file_dropper.max_file_size')} ${size}`}
          </ByteNumber>
        )}
      </div>
    </DropZone>
  );
};

export default memo(FileDropper);
