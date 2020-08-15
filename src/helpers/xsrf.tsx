export default function getXSRFCookie() {
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
  return xsrfToken;
}
