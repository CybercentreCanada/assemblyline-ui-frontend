export const isUserFeatureFlagAdmin = (user: CustomUser) => {
  return user?.is_admin ?? false;
};
