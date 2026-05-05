import { useTheme } from '@mui/material';
import { memo, useMemo } from 'react';

export const SIZES = {
  app: {
    divider: {
      margin: 12
    },
    name: {
      height: 24
    },
    icon: {
      width: 38,
      height: 38
    }
  },
  xlarge: {
    divider: {
      margin: 10
    },
    name: {
      height: 94
    },
    icon: {
      width: 150,
      height: 150
    }
  },
  large: {
    divider: {
      margin: 8
    },
    name: {
      height: 63
    },
    icon: {
      width: 100,
      height: 100
    }
  },
  medium: {
    divider: {
      margin: 6
    },
    name: {
      height: 37
    },
    icon: {
      width: 60,
      height: 60
    }
  },
  small: {
    divider: {
      margin: 4
    },
    name: {
      height: 24
    },
    icon: {
      width: 38,
      height: 38
    }
  },
  xsmall: {
    divider: {
      margin: 2
    },
    name: {
      height: 15
    },
    icon: {
      width: 24,
      height: 24
    }
  }
};

export const BRAND_VARIANTS = ['app', 'logo', 'name', 'banner-vertical', 'banner-horizontal'] as const;

export type BrandVariant = (typeof BRAND_VARIANTS)[number];

export type BrandSize = keyof typeof SIZES;

const AppLogo = ({
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
};

const AppName = ({ src, application, size = 'small' }: { src: string; application: string; size?: BrandSize }) => {
  return <img src={src} alt={application} style={{ ...SIZES[size].name }} />;
};

export type AppBrandProps = {
  application: string;
  variant: BrandVariant;
  size?: BrandSize;
};

export const AppBrand = memo(({ application, variant = 'app', size: sizeProp = 'small' }: AppBrandProps) => {
  const muiTheme = useTheme();
  const theme = muiTheme.palette.mode;

  const size = useMemo(() => (variant === 'app' ? 'app' : sizeProp), [variant, sizeProp]);

  const { logoSrc, nameSrc } = useMemo(() => {
    return {
      logoSrc: `/branding/${application}/noswoosh-${theme}.svg`,
      nameSrc: `/branding/${application}/name-${theme}.svg`
    };
  }, [theme, application]);

  const direction = useMemo(() => (variant.endsWith('horizontal') || variant === 'app' ? 'row' : 'column'), [variant]);

  return variant === 'logo' ? (
    <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
      <AppLogo application={application} src={logoSrc} variant={variant} size={size} />
    </div>
  ) : variant === 'name' ? (
    <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
      <AppName application={application} src={nameSrc} size={size} />
    </div>
  ) : (
    <div style={{ display: 'flex', flexDirection: direction, alignItems: 'center', width: 'fit-content' }}>
      <AppLogo application={application} src={logoSrc} variant={variant} size={size} />
      <div style={SIZES[size].divider} />
      <AppName application={application} src={nameSrc} size={size} />
    </div>
  );
});

AppBrand.displayName = 'AppBrand';
