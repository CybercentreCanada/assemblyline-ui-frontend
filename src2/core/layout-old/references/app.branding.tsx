import { Stack, Typography } from '@mui/material';
import { useCookiesStore, type BrandSize, type BrandVariant } from '@tui/core';
import { SIZES } from 'core/layout/components/brand/AppBrand';
import { memo, useMemo } from 'react';

const AppLogo = memo(
  ({
    src,
    application,
    variant,
    size = 'small'
  }: {
    src: string;
    application: string;
    variant: BrandVariant;
    size: BrandSize;
  }) => {
    return (
      <img src={src} alt={`${application} logo`} style={{ ...SIZES[size].icon, marginLeft: variant === 'app' && -7 }} />
    );
  }
);

const AppName = memo(
  ({
    src,
    application,
    appName,
    size = 'small'
  }: {
    src: string;
    application: string;
    appName?: string;
    size?: BrandSize;
  }) => {
    if (application.startsWith('templateui')) {
      return (
        <Typography sx={{ ...SIZES[size].text }} style={{ marginTop: 0 }}>
          {appName}
        </Typography>
      );
    }

    return <img src={src} alt={application} style={{ ...SIZES[size].name }} />;
  }
);

export type AppBrandProps = {
  application: string;
  variant: BrandVariant;
  size?: BrandSize;
};

export const AppBrand = memo(({ application, variant, size = 'small' }: AppBrandProps) => {
  const themeMode = useCookiesStore(state => state.mode);

  const { logoSrc, nameSrc } = useMemo(() => {
    return {
      logoSrc: `/branding/${application}/noswoosh-${themeMode}.svg`,
      nameSrc: `/branding/${application}/name-${themeMode}.svg`
    };
  }, [themeMode, application]);

  if (variant === 'logo') {
    return (
      <Stack direction="row" alignItems="center">
        <AppLogo application={application} src={logoSrc} variant={variant} size={size} />
      </Stack>
    );
  }

  if (variant === 'name') {
    return (
      <Stack direction="row" alignItems="center">
        <AppName application={application} src={nameSrc} size={size} appName="TemplateUI" />
      </Stack>
    );
  }

  if (variant === 'app') {
    size = 'app';
  }

  return (
    <Stack
      direction={variant.endsWith('horizontal') || variant === 'app' ? 'row' : 'column'}
      alignItems="center"
      style={{ width: 'fit-content' }}
    >
      <AppLogo application={application} src={logoSrc} variant={variant} size={size} />
      <div style={SIZES[size].divider} />
      <AppName application={application} src={nameSrc} size={size} appName="TemplateUI" />
    </Stack>
  );
});
