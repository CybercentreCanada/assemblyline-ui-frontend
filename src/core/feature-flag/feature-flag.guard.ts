/**
 * Checks if the user is a feature flag admin.
 *
 * @param user CustomUser
 * @returns boolean
 */
export const isUserFeatureFlagAdmin = (user: CustomUser) => {
  return user?.is_admin ?? false;
};
