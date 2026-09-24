import type { Submission } from 'components/models/base/config';

export const MOCK_PROFILES: Submission['profiles'] = {
  static: {
    display_name: 'Static Analysis [OFFLINE]',
    summary: 'Quick scan; keep it local',
    description: `**Summary**

Quick, local-only scan with no execution.

**What it does**

Analyzes files using internal and open-source tools (e.g., YARA, CAPA) to inspect their structure, metadata, and embedded indicators without running any code.

**When to use it**
- Rapid triage
- Checking sensitive or proprietary files that must never leave the local network

**Limitations**
- Low detection rate for packed or heavily obfuscated malware
- Cannot observe runtime behavior or command-and-control (C2) logic`,
    params: {
      services: {
        excluded: [],
        rescan: [],
        resubmit: [],
        selected: ['Filtering', 'Antivirus', 'Static Analysis', 'Extraction', 'Networking']
      }
    },
    restricted_params: {}
  },
  static_and_dynamic_with_internet: {
    display_name: 'Static + Dynamic Analysis [ONLINE]',
    summary: 'Full deep-dive; allow network traffic',
    description: `**Summary**

Complete analysis with execution and internet access.

**What it does**

Executes files in a sandbox with live internet connectivity to capture command-and-control traffic, network indicators, and runtime behavior, while also leveraging external reputation services.

**When to use it**
- Deep investigation of unknown or high-risk samples
- Identifying network IOCs and full malware lifecycle behavior

**Limitations**
- Privacy and data exposure risk
- Sample or metadata may be shared with third-party services`,
    params: {
      service_spec: {
        CAPE: {
          routing: 'internet'
        },
        URLDownloader: {
          proxy: 'localhost_proxy'
        }
      },
      services: {
        excluded: [],
        rescan: [],
        resubmit: [],
        selected: [
          'Filtering',
          'Antivirus',
          'Static Analysis',
          'Extraction',
          'Networking',
          'Internet Connected',
          'Dynamic Analysis'
        ]
      }
    },
    restricted_params: {}
  },
  static_with_dynamic: {
    display_name: 'Static + Dynamic Analysis [OFFLINE]',
    summary: 'See behavior; keep it local',
    description: `**Summary**

Local sandbox detonation with behavioral visibility.

**What it does**

Combines static analysis with full dynamic execution in a local sandbox to observe process creation, file system changes, registry activity, and system interactions.

**When to use it**
- Standard malware investigation
- Understanding what a file does at runtime without risking data leakage to third-party APIs

**Limitations**
- Malware may evade or delay execution if it detects the sandbox environment
- Limited visibility into network-based indicators without internet access`,
    params: {
      services: {
        excluded: [],
        rescan: [],
        resubmit: [],
        selected: ['Filtering', 'Antivirus', 'Static Analysis', 'Extraction', 'Networking', 'Dynamic Analysis']
      }
    },
    restricted_params: {}
  },
  static_with_internet: {
    display_name: 'Static Analysis [ONLINE]',
    summary: 'Is this a known threat? (Quick check)',
    description: `**Summary**

Quick reputation check using global intelligence sources.

**What it does**

Performs metadata and hash lookups against external services (e.g., VirusTotal, Google Threat Intelligence) without executing the file.

**When to use it**
- Quickly determining whether a file is already known malicious
- Prioritizing triage based on global reputation

**Limitations**
- Potential data leakage via hash or metadata queries
- Unique samples may alert adversaries that analysis is occurring`,
    params: {
      services: {
        excluded: [],
        rescan: [],
        resubmit: [],
        selected: ['Filtering', 'Antivirus', 'Static Analysis', 'Extraction', 'Networking', 'Internet Connected']
      }
    },
    restricted_params: {}
  }
};
