import type { Submission } from 'components/models/base/config';

export const MOCK_PROFILES: Submission['profiles'] = {
  static: {
    description:
      'Analyze files using static analysis techniques and extract information from the file without executing it, such as metadata, strings, and structural information.',
    display_name: '[OFFLINE] Static Analysis',
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
    description:
      'Perform comprehensive file analysis using traditional static and dynamic analysis techniques with internet access.',
    display_name: '[ONLINE] Static + Dynamic Analysis',
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
    description:
      'Analyze files using static analysis techniques along with executing them in a controlled environment to observe their behavior and capture runtime activities, interactions with the system, network communications, and any malicious behavior exhibited by the file during execution.',
    display_name: '[OFFLINE] Static + Dynamic Analysis',
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
    description:
      'Combine traditional static analysis techniques with internet-connected services to gather additional information and context about the file being analyzed.',
    display_name: '[ONLINE] Static Analysis',
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
