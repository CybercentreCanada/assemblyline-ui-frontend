import GetAppOutlinedIcon from '@mui/icons-material/GetAppOutlined';
import useMyAPI from 'components/hooks/useMyAPI';
import useMySnackbar from 'components/hooks/useMySnackbar';
import type { IconButtonProps } from 'components/visual/Buttons/IconButton';
import { IconButton } from 'components/visual/Buttons/IconButton';
import React, { useCallback, useMemo, useState } from 'react';

export type FileDownloaderProps = IconButtonProps & {
  link: string | (() => string);
  successMessage?: string;
};

export const WrappedFileDownloader = ({
  children = <GetAppOutlinedIcon />,
  disabled = false,
  link: linkProp = null,
  size = 'large',
  successMessage = null,
  loading = false,
  onClick = () => null,
  ...props
}: FileDownloaderProps) => {
  const { downloadBlob } = useMyAPI();
  const { showSuccessMessage, showErrorMessage } = useMySnackbar();

  const [progress, setProgress] = useState<number>(null);
  const [total, setTotal] = useState<number>(null);
  const [waiting, setWaiting] = useState<boolean>(false);

  const link = useMemo<string>(
    () => (loading ? null : typeof linkProp === 'function' ? linkProp() : linkProp),
    [linkProp, loading]
  );

  const downloadFile = useCallback(() => {
    downloadBlob({
      url: link,
      onEnter: () => setWaiting(true),
      onFailure: ({ api_error_message }) => {
        showErrorMessage(api_error_message);
        setTimeout(() => setWaiting(false), 1000);
      },
      onSuccess: ({ api_response, size, type, filename }) => {
        if (successMessage) showSuccessMessage(successMessage);

        const chunks: BlobPart[] = [];
        let curProgress = 0;
        const reader = api_response.getReader();
        setProgress(0);
        setTotal(size);
        setWaiting(false);

        const consume = () =>
          reader.read().then((res: ReadableStreamReadResult<string>) => {
            if (res.done) {
              const blob = new Blob(chunks, { type: type || 'application/octet-stream; charset=utf-8' });
              const url = window.URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.style.display = 'none';
              a.href = url;
              a.download = filename || 'file';
              a.click();
              setTimeout(() => {
                setTotal(null);
                setProgress(null);
              }, 1000);
              return;
            }
            curProgress += res.value.length;
            chunks.push(res.value);
            setProgress(curProgress);
            void consume();
          });

        void consume();
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [link, successMessage]);

  return (
    <IconButton
      disabled={disabled || waiting || total !== null}
      loading={loading}
      progress={total !== null && total !== 0 && progress !== null ? (progress / total) * 100 : waiting || total === 0}
      size={size}
      onClick={event => {
        downloadFile();
        onClick(event);
      }}
      {...props}
    >
      {children}
    </IconButton>
  );
};

export const FileDownloader = React.memo(WrappedFileDownloader);
