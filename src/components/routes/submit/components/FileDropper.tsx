import BlockIcon from '@mui/icons-material/Block';
import { styled } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import useALContext from 'components/hooks/useALContext';
import { ByteNumber } from 'components/visual/ByteNumber';
import { memo, useCallback, useMemo } from 'react';
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
  flex: 1,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  padding: `${theme.spacing(3)}`,
  backgroundColor: theme.palette.action.hover,
  outline: 'none',
  borderRadius: '6px',
  border: `2px dashed ${theme.palette.action.disabled}`,
  color: theme.palette.action.disabled,
  transition: '150ms cubic-bezier(0.4, 0, 0.2, 1)',

  ...(enter && {
    border: `2px dashed ${theme.palette.text.disabled}`,
    backgroundColor: theme.palette.action.selected,
    color: theme.palette.text.disabled
  }),

  ...(hover && {
    '&:hover': {
      cursor: 'pointer',
      border: `2px dashed ${theme.palette.text.disabled}`,
      backgroundColor: theme.palette.action.selected,
      color: theme.palette.text.disabled
    }
  })
}));

type FileDropperProps = {
  file: File | null;
  setFile: (file: File | null) => void;
  disabled: boolean;
};

const FileDropper = ({ file, setFile, disabled }: FileDropperProps) => {
  const { t } = useTranslation(['submit']);
  const { user, configuration } = useALContext();

  const canSubmit = useMemo(() => user.roles.includes('submission_create'), [user.roles]);

  const handleDrop = useCallback(
    (files: File[]) => {
      if (files.length > 0) setFile(files[0]);
    },
    [setFile]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    disabled,
    multiple: false,
    onDrop: handleDrop
  });

  const isDropping = isDragActive && !disabled;

  const labelText = useMemo(() => {
    if (isDropping) return t('file_dropper.drophere');
    if (file) return file.name;
    return t(canSubmit ? 'file_dropper.dragzone' : 'file_dropper.disabled');
  }, [isDropping, file, canSubmit, t]);

  return (
    <DropZone {...getRootProps()} enter={isDropping} hover={!disabled}>
      <input id="file_dropper" {...getInputProps()} />

      {canSubmit ? <AiOutlineSecurityScan style={{ fontSize: '140px' }} /> : <BlockIcon sx={{ fontSize: '140px' }} />}

      <div style={{ minHeight: '44px', textAlign: 'center' }}>
        <Typography htmlFor="file_dropper" component="label" variant="body1" sx={{ wordBreak: 'break-word' }}>
          <b>{labelText}</b>
        </Typography>
        {file && !isDropping ? (
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
