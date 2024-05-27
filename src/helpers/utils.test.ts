import { describe, expect, it } from '@jest/globals';
import { ConfigurationDefinition } from 'components/hooks/useMyUser';
import {
  bytesToSize,
  getFileName,
  getProvider,
  getSubmitType,
  getValueFromPath,
  getVersionQuery,
  humanReadableNumber,
  matchSHA256,
  matchURL,
  maxLenStr,
  priorityText,
  resetFavicon,
  safeFieldValue,
  safeFieldValueURI,
  searchResultsDisplay,
  setNotifyFavicon,
  toTitleCase,
  verdictRank,
  verdictToColor
} from 'helpers/utils';

describe('Test `toTitleCase`', () => {
  it('Should split on whitespace and underscores', () => {
    expect(toTitleCase('title')).toBe('Title');
    expect(toTitleCase('TITLE')).toBe('Title');
    expect(toTitleCase('TiTlE')).toBe('Title');
    expect(toTitleCase('the_title')).toBe('The Title');
    expect(toTitleCase('the title')).toBe('The Title');
    expect(toTitleCase('theTitle')).toBe('Thetitle');
    expect(toTitleCase('TheTitle')).toBe('Thetitle');
    expect(toTitleCase('_the_title_')).toBe('The Title');
    expect(toTitleCase('the title 0')).toBe('The Title 0');
  });

  it('Should trim extra whitespace', () => {
    expect(toTitleCase(' the title')).toBe('The Title');
    expect(toTitleCase('the  title')).toBe('The Title');
    expect(toTitleCase('the title ')).toBe('The Title');
    expect(toTitleCase('  the   title ')).toBe('The Title');
  });

  it('Should leave special characters', () => {
    expect(toTitleCase('*the-title>')).toBe('*the-title>');
    expect(toTitleCase('*the* *title*')).toBe('*the* *title*');
  });
});

describe('Test `getFileName`', () => {
  it('Should return `null` if `filename=` not found', () => {
    expect(getFileName('C:\\file.txt')).toBe(null);
    expect(getFileName('/etc/file.js')).toBe(null);
    expect(getFileName('~/downloads/file.js')).toBe(null);
    expect(getFileName('form-data; name="fieldName"')).toBe(null);
  });

  it('Should identify ascii filenames', () => {
    expect(getFileName('form-data; name="fieldName"; filename="filename.jpg"')).toBe('filename.jpg');
    expect(getFileName('form-data; filename="filename.jpg"; name="fieldName"')).toBe('filename.jpg');
    expect(getFileName('attachment; filename="filename.jpg"')).toBe('filename.jpg');
  });

  it('Should identify utf8 filenames', () => {
    expect(getFileName("attachment; filename*=UTF-8''%EA%B3%A0%EC%96%91%EC%9D%B4.jpg;")).toBe('고양이.jpg');
    // most modern browsers and application allow the use of non-ISO-8859-1 characters in HTTP fields
    // Should we test for these as they might be present?
    // expect(getFileName('attachment; filename=고양이.jpg;')).toBe('고양이.jpg');
    // expect(getFileName("attachment; filename*=UTF-8''고양이.jpg;")).toBe('고양이.jpg');
  });

  it('Should extract the utf8 filename if both ascii and utf8 are present', () => {
    expect(getFileName('attachment; filename="cat.jpg"; filename*=UTF-8\'\'%EA%B3%A0%EC%96%91%EC%9D%B4.jpg;')).toBe(
      '고양이.jpg'
    );
  });
});

describe('Test `bytesToSize`', () => {
  it('Should return NaN undefined for negative numbers', () => {
    expect(bytesToSize(-1)).toBe('NaN undefined');
  });

  it('Should return bytes if size less than 1024 B', () => {
    expect(bytesToSize(0)).toBe('0 B');
    expect(bytesToSize(5)).toBe('5 B');
    expect(bytesToSize(512)).toBe('512 B');
    expect(bytesToSize(1000)).toBe('1000 B');
    expect(bytesToSize(1023)).toBe('1023 B');
  });

  it('Should return KB if size between 1024 B to under 1 MB', () => {
    expect(bytesToSize(1024)).toBe('1 KB');
    expect(bytesToSize(1025)).toBe('1 KB');
    expect(bytesToSize(500000)).toBe('488 KB');
    expect(bytesToSize(1000000)).toBe('977 KB');
    expect(bytesToSize(1048575)).toBe('1024 KB');
  });

  it('Should return MB if size between 1 MB to under 1 GB', () => {
    expect(bytesToSize(1048576)).toBe('1 MB');
    expect(bytesToSize(1048586)).toBe('1 MB');
    expect(bytesToSize(500000000)).toBe('477 MB');
    expect(bytesToSize(750000000)).toBe('715 MB');
    expect(bytesToSize(1073741823)).toBe('1024 MB');
  });

  it('Should return GB if size between 1 GB to under 1 TB', () => {
    expect(bytesToSize(1073741824)).toBe('1 GB');
    expect(bytesToSize(50000000000)).toBe('47 GB');
    expect(bytesToSize(75000000000)).toBe('70 GB');
    expect(bytesToSize(1099511627775)).toBe('1024 GB');
  });

  it('Should return TB if size over 1024 GB', () => {
    expect(bytesToSize(1099511627776)).toBe('1 TB');
    expect(bytesToSize(5000000000000)).toBe('5 TB');
    expect(bytesToSize(10000000000000)).toBe('9 TB');
    expect(bytesToSize(1125899906842620)).toBe('1024 TB');
  });

  it('Should return `undefined` on 1 PB+', () => {
    expect(bytesToSize(1125899906842621)).toBe('1 undefined');
    expect(bytesToSize(1125899906842624)).toBe('1 undefined');
  });
});

describe('Test `getVersionQuery`', () => {
  it('Should extract complete stable build', () => {
    expect(getVersionQuery('4.4.1.1')).toBe(
      'response.service_version:4.4.1.1 OR response.service_version:4.4.1.stable1'
    );
    expect(getVersionQuery('4.4.1.stable1')).toBe(
      'response.service_version:4.4.1.1 OR response.service_version:4.4.1.stable1'
    );
  });

  it('Should use full dev build string', () => {
    expect(getVersionQuery('4.4.1.dev1')).toBe('response.service_version:4.4.1.dev1');
  });

  it('Should use input string on bad formats', () => {
    expect(getVersionQuery('not-a-version-string')).toBe('response.service_version:not-a-version-string');
  });
});

describe('Test `humanReadableNumber`', () => {
  it('Should return NaNundefined for negative numbers', () => {
    expect(humanReadableNumber(-1)).toBe('NaNundefined ');
  });

  it('Should return no suffix if size less than 1,000', () => {
    expect(humanReadableNumber(0)).toBe('0 ');
    expect(humanReadableNumber(512)).toBe('512 ');
    expect(humanReadableNumber(999)).toBe('999 ');
  });

  it('Should return k if size approx between 1,000 to under 1,000,000', () => {
    expect(humanReadableNumber(1000)).toBe('1k ');
    expect(humanReadableNumber(1024)).toBe('1k ');
    expect(humanReadableNumber(500000)).toBe('500k ');
    expect(humanReadableNumber(999e3)).toBe('999k ');
    // due to rounding in test function, we expect lossy conversion
    expect(humanReadableNumber(1e6 - 1)).toBe('1000k ');
  });

  it('Should return m if size approx between 1,000,000 to under 1,000,000,000', () => {
    expect(humanReadableNumber(1000000)).toBe('1m ');
    expect(humanReadableNumber(500000000)).toBe('500m ');
    expect(humanReadableNumber(999e6)).toBe('999m ');
    expect(humanReadableNumber(1e9 - 1)).toBe('1000m ');
  });

  it('Should return g if size approx between 1,000,000,000 to under 1,000,000,000,000', () => {
    expect(humanReadableNumber(1000000000)).toBe('1g ');
    expect(humanReadableNumber(500000000000)).toBe('500g ');
    expect(humanReadableNumber(999e9)).toBe('999g ');
    expect(humanReadableNumber(1e12 - 1)).toBe('1000g ');
  });

  it('Should return t if size approx between 1e12 to under 1e15', () => {
    expect(humanReadableNumber(1e12)).toBe('1t ');
    expect(humanReadableNumber(500e12)).toBe('500t ');
    expect(humanReadableNumber(999e12)).toBe('999t ');
  });

  it('Should return p if size approx between 1e15 to under 1e18', () => {
    expect(humanReadableNumber(1e15 - 1)).toBe('1p ');
    expect(humanReadableNumber(1e15)).toBe('1p ');
    expect(humanReadableNumber(500e15)).toBe('500p ');
    expect(humanReadableNumber(999e15)).toBe('999p ');
  });

  it('Should return e if size approx between 1e18 to under 1e21', () => {
    expect(humanReadableNumber(1e18 - 1)).toBe('1e ');
    expect(humanReadableNumber(1e18)).toBe('1e ');
    expect(humanReadableNumber(500e18)).toBe('500e ');
    expect(humanReadableNumber(999e18)).toBe('999e ');
  });

  it('Should return z if size approx between 1e21 to under 1e24', () => {
    expect(humanReadableNumber(1e21 - 1)).toBe('1z ');
    expect(humanReadableNumber(1e21)).toBe('1z ');
    expect(humanReadableNumber(500e21)).toBe('500z ');
    expect(humanReadableNumber(999e21)).toBe('999z ');
  });

  it('Should return y if size approx between 1e24 to under 1e27', () => {
    expect(humanReadableNumber(1e24 - 1)).toBe('1y ');
    expect(humanReadableNumber(1e24)).toBe('1y ');
    expect(humanReadableNumber(500e24)).toBe('500y ');
    expect(humanReadableNumber(999e24)).toBe('999y ');
  });

  it('Should return `undefined` on 1e27+', () => {
    expect(humanReadableNumber(1e27)).toBe('1undefined ');
    expect(humanReadableNumber(2e28)).toBe('20undefined ');
  });
});

describe('Test `resetFavicon`', () => {
  it('Should set favicon path to default', () => {
    const initial = 'https://not.the.default.url/favicon.ico';
    const defaultURL = process.env.PUBLIC_URL;

    let favicon = document.getElementById('favicon');
    if (!favicon) {
      let l = window.document.createElement('link');
      l.setAttribute('id', 'favicon');
      l.setAttribute('rel', 'icon');
      document.head.appendChild(l);
    }

    favicon = document.getElementById('favicon');
    favicon.setAttribute('href', initial);
    expect(favicon.getAttribute('href')).toBe(initial);
    resetFavicon();
    expect(favicon.getAttribute('href')).toBe(`${defaultURL}/favicon.ico`);
  });
});

describe('Test `setNotifyFavicon`', () => {
  it('Should set favicon path to the notify/done icon', () => {
    const initial = 'https://not.the.default.url/favicon_done.ico';
    const defaultURL = process.env.PUBLIC_URL;

    let favicon = document.getElementById('favicon');
    if (!favicon) {
      let l = window.document.createElement('link');
      l.setAttribute('id', 'favicon');
      l.setAttribute('rel', 'icon');
      document.head.appendChild(l);
    }

    favicon = document.getElementById('favicon');
    favicon.setAttribute('href', initial);
    expect(favicon.getAttribute('href')).toBe(initial);
    setNotifyFavicon();
    expect(favicon.getAttribute('href')).toBe(`${defaultURL}/favicon_done.ico`);
  });
});

describe('Test `verdictToColor`', () => {
  it('Should return correct colors', () => {
    expect(verdictToColor('safe')).toBe('success');
    expect(verdictToColor('info')).toBe('default');
    expect(verdictToColor('suspicious')).toBe('warning');
    expect(verdictToColor('highly_suspicious')).toBe('warning');
    expect(verdictToColor('malicious')).toBe('error');
  });
  it('Should return undefined if no mapping exists', () => {
    expect(verdictToColor('not-a-verdict')).toBe(undefined);
  });
});

describe('Test `verdictRank`', () => {
  it('Should return correct rank', () => {
    expect(verdictRank('safe')).toBe(4);
    expect(verdictRank('info')).toBe(3);
    expect(verdictRank('suspicious')).toBe(2);
    expect(verdictRank('highly_suspicious')).toBe(1);
    expect(verdictRank('malicious')).toBe(0);
  });
  it('Should return undefined if no mapping exists', () => {
    expect(verdictRank('not-a-verdict')).toBe(undefined);
  });
});

describe('Test `priorityText`', () => {
  it('Should return correct human readable priority', () => {
    expect(priorityText(-1)).toBe('low');
    expect(priorityText(0)).toBe('low');
    expect(priorityText(1)).toBe('low');
    expect(priorityText(99)).toBe('low');

    expect(priorityText(100)).toBe('medium');
    expect(priorityText(199)).toBe('medium');

    expect(priorityText(200)).toBe('high');
    expect(priorityText(299)).toBe('high');

    expect(priorityText(300)).toBe('critical');
    expect(priorityText(499)).toBe('critical');

    expect(priorityText(500)).toBe('user-low');
    expect(priorityText(999)).toBe('user-low');

    expect(priorityText(1000)).toBe('user-medium');
    expect(priorityText(1499)).toBe('user-medium');

    expect(priorityText(1500)).toBe('user-high');
    expect(priorityText(10000)).toBe('user-high');
  });
  it('Should return low if null passed in', () => {
    expect(priorityText(null)).toBe('low');
  });
});

describe('Test `getValueFromPath`', () => {
  const obj = {
    one: 'value1',
    two: { nested: 'value2' },
    three: { nested: { levels: 'value3' } }
  };

  it('Should return top level values', () => {
    expect(getValueFromPath(obj, 'one')).toBe('value1');
  });
  it('Should return nested values', () => {
    expect(getValueFromPath(obj, 'two.nested')).toBe('value2');
    expect(getValueFromPath(obj, 'three.nested.levels')).toBe('value3');
  });
  it('Should return undefined if path is null/undefined/empty', () => {
    expect(getValueFromPath(obj, '')).toBe(undefined);
    expect(getValueFromPath(obj, undefined)).toBe(undefined);
    expect(getValueFromPath(obj, null)).toBe(undefined);
  });
  it('Should return undefined if path is not found', () => {
    expect(getValueFromPath(obj, 'x')).toBe(undefined);
    expect(getValueFromPath(obj, 'not.a.valid.path')).toBe(undefined);
  });
});

describe('Test `getProvider`', () => {
  let loc = { ...window.location };
  afterEach(() => {
    window.location = loc;
  });

  it('Should return correct provider info if pathname provides oauth', () => {
    const location = {
      ...window.location,
      pathname: `${process.env.PUBLIC_URL}/oauth/oauthProvider/`
    };
    Object.defineProperty(window, 'location', {
      writable: true,
      value: location
    });

    expect(getProvider()).toBe('oauthProvider');
  });

  it('Should return correct provider info from search params', () => {
    const location = {
      ...window.location,
      search: '?provider=otherProvider',
      pathname: `${process.env.PUBLIC_URL}/notoauth/`
    };
    Object.defineProperty(window, 'location', {
      writable: true,
      value: location
    });

    expect(getProvider()).toBe('otherProvider');
  });

  it('Will always trim last character from oauth pathname ', () => {
    const location = {
      ...window.location,
      pathname: `${process.env.PUBLIC_URL}/oauth/oauthProvider`
    };
    Object.defineProperty(window, 'location', {
      writable: true,
      value: location
    });

    expect(getProvider()).toBe('oauthProvide');
  });
});

describe('Test `searchResultsDisplay`', () => {
  let loc = { ...window.location };
  afterEach(() => {
    window.location = loc;
  });

  it('Should return the exact count if not at the ES limit', () => {
    const location = {
      ...window.location,
      search: '?track_total_hits=100'
    };
    Object.defineProperty(window, 'location', {
      writable: true,
      value: location
    });

    expect(searchResultsDisplay(-1)).toBe('-1');
    expect(searchResultsDisplay(0)).toBe('0');
    expect(searchResultsDisplay(1)).toBe('1');
    expect(searchResultsDisplay(30)).toBe('30');
    expect(searchResultsDisplay(99)).toBe('99');
    expect(searchResultsDisplay(500)).toBe('500');
    expect(searchResultsDisplay(500, 500)).toBe('500');
  });

  it('Should return "count+" if at exactly the ES/track_total_hits limit', () => {
    const location = {
      ...window.location,
      search: '?track_total_hits=100'
    };
    Object.defineProperty(window, 'location', {
      writable: true,
      value: location
    });

    expect(searchResultsDisplay(100)).toBe('100+');
    expect(searchResultsDisplay(100, 50)).toBe('100+');
  });

  it('Should return "count+" if no ES tracked hits available and count is exactly the manual limit', () => {
    const location = {
      ...window.location,
      search: '?x='
    };
    Object.defineProperty(window, 'location', {
      writable: true,
      value: location
    });

    expect(searchResultsDisplay(200, 200)).toBe('200+');
    expect(searchResultsDisplay(10000)).toBe('10000+');
  });
});

describe('Test `maxLenStr`', () => {
  it('Should return the complete string if it is less than or equal to max length', () => {
    expect(maxLenStr('this string', 50)).toBe('this string');
    expect(maxLenStr('this string', 11)).toBe('this string');
  });

  it('Should return a truncated string if it is greater than max length', () => {
    expect(maxLenStr('this string', 7)).toBe('this...');
    expect(maxLenStr('this string', 10)).toBe('this st...');
  });
});

describe('Test `safeFieldValue`', () => {
  it('Should convert numbers to strings', () => {
    expect(safeFieldValue(1)).toBe('"1"');
    expect(safeFieldValue(0)).toBe('"0"');
    expect(safeFieldValue(-1)).toBe('"-1"');
    expect(safeFieldValue(1e15)).toBe('"1000000000000000"');
    expect(safeFieldValue(1e24)).toBe('"1e+24"');
  });
  it('Should convert booleans to strings', () => {
    expect(safeFieldValue(true)).toBe('"true"');
    expect(safeFieldValue(false)).toBe('"false"');
  });
  it('Should convert null/undefined to strings', () => {
    expect(safeFieldValue(null)).toBe('"null"');
    expect(safeFieldValue(undefined)).toBe('"undefined"');
  });
  it('Should quote plain strings', () => {
    expect(safeFieldValue('')).toBe('""');
    expect(safeFieldValue('plain')).toBe('"plain"');
    expect(safeFieldValue('plain/')).toBe('"plain/"');
  });
  it('Should escape backslash and double quotes strings', () => {
    expect(safeFieldValue('includes\\backslash')).toBe('"includes\\\\backslash"');
    expect(safeFieldValue('"quoted"')).toBe('"\\"quoted\\""');
    expect(safeFieldValue('"includes\\both"')).toBe('"\\"includes\\\\both\\""');
  });
});

describe('Test `safeFieldValueURI`', () => {
  it('Should not encode numbers', () => {
    expect(safeFieldValueURI(1)).toBe('%221%22');
    expect(safeFieldValueURI(0)).toBe('%220%22');
    expect(safeFieldValueURI(-1)).toBe('%22-1%22');
    expect(safeFieldValueURI(1e15)).toBe('%221000000000000000%22');
    expect(safeFieldValueURI(1e24)).toBe('%221e%2B24%22');
  });
  it('Should not encode booleans', () => {
    expect(safeFieldValueURI(true)).toBe('%22true%22');
    expect(safeFieldValueURI(false)).toBe('%22false%22');
  });
  it('Should not encode null/undefined', () => {
    expect(safeFieldValueURI(null)).toBe('%22null%22');
    expect(safeFieldValueURI(undefined)).toBe('%22undefined%22');
  });
  it('Should encode non-safe URI characters in plain strings', () => {
    expect(safeFieldValueURI('')).toBe('%22%22');
    expect(safeFieldValueURI('plain')).toBe('%22plain%22');
    expect(safeFieldValueURI('some+plain-ish.text/')).toBe('%22some%2Bplain-ish.text%2F%22');
  });
  it('Should encode escaped string', () => {
    expect(safeFieldValueURI('includes\\backslash')).toBe('%22includes%5C%5Cbackslash%22');
    expect(safeFieldValueURI('"quoted"')).toBe('%22%5C%22quoted%5C%22%22');
    expect(safeFieldValueURI('"includes\\both"')).toBe('%22%5C%22includes%5C%5Cboth%5C%22%22');
  });
});

describe('Test `matchSHA256`', () => {
  it('Should match valid sha256 hashes', () => {
    expect(matchSHA256('a'.repeat(64))).toBe('a'.repeat(64));
  });
  it('Should not match invalid sha256 hashes', () => {
    expect(matchSHA256('a'.repeat(32))).toBe(null);
    expect(matchSHA256('')).toBe(null);
    expect(matchSHA256(null)).toBe(null);
    expect(matchSHA256(undefined)).toBe(null);
    expect(matchSHA256('x'.repeat(64))).toBe(null);
    expect(matchSHA256(`start ${'a'.repeat(64)}`)).toBe(null);
    expect(matchSHA256(`${'a'.repeat(64)} end`)).toBe(null);
  });
});

describe('Test `matchURL`', () => {
  it('Should match valid URLs', () => {
    expect(matchURL('http://blah.com')[0]).toBe('http://blah.com');
    expect(matchURL('http://blah.com:123')[0]).toBe('http://blah.com');
    expect(matchURL('http://blah.com:123?blah')[0]).toBe('http://blah.com');
    expect(matchURL('http://blah.com:123/blah')[0]).toBe('http://blah.com');
    expect(matchURL('http://blah.com:123/blah?blah')[0]).toBe('http://blah.com');
    expect(matchURL('https://user:pass@www.blah.com:123/blah#anchor?blah&q=blah2')[0]).toBe(
      'https://user:pass@www.blah.com'
    );
    expect(matchURL('http://1.1.1.1')[0]).toBe('http://1.1.1.1');
    expect(matchURL('http://1.1.1.1:123')[0]).toBe('http://1.1.1.1');
    expect(matchURL('http://1.1.1.1:123/blah')[0]).toBe('http://1.1.1.1');
    expect(matchURL('http://1.1.1.1:123/blah?blah')[0]).toBe('http://1.1.1.1');
    expect(matchURL('net.tcp://1.1.1.1:123')[0]).toBe('tcp://1.1.1.1');
    expect(matchURL('net.tcp://1.1.1.1:1')[0]).toBe('tcp://1.1.1.1');
  });
  it('Should not match invalid URLs', () => {
    expect(matchSHA256('')).toBe(null);
    expect(matchSHA256(null)).toBe(null);
    expect(matchSHA256(undefined)).toBe(null);
    expect(matchURL('blah')).toBe(null);
    expect(matchURL('1.1.1.1')).toBe(null);
    // URI requires a scheme: https://en.wikipedia.org/wiki/Uniform_Resource_Identifier#scheme
    expect(matchURL('//1.1.1.1:1')).toBe(null);

    // TODO The follow are invalid inputs that are currently passing. The function needs to be updated.
    // expect(matchURL('http://blah')).toBe(null);
    // expect(matchURL('hxxp://blah.com')).toBe(null);
    // expect(matchURL('http://1.1.1.1:123:123')).toBe(null);
    // expect(matchURL('http://blah.com:abc')).toBe(null);
  });
});

describe('Test `getSubmitType`', () => {
  it('Should return null', () => {
    expect(getSubmitType(undefined, undefined)).toBe(null);
    expect(getSubmitType(null, null)).toBe(null);
  });

  const configuration: ConfigurationDefinition = {
    auth: {
      allow_2fa: false,
      allow_apikeys: false,
      allow_extended_apikeys: false,
      allow_security_tokens: false
    },
    core: {
      archiver: {
        alternate_dtl: 0,
        metadata: {},
        use_metadata: false
      }
    },
    datastore: {
      archive: {
        enabled: false
      }
    },
    retrohunt: {
      enabled: false,
      dtl: 0,
      max_dtl: 0
    },
    submission: {
      file_sources: {
        md5: { pattern: '^[a-f0-9]{32}$', sources: [] },
        sha1: { pattern: '^[a-f0-9]{40}$', sources: [] },
        sha256: { pattern: '^[a-f0-9]{64}$', sources: [] }
      },
      dtl: 0,
      max_dtl: 0,
      verdicts: {
        info: 0,
        suspicious: 0,
        highly_suspicious: 0,
        malicious: 0
      }
    },
    system: {
      organisation: '',
      type: '',
      version: ''
    },
    ui: {
      ai: {
        enabled: false
      },
      alerting_meta: {
        important: [],
        subject: [],
        url: []
      },
      allow_malicious_hinting: false,
      allow_raw_downloads: false,
      allow_replay: false,
      allow_url_submissions: false,
      allow_zip_downloads: false,
      apps: [],
      banner: {},
      banner_level: 'info',
      external_links: {
        tag: {},
        hash: {},
        metadata: {}
      },
      external_sources: [],
      external_source_tags: {},
      fqdn: '',
      read_only: false,
      rss_feeds: [],
      services_feed: '',
      community_feed: '',
      tos: false,
      tos_lockout: false,
      tos_lockout_notify: false,
      url_submission_auto_service_selection: []
    },
    user: {
      api_priv_map: {},
      priv_role_dependencies: {},
      roles: [],
      role_dependencies: {},
      types: []
    }
  };

  it('Should not match the input string with any type', () => {
    expect(getSubmitType('', configuration)).toBe(null);
    expect(getSubmitType('test', configuration)).toBe(null);
    expect(getSubmitType('qwerty1234567890qwerty1234567890', configuration)).toBe(null);
    expect(getSubmitType('qwerty1234567890qwerty1234567890qwerty12', configuration)).toBe(null);
    expect(getSubmitType('qwerty1234567890qwerty1234567890qwerty1234567890qwerty1234567890', configuration)).toBe(null);
  });

  it('Should match the input string with its corresponding type', () => {
    expect(getSubmitType('abcdef1234567890abcdef1234567890', configuration)).toBe('md5');
    expect(getSubmitType('abcdef1234567890abcdef1234567890abcdef12', configuration)).toBe('sha1');
    expect(getSubmitType('abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890', configuration)).toBe(
      'sha256'
    );
    expect(getSubmitType('http://blah.com', configuration)).toBe('url');
  });
});
