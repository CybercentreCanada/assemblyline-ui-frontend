import { describe, expect, it, jest } from '@jest/globals';
import getXSRFCookie from 'helpers/xsrf';

describe('Test `getXSRFCookie`', () => {
  beforeEach(function () {
    let cookieJar = document.cookie;
    jest.spyOn(document, 'cookie', 'set').mockImplementation(cookie => {
      // don't append like standard cookie behaviour so we can overwrite in tests
      cookieJar = cookie;
    });
    jest.spyOn(document, 'cookie', 'get').mockImplementation(() => cookieJar);
  });
  it('Should parse document cookies and return the XSRF token', () => {
    document.cookie = 'user=John; domain=site.com; XSRF-TOKEN=TOKEN';
    expect(getXSRFCookie()).toBe('TOKEN');
    document.cookie = 'user=John; XSRF-TOKEN=TOKEN; domain=site.com';
    expect(getXSRFCookie()).toBe('TOKEN');
    document.cookie = 'XSRF-TOKEN=TOKEN; domain=site.com; user=John;';
    expect(getXSRFCookie()).toBe('TOKEN');
  });

  it('Should return null if no XSRF token found', () => {
    expect(getXSRFCookie()).toBe(null);
    document.cookie = '';
    expect(getXSRFCookie()).toBe(null);
    document.cookie = null;
    expect(getXSRFCookie()).toBe(null);
    document.cookie = 'domain=site.com; user=John;';
    expect(getXSRFCookie()).toBe(null);
    document.cookie = '5';
    expect(getXSRFCookie()).toBe(null);
  });
});
