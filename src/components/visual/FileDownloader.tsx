import { CircularProgress, IconButton, Tooltip } from '@mui/material';
import useMyAPI from 'components/hooks/useMyAPI';
import useMySnackbar from 'components/hooks/useMySnackbar';
import { MouseEventHandler, useState } from 'react';

type EmptyProps = {
  icon: React.ReactNode;
  link: string;
  tooltip?: string;
  successMessage?: string;
  size?: 'small' | 'medium' | 'large';
  onClick?: MouseEventHandler<HTMLButtonElement>;
};

function FileDownloader({
  icon,
  link,
  tooltip = null,
  successMessage = null,
  size = 'large',
  onClick = () => null
}: EmptyProps) {
  const { downloadBlob } = useMyAPI();
  const { showSuccessMessage, showErrorMessage } = useMySnackbar();
  const [progress, setProgress] = useState(null);
  const [total, setTotal] = useState(null);
  const [waiting, setWaiting] = useState(false);

  const downloadFile = () => {
    downloadBlob({
      url: link,
      onFailure: api_data => {
        showErrorMessage(api_data.api_error_message);
        setTimeout(() => setWaiting(false), 1000);
      },
      onSuccess: api_data => {
        if (successMessage) showSuccessMessage(successMessage);

        let chunks = [];
        let curProgress = 0;
        const reader = api_data.api_response.getReader();
        setProgress(0);
        setTotal(api_data.size);
        setWaiting(false);

        const consume = () =>
          reader.read().then(res => {
            if (res.done) {
              const blob = new Blob(chunks, { type: api_data.type || 'application/octet-stream; charset=utf-8' });
              const url = window.URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.style.display = 'none';
              a.href = url;
              a.download = api_data.filename || 'file';
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
            consume();
          });

        consume();
      },
      onEnter: () => setWaiting(true)
    });
  };

  return (
    <Tooltip title={tooltip}>
      <div>
        <IconButton
          onClick={e => {
            downloadFile();
            onClick(e);
          }}
          disabled={waiting || total !== null}
          size={size}
        >
          {(waiting || total === 0) && (
            <CircularProgress
              size={24}
              style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                marginTop: -12,
                marginLeft: -12
              }}
            />
          )}
          {total !== null && total !== 0 && progress !== null && (
            <CircularProgress
              size={24}
              style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                marginTop: -12,
                marginLeft: -12
              }}
              value={(progress / total) * 100}
              variant={'determinate'}
            />
          )}
          {icon}
        </IconButton>
      </div>
    </Tooltip>
  );
}

export default FileDownloader;
