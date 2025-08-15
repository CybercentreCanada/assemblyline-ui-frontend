import type { IndexDefinition, Indexes } from 'components/models/ui/user';

const MOCK_ALERT_INDEX_DEFINITION: IndexDefinition = {
  'al.attrib': {
    default: true,
    indexed: true,
    list: true,
    stored: true,
    type: 'keyword'
  },
  'al.av': {
    default: true,
    indexed: true,
    list: true,
    stored: true,
    type: 'keyword'
  },
  'al.behavior': {
    default: true,
    indexed: true,
    list: true,
    stored: false,
    type: 'keyword'
  },
  'al.detailed.attack_category.subtype': {
    default: false,
    indexed: true,
    list: true,
    stored: false,
    type: 'keyword'
  },
  'al.detailed.attack_category.type': {
    default: false,
    indexed: true,
    list: true,
    stored: false,
    type: 'keyword'
  },
  'al.detailed.attack_category.value': {
    default: false,
    indexed: true,
    list: true,
    stored: false,
    type: 'keyword'
  },
  'al.detailed.attack_category.verdict': {
    default: false,
    indexed: true,
    list: true,
    stored: false,
    type: 'keyword'
  },
  'al.detailed.attack_pattern.subtype': {
    default: false,
    indexed: true,
    list: true,
    stored: false,
    type: 'keyword'
  },
  'al.detailed.attack_pattern.type': {
    default: false,
    indexed: true,
    list: true,
    stored: false,
    type: 'keyword'
  },
  'al.detailed.attack_pattern.value': {
    default: false,
    indexed: true,
    list: true,
    stored: false,
    type: 'keyword'
  },
  'al.detailed.attack_pattern.verdict': {
    default: false,
    indexed: true,
    list: true,
    stored: false,
    type: 'keyword'
  },
  'al.detailed.attrib.subtype': {
    default: false,
    indexed: true,
    list: true,
    stored: false,
    type: 'keyword'
  },
  'al.detailed.attrib.type': {
    default: false,
    indexed: true,
    list: true,
    stored: false,
    type: 'keyword'
  },
  'al.detailed.attrib.value': {
    default: false,
    indexed: true,
    list: true,
    stored: false,
    type: 'keyword'
  },
  'al.detailed.attrib.verdict': {
    default: false,
    indexed: true,
    list: true,
    stored: false,
    type: 'keyword'
  },
  'al.detailed.av.subtype': {
    default: false,
    indexed: true,
    list: true,
    stored: false,
    type: 'keyword'
  },
  'al.detailed.av.type': {
    default: false,
    indexed: true,
    list: true,
    stored: false,
    type: 'keyword'
  },
  'al.detailed.av.value': {
    default: false,
    indexed: true,
    list: true,
    stored: false,
    type: 'keyword'
  },
  'al.detailed.av.verdict': {
    default: false,
    indexed: true,
    list: true,
    stored: false,
    type: 'keyword'
  },
  'al.detailed.behavior.subtype': {
    default: false,
    indexed: true,
    list: true,
    stored: false,
    type: 'keyword'
  },
  'al.detailed.behavior.type': {
    default: false,
    indexed: true,
    list: true,
    stored: false,
    type: 'keyword'
  },
  'al.detailed.behavior.value': {
    default: false,
    indexed: true,
    list: true,
    stored: false,
    type: 'keyword'
  },
  'al.detailed.behavior.verdict': {
    default: false,
    indexed: true,
    list: true,
    stored: false,
    type: 'keyword'
  },
  'al.detailed.domain.subtype': {
    default: false,
    indexed: true,
    list: true,
    stored: false,
    type: 'keyword'
  },
  'al.detailed.domain.type': {
    default: false,
    indexed: true,
    list: true,
    stored: false,
    type: 'keyword'
  },
  'al.detailed.domain.value': {
    default: false,
    indexed: true,
    list: true,
    stored: false,
    type: 'keyword'
  },
  'al.detailed.domain.verdict': {
    default: false,
    indexed: true,
    list: true,
    stored: false,
    type: 'keyword'
  },
  'al.detailed.heuristic.subtype': {
    default: false,
    indexed: true,
    list: true,
    stored: false,
    type: 'keyword'
  },
  'al.detailed.heuristic.type': {
    default: false,
    indexed: true,
    list: true,
    stored: false,
    type: 'keyword'
  },
  'al.detailed.heuristic.value': {
    default: false,
    indexed: true,
    list: true,
    stored: false,
    type: 'keyword'
  },
  'al.detailed.heuristic.verdict': {
    default: false,
    indexed: true,
    list: true,
    stored: false,
    type: 'keyword'
  },
  'al.detailed.ip.subtype': {
    default: false,
    indexed: true,
    list: true,
    stored: false,
    type: 'keyword'
  },
  'al.detailed.ip.type': {
    default: false,
    indexed: true,
    list: true,
    stored: false,
    type: 'keyword'
  },
  'al.detailed.ip.value': {
    default: false,
    indexed: true,
    list: true,
    stored: false,
    type: 'keyword'
  },
  'al.detailed.ip.verdict': {
    default: false,
    indexed: true,
    list: true,
    stored: false,
    type: 'keyword'
  },
  'al.detailed.uri.subtype': {
    default: false,
    indexed: true,
    list: true,
    stored: false,
    type: 'keyword'
  },
  'al.detailed.uri.type': {
    default: false,
    indexed: true,
    list: true,
    stored: false,
    type: 'keyword'
  },
  'al.detailed.uri.value': {
    default: false,
    indexed: true,
    list: true,
    stored: false,
    type: 'keyword'
  },
  'al.detailed.uri.verdict': {
    default: false,
    indexed: true,
    list: true,
    stored: false,
    type: 'keyword'
  },
  'al.detailed.yara.subtype': {
    default: false,
    indexed: true,
    list: true,
    stored: false,
    type: 'keyword'
  },
  'al.detailed.yara.type': {
    default: false,
    indexed: true,
    list: true,
    stored: false,
    type: 'keyword'
  },
  'al.detailed.yara.value': {
    default: false,
    indexed: true,
    list: true,
    stored: false,
    type: 'keyword'
  },
  'al.detailed.yara.verdict': {
    default: false,
    indexed: true,
    list: true,
    stored: false,
    type: 'keyword'
  },
  'al.domain': {
    default: true,
    indexed: true,
    list: true,
    stored: false,
    type: 'keyword'
  },
  'al.domain_dynamic': {
    default: false,
    indexed: true,
    list: true,
    stored: false,
    type: 'keyword'
  },
  'al.domain_static': {
    default: false,
    indexed: true,
    list: true,
    stored: false,
    type: 'keyword'
  },
  'al.ip': {
    default: true,
    indexed: true,
    list: true,
    stored: false,
    type: 'ip'
  },
  'al.ip_dynamic': {
    default: false,
    indexed: true,
    list: true,
    stored: false,
    type: 'ip'
  },
  'al.ip_static': {
    default: false,
    indexed: true,
    list: true,
    stored: false,
    type: 'ip'
  },
  'al.request_end_time': {
    default: false,
    indexed: false,
    list: false,
    stored: false,
    type: 'date'
  },
  'al.score': {
    default: false,
    indexed: true,
    list: false,
    stored: true,
    type: 'integer'
  },
  'al.uri': {
    default: true,
    indexed: true,
    list: true,
    stored: false,
    type: 'keyword'
  },
  'al.uri_dynamic': {
    default: false,
    indexed: true,
    list: true,
    stored: false,
    type: 'keyword'
  },
  'al.uri_static': {
    default: false,
    indexed: true,
    list: true,
    stored: false,
    type: 'keyword'
  },
  'al.yara': {
    default: true,
    indexed: true,
    list: true,
    stored: false,
    type: 'keyword'
  },
  alert_id: {
    default: true,
    indexed: true,
    list: false,
    stored: true,
    type: 'keyword'
  },
  archive_ts: {
    default: false,
    indexed: true,
    list: false,
    stored: true,
    type: 'date'
  },
  'attack.category': {
    default: false,
    indexed: true,
    list: true,
    stored: false,
    type: 'keyword'
  },
  'attack.pattern': {
    default: false,
    indexed: true,
    list: true,
    stored: false,
    type: 'keyword'
  },
  classification: {
    default: false,
    indexed: true,
    list: false,
    stored: true,
    type: 'keyword'
  },
  'events.entity_id': {
    default: false,
    indexed: true,
    list: true,
    stored: false,
    type: 'keyword'
  },
  'events.entity_name': {
    default: false,
    indexed: true,
    list: true,
    stored: false,
    type: 'keyword'
  },
  'events.entity_type': {
    default: false,
    indexed: true,
    list: true,
    stored: false,
    type: 'keyword'
  },
  'events.labels': {
    default: false,
    indexed: true,
    list: true,
    stored: false,
    type: 'keyword'
  },
  'events.labels_removed': {
    default: false,
    indexed: true,
    list: true,
    stored: false,
    type: 'keyword'
  },
  'events.priority': {
    default: false,
    indexed: true,
    list: true,
    stored: false,
    type: 'keyword'
  },
  'events.status': {
    default: false,
    indexed: true,
    list: true,
    stored: false,
    type: 'keyword'
  },
  'events.ts': {
    default: false,
    indexed: true,
    list: true,
    stored: false,
    type: 'date'
  },
  expiry_ts: {
    default: false,
    indexed: true,
    list: false,
    stored: false,
    type: 'date'
  },
  extended_scan: {
    default: false,
    indexed: true,
    list: false,
    stored: true,
    type: 'keyword'
  },
  'file.md5': {
    default: true,
    indexed: true,
    list: false,
    stored: true,
    type: 'keyword'
  },
  'file.name': {
    default: true,
    indexed: true,
    list: false,
    stored: true,
    type: 'keyword'
  },
  'file.screenshots.description': {
    default: false,
    indexed: true,
    list: true,
    stored: false,
    type: 'keyword'
  },
  'file.screenshots.img': {
    default: false,
    indexed: true,
    list: true,
    stored: false,
    type: 'keyword'
  },
  'file.screenshots.name': {
    default: false,
    indexed: true,
    list: true,
    stored: false,
    type: 'keyword'
  },
  'file.screenshots.thumb': {
    default: false,
    indexed: true,
    list: true,
    stored: false,
    type: 'keyword'
  },
  'file.sha1': {
    default: true,
    indexed: true,
    list: false,
    stored: true,
    type: 'keyword'
  },
  'file.sha256': {
    default: true,
    indexed: true,
    list: false,
    stored: true,
    type: 'keyword'
  },
  'file.size': {
    default: false,
    indexed: true,
    list: false,
    stored: false,
    type: 'long'
  },
  'file.type': {
    default: true,
    indexed: true,
    list: false,
    stored: true,
    type: 'keyword'
  },
  filtered: {
    default: false,
    indexed: true,
    list: false,
    stored: true,
    type: 'boolean'
  },
  'heuristic.name': {
    default: false,
    indexed: true,
    list: true,
    stored: false,
    type: 'keyword'
  },
  id: {
    default: true,
    indexed: true,
    list: false,
    stored: false,
    type: 'keyword'
  },
  label: {
    default: true,
    indexed: true,
    list: true,
    stored: true,
    type: 'keyword'
  },
  owner: {
    default: false,
    indexed: true,
    list: false,
    stored: true,
    type: 'keyword'
  },
  priority: {
    default: false,
    indexed: true,
    list: false,
    stored: true,
    type: 'keyword'
  },
  reporting_ts: {
    default: false,
    indexed: true,
    list: false,
    stored: true,
    type: 'date'
  },
  sid: {
    default: false,
    indexed: true,
    list: false,
    stored: true,
    type: 'keyword'
  },
  status: {
    default: false,
    indexed: true,
    list: false,
    stored: true,
    type: 'keyword'
  },
  'submission_relations.child': {
    default: false,
    indexed: true,
    list: true,
    stored: true,
    type: 'keyword'
  },
  'submission_relations.parent': {
    default: false,
    indexed: true,
    list: true,
    stored: true,
    type: 'keyword'
  },
  ts: {
    default: false,
    indexed: true,
    list: false,
    stored: true,
    type: 'date'
  },
  type: {
    default: false,
    indexed: true,
    list: false,
    stored: true,
    type: 'keyword'
  },
  'verdict.malicious': {
    default: false,
    indexed: true,
    list: true,
    stored: false,
    type: 'keyword'
  },
  'verdict.non_malicious': {
    default: false,
    indexed: true,
    list: true,
    stored: false,
    type: 'keyword'
  },
  workflows_completed: {
    default: false,
    indexed: true,
    list: false,
    stored: true,
    type: 'boolean'
  }
};

const MOCK_APIKEY_INDEX_DEFINITION: IndexDefinition = {
  acl: {
    default: false,
    indexed: true,
    list: true,
    stored: true,
    type: 'keyword'
  },
  creation_date: {
    default: false,
    indexed: true,
    list: false,
    stored: true,
    type: 'date'
  },
  expiry_ts: {
    default: false,
    indexed: true,
    list: false,
    stored: true,
    type: 'date'
  },
  id: {
    default: true,
    indexed: true,
    list: false,
    stored: false,
    type: 'keyword'
  },
  key_name: {
    default: true,
    indexed: true,
    list: false,
    stored: true,
    type: 'keyword'
  },
  last_used: {
    default: false,
    indexed: true,
    list: false,
    stored: true,
    type: 'date'
  },
  password: {
    default: false,
    indexed: true,
    list: false,
    stored: true,
    type: 'keyword'
  },
  roles: {
    default: false,
    indexed: true,
    list: true,
    stored: true,
    type: 'keyword'
  },
  uname: {
    default: true,
    indexed: true,
    list: false,
    stored: true,
    type: 'keyword'
  }
};

const MOCK_BADLIST_INDEX_DEFINITION: IndexDefinition = {
  added: {
    default: false,
    indexed: true,
    list: false,
    stored: true,
    type: 'date'
  },
  'attribution.actor': {
    default: true,
    indexed: true,
    list: true,
    stored: false,
    type: 'keyword'
  },
  'attribution.campaign': {
    default: true,
    indexed: true,
    list: true,
    stored: false,
    type: 'keyword'
  },
  'attribution.category': {
    default: true,
    indexed: true,
    list: true,
    stored: false,
    type: 'keyword'
  },
  'attribution.exploit': {
    default: true,
    indexed: true,
    list: true,
    stored: false,
    type: 'keyword'
  },
  'attribution.family': {
    default: true,
    indexed: true,
    list: true,
    stored: false,
    type: 'keyword'
  },
  'attribution.implant': {
    default: true,
    indexed: true,
    list: true,
    stored: false,
    type: 'keyword'
  },
  'attribution.network': {
    default: true,
    indexed: true,
    list: true,
    stored: false,
    type: 'keyword'
  },
  classification: {
    default: false,
    indexed: true,
    list: false,
    stored: true,
    type: 'keyword'
  },
  enabled: {
    default: false,
    indexed: true,
    list: false,
    stored: true,
    type: 'boolean'
  },
  expiry_ts: {
    default: false,
    indexed: true,
    list: false,
    stored: true,
    type: 'date'
  },
  'file.name': {
    default: true,
    indexed: true,
    list: true,
    stored: true,
    type: 'keyword'
  },
  'file.size': {
    default: false,
    indexed: true,
    list: false,
    stored: false,
    type: 'long'
  },
  'file.type': {
    default: false,
    indexed: true,
    list: false,
    stored: false,
    type: 'keyword'
  },
  'hashes.md5': {
    default: true,
    indexed: true,
    list: false,
    stored: true,
    type: 'keyword'
  },
  'hashes.sha1': {
    default: true,
    indexed: true,
    list: false,
    stored: true,
    type: 'keyword'
  },
  'hashes.sha256': {
    default: true,
    indexed: true,
    list: false,
    stored: true,
    type: 'keyword'
  },
  'hashes.ssdeep': {
    default: true,
    indexed: true,
    list: false,
    stored: true,
    type: 'keyword'
  },
  'hashes.tlsh': {
    default: true,
    indexed: true,
    list: false,
    stored: true,
    type: 'keyword'
  },
  id: {
    default: true,
    indexed: true,
    list: false,
    stored: false,
    type: 'keyword'
  },
  'sources.classification': {
    default: false,
    indexed: true,
    list: true,
    stored: false,
    type: 'keyword'
  },
  'sources.name': {
    default: false,
    indexed: true,
    list: true,
    stored: true,
    type: 'keyword'
  },
  'sources.reason': {
    default: false,
    indexed: true,
    list: true,
    stored: false,
    type: 'keyword'
  },
  'sources.type': {
    default: false,
    indexed: true,
    list: true,
    stored: false,
    type: 'keyword'
  },
  'tag.type': {
    default: false,
    indexed: true,
    list: false,
    stored: true,
    type: 'keyword'
  },
  'tag.value': {
    default: true,
    indexed: true,
    list: false,
    stored: true,
    type: 'keyword'
  },
  type: {
    default: false,
    indexed: true,
    list: false,
    stored: true,
    type: 'keyword'
  },
  updated: {
    default: false,
    indexed: true,
    list: false,
    stored: true,
    type: 'date'
  }
};

const MOCK_EMPTYRESULT_INDEX_DEFINITION: IndexDefinition = {
  expiry_ts: {
    default: false,
    indexed: true,
    list: false,
    stored: false,
    type: 'date'
  },
  id: {
    default: true,
    indexed: true,
    list: false,
    stored: false,
    type: 'keyword'
  }
};

const MOCK_ERROR_INDEX_DEFINITION: IndexDefinition = {
  archive_ts: {
    default: false,
    indexed: true,
    list: false,
    stored: true,
    type: 'date'
  },
  created: {
    default: false,
    indexed: true,
    list: false,
    stored: true,
    type: 'date'
  },
  expiry_ts: {
    default: false,
    indexed: true,
    list: false,
    stored: false,
    type: 'date'
  },
  id: {
    default: true,
    indexed: true,
    list: false,
    stored: false,
    type: 'keyword'
  },
  'response.message': {
    default: true,
    indexed: true,
    list: false,
    stored: true,
    type: 'text'
  },
  'response.service_debug_info': {
    default: false,
    indexed: true,
    list: false,
    stored: true,
    type: 'keyword'
  },
  'response.service_name': {
    default: true,
    indexed: true,
    list: false,
    stored: true,
    type: 'keyword'
  },
  'response.service_tool_version': {
    default: true,
    indexed: true,
    list: false,
    stored: true,
    type: 'keyword'
  },
  'response.service_version': {
    default: false,
    indexed: true,
    list: false,
    stored: true,
    type: 'keyword'
  },
  'response.status': {
    default: false,
    indexed: true,
    list: false,
    stored: true,
    type: 'keyword'
  },
  sha256: {
    default: true,
    indexed: true,
    list: false,
    stored: true,
    type: 'keyword'
  },
  type: {
    default: false,
    indexed: true,
    list: false,
    stored: true,
    type: 'keyword'
  }
};

const MOCK_FILE_INDEX_DEFINITION: IndexDefinition = {
  archive_ts: {
    default: false,
    indexed: true,
    list: false,
    stored: true,
    type: 'date'
  },
  ascii: {
    default: false,
    indexed: false,
    list: false,
    stored: false,
    type: 'keyword'
  },
  classification: {
    default: false,
    indexed: true,
    list: false,
    stored: true,
    type: 'keyword'
  },
  'comments.cid': {
    default: false,
    indexed: true,
    list: true,
    stored: false,
    type: 'keyword'
  },
  'comments.date': {
    default: false,
    indexed: true,
    list: true,
    stored: true,
    type: 'date'
  },
  'comments.reactions.icon': {
    default: false,
    indexed: true,
    list: true,
    stored: false,
    type: 'keyword'
  },
  'comments.reactions.uname': {
    default: false,
    indexed: true,
    list: true,
    stored: false,
    type: 'keyword'
  },
  'comments.text': {
    default: false,
    indexed: true,
    list: true,
    stored: false,
    type: 'text'
  },
  'comments.uname': {
    default: false,
    indexed: true,
    list: true,
    stored: false,
    type: 'keyword'
  },
  entropy: {
    default: false,
    indexed: true,
    list: false,
    stored: true,
    type: 'float'
  },
  expiry_ts: {
    default: false,
    indexed: true,
    list: false,
    stored: false,
    type: 'date'
  },
  from_archive: {
    default: false,
    indexed: false,
    list: false,
    stored: false,
    type: 'boolean'
  },
  hex: {
    default: false,
    indexed: false,
    list: false,
    stored: false,
    type: 'keyword'
  },
  id: {
    default: true,
    indexed: true,
    list: false,
    stored: false,
    type: 'keyword'
  },
  is_section_image: {
    default: false,
    indexed: true,
    list: false,
    stored: true,
    type: 'boolean'
  },
  is_supplementary: {
    default: false,
    indexed: true,
    list: false,
    stored: true,
    type: 'boolean'
  },
  'label_categories.attribution': {
    default: false,
    indexed: true,
    list: true,
    stored: true,
    type: 'keyword'
  },
  'label_categories.info': {
    default: false,
    indexed: true,
    list: true,
    stored: true,
    type: 'keyword'
  },
  'label_categories.technique': {
    default: false,
    indexed: true,
    list: true,
    stored: true,
    type: 'keyword'
  },
  labels: {
    default: true,
    indexed: true,
    list: true,
    stored: true,
    type: 'keyword'
  },
  magic: {
    default: false,
    indexed: true,
    list: false,
    stored: false,
    type: 'keyword'
  },
  md5: {
    default: true,
    indexed: true,
    list: false,
    stored: true,
    type: 'keyword'
  },
  mime: {
    default: false,
    indexed: true,
    list: false,
    stored: false,
    type: 'keyword'
  },
  'seen.count': {
    default: false,
    indexed: true,
    list: false,
    stored: true,
    type: 'integer'
  },
  'seen.first': {
    default: false,
    indexed: true,
    list: false,
    stored: true,
    type: 'date'
  },
  'seen.last': {
    default: false,
    indexed: true,
    list: false,
    stored: true,
    type: 'date'
  },
  sha1: {
    default: true,
    indexed: true,
    list: false,
    stored: true,
    type: 'keyword'
  },
  sha256: {
    default: true,
    indexed: true,
    list: false,
    stored: true,
    type: 'keyword'
  },
  size: {
    default: false,
    indexed: true,
    list: false,
    stored: true,
    type: 'long'
  },
  ssdeep: {
    default: false,
    indexed: true,
    list: false,
    stored: false,
    type: 'keyword'
  },
  tlsh: {
    default: true,
    indexed: true,
    list: false,
    stored: true,
    type: 'keyword'
  },
  type: {
    default: true,
    indexed: true,
    list: false,
    stored: true,
    type: 'keyword'
  },
  'uri_info.fragment': {
    default: false,
    indexed: true,
    list: false,
    stored: true,
    type: 'keyword'
  },
  'uri_info.hostname': {
    default: false,
    indexed: true,
    list: false,
    stored: true,
    type: 'keyword'
  },
  'uri_info.netloc': {
    default: false,
    indexed: true,
    list: false,
    stored: true,
    type: 'keyword'
  },
  'uri_info.params': {
    default: false,
    indexed: true,
    list: false,
    stored: true,
    type: 'keyword'
  },
  'uri_info.password': {
    default: false,
    indexed: true,
    list: false,
    stored: true,
    type: 'keyword'
  },
  'uri_info.path': {
    default: false,
    indexed: true,
    list: false,
    stored: true,
    type: 'keyword'
  },
  'uri_info.port': {
    default: false,
    indexed: true,
    list: false,
    stored: true,
    type: 'integer'
  },
  'uri_info.query': {
    default: false,
    indexed: true,
    list: false,
    stored: true,
    type: 'keyword'
  },
  'uri_info.scheme': {
    default: false,
    indexed: true,
    list: false,
    stored: true,
    type: 'keyword'
  },
  'uri_info.uri': {
    default: false,
    indexed: true,
    list: false,
    stored: true,
    type: 'keyword'
  },
  'uri_info.username': {
    default: false,
    indexed: true,
    list: false,
    stored: true,
    type: 'keyword'
  }
};

const MOCK_HEURISTIC_INDEX_DEFINITION: IndexDefinition = {
  attack_id: {
    default: true,
    indexed: true,
    list: true,
    stored: true,
    type: 'keyword'
  },
  classification: {
    default: false,
    indexed: true,
    list: false,
    stored: true,
    type: 'keyword'
  },
  description: {
    default: true,
    indexed: true,
    list: false,
    stored: true,
    type: 'text'
  },
  filetype: {
    default: true,
    indexed: true,
    list: false,
    stored: true,
    type: 'keyword'
  },
  heur_id: {
    default: true,
    indexed: true,
    list: false,
    stored: true,
    type: 'keyword'
  },
  id: {
    default: true,
    indexed: true,
    list: false,
    stored: false,
    type: 'keyword'
  },
  max_score: {
    default: false,
    indexed: true,
    list: false,
    stored: true,
    type: 'integer'
  },
  name: {
    default: true,
    indexed: true,
    list: false,
    stored: true,
    type: 'keyword'
  },
  score: {
    default: false,
    indexed: true,
    list: false,
    stored: true,
    type: 'integer'
  },
  'signature_score_map.key_a': {
    default: false,
    indexed: true,
    list: false,
    stored: false,
    type: 'integer'
  },
  'signature_score_map.key_b': {
    default: false,
    indexed: true,
    list: false,
    stored: false,
    type: 'integer'
  },
  'signature_score_map.key_c': {
    default: false,
    indexed: true,
    list: false,
    stored: false,
    type: 'integer'
  },
  'signature_score_map.key_d': {
    default: false,
    indexed: true,
    list: false,
    stored: false,
    type: 'integer'
  },
  'signature_score_map.key_e': {
    default: false,
    indexed: true,
    list: false,
    stored: false,
    type: 'integer'
  },
  'stats.avg': {
    default: false,
    indexed: true,
    list: false,
    stored: true,
    type: 'integer'
  },
  'stats.count': {
    default: false,
    indexed: true,
    list: false,
    stored: true,
    type: 'integer'
  },
  'stats.first_hit': {
    default: false,
    indexed: true,
    list: false,
    stored: true,
    type: 'date'
  },
  'stats.last_hit': {
    default: false,
    indexed: true,
    list: false,
    stored: true,
    type: 'date'
  },
  'stats.max': {
    default: false,
    indexed: true,
    list: false,
    stored: true,
    type: 'integer'
  },
  'stats.min': {
    default: false,
    indexed: true,
    list: false,
    stored: true,
    type: 'integer'
  },
  'stats.sum': {
    default: false,
    indexed: true,
    list: false,
    stored: true,
    type: 'integer'
  }
};

const MOCK_RESULT_INDEX_DEFINITION: IndexDefinition = {
  archive_ts: {
    default: false,
    indexed: true,
    list: false,
    stored: true,
    type: 'date'
  },
  classification: {
    default: false,
    indexed: true,
    list: false,
    stored: true,
    type: 'keyword'
  },
  created: {
    default: false,
    indexed: true,
    list: false,
    stored: true,
    type: 'date'
  },
  drop_file: {
    default: false,
    indexed: true,
    list: false,
    stored: true,
    type: 'boolean'
  },
  expiry_ts: {
    default: false,
    indexed: true,
    list: false,
    stored: false,
    type: 'date'
  },
  from_archive: {
    default: false,
    indexed: false,
    list: false,
    stored: true,
    type: 'boolean'
  },
  id: {
    default: true,
    indexed: true,
    list: false,
    stored: false,
    type: 'keyword'
  },
  partial: {
    default: false,
    indexed: true,
    list: false,
    stored: true,
    type: 'boolean'
  },
  'response.extracted.allow_dynamic_recursion': {
    default: false,
    indexed: true,
    list: true,
    stored: false,
    type: 'boolean'
  },
  'response.extracted.classification': {
    default: false,
    indexed: true,
    list: true,
    stored: false,
    type: 'keyword'
  },
  'response.extracted.description': {
    default: true,
    indexed: true,
    list: true,
    stored: false,
    type: 'text'
  },
  'response.extracted.is_section_image': {
    default: false,
    indexed: true,
    list: true,
    stored: false,
    type: 'boolean'
  },
  'response.extracted.name': {
    default: true,
    indexed: true,
    list: true,
    stored: false,
    type: 'keyword'
  },
  'response.extracted.parent_relation': {
    default: false,
    indexed: true,
    list: true,
    stored: false,
    type: 'text'
  },
  'response.extracted.sha256': {
    default: true,
    indexed: true,
    list: true,
    stored: false,
    type: 'keyword'
  },
  'response.milestones.service_completed': {
    default: false,
    indexed: false,
    list: false,
    stored: false,
    type: 'date'
  },
  'response.milestones.service_started': {
    default: false,
    indexed: false,
    list: false,
    stored: false,
    type: 'date'
  },
  'response.service_context': {
    default: false,
    indexed: false,
    list: false,
    stored: false,
    type: 'keyword'
  },
  'response.service_debug_info': {
    default: false,
    indexed: false,
    list: false,
    stored: false,
    type: 'keyword'
  },
  'response.service_name': {
    default: true,
    indexed: true,
    list: false,
    stored: true,
    type: 'keyword'
  },
  'response.service_tool_version': {
    default: true,
    indexed: true,
    list: false,
    stored: true,
    type: 'keyword'
  },
  'response.service_version': {
    default: false,
    indexed: true,
    list: false,
    stored: false,
    type: 'keyword'
  },
  'response.supplementary.allow_dynamic_recursion': {
    default: false,
    indexed: true,
    list: true,
    stored: false,
    type: 'boolean'
  },
  'response.supplementary.classification': {
    default: false,
    indexed: true,
    list: true,
    stored: false,
    type: 'keyword'
  },
  'response.supplementary.description': {
    default: true,
    indexed: true,
    list: true,
    stored: false,
    type: 'text'
  },
  'response.supplementary.is_section_image': {
    default: false,
    indexed: true,
    list: true,
    stored: false,
    type: 'boolean'
  },
  'response.supplementary.name': {
    default: true,
    indexed: true,
    list: true,
    stored: false,
    type: 'keyword'
  },
  'response.supplementary.parent_relation': {
    default: false,
    indexed: true,
    list: true,
    stored: false,
    type: 'text'
  },
  'response.supplementary.sha256': {
    default: true,
    indexed: true,
    list: true,
    stored: false,
    type: 'keyword'
  },
  'result.score': {
    default: false,
    indexed: true,
    list: false,
    stored: true,
    type: 'integer'
  },
  'result.sections.auto_collapse': {
    default: false,
    indexed: true,
    list: true,
    stored: false,
    type: 'boolean'
  },
  'result.sections.body': {
    default: true,
    indexed: true,
    list: true,
    stored: false,
    type: 'text'
  },
  'result.sections.body_config': {
    default: false,
    indexed: false,
    list: true,
    stored: false,
    type: 'object'
  },
  'result.sections.body_format': {
    default: false,
    indexed: false,
    list: true,
    stored: false,
    type: 'keyword'
  },
  'result.sections.classification': {
    default: false,
    indexed: true,
    list: true,
    stored: false,
    type: 'keyword'
  },
  'result.sections.depth': {
    default: false,
    indexed: false,
    list: true,
    stored: false,
    type: 'integer'
  },
  'result.sections.heuristic.attack.attack_id': {
    default: true,
    indexed: true,
    list: true,
    stored: false,
    type: 'keyword'
  },
  'result.sections.heuristic.attack.categories': {
    default: false,
    indexed: true,
    list: true,
    stored: false,
    type: 'keyword'
  },
  'result.sections.heuristic.attack.pattern': {
    default: true,
    indexed: true,
    list: true,
    stored: false,
    type: 'keyword'
  },
  'result.sections.heuristic.heur_id': {
    default: true,
    indexed: true,
    list: true,
    stored: false,
    type: 'keyword'
  },
  'result.sections.heuristic.name': {
    default: true,
    indexed: true,
    list: true,
    stored: false,
    type: 'keyword'
  },
  'result.sections.heuristic.score': {
    default: false,
    indexed: true,
    list: true,
    stored: false,
    type: 'integer'
  },
  'result.sections.heuristic.signature.frequency': {
    default: false,
    indexed: true,
    list: true,
    stored: false,
    type: 'integer'
  },
  'result.sections.heuristic.signature.name': {
    default: true,
    indexed: true,
    list: true,
    stored: false,
    type: 'keyword'
  },
  'result.sections.heuristic.signature.safe': {
    default: false,
    indexed: true,
    list: true,
    stored: false,
    type: 'boolean'
  },
  'result.sections.promote_to': {
    default: false,
    indexed: true,
    list: true,
    stored: false,
    type: 'keyword'
  },
  'result.sections.tags.attribution.actor': {
    default: true,
    indexed: true,
    list: true,
    stored: false,
    type: 'keyword'
  },
  'result.sections.tags.attribution.campaign': {
    default: true,
    indexed: true,
    list: true,
    stored: false,
    type: 'keyword'
  },
  'result.sections.tags.attribution.category': {
    default: true,
    indexed: true,
    list: true,
    stored: false,
    type: 'keyword'
  },
  'result.sections.tags.attribution.exploit': {
    default: true,
    indexed: true,
    list: true,
    stored: false,
    type: 'keyword'
  },
  'result.sections.tags.attribution.family': {
    default: true,
    indexed: true,
    list: true,
    stored: false,
    type: 'keyword'
  },
  'result.sections.tags.attribution.implant': {
    default: true,
    indexed: true,
    list: true,
    stored: false,
    type: 'keyword'
  },
  'result.sections.tags.attribution.network': {
    default: true,
    indexed: true,
    list: true,
    stored: false,
    type: 'keyword'
  },
  'result.sections.tags.av.heuristic': {
    default: true,
    indexed: true,
    list: true,
    stored: false,
    type: 'keyword'
  },
  'result.sections.tags.av.virus_name': {
    default: true,
    indexed: true,
    list: true,
    stored: false,
    type: 'keyword'
  },
  'result.sections.tags.cert.extended_key_usage': {
    default: true,
    indexed: true,
    list: true,
    stored: false,
    type: 'keyword'
  },
  'result.sections.tags.cert.issuer': {
    default: true,
    indexed: true,
    list: true,
    stored: false,
    type: 'keyword'
  },
  'result.sections.tags.cert.key_usage': {
    default: true,
    indexed: true,
    list: true,
    stored: false,
    type: 'keyword'
  },
  'result.sections.tags.cert.owner': {
    default: true,
    indexed: true,
    list: true,
    stored: false,
    type: 'keyword'
  },
  'result.sections.tags.cert.serial_no': {
    default: true,
    indexed: true,
    list: true,
    stored: false,
    type: 'keyword'
  },
  'result.sections.tags.cert.signature_algo': {
    default: true,
    indexed: true,
    list: true,
    stored: false,
    type: 'keyword'
  },
  'result.sections.tags.cert.subject': {
    default: true,
    indexed: true,
    list: true,
    stored: false,
    type: 'keyword'
  },
  'result.sections.tags.cert.subject_alt_name': {
    default: true,
    indexed: true,
    list: true,
    stored: false,
    type: 'keyword'
  },
  'result.sections.tags.cert.thumbprint': {
    default: true,
    indexed: true,
    list: true,
    stored: false,
    type: 'keyword'
  },
  'result.sections.tags.cert.valid.end': {
    default: true,
    indexed: true,
    list: true,
    stored: false,
    type: 'keyword'
  },
  'result.sections.tags.cert.valid.start': {
    default: true,
    indexed: true,
    list: true,
    stored: false,
    type: 'keyword'
  },
  'result.sections.tags.cert.version': {
    default: true,
    indexed: true,
    list: true,
    stored: false,
    type: 'keyword'
  },
  'result.sections.tags.dynamic.autorun_location': {
    default: true,
    indexed: true,
    list: true,
    stored: false,
    type: 'keyword'
  },
  'result.sections.tags.dynamic.dos_device': {
    default: true,
    indexed: true,
    list: true,
    stored: false,
    type: 'keyword'
  },
  'result.sections.tags.dynamic.mutex': {
    default: true,
    indexed: true,
    list: true,
    stored: false,
    type: 'keyword'
  },
  'result.sections.tags.dynamic.operating_system.platform': {
    default: true,
    indexed: true,
    list: true,
    stored: false,
    type: 'keyword'
  },
  'result.sections.tags.dynamic.operating_system.processor': {
    default: true,
    indexed: true,
    list: true,
    stored: false,
    type: 'keyword'
  },
  'result.sections.tags.dynamic.operating_system.version': {
    default: true,
    indexed: true,
    list: true,
    stored: false,
    type: 'keyword'
  },
  'result.sections.tags.dynamic.process.command_line': {
    default: true,
    indexed: true,
    list: true,
    stored: false,
    type: 'keyword'
  },
  'result.sections.tags.dynamic.process.file_name': {
    default: true,
    indexed: true,
    list: true,
    stored: false,
    type: 'keyword'
  },
  'result.sections.tags.dynamic.process.shortcut': {
    default: true,
    indexed: true,
    list: true,
    stored: false,
    type: 'keyword'
  },
  'result.sections.tags.dynamic.processtree_id': {
    default: true,
    indexed: true,
    list: true,
    stored: false,
    type: 'keyword'
  },
  'result.sections.tags.dynamic.registry_key': {
    default: true,
    indexed: true,
    list: true,
    stored: false,
    type: 'keyword'
  },
  'result.sections.tags.dynamic.signature.category': {
    default: true,
    indexed: true,
    list: true,
    stored: false,
    type: 'keyword'
  },
  'result.sections.tags.dynamic.signature.family': {
    default: true,
    indexed: true,
    list: true,
    stored: false,
    type: 'keyword'
  },
  'result.sections.tags.dynamic.signature.name': {
    default: true,
    indexed: true,
    list: true,
    stored: false,
    type: 'keyword'
  },
  'result.sections.tags.dynamic.ssdeep.cls_ids': {
    default: true,
    indexed: true,
    list: true,
    stored: false,
    type: 'keyword'
  },
  'result.sections.tags.dynamic.ssdeep.dynamic_classes': {
    default: true,
    indexed: true,
    list: true,
    stored: false,
    type: 'keyword'
  },
  'result.sections.tags.dynamic.ssdeep.regkeys': {
    default: true,
    indexed: true,
    list: true,
    stored: false,
    type: 'keyword'
  },
  'result.sections.tags.dynamic.window.cls_ids': {
    default: true,
    indexed: true,
    list: true,
    stored: false,
    type: 'keyword'
  },
  'result.sections.tags.dynamic.window.dynamic_classes': {
    default: true,
    indexed: true,
    list: true,
    stored: false,
    type: 'keyword'
  },
  'result.sections.tags.dynamic.window.regkeys': {
    default: true,
    indexed: true,
    list: true,
    stored: false,
    type: 'keyword'
  },
  'result.sections.tags.file.ancestry': {
    default: true,
    indexed: true,
    list: true,
    stored: false,
    type: 'keyword'
  },
  'result.sections.tags.file.apk.activity': {
    default: true,
    indexed: true,
    list: true,
    stored: false,
    type: 'keyword'
  },
  'result.sections.tags.file.apk.app.label': {
    default: true,
    indexed: true,
    list: true,
    stored: false,
    type: 'keyword'
  },
  'result.sections.tags.file.apk.app.version': {
    default: true,
    indexed: true,
    list: true,
    stored: false,
    type: 'keyword'
  },
  'result.sections.tags.file.apk.feature': {
    default: true,
    indexed: true,
    list: true,
    stored: false,
    type: 'keyword'
  },
  'result.sections.tags.file.apk.locale': {
    default: true,
    indexed: true,
    list: true,
    stored: false,
    type: 'keyword'
  },
  'result.sections.tags.file.apk.permission': {
    default: true,
    indexed: true,
    list: true,
    stored: false,
    type: 'keyword'
  },
  'result.sections.tags.file.apk.pkg_name': {
    default: true,
    indexed: true,
    list: true,
    stored: false,
    type: 'keyword'
  },
  'result.sections.tags.file.apk.provides_component': {
    default: true,
    indexed: true,
    list: true,
    stored: false,
    type: 'keyword'
  },
  'result.sections.tags.file.apk.sdk.min': {
    default: true,
    indexed: true,
    list: true,
    stored: false,
    type: 'keyword'
  },
  'result.sections.tags.file.apk.sdk.target': {
    default: true,
    indexed: true,
    list: true,
    stored: false,
    type: 'keyword'
  },
  'result.sections.tags.file.apk.used_library': {
    default: true,
    indexed: true,
    list: true,
    stored: false,
    type: 'keyword'
  },
  'result.sections.tags.file.behavior': {
    default: true,
    indexed: true,
    list: true,
    stored: false,
    type: 'keyword'
  },
  'result.sections.tags.file.compiler': {
    default: true,
    indexed: true,
    list: true,
    stored: false,
    type: 'keyword'
  },
  'result.sections.tags.file.config': {
    default: true,
    indexed: true,
    list: true,
    stored: false,
    type: 'keyword'
  },
  'result.sections.tags.file.date.creation': {
    default: true,
    indexed: true,
    list: true,
    stored: false,
    type: 'keyword'
  },
  'result.sections.tags.file.date.last_modified': {
    default: true,
    indexed: true,
    list: true,
    stored: false,
    type: 'keyword'
  },
  'result.sections.tags.file.elf.interpreter': {
    default: true,
    indexed: true,
    list: true,
    stored: false,
    type: 'keyword'
  },
  'result.sections.tags.file.elf.libraries': {
    default: true,
    indexed: true,
    list: true,
    stored: false,
    type: 'keyword'
  },
  'result.sections.tags.file.elf.notes.name': {
    default: true,
    indexed: true,
    list: true,
    stored: false,
    type: 'keyword'
  },
  'result.sections.tags.file.elf.notes.type': {
    default: true,
    indexed: true,
    list: true,
    stored: false,
    type: 'keyword'
  },
  'result.sections.tags.file.elf.notes.type_core': {
    default: true,
    indexed: true,
    list: true,
    stored: false,
    type: 'keyword'
  },
  'result.sections.tags.file.elf.sections.name': {
    default: true,
    indexed: true,
    list: true,
    stored: false,
    type: 'keyword'
  },
  'result.sections.tags.file.elf.segments.type': {
    default: true,
    indexed: true,
    list: true,
    stored: false,
    type: 'keyword'
  },
  'result.sections.tags.file.img.exif_tool.creator_tool': {
    default: true,
    indexed: true,
    list: true,
    stored: false,
    type: 'keyword'
  },
  'result.sections.tags.file.img.exif_tool.derived_document_id': {
    default: true,
    indexed: true,
    list: true,
    stored: false,
    type: 'keyword'
  },
  'result.sections.tags.file.img.exif_tool.document_id': {
    default: true,
    indexed: true,
    list: true,
    stored: false,
    type: 'keyword'
  },
  'result.sections.tags.file.img.exif_tool.instance_id': {
    default: true,
    indexed: true,
    list: true,
    stored: false,
    type: 'keyword'
  },
  'result.sections.tags.file.img.exif_tool.toolkit': {
    default: true,
    indexed: true,
    list: true,
    stored: false,
    type: 'keyword'
  },
  'result.sections.tags.file.img.mega_pixels': {
    default: true,
    indexed: true,
    list: true,
    stored: false,
    type: 'keyword'
  },
  'result.sections.tags.file.img.mode': {
    default: true,
    indexed: true,
    list: true,
    stored: false,
    type: 'keyword'
  },
  'result.sections.tags.file.img.size': {
    default: true,
    indexed: true,
    list: true,
    stored: false,
    type: 'keyword'
  },
  'result.sections.tags.file.img.sorted_metadata_hash': {
    default: true,
    indexed: true,
    list: true,
    stored: false,
    type: 'keyword'
  },
  'result.sections.tags.file.jar.imported_package': {
    default: true,
    indexed: true,
    list: true,
    stored: false,
    type: 'keyword'
  },
  'result.sections.tags.file.jar.main_class': {
    default: true,
    indexed: true,
    list: true,
    stored: false,
    type: 'keyword'
  },
  'result.sections.tags.file.jar.main_package': {
    default: true,
    indexed: true,
    list: true,
    stored: false,
    type: 'keyword'
  },
  'result.sections.tags.file.lib': {
    default: true,
    indexed: true,
    list: true,
    stored: false,
    type: 'keyword'
  },
  'result.sections.tags.file.lsh': {
    default: true,
    indexed: true,
    list: true,
    stored: false,
    type: 'keyword'
  },
  'result.sections.tags.file.name.anomaly': {
    default: true,
    indexed: true,
    list: true,
    stored: false,
    type: 'keyword'
  },
  'result.sections.tags.file.name.extracted': {
    default: true,
    indexed: true,
    list: true,
    stored: false,
    type: 'keyword'
  },
  'result.sections.tags.file.ole.clsid': {
    default: true,
    indexed: true,
    list: true,
    stored: false,
    type: 'keyword'
  },
  'result.sections.tags.file.ole.dde_link': {
    default: true,
    indexed: true,
    list: true,
    stored: false,
    type: 'keyword'
  },
  'result.sections.tags.file.ole.fib_timestamp': {
    default: true,
    indexed: true,
    list: true,
    stored: false,
    type: 'keyword'
  },
  'result.sections.tags.file.ole.macro.sha256': {
    default: true,
    indexed: true,
    list: true,
    stored: false,
    type: 'keyword'
  },
  'result.sections.tags.file.ole.macro.suspicious_string': {
    default: true,
    indexed: true,
    list: true,
    stored: false,
    type: 'keyword'
  },
  'result.sections.tags.file.ole.summary.author': {
    default: true,
    indexed: true,
    list: true,
    stored: false,
    type: 'keyword'
  },
  'result.sections.tags.file.ole.summary.codepage': {
    default: true,
    indexed: true,
    list: true,
    stored: false,
    type: 'keyword'
  },
  'result.sections.tags.file.ole.summary.comment': {
    default: true,
    indexed: true,
    list: true,
    stored: false,
    type: 'keyword'
  },
  'result.sections.tags.file.ole.summary.company': {
    default: true,
    indexed: true,
    list: true,
    stored: false,
    type: 'keyword'
  },
  'result.sections.tags.file.ole.summary.create_time': {
    default: true,
    indexed: true,
    list: true,
    stored: false,
    type: 'keyword'
  },
  'result.sections.tags.file.ole.summary.last_printed': {
    default: true,
    indexed: true,
    list: true,
    stored: false,
    type: 'keyword'
  },
  'result.sections.tags.file.ole.summary.last_saved_by': {
    default: true,
    indexed: true,
    list: true,
    stored: false,
    type: 'keyword'
  },
  'result.sections.tags.file.ole.summary.last_saved_time': {
    default: true,
    indexed: true,
    list: true,
    stored: false,
    type: 'keyword'
  },
  'result.sections.tags.file.ole.summary.manager': {
    default: true,
    indexed: true,
    list: true,
    stored: false,
    type: 'keyword'
  },
  'result.sections.tags.file.ole.summary.subject': {
    default: true,
    indexed: true,
    list: true,
    stored: false,
    type: 'keyword'
  },
  'result.sections.tags.file.ole.summary.title': {
    default: true,
    indexed: true,
    list: true,
    stored: false,
    type: 'keyword'
  },
  'result.sections.tags.file.path': {
    default: true,
    indexed: true,
    list: true,
    stored: false,
    type: 'keyword'
  },
  'result.sections.tags.file.pdf.date.modified': {
    default: true,
    indexed: true,
    list: true,
    stored: false,
    type: 'keyword'
  },
  'result.sections.tags.file.pdf.date.pdfx': {
    default: true,
    indexed: true,
    list: true,
    stored: false,
    type: 'keyword'
  },
  'result.sections.tags.file.pdf.date.source_modified': {
    default: true,
    indexed: true,
    list: true,
    stored: false,
    type: 'keyword'
  },
  'result.sections.tags.file.pdf.javascript.sha1': {
    default: true,
    indexed: true,
    list: true,
    stored: false,
    type: 'keyword'
  },
  'result.sections.tags.file.pdf.stats.sha1': {
    default: true,
    indexed: true,
    list: true,
    stored: false,
    type: 'keyword'
  },
  'result.sections.tags.file.pe.api_vector': {
    default: true,
    indexed: true,
    list: true,
    stored: false,
    type: 'keyword'
  },
  'result.sections.tags.file.pe.authenticode.spc_sp_opus_info.program_name': {
    default: true,
    indexed: true,
    list: true,
    stored: false,
    type: 'keyword'
  },
  'result.sections.tags.file.pe.debug.guid': {
    default: true,
    indexed: true,
    list: true,
    stored: false,
    type: 'keyword'
  },
  'result.sections.tags.file.pe.exports.function_name': {
    default: true,
    indexed: true,
    list: true,
    stored: false,
    type: 'keyword'
  },
  'result.sections.tags.file.pe.exports.module_name': {
    default: true,
    indexed: true,
    list: true,
    stored: false,
    type: 'keyword'
  },
  'result.sections.tags.file.pe.imports.fuzzy': {
    default: true,
    indexed: true,
    list: true,
    stored: false,
    type: 'keyword'
  },
  'result.sections.tags.file.pe.imports.gimphash': {
    default: true,
    indexed: true,
    list: true,
    stored: false,
    type: 'keyword'
  },
  'result.sections.tags.file.pe.imports.imphash': {
    default: true,
    indexed: true,
    list: true,
    stored: false,
    type: 'keyword'
  },
  'result.sections.tags.file.pe.imports.md5': {
    default: true,
    indexed: true,
    list: true,
    stored: false,
    type: 'keyword'
  },
  'result.sections.tags.file.pe.imports.sorted_fuzzy': {
    default: true,
    indexed: true,
    list: true,
    stored: false,
    type: 'keyword'
  },
  'result.sections.tags.file.pe.imports.sorted_sha1': {
    default: true,
    indexed: true,
    list: true,
    stored: false,
    type: 'keyword'
  },
  'result.sections.tags.file.pe.imports.suspicious': {
    default: true,
    indexed: true,
    list: true,
    stored: false,
    type: 'keyword'
  },
  'result.sections.tags.file.pe.linker.timestamp': {
    default: true,
    indexed: true,
    list: true,
    stored: false,
    type: 'keyword'
  },
  'result.sections.tags.file.pe.oep.bytes': {
    default: true,
    indexed: true,
    list: true,
    stored: false,
    type: 'keyword'
  },
  'result.sections.tags.file.pe.oep.hexdump': {
    default: true,
    indexed: true,
    list: true,
    stored: false,
    type: 'keyword'
  },
  'result.sections.tags.file.pe.pdb_filename': {
    default: true,
    indexed: true,
    list: true,
    stored: false,
    type: 'keyword'
  },
  'result.sections.tags.file.pe.resources.language': {
    default: true,
    indexed: true,
    list: true,
    stored: false,
    type: 'keyword'
  },
  'result.sections.tags.file.pe.resources.name': {
    default: true,
    indexed: true,
    list: true,
    stored: false,
    type: 'keyword'
  },
  'result.sections.tags.file.pe.rich_header.hash': {
    default: true,
    indexed: true,
    list: true,
    stored: false,
    type: 'keyword'
  },
  'result.sections.tags.file.pe.sections.hash': {
    default: true,
    indexed: true,
    list: true,
    stored: false,
    type: 'keyword'
  },
  'result.sections.tags.file.pe.sections.name': {
    default: true,
    indexed: true,
    list: true,
    stored: false,
    type: 'keyword'
  },
  'result.sections.tags.file.pe.versions.description': {
    default: true,
    indexed: true,
    list: true,
    stored: false,
    type: 'keyword'
  },
  'result.sections.tags.file.pe.versions.filename': {
    default: true,
    indexed: true,
    list: true,
    stored: false,
    type: 'keyword'
  },
  'result.sections.tags.file.plist.build.machine_os': {
    default: true,
    indexed: true,
    list: true,
    stored: false,
    type: 'keyword'
  },
  'result.sections.tags.file.plist.cf_bundle.development_region': {
    default: true,
    indexed: true,
    list: true,
    stored: false,
    type: 'keyword'
  },
  'result.sections.tags.file.plist.cf_bundle.display_name': {
    default: true,
    indexed: true,
    list: true,
    stored: false,
    type: 'keyword'
  },
  'result.sections.tags.file.plist.cf_bundle.executable': {
    default: true,
    indexed: true,
    list: true,
    stored: false,
    type: 'keyword'
  },
  'result.sections.tags.file.plist.cf_bundle.identifier': {
    default: true,
    indexed: true,
    list: true,
    stored: false,
    type: 'keyword'
  },
  'result.sections.tags.file.plist.cf_bundle.name': {
    default: true,
    indexed: true,
    list: true,
    stored: false,
    type: 'keyword'
  },
  'result.sections.tags.file.plist.cf_bundle.pkg_type': {
    default: true,
    indexed: true,
    list: true,
    stored: false,
    type: 'keyword'
  },
  'result.sections.tags.file.plist.cf_bundle.signature': {
    default: true,
    indexed: true,
    list: true,
    stored: false,
    type: 'keyword'
  },
  'result.sections.tags.file.plist.cf_bundle.url_scheme': {
    default: true,
    indexed: true,
    list: true,
    stored: false,
    type: 'keyword'
  },
  'result.sections.tags.file.plist.cf_bundle.version.long': {
    default: true,
    indexed: true,
    list: true,
    stored: false,
    type: 'keyword'
  },
  'result.sections.tags.file.plist.cf_bundle.version.short': {
    default: true,
    indexed: true,
    list: true,
    stored: false,
    type: 'keyword'
  },
  'result.sections.tags.file.plist.dt.compiler': {
    default: true,
    indexed: true,
    list: true,
    stored: false,
    type: 'keyword'
  },
  'result.sections.tags.file.plist.dt.platform.build': {
    default: true,
    indexed: true,
    list: true,
    stored: false,
    type: 'keyword'
  },
  'result.sections.tags.file.plist.dt.platform.name': {
    default: true,
    indexed: true,
    list: true,
    stored: false,
    type: 'keyword'
  },
  'result.sections.tags.file.plist.dt.platform.version': {
    default: true,
    indexed: true,
    list: true,
    stored: false,
    type: 'keyword'
  },
  'result.sections.tags.file.plist.installer_url': {
    default: true,
    indexed: true,
    list: true,
    stored: false,
    type: 'keyword'
  },
  'result.sections.tags.file.plist.ls.background_only': {
    default: true,
    indexed: true,
    list: true,
    stored: false,
    type: 'keyword'
  },
  'result.sections.tags.file.plist.ls.min_system_version': {
    default: true,
    indexed: true,
    list: true,
    stored: false,
    type: 'keyword'
  },
  'result.sections.tags.file.plist.min_os_version': {
    default: true,
    indexed: true,
    list: true,
    stored: false,
    type: 'keyword'
  },
  'result.sections.tags.file.plist.ns.apple_script_enabled': {
    default: true,
    indexed: true,
    list: true,
    stored: false,
    type: 'keyword'
  },
  'result.sections.tags.file.plist.ns.principal_class': {
    default: true,
    indexed: true,
    list: true,
    stored: false,
    type: 'keyword'
  },
  'result.sections.tags.file.plist.requests_open_access': {
    default: true,
    indexed: true,
    list: true,
    stored: false,
    type: 'keyword'
  },
  'result.sections.tags.file.plist.ui.background_modes': {
    default: true,
    indexed: true,
    list: true,
    stored: false,
    type: 'keyword'
  },
  'result.sections.tags.file.plist.ui.requires_persistent_wifi': {
    default: true,
    indexed: true,
    list: true,
    stored: false,
    type: 'keyword'
  },
  'result.sections.tags.file.plist.wk.app_bundle_identifier': {
    default: true,
    indexed: true,
    list: true,
    stored: false,
    type: 'keyword'
  },
  'result.sections.tags.file.powershell.cmdlet': {
    default: true,
    indexed: true,
    list: true,
    stored: false,
    type: 'keyword'
  },
  'result.sections.tags.file.shortcut.command_line': {
    default: true,
    indexed: true,
    list: true,
    stored: false,
    type: 'keyword'
  },
  'result.sections.tags.file.shortcut.icon_location': {
    default: true,
    indexed: true,
    list: true,
    stored: false,
    type: 'keyword'
  },
  'result.sections.tags.file.shortcut.machine_id': {
    default: true,
    indexed: true,
    list: true,
    stored: false,
    type: 'keyword'
  },
  'result.sections.tags.file.shortcut.tracker_mac': {
    default: true,
    indexed: true,
    list: true,
    stored: false,
    type: 'keyword'
  },
  'result.sections.tags.file.string.api': {
    default: true,
    indexed: true,
    list: true,
    stored: false,
    type: 'keyword'
  },
  'result.sections.tags.file.string.blacklisted': {
    default: true,
    indexed: true,
    list: true,
    stored: false,
    type: 'keyword'
  },
  'result.sections.tags.file.string.decoded': {
    default: true,
    indexed: true,
    list: true,
    stored: false,
    type: 'keyword'
  },
  'result.sections.tags.file.string.extracted': {
    default: true,
    indexed: true,
    list: true,
    stored: false,
    type: 'keyword'
  },
  'result.sections.tags.file.swf.header.frame.count': {
    default: false,
    indexed: true,
    list: true,
    stored: false,
    type: 'integer'
  },
  'result.sections.tags.file.swf.header.frame.rate': {
    default: false,
    indexed: true,
    list: true,
    stored: false,
    type: 'keyword'
  },
  'result.sections.tags.file.swf.header.frame.size': {
    default: true,
    indexed: true,
    list: true,
    stored: false,
    type: 'keyword'
  },
  'result.sections.tags.file.swf.header.version': {
    default: true,
    indexed: true,
    list: true,
    stored: false,
    type: 'keyword'
  },
  'result.sections.tags.file.swf.tags_ssdeep': {
    default: true,
    indexed: true,
    list: true,
    stored: false,
    type: 'keyword'
  },
  'result.sections.tags.info.password': {
    default: true,
    indexed: true,
    list: true,
    stored: false,
    type: 'keyword'
  },
  'result.sections.tags.info.phone_number': {
    default: true,
    indexed: true,
    list: true,
    stored: false,
    type: 'keyword'
  },
  'result.sections.tags.network.attack': {
    default: true,
    indexed: true,
    list: true,
    stored: false,
    type: 'keyword'
  },
  'result.sections.tags.network.dynamic.domain': {
    default: true,
    indexed: true,
    list: true,
    stored: false,
    type: 'keyword'
  },
  'result.sections.tags.network.dynamic.ip': {
    default: true,
    indexed: true,
    list: true,
    stored: false,
    type: 'ip'
  },
  'result.sections.tags.network.dynamic.unc_path': {
    default: true,
    indexed: true,
    list: true,
    stored: false,
    type: 'keyword'
  },
  'result.sections.tags.network.dynamic.uri': {
    default: true,
    indexed: true,
    list: true,
    stored: false,
    type: 'keyword'
  },
  'result.sections.tags.network.dynamic.uri_path': {
    default: true,
    indexed: true,
    list: true,
    stored: false,
    type: 'keyword'
  },
  'result.sections.tags.network.email.address': {
    default: true,
    indexed: true,
    list: true,
    stored: false,
    type: 'keyword'
  },
  'result.sections.tags.network.email.date': {
    default: true,
    indexed: true,
    list: true,
    stored: false,
    type: 'keyword'
  },
  'result.sections.tags.network.email.msg_id': {
    default: true,
    indexed: true,
    list: true,
    stored: false,
    type: 'keyword'
  },
  'result.sections.tags.network.email.subject': {
    default: true,
    indexed: true,
    list: true,
    stored: false,
    type: 'keyword'
  },
  'result.sections.tags.network.mac_address': {
    default: true,
    indexed: true,
    list: true,
    stored: false,
    type: 'keyword'
  },
  'result.sections.tags.network.port': {
    default: false,
    indexed: true,
    list: true,
    stored: false,
    type: 'integer'
  },
  'result.sections.tags.network.protocol': {
    default: false,
    indexed: true,
    list: true,
    stored: false,
    type: 'keyword'
  },
  'result.sections.tags.network.signature.message': {
    default: true,
    indexed: true,
    list: true,
    stored: false,
    type: 'keyword'
  },
  'result.sections.tags.network.signature.signature_id': {
    default: true,
    indexed: true,
    list: true,
    stored: false,
    type: 'keyword'
  },
  'result.sections.tags.network.static.domain': {
    default: true,
    indexed: true,
    list: true,
    stored: false,
    type: 'keyword'
  },
  'result.sections.tags.network.static.ip': {
    default: true,
    indexed: true,
    list: true,
    stored: false,
    type: 'ip'
  },
  'result.sections.tags.network.static.unc_path': {
    default: true,
    indexed: true,
    list: true,
    stored: false,
    type: 'keyword'
  },
  'result.sections.tags.network.static.uri': {
    default: true,
    indexed: true,
    list: true,
    stored: false,
    type: 'keyword'
  },
  'result.sections.tags.network.static.uri_path': {
    default: true,
    indexed: true,
    list: true,
    stored: false,
    type: 'keyword'
  },
  'result.sections.tags.network.tls.ja3_hash': {
    default: true,
    indexed: true,
    list: true,
    stored: false,
    type: 'keyword'
  },
  'result.sections.tags.network.tls.ja3_string': {
    default: true,
    indexed: true,
    list: true,
    stored: false,
    type: 'keyword'
  },
  'result.sections.tags.network.tls.ja3s_hash': {
    default: true,
    indexed: true,
    list: true,
    stored: false,
    type: 'keyword'
  },
  'result.sections.tags.network.tls.ja3s_string': {
    default: true,
    indexed: true,
    list: true,
    stored: false,
    type: 'keyword'
  },
  'result.sections.tags.network.tls.ja4_hash': {
    default: true,
    indexed: true,
    list: true,
    stored: false,
    type: 'keyword'
  },
  'result.sections.tags.network.tls.ja4s_hash': {
    default: true,
    indexed: true,
    list: true,
    stored: false,
    type: 'keyword'
  },
  'result.sections.tags.network.tls.sni': {
    default: true,
    indexed: true,
    list: true,
    stored: false,
    type: 'keyword'
  },
  'result.sections.tags.network.user_agent': {
    default: false,
    indexed: true,
    list: true,
    stored: false,
    type: 'keyword'
  },
  'result.sections.tags.source': {
    default: true,
    indexed: true,
    list: true,
    stored: false,
    type: 'keyword'
  },
  'result.sections.tags.technique.comms_routine': {
    default: true,
    indexed: true,
    list: true,
    stored: false,
    type: 'keyword'
  },
  'result.sections.tags.technique.config': {
    default: true,
    indexed: true,
    list: true,
    stored: false,
    type: 'keyword'
  },
  'result.sections.tags.technique.crypto': {
    default: true,
    indexed: true,
    list: true,
    stored: false,
    type: 'keyword'
  },
  'result.sections.tags.technique.exploit': {
    default: true,
    indexed: true,
    list: true,
    stored: false,
    type: 'keyword'
  },
  'result.sections.tags.technique.keylogger': {
    default: true,
    indexed: true,
    list: true,
    stored: false,
    type: 'keyword'
  },
  'result.sections.tags.technique.macro': {
    default: true,
    indexed: true,
    list: true,
    stored: false,
    type: 'keyword'
  },
  'result.sections.tags.technique.masking_algo': {
    default: true,
    indexed: true,
    list: true,
    stored: false,
    type: 'keyword'
  },
  'result.sections.tags.technique.obfuscation': {
    default: true,
    indexed: true,
    list: true,
    stored: false,
    type: 'keyword'
  },
  'result.sections.tags.technique.packer': {
    default: true,
    indexed: true,
    list: true,
    stored: false,
    type: 'keyword'
  },
  'result.sections.tags.technique.persistence': {
    default: true,
    indexed: true,
    list: true,
    stored: false,
    type: 'keyword'
  },
  'result.sections.tags.technique.shellcode': {
    default: true,
    indexed: true,
    list: true,
    stored: false,
    type: 'keyword'
  },
  'result.sections.tags.technique.string': {
    default: true,
    indexed: true,
    list: true,
    stored: false,
    type: 'keyword'
  },
  'result.sections.tags.vector': {
    default: true,
    indexed: true,
    list: true,
    stored: false,
    type: 'keyword'
  },
  'result.sections.title_text': {
    default: true,
    indexed: true,
    list: true,
    stored: false,
    type: 'text'
  },
  sha256: {
    default: false,
    indexed: true,
    list: false,
    stored: false,
    type: 'keyword'
  },
  size: {
    default: false,
    indexed: true,
    list: false,
    stored: true,
    type: 'integer'
  },
  type: {
    default: false,
    indexed: true,
    list: false,
    stored: true,
    type: 'keyword'
  }
};

const MOCK_RETROHUNT_INDEX_DEFINITION: IndexDefinition = {
  classification: {
    default: false,
    indexed: true,
    list: false,
    stored: true,
    type: 'keyword'
  },
  completed_time: {
    default: false,
    indexed: true,
    list: false,
    stored: false,
    type: 'date'
  },
  created_time: {
    default: false,
    indexed: true,
    list: false,
    stored: true,
    type: 'date'
  },
  creator: {
    default: true,
    indexed: true,
    list: false,
    stored: true,
    type: 'keyword'
  },
  description: {
    default: true,
    indexed: true,
    list: false,
    stored: true,
    type: 'text'
  },
  end_group: {
    default: false,
    indexed: true,
    list: false,
    stored: true,
    type: 'long'
  },
  errors: {
    default: false,
    indexed: true,
    list: true,
    stored: false,
    type: 'keyword'
  },
  expiry_ts: {
    default: false,
    indexed: true,
    list: false,
    stored: false,
    type: 'date'
  },
  finished: {
    default: false,
    indexed: true,
    list: false,
    stored: true,
    type: 'boolean'
  },
  id: {
    default: true,
    indexed: true,
    list: false,
    stored: false,
    type: 'keyword'
  },
  indices: {
    default: false,
    indexed: true,
    list: false,
    stored: true,
    type: 'keyword'
  },
  key: {
    default: false,
    indexed: true,
    list: false,
    stored: true,
    type: 'keyword'
  },
  raw_query: {
    default: false,
    indexed: true,
    list: false,
    stored: false,
    type: 'keyword'
  },
  search_classification: {
    default: false,
    indexed: true,
    list: false,
    stored: true,
    type: 'keyword'
  },
  start_group: {
    default: false,
    indexed: true,
    list: false,
    stored: true,
    type: 'long'
  },
  started_time: {
    default: false,
    indexed: true,
    list: false,
    stored: true,
    type: 'date'
  },
  truncated: {
    default: false,
    indexed: true,
    list: false,
    stored: true,
    type: 'boolean'
  },
  warnings: {
    default: false,
    indexed: true,
    list: true,
    stored: false,
    type: 'keyword'
  },
  yara_signature: {
    default: true,
    indexed: true,
    list: false,
    stored: false,
    type: 'keyword'
  }
};

const MOCK_SAFELIST_INDEX_DEFINITION: IndexDefinition = {
  added: {
    default: false,
    indexed: true,
    list: false,
    stored: true,
    type: 'date'
  },
  classification: {
    default: false,
    indexed: true,
    list: false,
    stored: true,
    type: 'keyword'
  },
  enabled: {
    default: false,
    indexed: true,
    list: false,
    stored: true,
    type: 'boolean'
  },
  expiry_ts: {
    default: false,
    indexed: true,
    list: false,
    stored: true,
    type: 'date'
  },
  'file.name': {
    default: true,
    indexed: true,
    list: true,
    stored: true,
    type: 'keyword'
  },
  'file.size': {
    default: false,
    indexed: true,
    list: false,
    stored: false,
    type: 'long'
  },
  'file.type': {
    default: false,
    indexed: true,
    list: false,
    stored: false,
    type: 'keyword'
  },
  'hashes.md5': {
    default: true,
    indexed: true,
    list: false,
    stored: true,
    type: 'keyword'
  },
  'hashes.sha1': {
    default: true,
    indexed: true,
    list: false,
    stored: true,
    type: 'keyword'
  },
  'hashes.sha256': {
    default: true,
    indexed: true,
    list: false,
    stored: true,
    type: 'keyword'
  },
  id: {
    default: true,
    indexed: true,
    list: false,
    stored: false,
    type: 'keyword'
  },
  'signature.name': {
    default: true,
    indexed: true,
    list: false,
    stored: true,
    type: 'keyword'
  },
  'sources.classification': {
    default: false,
    indexed: true,
    list: true,
    stored: false,
    type: 'keyword'
  },
  'sources.name': {
    default: false,
    indexed: true,
    list: true,
    stored: true,
    type: 'keyword'
  },
  'sources.reason': {
    default: false,
    indexed: true,
    list: true,
    stored: false,
    type: 'keyword'
  },
  'sources.type': {
    default: false,
    indexed: true,
    list: true,
    stored: false,
    type: 'keyword'
  },
  'tag.type': {
    default: false,
    indexed: true,
    list: false,
    stored: true,
    type: 'keyword'
  },
  'tag.value': {
    default: true,
    indexed: true,
    list: false,
    stored: true,
    type: 'keyword'
  },
  type: {
    default: false,
    indexed: true,
    list: false,
    stored: true,
    type: 'keyword'
  },
  updated: {
    default: false,
    indexed: true,
    list: false,
    stored: true,
    type: 'date'
  }
};

const MOCK_SIGNATURE_INDEX_DEFINITION: IndexDefinition = {
  classification: {
    default: false,
    indexed: true,
    list: false,
    stored: true,
    type: 'keyword'
  },
  data: {
    default: true,
    indexed: true,
    list: false,
    stored: false,
    type: 'text'
  },
  id: {
    default: true,
    indexed: true,
    list: false,
    stored: false,
    type: 'keyword'
  },
  last_modified: {
    default: false,
    indexed: true,
    list: false,
    stored: true,
    type: 'date'
  },
  name: {
    default: true,
    indexed: true,
    list: false,
    stored: true,
    type: 'keyword'
  },
  order: {
    default: false,
    indexed: true,
    list: false,
    stored: false,
    type: 'integer'
  },
  revision: {
    default: false,
    indexed: true,
    list: false,
    stored: true,
    type: 'keyword'
  },
  signature_id: {
    default: false,
    indexed: true,
    list: false,
    stored: true,
    type: 'keyword'
  },
  source: {
    default: false,
    indexed: true,
    list: false,
    stored: true,
    type: 'keyword'
  },
  state_change_date: {
    default: false,
    indexed: true,
    list: false,
    stored: false,
    type: 'date'
  },
  state_change_user: {
    default: false,
    indexed: true,
    list: false,
    stored: false,
    type: 'keyword'
  },
  'stats.avg': {
    default: false,
    indexed: true,
    list: false,
    stored: true,
    type: 'integer'
  },
  'stats.count': {
    default: false,
    indexed: true,
    list: false,
    stored: true,
    type: 'integer'
  },
  'stats.first_hit': {
    default: false,
    indexed: true,
    list: false,
    stored: true,
    type: 'date'
  },
  'stats.last_hit': {
    default: false,
    indexed: true,
    list: false,
    stored: true,
    type: 'date'
  },
  'stats.max': {
    default: false,
    indexed: true,
    list: false,
    stored: true,
    type: 'integer'
  },
  'stats.min': {
    default: false,
    indexed: true,
    list: false,
    stored: true,
    type: 'integer'
  },
  'stats.sum': {
    default: false,
    indexed: true,
    list: false,
    stored: true,
    type: 'integer'
  },
  status: {
    default: true,
    indexed: true,
    list: false,
    stored: true,
    type: 'keyword'
  },
  type: {
    default: true,
    indexed: true,
    list: false,
    stored: true,
    type: 'keyword'
  }
};

const MOCK_SUBMISSION_INDEX_DEFINITION: IndexDefinition = {
  archive_ts: {
    default: false,
    indexed: true,
    list: false,
    stored: true,
    type: 'date'
  },
  archived: {
    default: false,
    indexed: true,
    list: false,
    stored: true,
    type: 'boolean'
  },
  classification: {
    default: false,
    indexed: true,
    list: false,
    stored: true,
    type: 'keyword'
  },
  error_count: {
    default: false,
    indexed: true,
    list: false,
    stored: true,
    type: 'integer'
  },
  errors: {
    default: false,
    indexed: true,
    list: true,
    stored: false,
    type: 'keyword'
  },
  expiry_ts: {
    default: false,
    indexed: true,
    list: false,
    stored: false,
    type: 'date'
  },
  file_count: {
    default: false,
    indexed: true,
    list: false,
    stored: true,
    type: 'integer'
  },
  'files.name': {
    default: true,
    indexed: true,
    list: true,
    stored: false,
    type: 'keyword'
  },
  'files.sha256': {
    default: true,
    indexed: true,
    list: true,
    stored: false,
    type: 'keyword'
  },
  'files.size': {
    default: false,
    indexed: true,
    list: true,
    stored: false,
    type: 'long'
  },
  from_archive: {
    default: false,
    indexed: false,
    list: false,
    stored: true,
    type: 'boolean'
  },
  id: {
    default: true,
    indexed: true,
    list: false,
    stored: false,
    type: 'keyword'
  },
  max_score: {
    default: false,
    indexed: true,
    list: false,
    stored: true,
    type: 'integer'
  },
  'params.auto_archive': {
    default: false,
    indexed: true,
    list: false,
    stored: false,
    type: 'boolean'
  },
  'params.classification': {
    default: false,
    indexed: true,
    list: false,
    stored: false,
    type: 'keyword'
  },
  'params.deep_scan': {
    default: false,
    indexed: true,
    list: false,
    stored: false,
    type: 'boolean'
  },
  'params.delete_after_archive': {
    default: false,
    indexed: true,
    list: false,
    stored: false,
    type: 'boolean'
  },
  'params.description': {
    default: true,
    indexed: true,
    list: false,
    stored: true,
    type: 'text'
  },
  'params.generate_alert': {
    default: false,
    indexed: true,
    list: false,
    stored: false,
    type: 'boolean'
  },
  'params.groups': {
    default: false,
    indexed: true,
    list: true,
    stored: false,
    type: 'keyword'
  },
  'params.ignore_cache': {
    default: false,
    indexed: true,
    list: false,
    stored: false,
    type: 'boolean'
  },
  'params.ignore_filtering': {
    default: false,
    indexed: true,
    list: false,
    stored: false,
    type: 'boolean'
  },
  'params.ignore_recursion_prevention': {
    default: false,
    indexed: true,
    list: false,
    stored: false,
    type: 'boolean'
  },
  'params.ignore_size': {
    default: false,
    indexed: true,
    list: false,
    stored: false,
    type: 'boolean'
  },
  'params.initial_data': {
    default: false,
    indexed: false,
    list: false,
    stored: false,
    type: 'text'
  },
  'params.malicious': {
    default: false,
    indexed: true,
    list: false,
    stored: false,
    type: 'boolean'
  },
  'params.max_extracted': {
    default: false,
    indexed: true,
    list: false,
    stored: false,
    type: 'integer'
  },
  'params.max_supplementary': {
    default: false,
    indexed: true,
    list: false,
    stored: false,
    type: 'integer'
  },
  'params.never_drop': {
    default: false,
    indexed: true,
    list: false,
    stored: false,
    type: 'boolean'
  },
  'params.priority': {
    default: false,
    indexed: true,
    list: false,
    stored: false,
    type: 'integer'
  },
  'params.psid': {
    default: false,
    indexed: true,
    list: false,
    stored: false,
    type: 'keyword'
  },
  'params.quota_item': {
    default: false,
    indexed: true,
    list: false,
    stored: false,
    type: 'boolean'
  },
  'params.service_spec': {
    default: false,
    indexed: false,
    list: false,
    stored: false,
    type: 'object'
  },
  'params.services.excluded': {
    default: false,
    indexed: false,
    list: true,
    stored: false,
    type: 'keyword'
  },
  'params.services.rescan': {
    default: false,
    indexed: false,
    list: true,
    stored: false,
    type: 'keyword'
  },
  'params.services.resubmit': {
    default: false,
    indexed: false,
    list: true,
    stored: false,
    type: 'keyword'
  },
  'params.services.selected': {
    default: false,
    indexed: false,
    list: true,
    stored: false,
    type: 'keyword'
  },
  'params.submitter': {
    default: true,
    indexed: true,
    list: false,
    stored: true,
    type: 'keyword'
  },
  'params.trace': {
    default: false,
    indexed: true,
    list: false,
    stored: false,
    type: 'boolean'
  },
  'params.ttl': {
    default: false,
    indexed: true,
    list: false,
    stored: false,
    type: 'integer'
  },
  'params.type': {
    default: false,
    indexed: true,
    list: false,
    stored: false,
    type: 'keyword'
  },
  'params.use_archive_alternate_dtl': {
    default: false,
    indexed: true,
    list: false,
    stored: false,
    type: 'boolean'
  },
  results: {
    default: false,
    indexed: true,
    list: true,
    stored: false,
    type: 'wildcard'
  },
  scan_key: {
    default: false,
    indexed: false,
    list: false,
    stored: false,
    type: 'keyword'
  },
  sid: {
    default: true,
    indexed: true,
    list: false,
    stored: true,
    type: 'keyword'
  },
  state: {
    default: false,
    indexed: true,
    list: false,
    stored: true,
    type: 'keyword'
  },
  'times.completed': {
    default: false,
    indexed: true,
    list: false,
    stored: false,
    type: 'date'
  },
  'times.submitted': {
    default: false,
    indexed: true,
    list: false,
    stored: true,
    type: 'date'
  },
  to_be_deleted: {
    default: false,
    indexed: true,
    list: false,
    stored: true,
    type: 'boolean'
  },
  'tracing_events.event_type': {
    default: false,
    indexed: false,
    list: true,
    stored: false,
    type: 'keyword'
  },
  'tracing_events.file': {
    default: false,
    indexed: false,
    list: true,
    stored: false,
    type: 'keyword'
  },
  'tracing_events.message': {
    default: false,
    indexed: false,
    list: true,
    stored: false,
    type: 'keyword'
  },
  'tracing_events.service': {
    default: false,
    indexed: false,
    list: true,
    stored: false,
    type: 'keyword'
  },
  'tracing_events.timestamp': {
    default: false,
    indexed: false,
    list: true,
    stored: false,
    type: 'date'
  },
  'verdict.malicious': {
    default: false,
    indexed: true,
    list: true,
    stored: false,
    type: 'keyword'
  },
  'verdict.non_malicious': {
    default: false,
    indexed: true,
    list: true,
    stored: false,
    type: 'keyword'
  }
};

const MOCK_USER_INDEX_DEFINITION: IndexDefinition = {
  agrees_with_tos: {
    default: false,
    indexed: false,
    list: false,
    stored: false,
    type: 'date'
  },
  api_daily_quota: {
    default: false,
    indexed: true,
    list: false,
    stored: false,
    type: 'integer'
  },
  api_quota: {
    default: false,
    indexed: true,
    list: false,
    stored: false,
    type: 'integer'
  },
  apikeys: {
    default: false,
    indexed: false,
    list: false,
    stored: false,
    type: 'object'
  },
  apps: {
    default: false,
    indexed: false,
    list: false,
    stored: false,
    type: 'object'
  },
  can_impersonate: {
    default: false,
    indexed: false,
    list: false,
    stored: false,
    type: 'boolean'
  },
  classification: {
    default: true,
    indexed: true,
    list: false,
    stored: true,
    type: 'keyword'
  },
  dn: {
    default: true,
    indexed: true,
    list: false,
    stored: false,
    type: 'keyword'
  },
  email: {
    default: true,
    indexed: true,
    list: false,
    stored: true,
    type: 'keyword'
  },
  groups: {
    default: true,
    indexed: true,
    list: true,
    stored: true,
    type: 'keyword'
  },
  id: {
    default: true,
    indexed: true,
    list: false,
    stored: false,
    type: 'keyword'
  },
  identity_id: {
    default: true,
    indexed: true,
    list: false,
    stored: false,
    type: 'keyword'
  },
  is_active: {
    default: false,
    indexed: true,
    list: false,
    stored: true,
    type: 'boolean'
  },
  name: {
    default: true,
    indexed: true,
    list: false,
    stored: true,
    type: 'keyword'
  },
  otp_sk: {
    default: false,
    indexed: false,
    list: false,
    stored: false,
    type: 'keyword'
  },
  password: {
    default: false,
    indexed: false,
    list: false,
    stored: false,
    type: 'keyword'
  },
  roles: {
    default: false,
    indexed: true,
    list: true,
    stored: true,
    type: 'keyword'
  },
  security_tokens: {
    default: false,
    indexed: false,
    list: false,
    stored: false,
    type: 'object'
  },
  submission_async_quota: {
    default: false,
    indexed: true,
    list: false,
    stored: false,
    type: 'integer'
  },
  submission_daily_quota: {
    default: false,
    indexed: true,
    list: false,
    stored: false,
    type: 'integer'
  },
  submission_quota: {
    default: false,
    indexed: true,
    list: false,
    stored: false,
    type: 'integer'
  },
  type: {
    default: false,
    indexed: true,
    list: true,
    stored: true,
    type: 'keyword'
  },
  uname: {
    default: true,
    indexed: true,
    list: false,
    stored: true,
    type: 'keyword'
  }
};

const MOCK_WORKFLOW_INDEX_DEFINITION: IndexDefinition = {
  classification: {
    default: true,
    indexed: true,
    list: false,
    stored: true,
    type: 'keyword'
  },
  creation_date: {
    default: false,
    indexed: true,
    list: false,
    stored: true,
    type: 'date'
  },
  creator: {
    default: false,
    indexed: true,
    list: false,
    stored: true,
    type: 'keyword'
  },
  edited_by: {
    default: false,
    indexed: true,
    list: false,
    stored: true,
    type: 'keyword'
  },
  enabled: {
    default: false,
    indexed: true,
    list: false,
    stored: true,
    type: 'boolean'
  },
  first_seen: {
    default: false,
    indexed: true,
    list: false,
    stored: true,
    type: 'date'
  },
  hit_count: {
    default: false,
    indexed: true,
    list: false,
    stored: true,
    type: 'integer'
  },
  id: {
    default: true,
    indexed: true,
    list: false,
    stored: false,
    type: 'keyword'
  },
  labels: {
    default: true,
    indexed: true,
    list: true,
    stored: true,
    type: 'keyword'
  },
  last_edit: {
    default: false,
    indexed: true,
    list: false,
    stored: true,
    type: 'date'
  },
  last_seen: {
    default: false,
    indexed: true,
    list: false,
    stored: true,
    type: 'date'
  },
  name: {
    default: true,
    indexed: true,
    list: false,
    stored: true,
    type: 'keyword'
  },
  origin: {
    default: false,
    indexed: true,
    list: false,
    stored: true,
    type: 'keyword'
  },
  priority: {
    default: true,
    indexed: true,
    list: false,
    stored: true,
    type: 'keyword'
  },
  query: {
    default: false,
    indexed: true,
    list: false,
    stored: true,
    type: 'keyword'
  },
  status: {
    default: true,
    indexed: true,
    list: false,
    stored: true,
    type: 'keyword'
  },
  workflow_id: {
    default: false,
    indexed: true,
    list: false,
    stored: true,
    type: 'keyword'
  }
};

export const MOCK_INDEXES: Indexes = {
  alert: MOCK_ALERT_INDEX_DEFINITION,
  apikey: MOCK_APIKEY_INDEX_DEFINITION,
  badlist: MOCK_BADLIST_INDEX_DEFINITION,
  emptyresult: MOCK_EMPTYRESULT_INDEX_DEFINITION,
  error: MOCK_ERROR_INDEX_DEFINITION,
  file: MOCK_FILE_INDEX_DEFINITION,
  heuristic: MOCK_HEURISTIC_INDEX_DEFINITION,
  result: MOCK_RESULT_INDEX_DEFINITION,
  retrohunt: MOCK_RETROHUNT_INDEX_DEFINITION,
  safelist: MOCK_SAFELIST_INDEX_DEFINITION,
  signature: MOCK_SIGNATURE_INDEX_DEFINITION,
  submission: MOCK_SUBMISSION_INDEX_DEFINITION,
  user: MOCK_USER_INDEX_DEFINITION,
  workflow: MOCK_WORKFLOW_INDEX_DEFINITION
};
