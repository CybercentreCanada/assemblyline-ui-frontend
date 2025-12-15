import { describe, it, expect } from 'vitest';
import type { Theme } from '@mui/material';
import type {
  SandboxBody,
  SandboxProcessItem,
  SandboxSignatureItem,
  SandboxNetworkHTTP,
  SandboxNetworkDNS,
  SandboxNetworkSMTP
} from 'components/models/base/result_body';
import {
  hasObjectData,
  buildProcessTree,
  getProcessScore,
  getDescendantPids,
  getHighestProcessScore,
  getBackgroundColor,
  compareIPs
} from 'components/visual/ResultCard/Sandbox/sandbox.utils';

const mockTheme: Theme = {
  palette: {
    mode: 'light',
    success: { light: '#00FF00', dark: '#007700' },
    warning: { light: '#FFFF00', dark: '#777700' },
    error: { light: '#FF0000', dark: '#770000' },
    grey: { 800: '#808080' }
  }
} as unknown as Theme;

/* ----------------------------------------------------------------------------
 * Tests for hasObjectData utility
 * Ensures that it correctly detects meaningful data in objects,
 * including nested objects and arrays.
 * -------------------------------------------------------------------------- */
describe('hasObjectData', () => {
  it('should return false for null, undefined, or non-object values', () => {
    expect(hasObjectData(null)).toBe(false);
    expect(hasObjectData(undefined)).toBe(false);
    expect(hasObjectData('string' as unknown as Record<string, unknown>)).toBe(false);
  });

  it('should return false for empty objects and empty nested values', () => {
    expect(hasObjectData({})).toBe(false);
    expect(hasObjectData({ a: null, b: '', c: [] })).toBe(false);
    expect(hasObjectData({ nested: { a: '', b: null } })).toBe(false);
  });

  it('should return true for objects with non-empty values', () => {
    expect(hasObjectData({ a: 1 })).toBe(true);
    expect(hasObjectData({ a: [1] })).toBe(true);
    expect(hasObjectData({ a: { b: 'x' } })).toBe(true);
    expect(hasObjectData({ a: 'test' })).toBe(true);
  });
});

/* ----------------------------------------------------------------------------
 * Tests for buildProcessTree utility
 * Verifies that a flat list of processes is correctly transformed into a
 * hierarchical tree structure using PID/PPID relationships.
 * -------------------------------------------------------------------------- */
describe('buildProcessTree', () => {
  it('should build hierarchical process tree correctly', () => {
    const processes: SandboxProcessItem[] = [
      { pid: 1, ppid: 0, image: 'a.exe', start_time: '' },
      { pid: 2, ppid: 1, image: 'b.exe', start_time: '' },
      { pid: 3, ppid: 1, image: 'c.exe', start_time: '' }
    ];
    const tree = buildProcessTree(processes);
    expect(tree.length).toBe(1);
    expect(tree[0].children?.length).toBe(2);
  });

  it('should return empty array for empty input', () => {
    expect(buildProcessTree([])).toEqual([]);
  });
});

/* ----------------------------------------------------------------------------
 * Tests for getProcessScore utility
 * Ensures process scoring behaves correctly:
 * - returns null for invalid input
 * - returns 0 for safelisted processes
 * - sums scores for all matching signatures
 * -------------------------------------------------------------------------- */
describe('getProcessScore', () => {
  it('should return null for invalid process', () => {
    expect(getProcessScore(null as unknown as SandboxProcessItem, [])).toBeNull();
    expect(getProcessScore({} as SandboxProcessItem, [])).toBe(0);
  });

  it('should return 0 for safelisted process', () => {
    const process: SandboxProcessItem = { pid: 1, safelisted: true, image: '', start_time: '' };
    const sigs: SandboxSignatureItem[] = [{ pid: [1], score: 5, name: '', type: 'YARA', classification: '' }];
    expect(getProcessScore(process, sigs)).toBe(0);
  });

  it('should sum scores for matching signatures', () => {
    const process: SandboxProcessItem = { pid: 1, image: '', start_time: '' };
    const sigs: SandboxSignatureItem[] = [
      { pid: [1], score: 5, name: '', type: 'YARA', classification: '' },
      { pid: [1], score: 3, name: '', type: 'YARA', classification: '' },
      { pid: [2], score: 10, name: '', type: 'YARA', classification: '' }
    ];
    expect(getProcessScore(process, sigs)).toBe(8);
  });
});

/* ----------------------------------------------------------------------------
 * Tests for getDescendantPids utility
 * Ensures that all descendant PIDs of a given process are correctly collected.
 * -------------------------------------------------------------------------- */
describe('getDescendantPids', () => {
  it('should return empty array for invalid process', () => {
    expect(getDescendantPids(null as unknown as SandboxProcessItem, [])).toEqual([]);
    expect(getDescendantPids({} as SandboxProcessItem, [])).toEqual([]);
  });

  it('should return all descendant PIDs', () => {
    const processes: SandboxProcessItem[] = [
      { pid: 1, ppid: 0, image: '', start_time: '' },
      { pid: 2, ppid: 1, image: '', start_time: '' },
      { pid: 3, ppid: 2, image: '', start_time: '' },
      { pid: 4, ppid: 1, image: '', start_time: '' }
    ];
    const root = { pid: 1, ppid: 0, image: '', start_time: '' };
    const result = getDescendantPids(root, processes);
    expect(result.sort()).toEqual([2, 3, 4]);
  });
});

/* ----------------------------------------------------------------------------
 * Tests for getHighestProcessScore utility
 * Verifies that the highest score among a process and its descendants is returned,
 * skipping safelisted processes and handling undefined PIDs.
 * -------------------------------------------------------------------------- */
describe('getHighestProcessScore', () => {
  it('should return highest score among process and descendants', () => {
    const body: SandboxBody = {
      processes: [
        { pid: 1, ppid: 0, image: '', start_time: '' },
        { pid: 2, ppid: 1, image: '', start_time: '' },
        { pid: 3, ppid: 2, safelisted: true, image: '', start_time: '' }
      ],
      signatures: [
        { pid: [1], score: 2, name: '', type: 'YARA', classification: '' },
        { pid: [2], score: 5, name: '', type: 'YARA', classification: '' },
        { pid: [3], score: 10, name: '', type: 'YARA', classification: '' }
      ],
      analysis_information: { sandbox_name: '', sandbox_version: '', analysis_metadata: { start_time: '' } },
      network_connections: []
    } as unknown as SandboxBody;
    const score = getHighestProcessScore({ pid: 1, ppid: 0, image: '', start_time: '' }, body);
    expect(score).toBe(5);
  });

  it('should handle undefined pid gracefully', () => {
    const body: SandboxBody = {
      processes: [],
      signatures: [],
      analysis_information: { sandbox_name: '', sandbox_version: '', analysis_metadata: { start_time: '' } },
      network_connections: []
    } as unknown as SandboxBody;
    expect(getHighestProcessScore({} as SandboxProcessItem, body)).toBeUndefined();
  });
});

/* ----------------------------------------------------------------------------
 * Tests for getBackgroundColor utility
 * Ensures background color is computed correctly based on heuristic verdicts,
 * opacity, and undefined scores.
 * -------------------------------------------------------------------------- */
describe('getBackgroundColor', () => {
  const scoreToVerdict = (score: number) => (score > 5 ? 'malicious' : score > 2 ? 'suspicious' : 'safe');

  it('should return null for unknown verdict', () => {
    const color = getBackgroundColor(mockTheme, () => 'unknown', 5);
    expect(color).toBeNull();
  });

  it('should return alpha for known verdicts', () => {
    const color = getBackgroundColor(mockTheme, scoreToVerdict, 6, 0.5);
    expect(color).toContain('rgba');
  });

  it('should handle undefined score', () => {
    const color = getBackgroundColor(mockTheme, scoreToVerdict, undefined);
    expect(color).toContain('rgba');
  });
});

/* ----------------------------------------------------------------------------
 * Tests for compareIPs utility
 * Ensures IPv4, IPv6-like, and IPs with ports are compared correctly.
 * -------------------------------------------------------------------------- */
describe('compareIPs', () => {
  it('should correctly compare IPv4 addresses', () => {
    expect(compareIPs('192.168.0.1', '192.168.0.2')).toBeLessThan(0);
    expect(compareIPs('192.168.0.2', '192.168.0.1')).toBeGreaterThan(0);
    expect(compareIPs('10.0.0.1', '10.0.0.1')).toBe(0);
  });

  it('should correctly compare IPs with ports', () => {
    expect(compareIPs('10.0.0.1:80', '10.0.0.1:81')).toBeLessThan(0);
    expect(compareIPs('10.0.0.1:80', '10.0.0.1:80')).toBe(0);
  });

  it('should correctly compare IPv6-like strings', () => {
    expect(compareIPs('1:2:3', '1:2:4')).toBeLessThan(0);
    expect(compareIPs('1:2:3', '1:2:3')).toBe(0);
  });
});

/* ----------------------------------------------------------------------------
 * Tests for network-related objects with hasObjectData
 * Verifies that HTTP, DNS, and SMTP objects are correctly detected as containing
 * data or empty, including edge cases.
 * -------------------------------------------------------------------------- */
describe('Network-related objects', () => {
  it('should handle hasObjectData for HTTP, DNS, SMTP', () => {
    const http: SandboxNetworkHTTP = { request_uri: 'a' };
    const dns: SandboxNetworkDNS = { domain: 'd', lookup_type: 'A' };
    const smtp: SandboxNetworkSMTP = { mail_from: 'a@b.com', mail_to: ['c@d.com'] };

    expect(hasObjectData(http)).toBe(true);
    expect(hasObjectData(dns)).toBe(true);
    expect(hasObjectData(smtp)).toBe(true);
    expect(hasObjectData({})).toBe(false);
  });

  it('should return false if network objects are empty', () => {
    const http: SandboxNetworkHTTP = { request_uri: '' };
    const dns: SandboxNetworkDNS = { domain: '', lookup_type: 'A' };
    const smtp: SandboxNetworkSMTP = { mail_from: '', mail_to: [] };
    expect(hasObjectData(http)).toBe(false);
    expect(hasObjectData(dns)).toBe(false);
    expect(hasObjectData(smtp)).toBe(false);
  });
});
