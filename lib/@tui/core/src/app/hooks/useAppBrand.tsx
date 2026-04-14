import type { Theme } from '@mui/material';
import { useTheme } from '@mui/material';
import { useMemo } from 'react';
import type { AppBrandConfig } from '../AppConfigs';
import { useAppPreferences } from './useAppPreferences';

export const BRAND_VARIANTS = ['app', 'logo', 'name', 'banner-vertical', 'banner-horizontal'] as const;

export type BrandVariant = (typeof BRAND_VARIANTS)[number];

export type BrandSize = 'app' | 'xsmall' | 'small' | 'medium' | 'large' | 'xlarge';

export type AppBrandProps = {
  variant: BrandVariant;
  size?: BrandSize;
  config: AppBrandConfig;
  sizes: BrandSizeSpecs;
};

export type BrandSizeSpecs = {
  divider: { margin: string };
  name: { height: string };
  icon: { width: string; height: string };
  text: { fontSize: string };
};

// Returns density-aware brand sizing specs using theme.spacing().
export const getBrandSizes = (theme: Theme, size: BrandSize): BrandSizeSpecs => {
  const specs: Record<BrandSize, BrandSizeSpecs> = {
    app: {
      divider: { margin: theme.spacing(1.5) },
      name: { height: theme.spacing(3) },
      icon: { width: theme.spacing(5), height: theme.spacing(5) },
      text: { fontSize: theme.spacing(3) }
    },
    xlarge: {
      divider: { margin: theme.spacing(1.25) },
      name: { height: theme.spacing(11.75) },
      icon: { width: theme.spacing(18.75), height: theme.spacing(18.75) },
      text: { fontSize: theme.spacing(11.75) }
    },
    large: {
      divider: { margin: theme.spacing(1) },
      name: { height: theme.spacing(7.875) },
      icon: { width: theme.spacing(12.5), height: theme.spacing(12.5) },
      text: { fontSize: theme.spacing(7.875) }
    },
    medium: {
      divider: { margin: theme.spacing(0.75) },
      name: { height: theme.spacing(4.625) },
      icon: { width: theme.spacing(7.5), height: theme.spacing(7.5) },
      text: { fontSize: theme.spacing(4.625) }
    },
    small: {
      divider: { margin: theme.spacing(0.5) },
      name: { height: theme.spacing(3) },
      icon: { width: theme.spacing(5), height: theme.spacing(5) },
      text: { fontSize: theme.spacing(3) }
    },
    xsmall: {
      divider: { margin: theme.spacing(0.25) },
      name: { height: theme.spacing(1.875) },
      icon: { width: theme.spacing(3), height: theme.spacing(3) },
      text: { fontSize: theme.spacing(1.875) }
    }
  };
  return specs[size];
};

export const useAppBrand = (props?: { variant?: BrandVariant; size?: BrandSize }) => {
  const theme = useTheme();
  const { brand } = useAppPreferences();

  const variant = props?.variant || 'app';
  const size = props?.size || 'small';
  const sizes = useMemo(() => getBrandSizes(theme, size), [theme, size]);

  return useMemo(() => {
    if (!brand) return null;
    return { brand, variant, size, sizes };
  }, [brand, variant, size, sizes]);
};
