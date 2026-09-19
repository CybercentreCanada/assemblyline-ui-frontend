/**
 * @name getXSRFCookie
 * @description Parses the cookiejar and extracts the value for the XSRF-TOKEN.
 * @returns the CSRF token
 */
export const getXSRFCookie = (): string => {
  if (document.cookie !== undefined) {
    try {
      return document.cookie
        .split('; ')
        .find(row => row.startsWith('XSRF-TOKEN'))
        .split('=')[1];
    } catch (ex) {
      return null;
    }
  }
};
