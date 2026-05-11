export const USERNAME_MIN_LENGTH = 3;
export const USERNAME_PATTERN = /^[a-z\-]+$/;
export const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Validates a username against UI constraints (required, min length, allowed characters).
 *
 * @param username - Raw username string.
 * @returns i18n key for the validation error, or `undefined` when the username is valid.
 */
export const validateUsername = (username: string) => {
  if (!username) return 'validate.username.required';
  else if (!(username.length >= USERNAME_MIN_LENGTH)) return 'validate.username.too_short';
  else if (!USERNAME_PATTERN.test(username)) return 'validate.username.characters';
  else return undefined;
};

/**
 * Validates that a password is present.
 *
 * @param password - Raw password string.
 * @returns i18n key for the validation error, or `undefined` when the password is valid.
 */
export const validatePassword = (password: string) => {
  if (!password) return 'validate.password.required';
  else return undefined;
};

/**
 * Validates that the confirmation password is present and matches the original password.
 *
 * @param password - The original password string.
 * @param password_confirm - The confirmation password string.
 * @returns i18n key for the validation error, or `undefined` when the confirmation matches.
 */
export const validatePasswordConfirm = (password: string, password_confirm: string) => {
  if (!password_confirm) return 'validate.password.required';
  if (password !== password_confirm) return 'validate.password_confirm.mismatch';
  return undefined;
};

/**
 * Normalizes (trim + lowercase) then validates an email address.
 *
 * @param email - Raw email string.
 * @returns i18n key for the validation error, or `undefined` when the email is valid.
 */
export const validateEmail = (email: string) => {
  const normalized = email?.trim().toLowerCase() ?? '';
  if (!normalized) return 'validate.email.required';
  if (!EMAIL_PATTERN.test(normalized)) return 'validate.email.invalid';
  return undefined;
};
