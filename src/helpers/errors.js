export const getErrorTypeFromKey = key => {
  let eID = key.substr(65, key.length);

  if (eID.indexOf('.e') !== -1) {
    eID = eID.substr(eID.indexOf('.e') + 2, eID.length);
  }

  if (eID === '21') {
    return 'down';
  }
  if (eID === '12') {
    return 'retry';
  }
  if (eID === '10') {
    return 'depth';
  }
  if (eID === '30') {
    return 'preempted';
  }
  if (eID === '20') {
    return 'busy';
  }
  if (eID === '11') {
    return 'files';
  }
  if (eID === '1') {
    return 'exception';
  }

  return 'unknown';
};

export const getServiceFromKey = key => {
  let srv = key.substr(65, key.length);

  if (srv.indexOf('.') !== -1) {
    srv = srv.substr(0, srv.indexOf('.'));
  }

  return srv;
};

export const getErrorIDFromKey = key => {
  let eID = key.substr(65, key.length);

  if (eID.indexOf('.e') !== -1) {
    eID = eID.substr(eID.indexOf('.e') + 2, eID.length);
  }

  return eID;
};

export const getHashFromKey = key => {
  return key.substr(0, 64);
};
