import { Error } from '@mui/icons-material';
import { Box, Chip, Link as MuiLink, Tooltip, useTheme } from '@mui/material';
import type { FC } from 'react';
import { useTranslation } from 'react-i18next';
import type { AppBreadcrumbItem } from '.';
import { useAppRouter } from '../app';

export const AppBreadcrumb: FC<AppBreadcrumbItem> = ({ text, ...props }) => {
  const { Link } = useAppRouter();

  return text ? (
    <span style={{ display: 'inline-flex', alignItems: 'center', color: 'inherit' }}>
      <TuiBreadcrumb {...props} />
    </span>
  ) : (
    <Tooltip title={!props.i18nKey && !props.title ? 'missing entry in sitemap' : props.path}>
      <MuiLink
        component={Link}
        to={props.path}
        underline="hover"
        style={{ display: 'inline-flex', alignItems: 'center', color: 'inherit' }}
      >
        <TuiBreadcrumb {...props} />
      </MuiLink>
    </Tooltip>
  );
};

const TuiBreadcrumb: FC<AppBreadcrumbItem> = ({ path, icon, i18nKey, title, width }) => {
  const theme = useTheme();
  const { t } = useTranslation();

  return (
    <>
      {icon && (
        <>
          <Box component="span" sx={{ marginRight: theme.spacing(0.5) }} />
          {icon}
        </>
      )}

      <span
        style={{
          maxWidth: width || '200px',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap'
        }}
      >
        {i18nKey
          ? t(i18nKey)
          : title || <Chip icon={<Error />} variant="outlined" color="error" label={path} size="small" clickable />}
      </span>
    </>
  );
};
