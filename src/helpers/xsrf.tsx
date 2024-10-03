/**
 *
 * Parses the cookiejar and extracts the value for the XSRF-TOKEN.
 *
 * @returns the CSRF token
 *
 */
export default function getXSRFCookie(): string {
  let xsrfToken = null;
  if (document.cookie !== undefined) {
    try {
      // eslint-disable-next-line prefer-destructuring
      xsrfToken = document.cookie
        .split('; ')
        .find(row => row.startsWith('XSRF-TOKEN'))
        .split('=')[1];
    } catch (ex) {
      // Ignore... we will return null
    }
  }
  return xsrfToken as string;
}
