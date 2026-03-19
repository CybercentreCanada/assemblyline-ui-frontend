export const USERNAME_MIN_LENGTH = 3;
export const USERNAME_PATTERN = /^[a-z\-]+$/;
export const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const validateUsername = (username: string) => {
  if (!username) return 'validate.username.required';
  else if (!(username.length >= USERNAME_MIN_LENGTH)) return 'validate.username.too_short';
  else if (!USERNAME_PATTERN.test(username)) return 'validate.username.characters';
  else return undefined;
};

export const validatePassword = (password: string) => {
  if (!password) return 'validate.password.required';
  else return undefined;
};

export const validatePasswordConfirm = (password: string, password_confirm: string) => {
  if (!password_confirm) return 'validate.password.required';
  if (password !== password_confirm) return 'validate.password_confirm.mismatch';
  return undefined;
};

export const validateEmail = (email: string) => {
  const normalized = email?.trim().toLowerCase() ?? '';
  if (!normalized) return 'validate.email.required';
  if (!EMAIL_PATTERN.test(normalized)) return 'validate.email.invalid';
  return undefined;
};
