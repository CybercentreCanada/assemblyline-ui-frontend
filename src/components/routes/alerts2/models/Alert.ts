import { LineItem } from 'commons/addons/lists/item/ListItemBase';

export interface Screenshots {
  name: string;
  description: string;
  img: string;
  thumb: string;
}

export interface AlertFile {
  md5: string;
  name: string;
  sha1: string;
  sha256: string;
  size: number;
  type: string;
  screenshots: Screenshots[];
}

export interface AlertUpdateItem {
  label?: string[];
  owner?: string;
  priority?: string;
  status?: string;
  verdict?: {
    malicious: string[];
    non_malicious: string[];
  };
}

export interface DetailedItem {
  subtype: string;
  type: string;
  value: string;
  verdict: 'safe' | 'info' | 'suspicious' | 'malicious';
}

export interface WorkflowEvent {
  entity_name: string;
  entity_type: 'user' | 'workflow';
  entity_id: string;
  labels?: string[];
  status?: string;
  priority?: string;
  ts: string;
}

export interface AlertItem extends LineItem {
  al: {
    attrib: string[];
    av: string[];
    behavior: string[];
    detailed: {
      attack_category: DetailedItem[];
      attack_pattern: DetailedItem[];
      attrib: DetailedItem[];
      av: DetailedItem[];
      behavior: DetailedItem[];
      domain: DetailedItem[];
      heuristic: DetailedItem[];
      ip: DetailedItem[];
      uri: DetailedItem[];
      yara: DetailedItem[];
    };
    domain: string[];
    domain_dynamic: string[];
    domain_static: string[];
    ip: string[];
    ip_dynamic: string[];
    ip_static: string[];
    uri: string[];
    uri_dynamic: string[];
    uri_static: string[];
    request_end_time: string[];
    score: number;
    yara: string[];
  };
  alert_id: string;
  attack: {
    category: string[];
    pattern: string[];
  };
  extended_scan: string;
  classification: string;
  file: AlertFile;
  filtered: boolean;
  label: string[];
  group_count: number;
  heuristic: { name: string[] };
  hint_owner: boolean;
  metadata: {
    [key: string]: any;
  }[];
  owner: string;
  priority: string;
  reporting_ts: string;
  sid: string;
  status: string;
  ts: string;
  type: string;
  verdict: {
    malicious: string[];
    non_malicious: string[];
  };
  events: WorkflowEvent[];
  workflow_completed: boolean;
}

export type Alert = AlertItem & {
  id: string;
  index: number;
};
