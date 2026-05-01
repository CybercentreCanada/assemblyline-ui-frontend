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

  const url = useMemo(() => {
    const str = href?.toString() || null;
    // If the href is empty, then we won't render a link at all
    if (!str) return null;
    // Relative path to the same domain is allowed
    else if (str.startsWith('/')) return str;
    // Absolute URLs must start with http:// or https://
    else if (str.startsWith('https://') || str.startsWith('http://')) return str;
    // Anything else is considered invalid and will not render a link
    else return null;
  }, [href]);

  const handleContinue = useCallback(() => {
    setOpen(false);
    window.open(url, '_blank', 'noopener,noreferrer');
  }, [url]);

  if (!url) return null;

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
