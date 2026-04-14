import { Stack, Typography, useTheme } from '@mui/material';
import { useMemo, type FC } from 'react';
import { getBrandSizes, type BrandSize, type BrandVariant } from '../app/hooks/useAppBrand';
import { useAppPreferences } from '../app/hooks/useAppPreferences';

export type AppBrandComponentProps = {
  variant?: BrandVariant;
  size?: BrandSize;
};

export const AppBrand: FC<AppBrandComponentProps> = ({ variant = 'app', size: sizeProp }) => {
  const theme = useTheme();
  const { brand } = useAppPreferences();

  const size = variant === 'app' ? 'app' : sizeProp || 'small';
  const sizes = useMemo(() => getBrandSizes(theme, size), [theme, size]);

  if (!brand) return null;

  const isDark = theme.palette.mode === 'dark';
  const logoSrc = isDark ? brand.logo.dark : brand.logo.light;
  const nameSrc = isDark ? brand.name?.dark : brand.name?.light;
  const nameText = brand.appName;

  // Delegate to client component if provided.
  if (brand.component) {
    return <brand.component variant={variant} size={size} config={brand} sizes={sizes} />;
  }

  if (variant === 'logo') {
    return (
      <Stack direction="row" alignItems="center">
        <img src={logoSrc} alt={`${brand.application} logo`} style={{ ...sizes.icon }} />
      </Stack>
    );
  }

  if (variant === 'name') {
    return (
      <Stack direction="row" alignItems="center">
        <AppBrandName nameSrc={nameSrc} nameText={nameText} application={brand.application} sizes={sizes} />
      </Stack>
    );
  }

  const isHorizontal = variant === 'banner-horizontal' || variant === 'app';

  return (
    <Stack direction={isHorizontal ? 'row' : 'column'} alignItems="center" style={{ width: 'fit-content' }}>
      <img src={logoSrc} alt={`${brand.application} logo`} style={{ ...sizes.icon }} />
      <div style={{ ...sizes.divider }} />
      <AppBrandName nameSrc={nameSrc} nameText={nameText} application={brand.application} sizes={sizes} />
    </Stack>
  );
};

const AppBrandName: FC<{
  nameSrc?: string;
  nameText?: string;
  application: string;
  sizes: ReturnType<typeof getBrandSizes>;
}> = ({ nameSrc, nameText, application, sizes }) => {
  if (nameSrc) {
    return <img src={nameSrc} alt={application} style={{ ...sizes.name }} />;
  }
  if (nameText) {
    return <Typography sx={{ fontSize: sizes.text.fontSize, lineHeight: 1 }}>{nameText}</Typography>;
  }
  return null;
};
