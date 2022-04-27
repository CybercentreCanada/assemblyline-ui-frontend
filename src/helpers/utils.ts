export function bytesToSize(bytes: number | null) {
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  if (bytes === 0 || bytes === null) return '0 B';
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${Math.round(bytes / Math.pow(1024, i))} ${sizes[i]}`;
}

export function getVersionQuery(version: string | null) {
  try {
    const [framework, major, minor, build] = version.replace('stable', '').split('.');
    if (build.indexOf('dev') === -1) {
      return `response.service_version:${framework}.${major}.${minor}.${build} OR response.service_version:${framework}.${major}.${minor}.stable${build}`;
    }
    return `response.service_version:${version}`;
  } catch (e) {
    return `response.service_version:${version}`;
  }
}

export function humanReadableNumber(num: number | null) {
  const sizes = ['', 'k', 'm', 'g', 't', 'p', 'e', 'z', 'y'];
  if (num === 0 || num === null) return '0 ';
  const i = Math.floor(Math.log(num) / Math.log(1000));
  return `${Math.round(num / Math.pow(1000, i))}${sizes[i]} `;
}

export function resetFavicon() {
  const favicon: HTMLLinkElement = document.querySelector('#favicon');
  favicon.href = `${process.env.PUBLIC_URL}/favicon.ico`;
}

export function setNotifyFavicon() {
  const favicon: HTMLLinkElement = document.querySelector('#favicon');
  favicon.href = `${process.env.PUBLIC_URL}/favicon_done.ico`;
}

export function scoreToVerdict(score: number | null) {
  // More then 1000 => Malicious
  if (score >= 1000) {
    return 'malicious';
  }

  // Between 700 - 999 => Highly suspicious
  if (score >= 700) {
    return 'highly_suspicious';
  }

  // Between 300 - 699 => Suspicious
  if (score >= 300) {
    return 'suspicious';
  }

  // Smaller then 0 => Safe
  if (score < 0) {
    return 'safe';
  }

  // Between 0 and 299 => Informational
  return 'info';
}

export function priorityText(priority: number | null) {
  if (priority >= 1500) {
    return 'user-high';
  }

  if (priority >= 1000) {
    return 'user-medium';
  }

  if (priority >= 500) {
    return 'user-low';
  }

  if (priority >= 300) {
    return 'critical';
  }

  if (priority >= 200) {
    return 'high';
  }

  if (priority >= 100) {
    return 'medium';
  }

  return 'low';
}

export function getValueFromPath(obj: object, path: string) {
  const paths = path.split('.');
  let current = obj;
  let i;

  for (i = 0; i < paths.length; ++i) {
    if (current[paths[i]] === undefined) {
      return undefined;
    }
    current = current[paths[i]];
  }
  return current;
}

export function getProvider() {
  if (window.location.pathname.indexOf(`${process.env.PUBLIC_URL}/oauth/`) !== -1) {
    return window.location.pathname.split(`${process.env.PUBLIC_URL}/oauth/`).pop().slice(0, -1);
  }
  const params = new URLSearchParams(window.location.search);
  return params.get('provider');
}

export function searchResultsDisplay(count: number, max: number = 10000) {
  const params = new URLSearchParams(window.location.search);
  const trackedHits = params.get('track_total_hits');

  if (count === parseInt(trackedHits) || (trackedHits === null && count === max)) {
    return `${count}+`;
  }

  return `${count}`;
}

export function maxLenStr(str: string, len: number) {
  if (str.length > len) {
    return `${str.substr(0, len - 3)}...`;
  }
  return str;
}
