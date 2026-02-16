import type { LinkProps } from '@mui/material';
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, Link, Stack, Typography } from '@mui/material';
import useALContext from 'components/hooks/useALContext';
import { memo, useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

export type ExternalLinkConfirmationProps = Omit<LinkProps, 'href'> & {
  href: string | URL;
};

export const ExternalLinkConfirmation = memo(({ href, children, ...props }: ExternalLinkConfirmationProps) => {
  const { t } = useTranslation();
  const { configuration } = useALContext();

  const [open, setOpen] = useState<boolean>(false);

  const url = useMemo(() => href.toString(), [href]);

  const handleContinue = useCallback(() => {
    setOpen(false);
    window.open(url, '_blank', 'noopener,noreferrer');
  }, [url]);

  return (
    <>
      <Link
        {...props}
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        onClick={event => {
          event.preventDefault();
          setOpen(true);
        }}
        sx={{
          textDecorationColor: 'rgba(var(--mui-palette-primary-mainChannel) / 0.4)',
          '&:hover': {
            textDecorationColor: 'inherit'
          },
          ...props?.sx
        }}
      >
        {children}
      </Link>

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle> {t('external_link_confirmation.title')}</DialogTitle>

        <DialogContent>
          <Stack spacing={2}>
            <Typography>{t('external_link_confirmation.content1').replace('{fqdn}', configuration.ui.fqdn)}</Typography>

            <Typography textAlign="center" variant="body2" color="text.secondary" sx={{ wordBreak: 'break-all' }}>
              {url}
            </Typography>

            <Typography>{t('external_link_confirmation.content2')}</Typography>
          </Stack>
        </DialogContent>

        <DialogActions>
          <Button onClick={() => setOpen(false)} color="secondary">
            {t('classification.cancelText')}
          </Button>

          <Button onClick={handleContinue} color="primary" autoFocus>
            {t('classification.acceptText')}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
});

ExternalLinkConfirmation.displayName = 'ExternalLinkConfirmation';
