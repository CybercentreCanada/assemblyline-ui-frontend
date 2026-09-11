import { type AppBrandProps } from 'commons/branding/AppBrand';
import { useAppConfigs } from 'commons/components/app/hooks/useAppConfigs';

export const useAppBrand = (props?: Partial<AppBrandProps>) => {
  const { preferences } = useAppConfigs();
  const brand = preferences.appBrand;
  const application = brand?.application || props?.application;

  if (!brand || !application) {
    return null;
  }

  const _variant = props?.variant || 'app';
  const _size = props?.size || 'small';
  return <brand.component application={application} variant={_variant} size={_size} />;
};
