import type { FileResult } from 'components/models/base/result';

export const SANDBOX_EXAMPLE = {
  archive_ts: null,
  classification: 'TLP:CLEAR//VIRUSTOTAL',
  created: '2025-09-30T23:17:19.763642Z',
  drop_file: false,
  expiry_ts: '2025-10-30T23:17:19.758724Z',
  from_archive: false,
  partial: false,
  response: {
    extracted: [
      {
        allow_dynamic_recursion: false,
        classification: 'TLP:CLEAR//VIRUSTOTAL',
        description: 'TCPDUMP captured during analysis',
        is_section_image: false,
        name: '124901_dump.pcap',
        parent_relation: 'DYNAMIC',
        sha256: 'afea2a776e0890488da4fb13ffd4a6e1a092546a4a0262e83bda391919ff7659'
      },
      {
        allow_dynamic_recursion: false,
        classification: 'TLP:CLEAR//VIRUSTOTAL',
        description: 'EVTX generated during analysis',
        is_section_image: false,
        name: '124901_Application.evtx',
        parent_relation: 'DYNAMIC',
        sha256: '9d54f67f410d1e0fd058abe0cf7bdc5c35295b4ed52eb09e784ffe3fc235baa7'
      },
      {
        allow_dynamic_recursion: false,
        classification: 'TLP:CLEAR//VIRUSTOTAL',
        description: 'EVTX generated during analysis',
        is_section_image: false,
        name: '124901_HardwareEvents.evtx',
        parent_relation: 'DYNAMIC',
        sha256: 'f132dc4fa059d27000ad300480a6ebae3a8175072205ab6b98faa6250e0b4423'
      },
      {
        allow_dynamic_recursion: false,
        classification: 'TLP:CLEAR//VIRUSTOTAL',
        description: 'EVTX generated during analysis',
        is_section_image: false,
        name: '124901_Internet Explorer.evtx',
        parent_relation: 'DYNAMIC',
        sha256: 'f5f9e97a6b1ec8d46a9bd5b9d4ccae96521b85517b0337b248814d2e974a968b'
      },
      {
        allow_dynamic_recursion: false,
        classification: 'TLP:CLEAR//VIRUSTOTAL',
        description: 'EVTX generated during analysis',
        is_section_image: false,
        name: '124901_Microsoft-Windows-Sysmon%4Operational.evtx',
        parent_relation: 'DYNAMIC',
        sha256: '1dfd3ef133a9bfcf1803a247afff93ffad232fce7ca80b4f605402807efa25a2'
      },
      {
        allow_dynamic_recursion: false,
        classification: 'TLP:CLEAR//VIRUSTOTAL',
        description: 'EVTX generated during analysis',
        is_section_image: false,
        name: '124901_OAlerts.evtx',
        parent_relation: 'DYNAMIC',
        sha256: '63fc34ecfe47ebc5f285cad761afd1c472dabacadde241f9f0ce393e06c4140b'
      },
      {
        allow_dynamic_recursion: false,
        classification: 'TLP:CLEAR//VIRUSTOTAL',
        description: 'EVTX generated during analysis',
        is_section_image: false,
        name: '124901_Security.evtx',
        parent_relation: 'DYNAMIC',
        sha256: 'da46968f6ceeeb814fbc6d076f731b8468964da89f3a65409ebbdab5f2706a00'
      },
      {
        allow_dynamic_recursion: false,
        classification: 'TLP:CLEAR//VIRUSTOTAL',
        description: 'EVTX generated during analysis',
        is_section_image: false,
        name: '124901_Setup.evtx',
        parent_relation: 'DYNAMIC',
        sha256: '174fb927ad7e36ab6afe9b6f129746ff17b7de46a35ecbb45156c6b4ff4e9636'
      },
      {
        allow_dynamic_recursion: false,
        classification: 'TLP:CLEAR//VIRUSTOTAL',
        description: 'EVTX generated during analysis',
        is_section_image: false,
        name: '124901_System.evtx',
        parent_relation: 'DYNAMIC',
        sha256: '68eea8471e9e4d01fd73e35a5565d0961c8c58980fe2689e557eb722cbba52af'
      },
      {
        allow_dynamic_recursion: false,
        classification: 'TLP:CLEAR//VIRUSTOTAL',
        description: 'EVTX generated during analysis',
        is_section_image: false,
        name: '124901_Windows PowerShell.evtx',
        parent_relation: 'DYNAMIC',
        sha256: '9f612884b0de13c5f9e6f94509ec7bce41d255ce91cafd0057a38d00bd5a2988'
      },
      {
        allow_dynamic_recursion: false,
        classification: 'TLP:CLEAR//VIRUSTOTAL',
        description: 'File extracted during analysis',
        is_section_image: false,
        name: '124901_fbef05223e03ebdbea9b.exe.log',
        parent_relation: 'DYNAMIC',
        sha256: 'e975c5a531c9dd5043e8dde00bd0657462702e9e3b26ea18344f5b8bc8149a36'
      },
      {
        allow_dynamic_recursion: false,
        classification: 'TLP:CLEAR//VIRUSTOTAL',
        description: 'Memory Dump',
        is_section_image: false,
        name: '124901_1604_1604_7669431436213102025',
        parent_relation: 'MEMDUMP',
        sha256: 'fc0625234d84feda670c040b036b26f00f6be1467bc3bf2a11f0bc14f65a2790'
      },
      {
        allow_dynamic_recursion: false,
        classification: 'TLP:CLEAR//VIRUSTOTAL',
        description: 'PEs extracted from Windows API buffers',
        is_section_image: false,
        name: '1604-CryptDecrypt-e03841ff5c768f68ffae535e799bdfaaefd5f3ce68ea26da75ac5a9520f113f7',
        parent_relation: 'MEMDUMP',
        sha256: 'e03841ff5c768f68ffae535e799bdfaaefd5f3ce68ea26da75ac5a9520f113f7'
      }
    ],
    milestones: {
      service_completed: '2025-09-30T23:17:17.361990Z',
      service_started: '2025-09-30T23:13:59.370192Z'
    },
    service_context: 'Nest Update Range: 2025-09-30 00:00:00 - 2025-10-01 00:00:00',
    service_debug_info: null,
    service_name: 'CAPE',
    service_tool_version: '65e5369',
    service_version: '4.6.0.17',
    supplementary: [
      {
        allow_dynamic_recursion: false,
        classification: 'TLP:CLEAR//VIRUSTOTAL',
        description: 'Screenshot captured during analysis',
        is_section_image: true,
        name: '124901_shots/0001.jpg',
        parent_relation: 'INFORMATION',
        sha256: 'd04a642618911bd231557cfca6734876fd4aa90969f328cd12383a4bdf7af862'
      },
      {
        allow_dynamic_recursion: false,
        classification: 'TLP:CLEAR//VIRUSTOTAL',
        description: 'Screenshot captured during analysis (thumbnail)',
        is_section_image: true,
        name: '124901_shots/0001.jpg.thumb',
        parent_relation: 'INFORMATION',
        sha256: '31093d8a966cfba25c6283783cfe0de7416f14f91b4d05e606ddf0f214a71142'
      },
      {
        allow_dynamic_recursion: false,
        classification: 'TLP:CLEAR//VIRUSTOTAL',
        description: 'Screenshot captured during analysis',
        is_section_image: true,
        name: '124901_shots/0002.jpg',
        parent_relation: 'INFORMATION',
        sha256: 'd04a642618911bd231557cfca6734876fd4aa90969f328cd12383a4bdf7af862'
      },
      {
        allow_dynamic_recursion: false,
        classification: 'TLP:CLEAR//VIRUSTOTAL',
        description: 'Screenshot captured during analysis (thumbnail)',
        is_section_image: true,
        name: '124901_shots/0002.jpg.thumb',
        parent_relation: 'INFORMATION',
        sha256: '31093d8a966cfba25c6283783cfe0de7416f14f91b4d05e606ddf0f214a71142'
      },
      {
        allow_dynamic_recursion: false,
        classification: 'TLP:CLEAR//VIRUSTOTAL',
        description: 'Screenshot captured during analysis',
        is_section_image: true,
        name: '124901_shots/0003.jpg',
        parent_relation: 'INFORMATION',
        sha256: 'd04a642618911bd231557cfca6734876fd4aa90969f328cd12383a4bdf7af862'
      },
      {
        allow_dynamic_recursion: false,
        classification: 'TLP:CLEAR//VIRUSTOTAL',
        description: 'Screenshot captured during analysis (thumbnail)',
        is_section_image: true,
        name: '124901_shots/0003.jpg.thumb',
        parent_relation: 'INFORMATION',
        sha256: '31093d8a966cfba25c6283783cfe0de7416f14f91b4d05e606ddf0f214a71142'
      },
      {
        allow_dynamic_recursion: false,
        classification: 'TLP:CLEAR//VIRUSTOTAL',
        description: 'Screenshot captured during analysis',
        is_section_image: true,
        name: '124901_shots/0004.jpg',
        parent_relation: 'INFORMATION',
        sha256: 'd04a642618911bd231557cfca6734876fd4aa90969f328cd12383a4bdf7af862'
      },
      {
        allow_dynamic_recursion: false,
        classification: 'TLP:CLEAR//VIRUSTOTAL',
        description: 'Screenshot captured during analysis (thumbnail)',
        is_section_image: true,
        name: '124901_shots/0004.jpg.thumb',
        parent_relation: 'INFORMATION',
        sha256: '31093d8a966cfba25c6283783cfe0de7416f14f91b4d05e606ddf0f214a71142'
      },
      {
        allow_dynamic_recursion: false,
        classification: 'TLP:CLEAR//VIRUSTOTAL',
        description: 'Screenshot captured during analysis',
        is_section_image: true,
        name: '124901_shots/0005.jpg',
        parent_relation: 'INFORMATION',
        sha256: 'd04a642618911bd231557cfca6734876fd4aa90969f328cd12383a4bdf7af862'
      },
      {
        allow_dynamic_recursion: false,
        classification: 'TLP:CLEAR//VIRUSTOTAL',
        description: 'Screenshot captured during analysis (thumbnail)',
        is_section_image: true,
        name: '124901_shots/0005.jpg.thumb',
        parent_relation: 'INFORMATION',
        sha256: '31093d8a966cfba25c6283783cfe0de7416f14f91b4d05e606ddf0f214a71142'
      },
      {
        allow_dynamic_recursion: false,
        classification: 'TLP:CLEAR//VIRUSTOTAL',
        description: 'Screenshot captured during analysis',
        is_section_image: true,
        name: '124901_shots/0006.jpg',
        parent_relation: 'INFORMATION',
        sha256: 'd04a642618911bd231557cfca6734876fd4aa90969f328cd12383a4bdf7af862'
      },
      {
        allow_dynamic_recursion: false,
        classification: 'TLP:CLEAR//VIRUSTOTAL',
        description: 'Screenshot captured during analysis (thumbnail)',
        is_section_image: true,
        name: '124901_shots/0006.jpg.thumb',
        parent_relation: 'INFORMATION',
        sha256: '31093d8a966cfba25c6283783cfe0de7416f14f91b4d05e606ddf0f214a71142'
      },
      {
        allow_dynamic_recursion: false,
        classification: 'TLP:CLEAR//VIRUSTOTAL',
        description: 'Screenshot captured during analysis',
        is_section_image: true,
        name: '124901_shots/0007.jpg',
        parent_relation: 'INFORMATION',
        sha256: 'd04a642618911bd231557cfca6734876fd4aa90969f328cd12383a4bdf7af862'
      },
      {
        allow_dynamic_recursion: false,
        classification: 'TLP:CLEAR//VIRUSTOTAL',
        description: 'Screenshot captured during analysis (thumbnail)',
        is_section_image: true,
        name: '124901_shots/0007.jpg.thumb',
        parent_relation: 'INFORMATION',
        sha256: '31093d8a966cfba25c6283783cfe0de7416f14f91b4d05e606ddf0f214a71142'
      },
      {
        allow_dynamic_recursion: false,
        classification: 'TLP:CLEAR//VIRUSTOTAL',
        description: 'Screenshot captured during analysis',
        is_section_image: true,
        name: '124901_shots/0008.jpg',
        parent_relation: 'INFORMATION',
        sha256: 'd04a642618911bd231557cfca6734876fd4aa90969f328cd12383a4bdf7af862'
      },
      {
        allow_dynamic_recursion: false,
        classification: 'TLP:CLEAR//VIRUSTOTAL',
        description: 'Screenshot captured during analysis (thumbnail)',
        is_section_image: true,
        name: '124901_shots/0008.jpg.thumb',
        parent_relation: 'INFORMATION',
        sha256: '31093d8a966cfba25c6283783cfe0de7416f14f91b4d05e606ddf0f214a71142'
      },
      {
        allow_dynamic_recursion: false,
        classification: 'TLP:CLEAR//VIRUSTOTAL',
        description: 'Screenshot captured during analysis',
        is_section_image: true,
        name: '124901_shots/0009.jpg',
        parent_relation: 'INFORMATION',
        sha256: 'd04a642618911bd231557cfca6734876fd4aa90969f328cd12383a4bdf7af862'
      },
      {
        allow_dynamic_recursion: false,
        classification: 'TLP:CLEAR//VIRUSTOTAL',
        description: 'Screenshot captured during analysis (thumbnail)',
        is_section_image: true,
        name: '124901_shots/0009.jpg.thumb',
        parent_relation: 'INFORMATION',
        sha256: '31093d8a966cfba25c6283783cfe0de7416f14f91b4d05e606ddf0f214a71142'
      },
      {
        allow_dynamic_recursion: false,
        classification: 'TLP:CLEAR//VIRUSTOTAL',
        description: 'Screenshot captured during analysis',
        is_section_image: true,
        name: '124901_shots/0010.jpg',
        parent_relation: 'INFORMATION',
        sha256: 'd04a642618911bd231557cfca6734876fd4aa90969f328cd12383a4bdf7af862'
      },
      {
        allow_dynamic_recursion: false,
        classification: 'TLP:CLEAR//VIRUSTOTAL',
        description: 'Screenshot captured during analysis (thumbnail)',
        is_section_image: true,
        name: '124901_shots/0010.jpg.thumb',
        parent_relation: 'INFORMATION',
        sha256: '31093d8a966cfba25c6283783cfe0de7416f14f91b4d05e606ddf0f214a71142'
      },
      {
        allow_dynamic_recursion: false,
        classification: 'TLP:CLEAR//VIRUSTOTAL',
        description: 'Screenshot captured during analysis',
        is_section_image: true,
        name: '124901_shots/0011.jpg',
        parent_relation: 'INFORMATION',
        sha256: 'd04a642618911bd231557cfca6734876fd4aa90969f328cd12383a4bdf7af862'
      },
      {
        allow_dynamic_recursion: false,
        classification: 'TLP:CLEAR//VIRUSTOTAL',
        description: 'Screenshot captured during analysis (thumbnail)',
        is_section_image: true,
        name: '124901_shots/0011.jpg.thumb',
        parent_relation: 'INFORMATION',
        sha256: '31093d8a966cfba25c6283783cfe0de7416f14f91b4d05e606ddf0f214a71142'
      },
      {
        allow_dynamic_recursion: false,
        classification: 'TLP:CLEAR//VIRUSTOTAL',
        description: 'Screenshot captured during analysis',
        is_section_image: true,
        name: '124901_shots/0012.jpg',
        parent_relation: 'INFORMATION',
        sha256: 'd04a642618911bd231557cfca6734876fd4aa90969f328cd12383a4bdf7af862'
      },
      {
        allow_dynamic_recursion: false,
        classification: 'TLP:CLEAR//VIRUSTOTAL',
        description: 'Screenshot captured during analysis (thumbnail)',
        is_section_image: true,
        name: '124901_shots/0012.jpg.thumb',
        parent_relation: 'INFORMATION',
        sha256: '31093d8a966cfba25c6283783cfe0de7416f14f91b4d05e606ddf0f214a71142'
      },
      {
        allow_dynamic_recursion: false,
        classification: 'TLP:CLEAR//VIRUSTOTAL',
        description: 'Screenshot captured during analysis',
        is_section_image: true,
        name: '124901_shots/0013.jpg',
        parent_relation: 'INFORMATION',
        sha256: 'd04a642618911bd231557cfca6734876fd4aa90969f328cd12383a4bdf7af862'
      },
      {
        allow_dynamic_recursion: false,
        classification: 'TLP:CLEAR//VIRUSTOTAL',
        description: 'Screenshot captured during analysis (thumbnail)',
        is_section_image: true,
        name: '124901_shots/0013.jpg.thumb',
        parent_relation: 'INFORMATION',
        sha256: '31093d8a966cfba25c6283783cfe0de7416f14f91b4d05e606ddf0f214a71142'
      },
      {
        allow_dynamic_recursion: false,
        classification: 'TLP:CLEAR//VIRUSTOTAL',
        description: 'Screenshot captured during analysis',
        is_section_image: true,
        name: '124901_shots/0014.jpg',
        parent_relation: 'INFORMATION',
        sha256: '8dee6316fa3bd6b930f870d759450a99a3e75ba308cb323f5a96bc6ef09d7032'
      },
      {
        allow_dynamic_recursion: false,
        classification: 'TLP:CLEAR//VIRUSTOTAL',
        description: 'Screenshot captured during analysis (thumbnail)',
        is_section_image: true,
        name: '124901_shots/0014.jpg.thumb',
        parent_relation: 'INFORMATION',
        sha256: '09ef22430a995e90dee2df4e4db4ab28ccdb0e55c0f55f32dc4d1d7cee0f9528'
      },
      {
        allow_dynamic_recursion: false,
        classification: 'TLP:CLEAR//VIRUSTOTAL',
        description: 'Screenshot captured during analysis',
        is_section_image: true,
        name: '124901_shots/0015.jpg',
        parent_relation: 'INFORMATION',
        sha256: '8dee6316fa3bd6b930f870d759450a99a3e75ba308cb323f5a96bc6ef09d7032'
      },
      {
        allow_dynamic_recursion: false,
        classification: 'TLP:CLEAR//VIRUSTOTAL',
        description: 'Screenshot captured during analysis (thumbnail)',
        is_section_image: true,
        name: '124901_shots/0015.jpg.thumb',
        parent_relation: 'INFORMATION',
        sha256: '09ef22430a995e90dee2df4e4db4ab28ccdb0e55c0f55f32dc4d1d7cee0f9528'
      },
      {
        allow_dynamic_recursion: false,
        classification: 'TLP:CLEAR//VIRUSTOTAL',
        description: 'Screenshot captured during analysis',
        is_section_image: true,
        name: '124901_shots/0016.jpg',
        parent_relation: 'INFORMATION',
        sha256: 'd04a642618911bd231557cfca6734876fd4aa90969f328cd12383a4bdf7af862'
      },
      {
        allow_dynamic_recursion: false,
        classification: 'TLP:CLEAR//VIRUSTOTAL',
        description: 'Screenshot captured during analysis (thumbnail)',
        is_section_image: true,
        name: '124901_shots/0016.jpg.thumb',
        parent_relation: 'INFORMATION',
        sha256: '31093d8a966cfba25c6283783cfe0de7416f14f91b4d05e606ddf0f214a71142'
      },
      {
        allow_dynamic_recursion: false,
        classification: 'TLP:CLEAR//VIRUSTOTAL',
        description: 'Screenshot captured during analysis',
        is_section_image: true,
        name: '124901_shots/0017.jpg',
        parent_relation: 'INFORMATION',
        sha256: '102db5a008430f6e19e0db5fa917ce41cec0aba05678365705d97a619701c83b'
      },
      {
        allow_dynamic_recursion: false,
        classification: 'TLP:CLEAR//VIRUSTOTAL',
        description: 'Screenshot captured during analysis (thumbnail)',
        is_section_image: true,
        name: '124901_shots/0017.jpg.thumb',
        parent_relation: 'INFORMATION',
        sha256: 'c78bbad0900f8526743657bc643dbbb809f097b0f61f70e7ca3027bc81afcea3'
      },
      {
        allow_dynamic_recursion: false,
        classification: 'TLP:CLEAR//VIRUSTOTAL',
        description: 'Screenshot captured during analysis',
        is_section_image: true,
        name: '124901_shots/0018.jpg',
        parent_relation: 'INFORMATION',
        sha256: '102db5a008430f6e19e0db5fa917ce41cec0aba05678365705d97a619701c83b'
      },
      {
        allow_dynamic_recursion: false,
        classification: 'TLP:CLEAR//VIRUSTOTAL',
        description: 'Screenshot captured during analysis (thumbnail)',
        is_section_image: true,
        name: '124901_shots/0018.jpg.thumb',
        parent_relation: 'INFORMATION',
        sha256: 'c78bbad0900f8526743657bc643dbbb809f097b0f61f70e7ca3027bc81afcea3'
      },
      {
        allow_dynamic_recursion: false,
        classification: 'TLP:CLEAR//VIRUSTOTAL',
        description: 'Screenshot captured during analysis',
        is_section_image: true,
        name: '124901_shots/0019.jpg',
        parent_relation: 'INFORMATION',
        sha256: '102db5a008430f6e19e0db5fa917ce41cec0aba05678365705d97a619701c83b'
      },
      {
        allow_dynamic_recursion: false,
        classification: 'TLP:CLEAR//VIRUSTOTAL',
        description: 'Screenshot captured during analysis (thumbnail)',
        is_section_image: true,
        name: '124901_shots/0019.jpg.thumb',
        parent_relation: 'INFORMATION',
        sha256: 'c78bbad0900f8526743657bc643dbbb809f097b0f61f70e7ca3027bc81afcea3'
      },
      {
        allow_dynamic_recursion: false,
        classification: 'TLP:CLEAR//VIRUSTOTAL',
        description: 'Screenshot captured during analysis',
        is_section_image: true,
        name: '124901_shots/0020.jpg',
        parent_relation: 'INFORMATION',
        sha256: '102db5a008430f6e19e0db5fa917ce41cec0aba05678365705d97a619701c83b'
      },
      {
        allow_dynamic_recursion: false,
        classification: 'TLP:CLEAR//VIRUSTOTAL',
        description: 'Screenshot captured during analysis (thumbnail)',
        is_section_image: true,
        name: '124901_shots/0020.jpg.thumb',
        parent_relation: 'INFORMATION',
        sha256: 'c78bbad0900f8526743657bc643dbbb809f097b0f61f70e7ca3027bc81afcea3'
      },
      {
        allow_dynamic_recursion: false,
        classification: 'TLP:CLEAR//VIRUSTOTAL',
        description: 'Screenshot captured during analysis',
        is_section_image: true,
        name: '124901_shots/0021.jpg',
        parent_relation: 'INFORMATION',
        sha256: '102db5a008430f6e19e0db5fa917ce41cec0aba05678365705d97a619701c83b'
      },
      {
        allow_dynamic_recursion: false,
        classification: 'TLP:CLEAR//VIRUSTOTAL',
        description: 'Screenshot captured during analysis (thumbnail)',
        is_section_image: true,
        name: '124901_shots/0021.jpg.thumb',
        parent_relation: 'INFORMATION',
        sha256: 'c78bbad0900f8526743657bc643dbbb809f097b0f61f70e7ca3027bc81afcea3'
      },
      {
        allow_dynamic_recursion: false,
        classification: 'TLP:CLEAR//VIRUSTOTAL',
        description: 'Screenshot captured during analysis',
        is_section_image: true,
        name: '124901_shots/0022.jpg',
        parent_relation: 'INFORMATION',
        sha256: '102db5a008430f6e19e0db5fa917ce41cec0aba05678365705d97a619701c83b'
      },
      {
        allow_dynamic_recursion: false,
        classification: 'TLP:CLEAR//VIRUSTOTAL',
        description: 'Screenshot captured during analysis (thumbnail)',
        is_section_image: true,
        name: '124901_shots/0022.jpg.thumb',
        parent_relation: 'INFORMATION',
        sha256: 'c78bbad0900f8526743657bc643dbbb809f097b0f61f70e7ca3027bc81afcea3'
      },
      {
        allow_dynamic_recursion: false,
        classification: 'TLP:CLEAR//VIRUSTOTAL',
        description: 'Screenshot captured during analysis',
        is_section_image: true,
        name: '124901_shots/0023.jpg',
        parent_relation: 'INFORMATION',
        sha256: 'dbe27ffc77babe667af47074f3b61bdadc7190737f6da3c97c2c591d33e5ce71'
      },
      {
        allow_dynamic_recursion: false,
        classification: 'TLP:CLEAR//VIRUSTOTAL',
        description: 'Screenshot captured during analysis (thumbnail)',
        is_section_image: true,
        name: '124901_shots/0023.jpg.thumb',
        parent_relation: 'INFORMATION',
        sha256: '5a329527758aead754fc862733e909d052bb1625c8bfc676edd1622a7e46656a'
      },
      {
        allow_dynamic_recursion: false,
        classification: 'TLP:CLEAR//VIRUSTOTAL',
        description: 'Screenshot captured during analysis',
        is_section_image: true,
        name: '124901_shots/0024.jpg',
        parent_relation: 'INFORMATION',
        sha256: 'dbe27ffc77babe667af47074f3b61bdadc7190737f6da3c97c2c591d33e5ce71'
      },
      {
        allow_dynamic_recursion: false,
        classification: 'TLP:CLEAR//VIRUSTOTAL',
        description: 'Screenshot captured during analysis (thumbnail)',
        is_section_image: true,
        name: '124901_shots/0024.jpg.thumb',
        parent_relation: 'INFORMATION',
        sha256: '5a329527758aead754fc862733e909d052bb1625c8bfc676edd1622a7e46656a'
      },
      {
        allow_dynamic_recursion: false,
        classification: 'TLP:CLEAR//VIRUSTOTAL',
        description: 'Screenshot captured during analysis',
        is_section_image: true,
        name: '124901_shots/0025.jpg',
        parent_relation: 'INFORMATION',
        sha256: '102db5a008430f6e19e0db5fa917ce41cec0aba05678365705d97a619701c83b'
      },
      {
        allow_dynamic_recursion: false,
        classification: 'TLP:CLEAR//VIRUSTOTAL',
        description: 'Screenshot captured during analysis (thumbnail)',
        is_section_image: true,
        name: '124901_shots/0025.jpg.thumb',
        parent_relation: 'INFORMATION',
        sha256: 'c78bbad0900f8526743657bc643dbbb809f097b0f61f70e7ca3027bc81afcea3'
      },
      {
        allow_dynamic_recursion: false,
        classification: 'TLP:CLEAR//VIRUSTOTAL',
        description: 'Screenshot captured during analysis',
        is_section_image: true,
        name: '124901_shots/0026.jpg',
        parent_relation: 'INFORMATION',
        sha256: '102db5a008430f6e19e0db5fa917ce41cec0aba05678365705d97a619701c83b'
      },
      {
        allow_dynamic_recursion: false,
        classification: 'TLP:CLEAR//VIRUSTOTAL',
        description: 'Screenshot captured during analysis (thumbnail)',
        is_section_image: true,
        name: '124901_shots/0026.jpg.thumb',
        parent_relation: 'INFORMATION',
        sha256: 'c78bbad0900f8526743657bc643dbbb809f097b0f61f70e7ca3027bc81afcea3'
      },
      {
        allow_dynamic_recursion: false,
        classification: 'TLP:CLEAR//VIRUSTOTAL',
        description: 'Screenshot captured during analysis',
        is_section_image: true,
        name: '124901_shots/0027.jpg',
        parent_relation: 'INFORMATION',
        sha256: '102db5a008430f6e19e0db5fa917ce41cec0aba05678365705d97a619701c83b'
      },
      {
        allow_dynamic_recursion: false,
        classification: 'TLP:CLEAR//VIRUSTOTAL',
        description: 'Screenshot captured during analysis (thumbnail)',
        is_section_image: true,
        name: '124901_shots/0027.jpg.thumb',
        parent_relation: 'INFORMATION',
        sha256: 'c78bbad0900f8526743657bc643dbbb809f097b0f61f70e7ca3027bc81afcea3'
      },
      {
        allow_dynamic_recursion: false,
        classification: 'TLP:CLEAR//VIRUSTOTAL',
        description: 'Screenshot captured during analysis',
        is_section_image: true,
        name: '124901_shots/0028.jpg',
        parent_relation: 'INFORMATION',
        sha256: '102db5a008430f6e19e0db5fa917ce41cec0aba05678365705d97a619701c83b'
      },
      {
        allow_dynamic_recursion: false,
        classification: 'TLP:CLEAR//VIRUSTOTAL',
        description: 'Screenshot captured during analysis (thumbnail)',
        is_section_image: true,
        name: '124901_shots/0028.jpg.thumb',
        parent_relation: 'INFORMATION',
        sha256: 'c78bbad0900f8526743657bc643dbbb809f097b0f61f70e7ca3027bc81afcea3'
      },
      {
        allow_dynamic_recursion: false,
        classification: 'TLP:CLEAR//VIRUSTOTAL',
        description: 'Screenshot captured during analysis',
        is_section_image: true,
        name: '124901_shots/0029.jpg',
        parent_relation: 'INFORMATION',
        sha256: '102db5a008430f6e19e0db5fa917ce41cec0aba05678365705d97a619701c83b'
      },
      {
        allow_dynamic_recursion: false,
        classification: 'TLP:CLEAR//VIRUSTOTAL',
        description: 'Screenshot captured during analysis (thumbnail)',
        is_section_image: true,
        name: '124901_shots/0029.jpg.thumb',
        parent_relation: 'INFORMATION',
        sha256: 'c78bbad0900f8526743657bc643dbbb809f097b0f61f70e7ca3027bc81afcea3'
      },
      {
        allow_dynamic_recursion: false,
        classification: 'TLP:CLEAR//VIRUSTOTAL',
        description: 'Screenshot captured during analysis',
        is_section_image: true,
        name: '124901_shots/0030.jpg',
        parent_relation: 'INFORMATION',
        sha256: '102db5a008430f6e19e0db5fa917ce41cec0aba05678365705d97a619701c83b'
      },
      {
        allow_dynamic_recursion: false,
        classification: 'TLP:CLEAR//VIRUSTOTAL',
        description: 'Screenshot captured during analysis (thumbnail)',
        is_section_image: true,
        name: '124901_shots/0030.jpg.thumb',
        parent_relation: 'INFORMATION',
        sha256: 'c78bbad0900f8526743657bc643dbbb809f097b0f61f70e7ca3027bc81afcea3'
      },
      {
        allow_dynamic_recursion: false,
        classification: 'TLP:CLEAR//VIRUSTOTAL',
        description: 'Screenshot captured during analysis',
        is_section_image: true,
        name: '124901_shots/0031.jpg',
        parent_relation: 'INFORMATION',
        sha256: '102db5a008430f6e19e0db5fa917ce41cec0aba05678365705d97a619701c83b'
      },
      {
        allow_dynamic_recursion: false,
        classification: 'TLP:CLEAR//VIRUSTOTAL',
        description: 'Screenshot captured during analysis (thumbnail)',
        is_section_image: true,
        name: '124901_shots/0031.jpg.thumb',
        parent_relation: 'INFORMATION',
        sha256: 'c78bbad0900f8526743657bc643dbbb809f097b0f61f70e7ca3027bc81afcea3'
      },
      {
        allow_dynamic_recursion: false,
        classification: 'TLP:CLEAR//VIRUSTOTAL',
        description: 'Screenshot captured during analysis',
        is_section_image: true,
        name: '124901_shots/0032.jpg',
        parent_relation: 'INFORMATION',
        sha256: '102db5a008430f6e19e0db5fa917ce41cec0aba05678365705d97a619701c83b'
      },
      {
        allow_dynamic_recursion: false,
        classification: 'TLP:CLEAR//VIRUSTOTAL',
        description: 'Screenshot captured during analysis (thumbnail)',
        is_section_image: true,
        name: '124901_shots/0032.jpg.thumb',
        parent_relation: 'INFORMATION',
        sha256: 'c78bbad0900f8526743657bc643dbbb809f097b0f61f70e7ca3027bc81afcea3'
      },
      {
        allow_dynamic_recursion: false,
        classification: 'TLP:CLEAR//VIRUSTOTAL',
        description: 'Screenshot captured during analysis',
        is_section_image: true,
        name: '124901_shots/0033.jpg',
        parent_relation: 'INFORMATION',
        sha256: '102db5a008430f6e19e0db5fa917ce41cec0aba05678365705d97a619701c83b'
      },
      {
        allow_dynamic_recursion: false,
        classification: 'TLP:CLEAR//VIRUSTOTAL',
        description: 'Screenshot captured during analysis (thumbnail)',
        is_section_image: true,
        name: '124901_shots/0033.jpg.thumb',
        parent_relation: 'INFORMATION',
        sha256: 'c78bbad0900f8526743657bc643dbbb809f097b0f61f70e7ca3027bc81afcea3'
      },
      {
        allow_dynamic_recursion: false,
        classification: 'TLP:CLEAR//VIRUSTOTAL',
        description: 'Screenshot captured during analysis',
        is_section_image: true,
        name: '124901_shots/0034.jpg',
        parent_relation: 'INFORMATION',
        sha256: '102db5a008430f6e19e0db5fa917ce41cec0aba05678365705d97a619701c83b'
      },
      {
        allow_dynamic_recursion: false,
        classification: 'TLP:CLEAR//VIRUSTOTAL',
        description: 'Screenshot captured during analysis (thumbnail)',
        is_section_image: true,
        name: '124901_shots/0034.jpg.thumb',
        parent_relation: 'INFORMATION',
        sha256: 'c78bbad0900f8526743657bc643dbbb809f097b0f61f70e7ca3027bc81afcea3'
      },
      {
        allow_dynamic_recursion: false,
        classification: 'TLP:CLEAR//VIRUSTOTAL',
        description: 'Screenshot captured during analysis',
        is_section_image: true,
        name: '124901_shots/0035.jpg',
        parent_relation: 'INFORMATION',
        sha256: '102db5a008430f6e19e0db5fa917ce41cec0aba05678365705d97a619701c83b'
      },
      {
        allow_dynamic_recursion: false,
        classification: 'TLP:CLEAR//VIRUSTOTAL',
        description: 'Screenshot captured during analysis (thumbnail)',
        is_section_image: true,
        name: '124901_shots/0035.jpg.thumb',
        parent_relation: 'INFORMATION',
        sha256: 'c78bbad0900f8526743657bc643dbbb809f097b0f61f70e7ca3027bc81afcea3'
      },
      {
        allow_dynamic_recursion: false,
        classification: 'TLP:CLEAR//VIRUSTOTAL',
        description: 'Screenshot captured during analysis',
        is_section_image: true,
        name: '124901_shots/0036.jpg',
        parent_relation: 'INFORMATION',
        sha256: '102db5a008430f6e19e0db5fa917ce41cec0aba05678365705d97a619701c83b'
      },
      {
        allow_dynamic_recursion: false,
        classification: 'TLP:CLEAR//VIRUSTOTAL',
        description: 'Screenshot captured during analysis (thumbnail)',
        is_section_image: true,
        name: '124901_shots/0036.jpg.thumb',
        parent_relation: 'INFORMATION',
        sha256: 'c78bbad0900f8526743657bc643dbbb809f097b0f61f70e7ca3027bc81afcea3'
      },
      {
        allow_dynamic_recursion: false,
        classification: 'TLP:CLEAR//VIRUSTOTAL',
        description: 'Screenshot captured during analysis',
        is_section_image: true,
        name: '124901_shots/0037.jpg',
        parent_relation: 'INFORMATION',
        sha256: '102db5a008430f6e19e0db5fa917ce41cec0aba05678365705d97a619701c83b'
      },
      {
        allow_dynamic_recursion: false,
        classification: 'TLP:CLEAR//VIRUSTOTAL',
        description: 'Screenshot captured during analysis (thumbnail)',
        is_section_image: true,
        name: '124901_shots/0037.jpg.thumb',
        parent_relation: 'INFORMATION',
        sha256: 'c78bbad0900f8526743657bc643dbbb809f097b0f61f70e7ca3027bc81afcea3'
      },
      {
        allow_dynamic_recursion: false,
        classification: 'TLP:CLEAR//VIRUSTOTAL',
        description: 'Screenshot captured during analysis',
        is_section_image: true,
        name: '124901_shots/0038.jpg',
        parent_relation: 'INFORMATION',
        sha256: '102db5a008430f6e19e0db5fa917ce41cec0aba05678365705d97a619701c83b'
      },
      {
        allow_dynamic_recursion: false,
        classification: 'TLP:CLEAR//VIRUSTOTAL',
        description: 'Screenshot captured during analysis (thumbnail)',
        is_section_image: true,
        name: '124901_shots/0038.jpg.thumb',
        parent_relation: 'INFORMATION',
        sha256: 'c78bbad0900f8526743657bc643dbbb809f097b0f61f70e7ca3027bc81afcea3'
      },
      {
        allow_dynamic_recursion: false,
        classification: 'TLP:CLEAR//VIRUSTOTAL',
        description: 'Screenshot captured during analysis',
        is_section_image: true,
        name: '124901_shots/0039.jpg',
        parent_relation: 'INFORMATION',
        sha256: '102db5a008430f6e19e0db5fa917ce41cec0aba05678365705d97a619701c83b'
      },
      {
        allow_dynamic_recursion: false,
        classification: 'TLP:CLEAR//VIRUSTOTAL',
        description: 'Screenshot captured during analysis (thumbnail)',
        is_section_image: true,
        name: '124901_shots/0039.jpg.thumb',
        parent_relation: 'INFORMATION',
        sha256: 'c78bbad0900f8526743657bc643dbbb809f097b0f61f70e7ca3027bc81afcea3'
      },
      {
        allow_dynamic_recursion: false,
        classification: 'TLP:CLEAR//VIRUSTOTAL',
        description: 'Screenshot captured during analysis',
        is_section_image: true,
        name: '124901_shots/0040.jpg',
        parent_relation: 'INFORMATION',
        sha256: '102db5a008430f6e19e0db5fa917ce41cec0aba05678365705d97a619701c83b'
      },
      {
        allow_dynamic_recursion: false,
        classification: 'TLP:CLEAR//VIRUSTOTAL',
        description: 'Screenshot captured during analysis (thumbnail)',
        is_section_image: true,
        name: '124901_shots/0040.jpg.thumb',
        parent_relation: 'INFORMATION',
        sha256: 'c78bbad0900f8526743657bc643dbbb809f097b0f61f70e7ca3027bc81afcea3'
      },
      {
        allow_dynamic_recursion: false,
        classification: 'TLP:CLEAR//VIRUSTOTAL',
        description: 'Screenshot captured during analysis',
        is_section_image: true,
        name: '124901_shots/0041.jpg',
        parent_relation: 'INFORMATION',
        sha256: '102db5a008430f6e19e0db5fa917ce41cec0aba05678365705d97a619701c83b'
      },
      {
        allow_dynamic_recursion: false,
        classification: 'TLP:CLEAR//VIRUSTOTAL',
        description: 'Screenshot captured during analysis (thumbnail)',
        is_section_image: true,
        name: '124901_shots/0041.jpg.thumb',
        parent_relation: 'INFORMATION',
        sha256: 'c78bbad0900f8526743657bc643dbbb809f097b0f61f70e7ca3027bc81afcea3'
      },
      {
        allow_dynamic_recursion: false,
        classification: 'TLP:CLEAR//VIRUSTOTAL',
        description: 'Screenshot captured during analysis',
        is_section_image: true,
        name: '124901_shots/0042.jpg',
        parent_relation: 'INFORMATION',
        sha256: '102db5a008430f6e19e0db5fa917ce41cec0aba05678365705d97a619701c83b'
      },
      {
        allow_dynamic_recursion: false,
        classification: 'TLP:CLEAR//VIRUSTOTAL',
        description: 'Screenshot captured during analysis (thumbnail)',
        is_section_image: true,
        name: '124901_shots/0042.jpg.thumb',
        parent_relation: 'INFORMATION',
        sha256: 'c78bbad0900f8526743657bc643dbbb809f097b0f61f70e7ca3027bc81afcea3'
      },
      {
        allow_dynamic_recursion: false,
        classification: 'TLP:CLEAR//VIRUSTOTAL',
        description: 'Screenshot captured during analysis',
        is_section_image: true,
        name: '124901_shots/0043.jpg',
        parent_relation: 'INFORMATION',
        sha256: '102db5a008430f6e19e0db5fa917ce41cec0aba05678365705d97a619701c83b'
      },
      {
        allow_dynamic_recursion: false,
        classification: 'TLP:CLEAR//VIRUSTOTAL',
        description: 'Screenshot captured during analysis (thumbnail)',
        is_section_image: true,
        name: '124901_shots/0043.jpg.thumb',
        parent_relation: 'INFORMATION',
        sha256: 'c78bbad0900f8526743657bc643dbbb809f097b0f61f70e7ca3027bc81afcea3'
      },
      {
        allow_dynamic_recursion: false,
        classification: 'TLP:CLEAR//VIRUSTOTAL',
        description: 'Screenshot captured during analysis',
        is_section_image: true,
        name: '124901_shots/0044.jpg',
        parent_relation: 'INFORMATION',
        sha256: '102db5a008430f6e19e0db5fa917ce41cec0aba05678365705d97a619701c83b'
      },
      {
        allow_dynamic_recursion: false,
        classification: 'TLP:CLEAR//VIRUSTOTAL',
        description: 'Screenshot captured during analysis (thumbnail)',
        is_section_image: true,
        name: '124901_shots/0044.jpg.thumb',
        parent_relation: 'INFORMATION',
        sha256: 'c78bbad0900f8526743657bc643dbbb809f097b0f61f70e7ca3027bc81afcea3'
      },
      {
        allow_dynamic_recursion: false,
        classification: 'TLP:CLEAR//VIRUSTOTAL',
        description: 'Screenshot captured during analysis',
        is_section_image: true,
        name: '124901_shots/0045.jpg',
        parent_relation: 'INFORMATION',
        sha256: '102db5a008430f6e19e0db5fa917ce41cec0aba05678365705d97a619701c83b'
      },
      {
        allow_dynamic_recursion: false,
        classification: 'TLP:CLEAR//VIRUSTOTAL',
        description: 'Screenshot captured during analysis (thumbnail)',
        is_section_image: true,
        name: '124901_shots/0045.jpg.thumb',
        parent_relation: 'INFORMATION',
        sha256: 'c78bbad0900f8526743657bc643dbbb809f097b0f61f70e7ca3027bc81afcea3'
      },
      {
        allow_dynamic_recursion: false,
        classification: 'TLP:CLEAR//VIRUSTOTAL',
        description: 'CAPE Sandbox analysis report archive (zip)',
        is_section_image: false,
        name: '124901_cape_report.zip',
        parent_relation: 'INFORMATION',
        sha256: '46189c98ad9990e2fc4b45af7e2e36545b0e3abd9528540006e059bb94015754'
      },
      {
        allow_dynamic_recursion: false,
        classification: 'TLP:CLEAR//VIRUSTOTAL',
        description: 'CAPE Sandbox report (json)',
        is_section_image: false,
        name: '124901_report.json',
        parent_relation: 'INFORMATION',
        sha256: '9153a2855bd9c8ad9e54d37811be0424c499109f8b5fdd1a3ee29d7295fcafe9'
      },
      {
        allow_dynamic_recursion: false,
        classification: 'TLP:CLEAR//VIRUSTOTAL',
        description: 'HollowsHunter trace',
        is_section_image: false,
        name: '124901_hollows.log',
        parent_relation: 'INFORMATION',
        sha256: 'b3d436740520eb4fc3902dfb9aa35eb7b8c79f1f39c88fc32cfe144f0a24accd'
      },
      {
        allow_dynamic_recursion: false,
        classification: 'TLP:CLEAR//VIRUSTOTAL',
        description: 'Result Ontology from CAPE',
        is_section_image: false,
        name: 'cape_fbef05223e03ebdbea9b1f22114e13ea5622e73f0a34e2a52364ce3b3d14a02f.ontology',
        parent_relation: 'INFORMATION',
        sha256: '1d6414e29473bddb28a3d1ad0ff32009c0b30cc2acc0f82fbfb80fe1c74be702'
      }
    ]
  },
  result: {
    score: 7411,
    sections: [
      {
        auto_collapse: false,
        body: null,
        body_config: {},
        body_format: 'TEXT',
        classification: 'TLP:CLEAR//VIRUSTOTAL',
        depth: 0,
        heuristic: null,
        promote_to: null,
        tags: [],
        title_text: 'Analysis Environment Target: win10x64'
      },
      {
        auto_collapse: false,
        body: {
          IP: '169.254.128.88',
          Manager: 'KVM',
          Name: 'cape_u-12_win10x64-39',
          Platform: 'windows',
          Tags: ['win10x64', 'x64']
        },
        body_config: {},
        body_format: 'KEY_VALUE',
        classification: 'TLP:CLEAR//VIRUSTOTAL',
        depth: 1,
        heuristic: null,
        promote_to: null,
        tags: [
          {
            safelisted: false,
            short_type: 'platform',
            type: 'dynamic.operating_system.platform',
            value: 'Windows'
          },
          {
            safelisted: false,
            short_type: 'version',
            type: 'dynamic.operating_system.version',
            value: '10'
          },
          {
            safelisted: false,
            short_type: 'processor',
            type: 'dynamic.operating_system.processor',
            value: 'x64'
          }
        ],
        title_text: 'Machine Information'
      },
      {
        auto_collapse: false,
        body: {
          'CAPE Task ID': 124901,
          'CAPE Version': '2.4-CAPE',
          Duration: '00h 01m 20s\t(2025-09-30 23:15:34.000 to 2025-09-30 23:16:54.000)',
          Routing: 'internet'
        },
        body_config: {},
        body_format: 'KEY_VALUE',
        classification: 'TLP:CLEAR//VIRUSTOTAL',
        depth: 1,
        heuristic: null,
        promote_to: null,
        tags: [],
        title_text: 'Analysis Information'
      },
      {
        auto_collapse: false,
        body: null,
        body_config: {},
        body_format: 'TEXT',
        classification: 'TLP:CLEAR//VIRUSTOTAL',
        depth: 1,
        heuristic: null,
        promote_to: null,
        tags: [],
        title_text: 'Network Activity'
      },
      {
        auto_collapse: false,
        body: [
          {
            answer: '208.95.112.1',
            domain: 'ip-api.com',
            type: 'A'
          }
        ],
        body_config: {
          column_order: ['domain', 'answer', 'type']
        },
        body_format: 'TABLE',
        classification: 'TLP:CLEAR//VIRUSTOTAL',
        depth: 2,
        heuristic: {
          attack: [],
          heur_id: 'CAPE.1000',
          name: 'Domain detected',
          score: 10,
          signature: []
        },
        promote_to: null,
        tags: [
          {
            safelisted: false,
            short_type: 'domain',
            type: 'network.dynamic.domain',
            value: 'ip-api.com'
          },
          {
            safelisted: false,
            short_type: 'ip',
            type: 'network.dynamic.ip',
            value: '52.140.118.28'
          },
          {
            safelisted: false,
            short_type: 'ip',
            type: 'network.dynamic.ip',
            value: '52.167.17.97'
          },
          {
            safelisted: false,
            short_type: 'ip',
            type: 'network.dynamic.ip',
            value: '40.119.249.228'
          },
          {
            safelisted: false,
            short_type: 'ip',
            type: 'network.dynamic.ip',
            value: '23.223.17.132'
          },
          {
            safelisted: false,
            short_type: 'ip',
            type: 'network.dynamic.ip',
            value: '23.223.17.133'
          },
          {
            safelisted: false,
            short_type: 'ip',
            type: 'network.dynamic.ip',
            value: '23.192.53.222'
          },
          {
            safelisted: false,
            short_type: 'ip',
            type: 'network.dynamic.ip',
            value: '40.91.76.224'
          },
          {
            safelisted: false,
            short_type: 'ip',
            type: 'network.dynamic.ip',
            value: '208.95.112.1'
          },
          {
            safelisted: false,
            short_type: 'protocol',
            type: 'network.protocol',
            value: 'dns'
          }
        ],
        title_text: 'Protocol: DNS'
      },
      {
        auto_collapse: false,
        body: [
          {
            ioc: 'http://ip-api.com/line/?fields=hosting',
            ioc_type: 'uri'
          }
        ],
        body_config: {
          column_order: ['ioc_type', 'ioc']
        },
        body_format: 'TABLE',
        classification: 'TLP:CLEAR//VIRUSTOTAL',
        depth: 2,
        heuristic: {
          attack: [],
          heur_id: 'CAPE.1013',
          name: 'Unseen IOCs found in API calls',
          score: 1,
          signature: []
        },
        promote_to: null,
        tags: [
          {
            safelisted: false,
            short_type: 'domain',
            type: 'network.dynamic.domain',
            value: 'ip-api.com'
          },
          {
            safelisted: false,
            short_type: 'uri',
            type: 'network.dynamic.uri',
            value: 'http://ip-api.com/line/?fields=hosting'
          },
          {
            safelisted: false,
            short_type: 'uri_path',
            type: 'network.dynamic.uri_path',
            value: '/line/?fields=hosting'
          }
        ],
        title_text: 'Unseen IOCs found in API calls'
      },
      {
        auto_collapse: false,
        body: null,
        body_config: {},
        body_format: 'TEXT',
        classification: 'TLP:CLEAR//VIRUSTOTAL',
        depth: 1,
        heuristic: null,
        promote_to: null,
        tags: [],
        title_text: 'Signatures'
      },
      {
        auto_collapse: false,
        body: [
          ['TEXT', 'Checks available memory', {}],
          ['TEXT', 'Processes involved: C:\\Users\\buddy\\AppData\\Local\\Temp\\fbef05223e03ebdbea9b.exe (1604)', {}]
        ],
        body_config: {},
        body_format: 'MULTI',
        classification: 'TLP:CLEAR//VIRUSTOTAL',
        depth: 2,
        heuristic: {
          attack: [
            {
              attack_id: 'T1007',
              categories: ['discovery'],
              pattern: 'System Service Discovery'
            },
            {
              attack_id: 'T1497',
              categories: ['defense-evasion', 'discovery'],
              pattern: 'Virtualization/Sandbox Evasion'
            }
          ],
          heur_id: 'CAPE.7',
          name: 'Anti-vm',
          score: 10,
          signature: [
            {
              frequency: 1,
              name: 'antivm_checks_available_memory',
              safe: false
            }
          ]
        },
        promote_to: null,
        tags: [],
        title_text: 'Signature: antivm_checks_available_memory'
      },
      {
        auto_collapse: false,
        body: [
          ['TEXT', 'Queries computer hostname', {}],
          ['TEXT', 'Processes involved: C:\\Windows\\Microsoft.NET\\Framework\\v4.0.30319\\RegAsm.exe (212)', {}]
        ],
        body_config: {},
        body_format: 'MULTI',
        classification: 'TLP:CLEAR//VIRUSTOTAL',
        depth: 2,
        heuristic: {
          attack: [],
          heur_id: 'CAPE.9999',
          name: 'Unknown',
          score: 10,
          signature: [
            {
              frequency: 1,
              name: 'queries_computer_name',
              safe: false
            }
          ]
        },
        promote_to: null,
        tags: [],
        title_text: 'Signature: queries_computer_name'
      },
      {
        auto_collapse: false,
        body: [
          ['TEXT', 'Queries the username', {}],
          ['TEXT', 'Processes involved: C:\\Windows\\Microsoft.NET\\Framework\\v4.0.30319\\RegAsm.exe (212)', {}]
        ],
        body_config: {},
        body_format: 'MULTI',
        classification: 'TLP:CLEAR//VIRUSTOTAL',
        depth: 2,
        heuristic: {
          attack: [],
          heur_id: 'CAPE.9999',
          name: 'Unknown',
          score: 10,
          signature: [
            {
              frequency: 1,
              name: 'queries_user_name',
              safe: false
            }
          ]
        },
        promote_to: null,
        tags: [],
        title_text: 'Signature: queries_user_name'
      },
      {
        auto_collapse: false,
        body: [
          ['TEXT', 'Queries the keyboard layout', {}],
          ['TEXT', 'Processes involved: C:\\Windows\\Microsoft.NET\\Framework\\v4.0.30319\\RegAsm.exe (212)', {}]
        ],
        body_config: {},
        body_format: 'MULTI',
        classification: 'TLP:CLEAR//VIRUSTOTAL',
        depth: 2,
        heuristic: {
          attack: [],
          heur_id: 'CAPE.20',
          name: 'Discovery',
          score: 10,
          signature: [
            {
              frequency: 1,
              name: 'queries_keyboard_layout',
              safe: false
            }
          ]
        },
        promote_to: null,
        tags: [],
        title_text: 'Signature: queries_keyboard_layout'
      },
      {
        auto_collapse: false,
        body: [
          ['TEXT', 'Checks adapter addresses which can be used to detect virtual network interfaces', {}],
          ['TEXT', 'Processes involved: C:\\Windows\\Microsoft.NET\\Framework\\v4.0.30319\\RegAsm.exe (212)', {}]
        ],
        body_config: {},
        body_format: 'MULTI',
        classification: 'TLP:CLEAR//VIRUSTOTAL',
        depth: 2,
        heuristic: {
          attack: [
            {
              attack_id: 'T1007',
              categories: ['discovery'],
              pattern: 'System Service Discovery'
            },
            {
              attack_id: 'T1497',
              categories: ['defense-evasion', 'discovery'],
              pattern: 'Virtualization/Sandbox Evasion'
            }
          ],
          heur_id: 'CAPE.7',
          name: 'Anti-vm',
          score: 10,
          signature: [
            {
              frequency: 1,
              name: 'antivm_network_adapters',
              safe: false
            }
          ]
        },
        promote_to: null,
        tags: [],
        title_text: 'Signature: antivm_network_adapters'
      },
      {
        auto_collapse: false,
        body: [
          ['TEXT', 'Checks system language via registry key (possible geofencing)', {}],
          [
            'KEY_VALUE',
            {
              regkey: 'HKEY_LOCAL_MACHINE\\SYSTEM\\ControlSet001\\Control\\Nls\\CustomLocale\\en-US'
            },
            {}
          ],
          [
            'KEY_VALUE',
            {
              regkey: 'HKEY_LOCAL_MACHINE\\SYSTEM\\ControlSet001\\Control\\Nls\\ExtendedLocale\\en-US'
            },
            {}
          ]
        ],
        body_config: {},
        body_format: 'MULTI',
        classification: 'TLP:CLEAR//VIRUSTOTAL',
        depth: 2,
        heuristic: {
          attack: [],
          heur_id: 'CAPE.9999',
          name: 'Unknown',
          score: 10,
          signature: [
            {
              frequency: 1,
              name: 'language_check_registry',
              safe: false
            }
          ]
        },
        promote_to: null,
        tags: [
          {
            safelisted: false,
            short_type: 'registry_key',
            type: 'dynamic.registry_key',
            value: 'HKEY_LOCAL_MACHINE\\SYSTEM\\ControlSet001\\Control\\Nls\\CustomLocale\\en-US'
          },
          {
            safelisted: false,
            short_type: 'registry_key',
            type: 'dynamic.registry_key',
            value: 'HKEY_LOCAL_MACHINE\\SYSTEM\\ControlSet001\\Control\\Nls\\ExtendedLocale\\en-US'
          }
        ],
        title_text: 'Signature: language_check_registry'
      },
      {
        auto_collapse: false,
        body: [
          ['TEXT', 'Guard pages use detected - possible anti-debugging.', {}],
          ['TEXT', 'Processes involved: C:\\Users\\buddy\\AppData\\Local\\Temp\\fbef05223e03ebdbea9b.exe (1604)', {}]
        ],
        body_config: {},
        body_format: 'MULTI',
        classification: 'TLP:CLEAR//VIRUSTOTAL',
        depth: 2,
        heuristic: {
          attack: [
            {
              attack_id: 'T1057',
              categories: ['discovery'],
              pattern: 'Process Discovery'
            },
            {
              attack_id: 'T1518.001',
              categories: ['discovery'],
              pattern: 'Security Software Discovery'
            }
          ],
          heur_id: 'CAPE.4',
          name: 'Anti-debug',
          score: 30,
          signature: [
            {
              frequency: 1,
              name: 'antidebug_guardpages',
              safe: false
            }
          ]
        },
        promote_to: null,
        tags: [],
        title_text: 'Signature: antidebug_guardpages'
      },
      {
        auto_collapse: false,
        body: [
          ['TEXT', 'Performs HTTP requests potentially not found in PCAP.', {}],
          [
            'KEY_VALUE',
            {
              url: 'http://ip-api.com/line/?fields=hosting'
            },
            {}
          ],
          ['TEXT', 'Processes involved: C:\\Windows\\Microsoft.NET\\Framework\\v4.0.30319\\RegAsm.exe (212)', {}]
        ],
        body_config: {},
        body_format: 'MULTI',
        classification: 'TLP:CLEAR//VIRUSTOTAL',
        depth: 2,
        heuristic: {
          attack: [],
          heur_id: 'CAPE.41',
          name: 'Network',
          score: 30,
          signature: [
            {
              frequency: 1,
              name: 'http_request',
              safe: false
            }
          ]
        },
        promote_to: null,
        tags: [
          {
            safelisted: false,
            short_type: 'domain',
            type: 'network.dynamic.domain',
            value: 'ip-api.com'
          },
          {
            safelisted: false,
            short_type: 'uri',
            type: 'network.dynamic.uri',
            value: 'http://ip-api.com/line/?fields=hosting'
          },
          {
            safelisted: false,
            short_type: 'uri_path',
            type: 'network.dynamic.uri_path',
            value: '/line/?fields=hosting'
          }
        ],
        title_text: 'Signature: http_request'
      },
      {
        auto_collapse: false,
        body: [
          ['TEXT', 'Resumed a thread in another process', {}],
          [
            'KEY_VALUE',
            {
              thread_resumed:
                'Process fbef05223e03ebdbea9b.exe with process ID 1604 resumed a thread in another process with the process ID 212'
            },
            {}
          ],
          ['TEXT', 'Processes involved: C:\\Users\\buddy\\AppData\\Local\\Temp\\fbef05223e03ebdbea9b.exe (1604)', {}]
        ],
        body_config: {},
        body_format: 'MULTI',
        classification: 'TLP:CLEAR//VIRUSTOTAL',
        depth: 2,
        heuristic: {
          attack: [
            {
              attack_id: 'T1055',
              categories: ['defense-evasion', 'privilege-escalation'],
              pattern: 'Process Injection'
            }
          ],
          heur_id: 'CAPE.32',
          name: 'Injection',
          score: 30,
          signature: [
            {
              frequency: 1,
              name: 'resumethread_remote_process',
              safe: false
            }
          ]
        },
        promote_to: null,
        tags: [],
        title_text: 'Signature: resumethread_remote_process'
      },
      {
        auto_collapse: false,
        body: [
          ['TEXT', 'Writes to the memory another process', {}],
          [
            'KEY_VALUE',
            {
              write_memory:
                'Process fbef05223e03ebdbea9b.exe with process ID 1604 wrote to the memory of process handle 0x0000040c'
            },
            {}
          ],
          ['TEXT', 'Processes involved: C:\\Users\\buddy\\AppData\\Local\\Temp\\fbef05223e03ebdbea9b.exe (1604)', {}]
        ],
        body_config: {},
        body_format: 'MULTI',
        classification: 'TLP:CLEAR//VIRUSTOTAL',
        depth: 2,
        heuristic: {
          attack: [],
          heur_id: 'CAPE.9999',
          name: 'Unknown',
          score: 30,
          signature: [
            {
              frequency: 1,
              name: 'injection_write_process',
              safe: false
            }
          ]
        },
        promote_to: null,
        tags: [],
        title_text: 'Signature: injection_write_process'
      },
      {
        auto_collapse: false,
        body: [
          ['TEXT', 'Reads from the memory of another process', {}],
          [
            'KEY_VALUE',
            {
              read_memory:
                'Process fbef05223e03ebdbea9b.exe with process ID 1604 read from the memory of process handle 0x0000040c'
            },
            {}
          ],
          ['TEXT', 'Processes involved: C:\\Users\\buddy\\AppData\\Local\\Temp\\fbef05223e03ebdbea9b.exe (1604)', {}]
        ],
        body_config: {},
        body_format: 'MULTI',
        classification: 'TLP:CLEAR//VIRUSTOTAL',
        depth: 2,
        heuristic: {
          attack: [],
          heur_id: 'CAPE.9999',
          name: 'Unknown',
          score: 30,
          signature: [
            {
              frequency: 1,
              name: 'reads_memory_remote_process',
              safe: false
            }
          ]
        },
        promote_to: null,
        tags: [],
        title_text: 'Signature: reads_memory_remote_process'
      },
      {
        auto_collapse: false,
        body: [
          ['TEXT', 'The binary contains an unknown PE section name indicative of packing', {}],
          [
            'KEY_VALUE',
            {
              'unknown section': {
                characteristics: 'IMAGE_SCN_CNT_INITIALIZED_DATA|IMAGE_SCN_MEM_READ|IMAGE_SCN_MEM_WRITE',
                characteristics_raw: '0xc0000040',
                entropy: '6.64',
                name: '.sdata',
                raw_address: '0x000af600',
                size_of_data: '0x00000200',
                virtual_address: '0x000b2000',
                virtual_size: '0x000001e8'
              }
            },
            {}
          ]
        ],
        body_config: {},
        body_format: 'MULTI',
        classification: 'TLP:CLEAR//VIRUSTOTAL',
        depth: 2,
        heuristic: {
          attack: [
            {
              attack_id: 'T1027.002',
              categories: ['defense-evasion'],
              pattern: 'Software Packing'
            }
          ],
          heur_id: 'CAPE.43',
          name: 'Packer',
          score: 30,
          signature: [
            {
              frequency: 1,
              name: 'packer_unknown_pe_section_name',
              safe: false
            }
          ]
        },
        promote_to: null,
        tags: [],
        title_text: 'Signature: packer_unknown_pe_section_name'
      },
      {
        auto_collapse: false,
        body: [
          ['TEXT', 'Looks up the external IP address', {}],
          [
            'KEY_VALUE',
            {
              domain: 'ip-api.com'
            },
            {}
          ]
        ],
        body_config: {},
        body_format: 'MULTI',
        classification: 'TLP:CLEAR//VIRUSTOTAL',
        depth: 2,
        heuristic: {
          attack: [],
          heur_id: 'CAPE.20',
          name: 'Discovery',
          score: 30,
          signature: [
            {
              frequency: 1,
              name: 'recon_checkip',
              safe: false
            }
          ]
        },
        promote_to: null,
        tags: [
          {
            safelisted: false,
            short_type: 'domain',
            type: 'network.dynamic.domain',
            value: 'ip-api.com'
          }
        ],
        title_text: 'Signature: recon_checkip'
      },
      {
        auto_collapse: false,
        body: [
          ['TEXT', 'Creates RWX memory', {}],
          ['TEXT', 'Processes involved: C:\\Users\\buddy\\AppData\\Local\\Temp\\fbef05223e03ebdbea9b.exe (1604)', {}]
        ],
        body_config: {},
        body_format: 'MULTI',
        classification: 'TLP:CLEAR//VIRUSTOTAL',
        depth: 2,
        heuristic: {
          attack: [
            {
              attack_id: 'T1055',
              categories: ['defense-evasion', 'privilege-escalation'],
              pattern: 'Process Injection'
            }
          ],
          heur_id: 'CAPE.32',
          name: 'Injection',
          score: 30,
          signature: [
            {
              frequency: 1,
              name: 'injection_rwx',
              safe: false
            }
          ]
        },
        promote_to: null,
        tags: [],
        title_text: 'Signature: injection_rwx'
      },
      {
        auto_collapse: false,
        body: [
          ['TEXT', 'Writes an executable to the memory of another process', {}],
          [
            'KEY_VALUE',
            {
              write_exe_memory:
                'Process fbef05223e03ebdbea9b.exe with process ID 1604 wrote an executable to the process handle 0x0000040c'
            },
            {}
          ],
          ['TEXT', 'Processes involved: C:\\Users\\buddy\\AppData\\Local\\Temp\\fbef05223e03ebdbea9b.exe (1604)', {}]
        ],
        body_config: {},
        body_format: 'MULTI',
        classification: 'TLP:CLEAR//VIRUSTOTAL',
        depth: 2,
        heuristic: {
          attack: [],
          heur_id: 'CAPE.9999',
          name: 'Unknown',
          score: 50,
          signature: [
            {
              frequency: 1,
              name: 'injection_write_exe_process',
              safe: false
            }
          ]
        },
        promote_to: null,
        tags: [],
        title_text: 'Signature: injection_write_exe_process'
      },
      {
        auto_collapse: false,
        body: [
          ['TEXT', 'Yara detections observed in process dumps, payloads or dropped files', {}],
          [
            'KEY_VALUE',
            {
              Hit: "PID 212 triggered the Yara rule 'INDICATOR_SUSPICIOUS_EXE_SandboxHookingDLL' with data '['S\\x00b\\x00i\\x00e\\x00D\\x00l\\x00l\\x00.\\x00d\\x00l\\x00l\\x00', 'S\\x00x\\x00I\\x00n\\x00.\\x00d\\x00l\\x00l\\x00', 'S\\x00f\\x002\\x00.\\x00d\\x00l\\x00l\\x00']'"
            },
            {}
          ],
          [
            'KEY_VALUE',
            {
              Hit: "PID 212 triggered the Yara rule 'INDICATOR_SUSPICIOUS_EXE_VaultSchemaGUID' with data '['2\\x00F\\x001\\x00A\\x006\\x005\\x000\\x004\\x00-\\x000\\x006\\x004\\x001\\x00-\\x004\\x004\\x00C\\x00F\\x00-\\x008\\x00B\\x00B\\x005\\x00-\\x003\\x006\\x001\\x002\\x00D\\x008\\x006\\x005\\x00F\\x002\\x00E\\x005\\x00', '3\\x00C\\x00C\\x00D\\x005\\x004\\x009\\x009\\x00-\\x008\\x007\\x00A\\x008\\x00-\\x004\\x00B\\x001\\x000\\x00-\\x00A\\x002\\x001\\x005\\x00-\\x006\\x000\\x008\\x008\\x008\\x008\\x00D\\x00D\\x003\\x00B\\x005\\x005\\x00', '1\\x005\\x004\\x00E\\x002\\x003\\x00D\\x000\\x00-\\x00C\\x006\\x004..."
            },
            {}
          ],
          [
            'KEY_VALUE',
            {
              Hit: "PID 212 triggered the Yara rule 'INDICATOR_EXE_Packed_GEN01' with data '['com.apple.Safari', 'Unable to resolve HTTP prox', 'A\\x00c\\x00c\\x00o\\x00u\\x00n\\x00t\\x00s\\x00', 'l\\x00o\\x00g\\x00i\\x00n\\x00s\\x00', 's\\x00h\\x00a\\x005\\x001\\x002\\x00', 'c\\x00r\\x00e\\x00d\\x00e\\x00n\\x00t\\x00i\\x00a\\x00l\\x00']'"
            },
            {}
          ],
          [
            'KEY_VALUE',
            {
              Hit: "PID 212 triggered the Yara rule 'AgentTeslaV2' with data '['GetPrivateProfileString', 'get_OSFullName', 'remove_Key', 'FtpWebRequest', 'l\\x00o\\x00g\\x00i\\x00n\\x00s\\x00', '1\\x00.\\x008\\x005\\x00 \\x00(\\x00H\\x00a\\x00s\\x00h\\x00,\\x00 \\x00v\\x00e\\x00r\\x00s\\x00i\\x00o\\x00n\\x00 \\x002\\x00,\\x00 \\x00n\\x00a\\x00t\\x00i\\x00v\\x00e\\x00 \\x00b\\x00y\\x00t\\x00e\\x00-\\x00o\\x00r\\x00d\\x00e\\x00r\\x00)\\x00']'"
            },
            {}
          ],
          [
            'KEY_VALUE',
            {
              Hit: "PID 212 triggered the Yara rule 'AgentTeslaV3' with data '['l\\x00o\\x00g\\x00i\\x00n\\x00s\\x00', 'c\\x00r\\x00e\\x00d\\x00e\\x00n\\x00t\\x00i\\x00a\\x00l\\x00', 'set_Lenght', 'get_Keys', 'set_AllowAutoRedirect', 'set_UseShellExecute', 'set_RedirectStandardOutput', 'get_Password', 'get_CtrlKeyDown', 'get_ShiftKeyDown', 'get_AltKeyDown']'"
            },
            {}
          ],
          [
            'KEY_VALUE',
            {
              Hit: "PID 212 triggered the Yara rule 'AgentTeslaV5' with data '['<\\x00b\\x00r\\x00>\\x00U\\x00s\\x00e\\x00r\\x00 \\x00N\\x00a\\x00m\\x00e\\x00:\\x00 \\x00', '<\\x00b\\x00r\\x00>\\x00U\\x00s\\x00e\\x00r\\x00n\\x00a\\x00m\\x00e\\x00:\\x00 \\x00', '<\\x00b\\x00r\\x00>\\x00R\\x00A\\x00M\\x00:\\x00 \\x00', '<\\x00b\\x00r\\x00>\\x00P\\x00a\\x00s\\x00s\\x00w\\x00o\\x00r\\x00d\\x00:\\x00 \\x00', '<\\x00b\\x00r\\x00>\\x00O\\x00S\\x00F\\x00u\\x00l\\x00l\\x00N\\x00a\\x00m\\x00e\\x00:\\x00 \\x00', '<\\x00b\\x00r\\x00>\\x00<\\x00h\\x00r\\x00>\\x00C\\x00o\\x00p\\x00i\\x00e\\x00d\\x00 \\x00T\\x00e\\x00x\\x00t\\..."
            },
            {}
          ],
          [
            'KEY_VALUE',
            {
              Hit: "PID 1604 triggered the Yara rule 'INDICATOR_SUSPICIOUS_EXE_SandboxHookingDLL' with data '['S\\x00b\\x00i\\x00e\\x00D\\x00l\\x00l\\x00.\\x00d\\x00l\\x00l\\x00', 'S\\x00x\\x00I\\x00n\\x00.\\x00d\\x00l\\x00l\\x00', 'S\\x00f\\x002\\x00.\\x00d\\x00l\\x00l\\x00']'"
            },
            {}
          ],
          [
            'KEY_VALUE',
            {
              Hit: "PID 1604 triggered the Yara rule 'INDICATOR_SUSPICIOUS_EXE_VaultSchemaGUID' with data '['2\\x00F\\x001\\x00A\\x006\\x005\\x000\\x004\\x00-\\x000\\x006\\x004\\x001\\x00-\\x004\\x004\\x00C\\x00F\\x00-\\x008\\x00B\\x00B\\x005\\x00-\\x003\\x006\\x001\\x002\\x00D\\x008\\x006\\x005\\x00F\\x002\\x00E\\x005\\x00', '3\\x00C\\x00C\\x00D\\x005\\x004\\x009\\x009\\x00-\\x008\\x007\\x00A\\x008\\x00-\\x004\\x00B\\x001\\x000\\x00-\\x00A\\x002\\x001\\x005\\x00-\\x006\\x000\\x008\\x008\\x008\\x008\\x00D\\x00D\\x003\\x00B\\x005\\x005\\x00', '1\\x005\\x004\\x00E\\x002\\x003\\x00D\\x000\\x00-\\x00C\\x006\\x00..."
            },
            {}
          ],
          [
            'KEY_VALUE',
            {
              Hit: "PID 1604 triggered the Yara rule 'INDICATOR_EXE_Packed_GEN01' with data '['com.apple.Safari', 'Unable to resolve HTTP prox', 'A\\x00c\\x00c\\x00o\\x00u\\x00n\\x00t\\x00s\\x00', 'l\\x00o\\x00g\\x00i\\x00n\\x00s\\x00', 's\\x00h\\x00a\\x005\\x001\\x002\\x00', 'c\\x00r\\x00e\\x00d\\x00e\\x00n\\x00t\\x00i\\x00a\\x00l\\x00']'"
            },
            {}
          ],
          [
            'KEY_VALUE',
            {
              Hit: "PID 1604 triggered the Yara rule 'AgentTeslaV2' with data '['GetPrivateProfileString', 'get_OSFullName', 'remove_Key', 'FtpWebRequest', 'l\\x00o\\x00g\\x00i\\x00n\\x00s\\x00', '1\\x00.\\x008\\x005\\x00 \\x00(\\x00H\\x00a\\x00s\\x00h\\x00,\\x00 \\x00v\\x00e\\x00r\\x00s\\x00i\\x00o\\x00n\\x00 \\x002\\x00,\\x00 \\x00n\\x00a\\x00t\\x00i\\x00v\\x00e\\x00 \\x00b\\x00y\\x00t\\x00e\\x00-\\x00o\\x00r\\x00d\\x00e\\x00r\\x00)\\x00']'"
            },
            {}
          ],
          ['TEXT', 'There were 2 more marks that were not displayed.', {}],
          [
            'TEXT',
            'Processes involved: C:\\Windows\\Microsoft.NET\\Framework\\v4.0.30319\\RegAsm.exe (212),C:\\Users\\buddy\\AppData\\Local\\Temp\\fbef05223e03ebdbea9b.exe (1604)',
            {}
          ]
        ],
        body_config: {},
        body_format: 'MULTI',
        classification: 'TLP:CLEAR//VIRUSTOTAL',
        depth: 2,
        heuristic: {
          attack: [],
          heur_id: 'CAPE.55',
          name: 'CAPE Yara Hit',
          score: 6000,
          signature: [
            {
              frequency: 1,
              name: 'procmem_yara',
              safe: false
            },
            {
              frequency: 2,
              name: 'indicator_suspicious_exe_sandboxhookingdll',
              safe: false
            },
            {
              frequency: 2,
              name: 'indicator_suspicious_exe_vaultschemaguid',
              safe: false
            },
            {
              frequency: 2,
              name: 'indicator_exe_packed_gen01',
              safe: false
            },
            {
              frequency: 2,
              name: 'ftpwebrequest',
              safe: false
            },
            {
              frequency: 2,
              name: 'get_altkeydown',
              safe: false
            },
            {
              frequency: 2,
              name: 'agentteslav5',
              safe: false
            }
          ]
        },
        promote_to: null,
        tags: [
          {
            safelisted: false,
            short_type: 'cape',
            type: 'file.rule.cape',
            value: 'internal-cape-community-yara.INDICATOR_SUSPICIOUS_EXE_SandboxHookingDLL'
          },
          {
            safelisted: false,
            short_type: 'cape',
            type: 'file.rule.cape',
            value: 'internal-cape-community-yara.INDICATOR_SUSPICIOUS_EXE_VaultSchemaGUID'
          },
          {
            safelisted: false,
            short_type: 'cape',
            type: 'file.rule.cape',
            value: 'internal-cape-community-yara.INDICATOR_EXE_Packed_GEN01'
          },
          {
            safelisted: false,
            short_type: 'cape',
            type: 'file.rule.cape',
            value: 'CAPE.FtpWebRequest'
          },
          {
            safelisted: false,
            short_type: 'cape',
            type: 'file.rule.cape',
            value: 'CAPE.get_AltKeyDown'
          },
          {
            safelisted: false,
            short_type: 'cape',
            type: 'file.rule.cape',
            value: 'internal-cape-yara.AgentTeslaV5'
          }
        ],
        title_text: 'Signature: procmem_yara'
      },
      {
        auto_collapse: false,
        body: [
          ['TEXT', 'Anomalous binary characteristics', {}],
          [
            'KEY_VALUE',
            {
              anomaly: 'Entrypoint of binary is located outside of any mapped sections'
            },
            {}
          ]
        ],
        body_config: {},
        body_format: 'MULTI',
        classification: 'TLP:CLEAR//VIRUSTOTAL',
        depth: 2,
        heuristic: {
          attack: [],
          heur_id: 'CAPE.51',
          name: 'Static',
          score: 50,
          signature: [
            {
              frequency: 1,
              name: 'static_pe_anomaly',
              safe: false
            }
          ]
        },
        promote_to: null,
        tags: [],
        title_text: 'Signature: static_pe_anomaly'
      },
      {
        auto_collapse: false,
        body: [
          {
            children: [
              {
                children: [],
                command_line: '\\??\\C:\\WINDOWS\\system32\\conhost.exe 0xffffffff -ForceV1',
                file_count: 0,
                network_count: 0,
                process_name: 'C:\\Windows\\System32\\conhost.exe',
                process_pid: 8172,
                registry_count: 0,
                safelisted: false,
                signatures: {}
              }
            ],
            command_line:
              'C:\\WINDOWS\\System32\\WaaSMedicAgent.exe 7084911abcd9322f02526b7ad85620a6 XUUsoIrZn0KtQReYgXqMWg.0.1.0.0.0',
            file_count: 0,
            network_count: 0,
            process_name: 'C:\\Windows\\System32\\WaaSMedicAgent.exe',
            process_pid: 7176,
            registry_count: 0,
            safelisted: true,
            signatures: {}
          },
          {
            children: [],
            command_line: null,
            file_count: 0,
            network_count: 0,
            process_name: 'C:\\Windows\\System32\\MusNotification.exe',
            process_pid: 4184,
            registry_count: 0,
            safelisted: false,
            signatures: {}
          },
          {
            children: [
              {
                children: [
                  {
                    children: [],
                    command_line:
                      'C:\\WINDOWS\\system32\\services.exe 600 "batmeter.dll" 39a1d4c1-d312-4688-a677-e16691ba68e',
                    file_count: 0,
                    network_count: 0,
                    process_name: 'C:\\Windows\\System32\\services.exe',
                    process_pid: 7968,
                    registry_count: 0,
                    safelisted: false,
                    signatures: {}
                  },
                  {
                    children: [],
                    command_line: '\\??\\C:\\WINDOWS\\system32\\conhost.exe 0xffffffff -ForceV1',
                    file_count: 0,
                    network_count: 0,
                    process_name: 'C:\\Windows\\System32\\conhost.exe',
                    process_pid: 7916,
                    registry_count: 0,
                    safelisted: false,
                    signatures: {}
                  }
                ],
                command_line: 'PPLinject64.exe 600 C:\\vzq2xvg0\\dll\\KuyVlpd.dll',
                file_count: 0,
                network_count: 0,
                process_name: 'C:\\vzq2xvg0\\bin\\PPLinject64.exe',
                process_pid: 7904,
                registry_count: 0,
                safelisted: false,
                signatures: {}
              }
            ],
            command_line: null,
            file_count: 0,
            network_count: 0,
            process_name: 'C:\\vzq2xvg0\\bin\\wZvfgXMN.exe',
            process_pid: 3148,
            registry_count: 0,
            safelisted: false,
            signatures: {}
          },
          {
            children: [],
            command_line: null,
            file_count: 0,
            network_count: 0,
            process_name: 'C:\\vzq2xvg0\\bin\\wZvfgXMN.exe',
            process_pid: 8168,
            registry_count: 0,
            safelisted: false,
            signatures: {}
          },
          {
            children: [],
            command_line: null,
            file_count: 0,
            network_count: 0,
            process_name: 'C:\\vzq2xvg0\\bin\\wZvfgXMN.exe',
            process_pid: 8100,
            registry_count: 0,
            safelisted: false,
            signatures: {}
          },
          {
            children: [],
            command_line: null,
            file_count: 0,
            network_count: 0,
            process_name: 'C:\\Program Files\\CUAssistant\\culauncher.exe',
            process_pid: 3880,
            registry_count: 0,
            safelisted: false,
            signatures: {}
          },
          {
            children: [],
            command_line: null,
            file_count: 0,
            network_count: 0,
            process_name: 'C:\\Windows\\System32\\MusNotificationUx.exe',
            process_pid: 7372,
            registry_count: 0,
            safelisted: false,
            signatures: {}
          },
          {
            children: [],
            command_line: null,
            file_count: 0,
            network_count: 0,
            process_name: 'C:\\vzq2xvg0\\bin\\wZvfgXMN.exe',
            process_pid: 7392,
            registry_count: 0,
            safelisted: false,
            signatures: {}
          },
          {
            children: [],
            command_line: null,
            file_count: 0,
            network_count: 0,
            process_name: 'C:\\vzq2xvg0\\bin\\wZvfgXMN.exe',
            process_pid: 7236,
            registry_count: 0,
            safelisted: false,
            signatures: {}
          },
          {
            children: [],
            command_line: null,
            file_count: 0,
            network_count: 0,
            process_name: 'C:\\vzq2xvg0\\bin\\OUwsLSl.exe',
            process_pid: 4888,
            registry_count: 0,
            safelisted: false,
            signatures: {}
          },
          {
            children: [],
            command_line: null,
            file_count: 0,
            network_count: 0,
            process_name: 'C:\\vzq2xvg0\\bin\\OUwsLSl.exe',
            process_pid: 1692,
            registry_count: 0,
            safelisted: false,
            signatures: {}
          },
          {
            children: [],
            command_line: null,
            file_count: 0,
            network_count: 0,
            process_name: 'C:\\vzq2xvg0\\bin\\OUwsLSl.exe',
            process_pid: 524,
            registry_count: 0,
            safelisted: false,
            signatures: {}
          },
          {
            children: [],
            command_line: null,
            file_count: 0,
            network_count: 0,
            process_name: 'C:\\vzq2xvg0\\bin\\OUwsLSl.exe',
            process_pid: 784,
            registry_count: 0,
            safelisted: false,
            signatures: {}
          },
          {
            children: [],
            command_line: null,
            file_count: 0,
            network_count: 0,
            process_name: 'C:\\vzq2xvg0\\bin\\OUwsLSl.exe',
            process_pid: 1008,
            registry_count: 0,
            safelisted: false,
            signatures: {}
          },
          {
            children: [],
            command_line: null,
            file_count: 0,
            network_count: 0,
            process_name: 'C:\\vzq2xvg0\\bin\\OUwsLSl.exe',
            process_pid: 4100,
            registry_count: 0,
            safelisted: false,
            signatures: {}
          },
          {
            children: [],
            command_line: null,
            file_count: 0,
            network_count: 0,
            process_name: 'C:\\vzq2xvg0\\bin\\OUwsLSl.exe',
            process_pid: 3452,
            registry_count: 0,
            safelisted: false,
            signatures: {}
          },
          {
            children: [
              {
                children: [],
                command_line: '"C:\\Windows\\Microsoft.NET\\Framework\\v4.0.30319\\RegAsm.exe"',
                file_count: 0,
                network_count: 1,
                process_name: 'C:\\Windows\\Microsoft.NET\\Framework\\v4.0.30319\\RegAsm.exe',
                process_pid: 212,
                registry_count: 0,
                safelisted: false,
                signatures: {
                  antivm_network_adapters: 10,
                  http_request: 30,
                  procmem_yara: 50,
                  queries_computer_name: 10,
                  queries_keyboard_layout: 10,
                  queries_user_name: 10
                }
              }
            ],
            command_line: '"C:\\Users\\buddy\\AppData\\Local\\Temp\\fbef05223e03ebdbea9b.exe" ',
            file_count: 0,
            network_count: 0,
            process_name: 'C:\\Users\\buddy\\AppData\\Local\\Temp\\fbef05223e03ebdbea9b.exe',
            process_pid: 1604,
            registry_count: 0,
            safelisted: false,
            signatures: {
              antidebug_guardpages: 30,
              antivm_checks_available_memory: 10,
              injection_rwx: 30,
              injection_write_exe_process: 50,
              injection_write_process: 30,
              procmem_yara: 50,
              reads_memory_remote_process: 30,
              resumethread_remote_process: 30
            }
          },
          {
            children: [],
            command_line: 'C:\\WINDOWS\\system32\\services.exe',
            file_count: 0,
            network_count: 0,
            process_name: 'C:\\Windows\\System32\\services.exe',
            process_pid: 600,
            registry_count: 0,
            safelisted: false,
            signatures: {}
          }
        ],
        body_config: {},
        body_format: 'PROCESS_TREE',
        classification: 'TLP:CLEAR//VIRUSTOTAL',
        depth: 1,
        heuristic: null,
        promote_to: null,
        tags: [
          {
            safelisted: false,
            short_type: 'command_line',
            type: 'dynamic.process.command_line',
            value: '\\??\\C:\\WINDOWS\\system32\\conhost.exe 0xffffffff -ForceV1'
          },
          {
            safelisted: false,
            short_type: 'command_line',
            type: 'dynamic.process.command_line',
            value: 'PPLinject64.exe 600 C:\\vzq2xvg0\\dll\\KuyVlpd.dll'
          },
          {
            safelisted: false,
            short_type: 'command_line',
            type: 'dynamic.process.command_line',
            value: 'C:\\WINDOWS\\system32\\services.exe 600 "batmeter.dll" 39a1d4c1-d312-4688-a677-e16691ba68e'
          },
          {
            safelisted: false,
            short_type: 'command_line',
            type: 'dynamic.process.command_line',
            value: '"C:\\Users\\buddy\\AppData\\Local\\Temp\\fbef05223e03ebdbea9b.exe" '
          },
          {
            safelisted: false,
            short_type: 'command_line',
            type: 'dynamic.process.command_line',
            value: '"C:\\Windows\\Microsoft.NET\\Framework\\v4.0.30319\\RegAsm.exe"'
          },
          {
            safelisted: false,
            short_type: 'command_line',
            type: 'dynamic.process.command_line',
            value: 'C:\\WINDOWS\\system32\\services.exe'
          },
          {
            safelisted: false,
            short_type: 'processtree_id',
            type: 'dynamic.processtree_id',
            value: '?sys32\\waasmedicagent.exe|?sys32\\conhost.exe'
          },
          {
            safelisted: false,
            short_type: 'processtree_id',
            type: 'dynamic.processtree_id',
            value: '?sys32\\musnotification.exe'
          },
          {
            safelisted: false,
            short_type: 'processtree_id',
            type: 'dynamic.processtree_id',
            value: '?c\\vzq2xvg0\\bin\\wzvfgxmn.exe'
          },
          {
            safelisted: false,
            short_type: 'processtree_id',
            type: 'dynamic.processtree_id',
            value: '?c\\vzq2xvg0\\bin\\wzvfgxmn.exe|?c\\vzq2xvg0\\bin\\pplinject64.exe'
          },
          {
            safelisted: false,
            short_type: 'processtree_id',
            type: 'dynamic.processtree_id',
            value: '?c\\vzq2xvg0\\bin\\wzvfgxmn.exe|?c\\vzq2xvg0\\bin\\pplinject64.exe|?sys32\\services.exe'
          },
          {
            safelisted: false,
            short_type: 'processtree_id',
            type: 'dynamic.processtree_id',
            value: '?c\\vzq2xvg0\\bin\\wzvfgxmn.exe|?c\\vzq2xvg0\\bin\\pplinject64.exe|?sys32\\conhost.exe'
          },
          {
            safelisted: false,
            short_type: 'processtree_id',
            type: 'dynamic.processtree_id',
            value: '?pf86\\cuassistant\\culauncher.exe'
          },
          {
            safelisted: false,
            short_type: 'processtree_id',
            type: 'dynamic.processtree_id',
            value: '?sys32\\musnotificationux.exe'
          },
          {
            safelisted: false,
            short_type: 'processtree_id',
            type: 'dynamic.processtree_id',
            value: '?c\\vzq2xvg0\\bin\\ouwslsl.exe'
          },
          {
            safelisted: false,
            short_type: 'processtree_id',
            type: 'dynamic.processtree_id',
            value: '?usrtmp\\fbef05223e03ebdbea9b.exe'
          },
          {
            safelisted: false,
            short_type: 'processtree_id',
            type: 'dynamic.processtree_id',
            value: '?usrtmp\\fbef05223e03ebdbea9b.exe|?win\\microsoft.net\\framework\\v4.0.30319\\regasm.exe'
          },
          {
            safelisted: false,
            short_type: 'processtree_id',
            type: 'dynamic.processtree_id',
            value: '?sys32\\services.exe'
          }
        ],
        title_text: 'Spawned Process Tree'
      },
      {
        auto_collapse: false,
        body: [
          {
            details: {
              command_line: '"C:\\Users\\buddy\\AppData\\Local\\Temp\\fbef05223e03ebdbea9b.exe" '
            },
            process_name: 'C:\\Users\\buddy\\AppData\\Local\\Temp\\fbef05223e03ebdbea9b.exe (1604)',
            time_observed: '2025-09-30 23:15:49.151'
          },
          {
            details: {
              command_line: '"C:\\Windows\\Microsoft.NET\\Framework\\v4.0.30319\\RegAsm.exe"'
            },
            process_name: 'C:\\Windows\\Microsoft.NET\\Framework\\v4.0.30319\\RegAsm.exe (212)',
            time_observed: '2025-09-30 23:15:51.776'
          },
          {
            details: {
              command_line: '\\??\\C:\\WINDOWS\\system32\\conhost.exe 0xffffffff -ForceV1'
            },
            process_name: 'C:\\Windows\\System32\\conhost.exe (7916)',
            time_observed: '2025-09-30 23:16:06.408'
          },
          {
            details: {
              command_line: 'C:\\WINDOWS\\system32\\services.exe'
            },
            process_name: 'C:\\Windows\\System32\\services.exe (600)',
            time_observed: '2025-09-30 23:16:06.823'
          },
          {
            details: {
              dns_requests: ['208.95.112.1'],
              domain: 'ip-api.com',
              lookup_type: 'A',
              protocol: 'dns'
            },
            process_name: 'C:\\Windows\\Microsoft.NET\\Framework\\v4.0.30319\\RegAsm.exe (212)',
            time_observed: '2025-09-30 23:16:08.743'
          },
          {
            details: {
              command_line: '\\??\\C:\\WINDOWS\\system32\\conhost.exe 0xffffffff -ForceV1'
            },
            process_name: 'C:\\Windows\\System32\\conhost.exe (8172)',
            time_observed: '2025-09-30 23:16:10.292'
          }
        ],
        body_config: {
          column_order: ['time_observed', 'process_name', 'details']
        },
        body_format: 'TABLE',
        classification: 'TLP:CLEAR//VIRUSTOTAL',
        depth: 1,
        heuristic: null,
        promote_to: null,
        tags: [
          {
            safelisted: false,
            short_type: 'command_line',
            type: 'dynamic.process.command_line',
            value: '"C:\\Users\\buddy\\AppData\\Local\\Temp\\fbef05223e03ebdbea9b.exe" '
          },
          {
            safelisted: false,
            short_type: 'command_line',
            type: 'dynamic.process.command_line',
            value: '"C:\\Windows\\Microsoft.NET\\Framework\\v4.0.30319\\RegAsm.exe"'
          },
          {
            safelisted: false,
            short_type: 'command_line',
            type: 'dynamic.process.command_line',
            value: '\\??\\C:\\WINDOWS\\system32\\conhost.exe 0xffffffff -ForceV1'
          },
          {
            safelisted: false,
            short_type: 'command_line',
            type: 'dynamic.process.command_line',
            value: 'C:\\WINDOWS\\system32\\services.exe'
          },
          {
            safelisted: false,
            short_type: 'file_name',
            type: 'dynamic.process.file_name',
            value: 'C:\\Users\\buddy\\AppData\\Local\\Temp\\fbef05223e03ebdbea9b.exe'
          },
          {
            safelisted: false,
            short_type: 'file_name',
            type: 'dynamic.process.file_name',
            value: 'C:\\Windows\\Microsoft.NET\\Framework\\v4.0.30319\\RegAsm.exe'
          },
          {
            safelisted: false,
            short_type: 'file_name',
            type: 'dynamic.process.file_name',
            value: 'C:\\Windows\\System32\\conhost.exe'
          },
          {
            safelisted: false,
            short_type: 'file_name',
            type: 'dynamic.process.file_name',
            value: 'C:\\Windows\\System32\\services.exe'
          }
        ],
        title_text: 'Event Log'
      },
      {
        auto_collapse: true,
        body: [
          {
            Buffer:
              'MZ\\x90\\x00\\x03\\x00\\x00\\x00\\x04\\x00\\x00\\x00\\xff\\xff\\x00\\x00\\xb8\\x00\\x00\\x00\\x00\\x00\\x00\\x00@\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x80\\x00\\x00\\x00\\x0e\\x1f\\xba\\x0e\\x00\\xb4\t\\xcd!\\xb8\\x01L\\xcd!This program cannot be run in DOS mode.\r\r\n$\\x00\\x00\\x00\\x00\\x00\\x00\\x00PE\\x00\\x00L\\x01\\x03\\x00\\xeax\\xa9e\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\xe0\\x00\\x02\\x01\\x0b\\x01\\x0b\\x00\\x00\\xb2\\x03\\x00\\x00\n\\x00\\x00\\x00\\x00\\x00\\x00\\xee\\xd1\\x03\\x00\\x00 \\x00\\x00\\x00\\xe0\\x03\\x00\\x00\\x00@\\x00\\x00 \\x00\\x00\\x00\\x02\\x00\\x00\\x04\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x04\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00 \\x04\\x00\\x00\\x02\\x00\\x00\\x00\\x00\\x00\\x00\\x02\\x00@\\x85\\x00\\x00\\x10\\x00\\x00\\x10\\x00\\x00\\x00\\x00\\x10\\x00\\x00\\x10\\x00\\x00\\x00\\x00\\x00\\x00\\x10\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00',
            Process: 'C:\\Users\\buddy\\AppData\\Local\\Temp\\fbef05223e03ebdbea9b.exe (1604)',
            Source: 'Windows API'
          },
          {
            Buffer: '\\x10\\x10\\x10\\x10\\x10\\x10\\x10\\x10\\x10\\x10\\x10\\x10\\x10\\x10\\x10\\x10',
            Process: 'C:\\Users\\buddy\\AppData\\Local\\Temp\\fbef05223e03ebdbea9b.exe (1604)',
            Source: 'Windows API'
          }
        ],
        body_config: {
          column_order: ['Process', 'Source', 'Buffer']
        },
        body_format: 'TABLE',
        classification: 'TLP:CLEAR//VIRUSTOTAL',
        depth: 1,
        heuristic: null,
        promote_to: null,
        tags: [],
        title_text: 'Buffers'
      },
      {
        auto_collapse: false,
        body: null,
        body_config: {},
        body_format: 'TEXT',
        classification: 'TLP:CLEAR//VIRUSTOTAL',
        depth: 1,
        heuristic: {
          attack: [],
          heur_id: 'CAPE.38',
          name: 'Malware',
          score: 1000,
          signature: [
            {
              frequency: 1,
              name: 'config_extracted',
              safe: false
            }
          ]
        },
        promote_to: null,
        tags: [],
        title_text: 'Configs Extracted By CAPE'
      },
      {
        auto_collapse: false,
        body: [
          {
            config_value: ['FTP'],
            type: 'Protocol'
          },
          {
            config_value: ['ftp://ftp.4bagh.net'],
            type: 'C2'
          },
          {
            config_value: ['ikdonoffice@4bagh.net'],
            type: 'Username'
          },
          {
            config_value: ['CarpeDiem.2024'],
            type: 'Password'
          },
          {
            config_value: ['eXCXES.exe'],
            type: 'Persistence_Filename'
          },
          {
            config_value: [['http://ip-api.com/line/?fields=hosting']],
            type: 'ExternalIPCheckServices'
          }
        ],
        body_config: {
          column_order: ['type', 'config_value']
        },
        body_format: 'TABLE',
        classification: 'TLP:CLEAR//VIRUSTOTAL',
        depth: 2,
        heuristic: null,
        promote_to: null,
        tags: [],
        title_text: 'AgentTesla Config'
      },
      {
        auto_collapse: false,
        body: [
          [
            'IMAGE',
            [
              {
                img: {
                  description: 'Screenshot captured during analysis',
                  name: '124901_shots/0001.jpg',
                  sha256: 'd04a642618911bd231557cfca6734876fd4aa90969f328cd12383a4bdf7af862'
                },
                thumb: {
                  description: 'Screenshot captured during analysis (thumbnail)',
                  name: '124901_shots/0001.jpg.thumb',
                  sha256: '31093d8a966cfba25c6283783cfe0de7416f14f91b4d05e606ddf0f214a71142'
                }
              },
              {
                img: {
                  description: 'Screenshot captured during analysis',
                  name: '124901_shots/0002.jpg',
                  sha256: 'd04a642618911bd231557cfca6734876fd4aa90969f328cd12383a4bdf7af862'
                },
                thumb: {
                  description: 'Screenshot captured during analysis (thumbnail)',
                  name: '124901_shots/0002.jpg.thumb',
                  sha256: '31093d8a966cfba25c6283783cfe0de7416f14f91b4d05e606ddf0f214a71142'
                }
              },
              {
                img: {
                  description: 'Screenshot captured during analysis',
                  name: '124901_shots/0003.jpg',
                  sha256: 'd04a642618911bd231557cfca6734876fd4aa90969f328cd12383a4bdf7af862'
                },
                thumb: {
                  description: 'Screenshot captured during analysis (thumbnail)',
                  name: '124901_shots/0003.jpg.thumb',
                  sha256: '31093d8a966cfba25c6283783cfe0de7416f14f91b4d05e606ddf0f214a71142'
                }
              },
              {
                img: {
                  description: 'Screenshot captured during analysis',
                  name: '124901_shots/0004.jpg',
                  sha256: 'd04a642618911bd231557cfca6734876fd4aa90969f328cd12383a4bdf7af862'
                },
                thumb: {
                  description: 'Screenshot captured during analysis (thumbnail)',
                  name: '124901_shots/0004.jpg.thumb',
                  sha256: '31093d8a966cfba25c6283783cfe0de7416f14f91b4d05e606ddf0f214a71142'
                }
              },
              {
                img: {
                  description: 'Screenshot captured during analysis',
                  name: '124901_shots/0005.jpg',
                  sha256: 'd04a642618911bd231557cfca6734876fd4aa90969f328cd12383a4bdf7af862'
                },
                thumb: {
                  description: 'Screenshot captured during analysis (thumbnail)',
                  name: '124901_shots/0005.jpg.thumb',
                  sha256: '31093d8a966cfba25c6283783cfe0de7416f14f91b4d05e606ddf0f214a71142'
                }
              },
              {
                img: {
                  description: 'Screenshot captured during analysis',
                  name: '124901_shots/0006.jpg',
                  sha256: 'd04a642618911bd231557cfca6734876fd4aa90969f328cd12383a4bdf7af862'
                },
                thumb: {
                  description: 'Screenshot captured during analysis (thumbnail)',
                  name: '124901_shots/0006.jpg.thumb',
                  sha256: '31093d8a966cfba25c6283783cfe0de7416f14f91b4d05e606ddf0f214a71142'
                }
              },
              {
                img: {
                  description: 'Screenshot captured during analysis',
                  name: '124901_shots/0007.jpg',
                  sha256: 'd04a642618911bd231557cfca6734876fd4aa90969f328cd12383a4bdf7af862'
                },
                thumb: {
                  description: 'Screenshot captured during analysis (thumbnail)',
                  name: '124901_shots/0007.jpg.thumb',
                  sha256: '31093d8a966cfba25c6283783cfe0de7416f14f91b4d05e606ddf0f214a71142'
                }
              },
              {
                img: {
                  description: 'Screenshot captured during analysis',
                  name: '124901_shots/0008.jpg',
                  sha256: 'd04a642618911bd231557cfca6734876fd4aa90969f328cd12383a4bdf7af862'
                },
                thumb: {
                  description: 'Screenshot captured during analysis (thumbnail)',
                  name: '124901_shots/0008.jpg.thumb',
                  sha256: '31093d8a966cfba25c6283783cfe0de7416f14f91b4d05e606ddf0f214a71142'
                }
              },
              {
                img: {
                  description: 'Screenshot captured during analysis',
                  name: '124901_shots/0009.jpg',
                  sha256: 'd04a642618911bd231557cfca6734876fd4aa90969f328cd12383a4bdf7af862'
                },
                thumb: {
                  description: 'Screenshot captured during analysis (thumbnail)',
                  name: '124901_shots/0009.jpg.thumb',
                  sha256: '31093d8a966cfba25c6283783cfe0de7416f14f91b4d05e606ddf0f214a71142'
                }
              },
              {
                img: {
                  description: 'Screenshot captured during analysis',
                  name: '124901_shots/0010.jpg',
                  sha256: 'd04a642618911bd231557cfca6734876fd4aa90969f328cd12383a4bdf7af862'
                },
                thumb: {
                  description: 'Screenshot captured during analysis (thumbnail)',
                  name: '124901_shots/0010.jpg.thumb',
                  sha256: '31093d8a966cfba25c6283783cfe0de7416f14f91b4d05e606ddf0f214a71142'
                }
              },
              {
                img: {
                  description: 'Screenshot captured during analysis',
                  name: '124901_shots/0011.jpg',
                  sha256: 'd04a642618911bd231557cfca6734876fd4aa90969f328cd12383a4bdf7af862'
                },
                thumb: {
                  description: 'Screenshot captured during analysis (thumbnail)',
                  name: '124901_shots/0011.jpg.thumb',
                  sha256: '31093d8a966cfba25c6283783cfe0de7416f14f91b4d05e606ddf0f214a71142'
                }
              },
              {
                img: {
                  description: 'Screenshot captured during analysis',
                  name: '124901_shots/0012.jpg',
                  sha256: 'd04a642618911bd231557cfca6734876fd4aa90969f328cd12383a4bdf7af862'
                },
                thumb: {
                  description: 'Screenshot captured during analysis (thumbnail)',
                  name: '124901_shots/0012.jpg.thumb',
                  sha256: '31093d8a966cfba25c6283783cfe0de7416f14f91b4d05e606ddf0f214a71142'
                }
              },
              {
                img: {
                  description: 'Screenshot captured during analysis',
                  name: '124901_shots/0013.jpg',
                  sha256: 'd04a642618911bd231557cfca6734876fd4aa90969f328cd12383a4bdf7af862'
                },
                thumb: {
                  description: 'Screenshot captured during analysis (thumbnail)',
                  name: '124901_shots/0013.jpg.thumb',
                  sha256: '31093d8a966cfba25c6283783cfe0de7416f14f91b4d05e606ddf0f214a71142'
                }
              },
              {
                img: {
                  description: 'Screenshot captured during analysis',
                  name: '124901_shots/0014.jpg',
                  sha256: '8dee6316fa3bd6b930f870d759450a99a3e75ba308cb323f5a96bc6ef09d7032'
                },
                thumb: {
                  description: 'Screenshot captured during analysis (thumbnail)',
                  name: '124901_shots/0014.jpg.thumb',
                  sha256: '09ef22430a995e90dee2df4e4db4ab28ccdb0e55c0f55f32dc4d1d7cee0f9528'
                }
              },
              {
                img: {
                  description: 'Screenshot captured during analysis',
                  name: '124901_shots/0015.jpg',
                  sha256: '8dee6316fa3bd6b930f870d759450a99a3e75ba308cb323f5a96bc6ef09d7032'
                },
                thumb: {
                  description: 'Screenshot captured during analysis (thumbnail)',
                  name: '124901_shots/0015.jpg.thumb',
                  sha256: '09ef22430a995e90dee2df4e4db4ab28ccdb0e55c0f55f32dc4d1d7cee0f9528'
                }
              },
              {
                img: {
                  description: 'Screenshot captured during analysis',
                  name: '124901_shots/0016.jpg',
                  sha256: 'd04a642618911bd231557cfca6734876fd4aa90969f328cd12383a4bdf7af862'
                },
                thumb: {
                  description: 'Screenshot captured during analysis (thumbnail)',
                  name: '124901_shots/0016.jpg.thumb',
                  sha256: '31093d8a966cfba25c6283783cfe0de7416f14f91b4d05e606ddf0f214a71142'
                }
              },
              {
                img: {
                  description: 'Screenshot captured during analysis',
                  name: '124901_shots/0017.jpg',
                  sha256: '102db5a008430f6e19e0db5fa917ce41cec0aba05678365705d97a619701c83b'
                },
                thumb: {
                  description: 'Screenshot captured during analysis (thumbnail)',
                  name: '124901_shots/0017.jpg.thumb',
                  sha256: 'c78bbad0900f8526743657bc643dbbb809f097b0f61f70e7ca3027bc81afcea3'
                }
              },
              {
                img: {
                  description: 'Screenshot captured during analysis',
                  name: '124901_shots/0018.jpg',
                  sha256: '102db5a008430f6e19e0db5fa917ce41cec0aba05678365705d97a619701c83b'
                },
                thumb: {
                  description: 'Screenshot captured during analysis (thumbnail)',
                  name: '124901_shots/0018.jpg.thumb',
                  sha256: 'c78bbad0900f8526743657bc643dbbb809f097b0f61f70e7ca3027bc81afcea3'
                }
              },
              {
                img: {
                  description: 'Screenshot captured during analysis',
                  name: '124901_shots/0019.jpg',
                  sha256: '102db5a008430f6e19e0db5fa917ce41cec0aba05678365705d97a619701c83b'
                },
                thumb: {
                  description: 'Screenshot captured during analysis (thumbnail)',
                  name: '124901_shots/0019.jpg.thumb',
                  sha256: 'c78bbad0900f8526743657bc643dbbb809f097b0f61f70e7ca3027bc81afcea3'
                }
              },
              {
                img: {
                  description: 'Screenshot captured during analysis',
                  name: '124901_shots/0020.jpg',
                  sha256: '102db5a008430f6e19e0db5fa917ce41cec0aba05678365705d97a619701c83b'
                },
                thumb: {
                  description: 'Screenshot captured during analysis (thumbnail)',
                  name: '124901_shots/0020.jpg.thumb',
                  sha256: 'c78bbad0900f8526743657bc643dbbb809f097b0f61f70e7ca3027bc81afcea3'
                }
              },
              {
                img: {
                  description: 'Screenshot captured during analysis',
                  name: '124901_shots/0021.jpg',
                  sha256: '102db5a008430f6e19e0db5fa917ce41cec0aba05678365705d97a619701c83b'
                },
                thumb: {
                  description: 'Screenshot captured during analysis (thumbnail)',
                  name: '124901_shots/0021.jpg.thumb',
                  sha256: 'c78bbad0900f8526743657bc643dbbb809f097b0f61f70e7ca3027bc81afcea3'
                }
              },
              {
                img: {
                  description: 'Screenshot captured during analysis',
                  name: '124901_shots/0022.jpg',
                  sha256: '102db5a008430f6e19e0db5fa917ce41cec0aba05678365705d97a619701c83b'
                },
                thumb: {
                  description: 'Screenshot captured during analysis (thumbnail)',
                  name: '124901_shots/0022.jpg.thumb',
                  sha256: 'c78bbad0900f8526743657bc643dbbb809f097b0f61f70e7ca3027bc81afcea3'
                }
              },
              {
                img: {
                  description: 'Screenshot captured during analysis',
                  name: '124901_shots/0023.jpg',
                  sha256: 'dbe27ffc77babe667af47074f3b61bdadc7190737f6da3c97c2c591d33e5ce71'
                },
                thumb: {
                  description: 'Screenshot captured during analysis (thumbnail)',
                  name: '124901_shots/0023.jpg.thumb',
                  sha256: '5a329527758aead754fc862733e909d052bb1625c8bfc676edd1622a7e46656a'
                }
              },
              {
                img: {
                  description: 'Screenshot captured during analysis',
                  name: '124901_shots/0024.jpg',
                  sha256: 'dbe27ffc77babe667af47074f3b61bdadc7190737f6da3c97c2c591d33e5ce71'
                },
                thumb: {
                  description: 'Screenshot captured during analysis (thumbnail)',
                  name: '124901_shots/0024.jpg.thumb',
                  sha256: '5a329527758aead754fc862733e909d052bb1625c8bfc676edd1622a7e46656a'
                }
              },
              {
                img: {
                  description: 'Screenshot captured during analysis',
                  name: '124901_shots/0025.jpg',
                  sha256: '102db5a008430f6e19e0db5fa917ce41cec0aba05678365705d97a619701c83b'
                },
                thumb: {
                  description: 'Screenshot captured during analysis (thumbnail)',
                  name: '124901_shots/0025.jpg.thumb',
                  sha256: 'c78bbad0900f8526743657bc643dbbb809f097b0f61f70e7ca3027bc81afcea3'
                }
              },
              {
                img: {
                  description: 'Screenshot captured during analysis',
                  name: '124901_shots/0026.jpg',
                  sha256: '102db5a008430f6e19e0db5fa917ce41cec0aba05678365705d97a619701c83b'
                },
                thumb: {
                  description: 'Screenshot captured during analysis (thumbnail)',
                  name: '124901_shots/0026.jpg.thumb',
                  sha256: 'c78bbad0900f8526743657bc643dbbb809f097b0f61f70e7ca3027bc81afcea3'
                }
              },
              {
                img: {
                  description: 'Screenshot captured during analysis',
                  name: '124901_shots/0027.jpg',
                  sha256: '102db5a008430f6e19e0db5fa917ce41cec0aba05678365705d97a619701c83b'
                },
                thumb: {
                  description: 'Screenshot captured during analysis (thumbnail)',
                  name: '124901_shots/0027.jpg.thumb',
                  sha256: 'c78bbad0900f8526743657bc643dbbb809f097b0f61f70e7ca3027bc81afcea3'
                }
              },
              {
                img: {
                  description: 'Screenshot captured during analysis',
                  name: '124901_shots/0028.jpg',
                  sha256: '102db5a008430f6e19e0db5fa917ce41cec0aba05678365705d97a619701c83b'
                },
                thumb: {
                  description: 'Screenshot captured during analysis (thumbnail)',
                  name: '124901_shots/0028.jpg.thumb',
                  sha256: 'c78bbad0900f8526743657bc643dbbb809f097b0f61f70e7ca3027bc81afcea3'
                }
              },
              {
                img: {
                  description: 'Screenshot captured during analysis',
                  name: '124901_shots/0029.jpg',
                  sha256: '102db5a008430f6e19e0db5fa917ce41cec0aba05678365705d97a619701c83b'
                },
                thumb: {
                  description: 'Screenshot captured during analysis (thumbnail)',
                  name: '124901_shots/0029.jpg.thumb',
                  sha256: 'c78bbad0900f8526743657bc643dbbb809f097b0f61f70e7ca3027bc81afcea3'
                }
              },
              {
                img: {
                  description: 'Screenshot captured during analysis',
                  name: '124901_shots/0030.jpg',
                  sha256: '102db5a008430f6e19e0db5fa917ce41cec0aba05678365705d97a619701c83b'
                },
                thumb: {
                  description: 'Screenshot captured during analysis (thumbnail)',
                  name: '124901_shots/0030.jpg.thumb',
                  sha256: 'c78bbad0900f8526743657bc643dbbb809f097b0f61f70e7ca3027bc81afcea3'
                }
              },
              {
                img: {
                  description: 'Screenshot captured during analysis',
                  name: '124901_shots/0031.jpg',
                  sha256: '102db5a008430f6e19e0db5fa917ce41cec0aba05678365705d97a619701c83b'
                },
                thumb: {
                  description: 'Screenshot captured during analysis (thumbnail)',
                  name: '124901_shots/0031.jpg.thumb',
                  sha256: 'c78bbad0900f8526743657bc643dbbb809f097b0f61f70e7ca3027bc81afcea3'
                }
              },
              {
                img: {
                  description: 'Screenshot captured during analysis',
                  name: '124901_shots/0032.jpg',
                  sha256: '102db5a008430f6e19e0db5fa917ce41cec0aba05678365705d97a619701c83b'
                },
                thumb: {
                  description: 'Screenshot captured during analysis (thumbnail)',
                  name: '124901_shots/0032.jpg.thumb',
                  sha256: 'c78bbad0900f8526743657bc643dbbb809f097b0f61f70e7ca3027bc81afcea3'
                }
              },
              {
                img: {
                  description: 'Screenshot captured during analysis',
                  name: '124901_shots/0033.jpg',
                  sha256: '102db5a008430f6e19e0db5fa917ce41cec0aba05678365705d97a619701c83b'
                },
                thumb: {
                  description: 'Screenshot captured during analysis (thumbnail)',
                  name: '124901_shots/0033.jpg.thumb',
                  sha256: 'c78bbad0900f8526743657bc643dbbb809f097b0f61f70e7ca3027bc81afcea3'
                }
              },
              {
                img: {
                  description: 'Screenshot captured during analysis',
                  name: '124901_shots/0034.jpg',
                  sha256: '102db5a008430f6e19e0db5fa917ce41cec0aba05678365705d97a619701c83b'
                },
                thumb: {
                  description: 'Screenshot captured during analysis (thumbnail)',
                  name: '124901_shots/0034.jpg.thumb',
                  sha256: 'c78bbad0900f8526743657bc643dbbb809f097b0f61f70e7ca3027bc81afcea3'
                }
              },
              {
                img: {
                  description: 'Screenshot captured during analysis',
                  name: '124901_shots/0035.jpg',
                  sha256: '102db5a008430f6e19e0db5fa917ce41cec0aba05678365705d97a619701c83b'
                },
                thumb: {
                  description: 'Screenshot captured during analysis (thumbnail)',
                  name: '124901_shots/0035.jpg.thumb',
                  sha256: 'c78bbad0900f8526743657bc643dbbb809f097b0f61f70e7ca3027bc81afcea3'
                }
              },
              {
                img: {
                  description: 'Screenshot captured during analysis',
                  name: '124901_shots/0036.jpg',
                  sha256: '102db5a008430f6e19e0db5fa917ce41cec0aba05678365705d97a619701c83b'
                },
                thumb: {
                  description: 'Screenshot captured during analysis (thumbnail)',
                  name: '124901_shots/0036.jpg.thumb',
                  sha256: 'c78bbad0900f8526743657bc643dbbb809f097b0f61f70e7ca3027bc81afcea3'
                }
              },
              {
                img: {
                  description: 'Screenshot captured during analysis',
                  name: '124901_shots/0037.jpg',
                  sha256: '102db5a008430f6e19e0db5fa917ce41cec0aba05678365705d97a619701c83b'
                },
                thumb: {
                  description: 'Screenshot captured during analysis (thumbnail)',
                  name: '124901_shots/0037.jpg.thumb',
                  sha256: 'c78bbad0900f8526743657bc643dbbb809f097b0f61f70e7ca3027bc81afcea3'
                }
              },
              {
                img: {
                  description: 'Screenshot captured during analysis',
                  name: '124901_shots/0038.jpg',
                  sha256: '102db5a008430f6e19e0db5fa917ce41cec0aba05678365705d97a619701c83b'
                },
                thumb: {
                  description: 'Screenshot captured during analysis (thumbnail)',
                  name: '124901_shots/0038.jpg.thumb',
                  sha256: 'c78bbad0900f8526743657bc643dbbb809f097b0f61f70e7ca3027bc81afcea3'
                }
              },
              {
                img: {
                  description: 'Screenshot captured during analysis',
                  name: '124901_shots/0039.jpg',
                  sha256: '102db5a008430f6e19e0db5fa917ce41cec0aba05678365705d97a619701c83b'
                },
                thumb: {
                  description: 'Screenshot captured during analysis (thumbnail)',
                  name: '124901_shots/0039.jpg.thumb',
                  sha256: 'c78bbad0900f8526743657bc643dbbb809f097b0f61f70e7ca3027bc81afcea3'
                }
              },
              {
                img: {
                  description: 'Screenshot captured during analysis',
                  name: '124901_shots/0040.jpg',
                  sha256: '102db5a008430f6e19e0db5fa917ce41cec0aba05678365705d97a619701c83b'
                },
                thumb: {
                  description: 'Screenshot captured during analysis (thumbnail)',
                  name: '124901_shots/0040.jpg.thumb',
                  sha256: 'c78bbad0900f8526743657bc643dbbb809f097b0f61f70e7ca3027bc81afcea3'
                }
              },
              {
                img: {
                  description: 'Screenshot captured during analysis',
                  name: '124901_shots/0041.jpg',
                  sha256: '102db5a008430f6e19e0db5fa917ce41cec0aba05678365705d97a619701c83b'
                },
                thumb: {
                  description: 'Screenshot captured during analysis (thumbnail)',
                  name: '124901_shots/0041.jpg.thumb',
                  sha256: 'c78bbad0900f8526743657bc643dbbb809f097b0f61f70e7ca3027bc81afcea3'
                }
              },
              {
                img: {
                  description: 'Screenshot captured during analysis',
                  name: '124901_shots/0042.jpg',
                  sha256: '102db5a008430f6e19e0db5fa917ce41cec0aba05678365705d97a619701c83b'
                },
                thumb: {
                  description: 'Screenshot captured during analysis (thumbnail)',
                  name: '124901_shots/0042.jpg.thumb',
                  sha256: 'c78bbad0900f8526743657bc643dbbb809f097b0f61f70e7ca3027bc81afcea3'
                }
              },
              {
                img: {
                  description: 'Screenshot captured during analysis',
                  name: '124901_shots/0043.jpg',
                  sha256: '102db5a008430f6e19e0db5fa917ce41cec0aba05678365705d97a619701c83b'
                },
                thumb: {
                  description: 'Screenshot captured during analysis (thumbnail)',
                  name: '124901_shots/0043.jpg.thumb',
                  sha256: 'c78bbad0900f8526743657bc643dbbb809f097b0f61f70e7ca3027bc81afcea3'
                }
              },
              {
                img: {
                  description: 'Screenshot captured during analysis',
                  name: '124901_shots/0044.jpg',
                  sha256: '102db5a008430f6e19e0db5fa917ce41cec0aba05678365705d97a619701c83b'
                },
                thumb: {
                  description: 'Screenshot captured during analysis (thumbnail)',
                  name: '124901_shots/0044.jpg.thumb',
                  sha256: 'c78bbad0900f8526743657bc643dbbb809f097b0f61f70e7ca3027bc81afcea3'
                }
              },
              {
                img: {
                  description: 'Screenshot captured during analysis',
                  name: '124901_shots/0045.jpg',
                  sha256: '102db5a008430f6e19e0db5fa917ce41cec0aba05678365705d97a619701c83b'
                },
                thumb: {
                  description: 'Screenshot captured during analysis (thumbnail)',
                  name: '124901_shots/0045.jpg.thumb',
                  sha256: 'c78bbad0900f8526743657bc643dbbb809f097b0f61f70e7ca3027bc81afcea3'
                }
              }
            ],
            {}
          ]
        ],
        body_config: {},
        body_format: 'MULTI',
        classification: 'TLP:CLEAR//VIRUSTOTAL',
        depth: 1,
        heuristic: null,
        promote_to: null,
        tags: [],
        title_text: 'Screenshots taken during Task 124901'
      },
      {
        auto_collapse: false,
        body: {
          tags: {
            'dynamic.operating_system.platform': ['Windows'],
            'dynamic.operating_system.version': ['10'],
            'dynamic.operating_system.processor': ['x64'],
            'network.dynamic.domain': ['pastebin.com'],
            'network.dynamic.ip': [
              '23.44.133.12',
              '104.20.29.150',
              '52.191.219.104',
              '172.66.171.73',
              '23.56.210.93',
              '4.154.209.85',
              '52.167.17.97',
              '23.44.133.27'
            ],
            'network.protocol': ['dns'],
            'network.dynamic.uri': ['https://pastebin.com/raw/Fxzr3jeT'],
            'network.dynamic.uri_path': ['/raw/Fxzr3jeT'],
            'network.port': [443],
            'dynamic.registry_key': [
              'HKEY_CURRENT_USER\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\Run\\winlogon',
              'HKEY_LOCAL_MACHINE\\SYSTEM\\ControlSet001\\Control\\Nls\\ExtendedLocale\\en-US',
              'HKEY_LOCAL_MACHINE\\SOFTWARE\\Classes\\exefile\\shell\\open\\command\\(Default)',
              'HKEY_LOCAL_MACHINE\\SYSTEM\\ControlSet001\\Control\\Nls\\CustomLocale\\en-US'
            ],
            'dynamic.process.file_name': [
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\PROGRA~~1\\025028086467.ico',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\RCXCE2B.tmp',
              'C:\\Windows\\explorer.exe',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\PROGRA~~1\\557429734122..exe',
              'C:\\Users\\buddy\\Documents\\diagnostics\\audiodg.exe',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\PROGRA~~1\\280614142103.exe',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\PROGRA~~1\\126880826337.ico',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\PROGRA~~1\\599748136847.ico',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\PROGRA~~1\\206552021892.exe',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\PROGRA~~1\\956892949988.ico',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\PROGRA~~1\\739338413802..exe',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\PROGRA~~1\\532707298230.exe',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\PROGRA~~1\\703749671569.exe',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\PROGRA~~1\\940765063361.exe',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\PROGRA~~1\\301538607229..exe',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\PROGRA~~1\\236425297034..exe',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\PROGRA~~1\\400613790870.ico',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\PROGRA~~1\\926344970048.ico',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\RCXA74B.tmp',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\0b5032375d29b11f01ec.exe',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\PROGRA~~1\\449445123055..exe',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\PROGRA~~1\\252865810529.exe',
              'c:\\$recycle.bin\\s-1-5-21-3171250481-3681422803-404499418-1001\\$iyqo38i.exe',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\PROGRA~~1\\684203558359.exe',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\PROGRA~~1\\314130148242..exe',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\PROGRA~~1\\552097906486.exe',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\PROGRA~~1\\966022451485..exe',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\PROGRA~~1\\971146245299.ico',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\PROGRA~~1\\067213712963.ico',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\RCXB37E.tmp',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\PROGRA~~1\\506697857577.exe',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\PROGRA~~1\\419718903295..exe',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\PROGRA~~1\\565587715460.ico',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\PROGRA~~1\\483881874643..exe',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\PROGRA~~1\\264809384509..exe',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\PROGRA~~1\\744710747824.exe',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\PROGRA~~1\\527930408795..exe',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\RCXCA3A.tmp',
              'C:\\$Recycle.Bin\\S-1-5-21-3171250481-3681422803-404499418-1001\\RCX6CFA.tmp',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\PROGRA~~1\\755354519038.exe',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\PROGRA~~1\\795503213389.exe',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\PROGRA~~1\\978576709606.ico',
              'C:\\hollowshunter\\process_7328\\140000000.shost.exe',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\PROGRA~~1\\758550967601.ico',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\PROGRA~~1\\660078159571.exe',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\PROGRA~~1\\526353461480..exe',
              'C:\\$Recycle.Bin\\S-1-5-21-3171250481-3681422803-404499418-1001\\$RYQO38I.exe',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\PROGRA~~1\\563974645141..exe',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\PROGRA~~1\\031487327629.exe',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\PROGRA~~1\\436654847011.ico',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\PROGRA~~1\\126880826337.exe',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\PROGRA~~1\\307011268108.ico',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\PROGRA~~1\\331450979630.exe',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\PROGRA~~1\\468967607332..exe',
              'c:\\$recycle.bin\\s-1-5-21-3171250481-3681422803-404499418-1001\\$r899mjr.exe',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\PROGRA~~1\\889676251269..exe',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\PROGRA~~1\\958406934340.ico',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\PROGRA~~1\\875641555633.exe',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\PROGRA~~1\\978019026635.ico',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\PROGRA~~1\\003038459104.exe',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\PROGRA~~1\\864333749661..exe',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\PROGRA~~1\\064028145971.exe',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\PROGRA~~1\\205618046841.ico',
              'C:\\Users\\buddy\\AppData\\Local\\Microsoft\\PenWorkspace\\DiscoverCacheData.dat',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\PROGRA~~1\\778029667996..exe',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\PROGRA~~1\\905941319641.exe',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\PROGRA~~1\\123365152555.ico',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\PROGRA~~1\\707743128505.exe',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\PROGRA~~1\\077500498618.exe',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\RCXCD64.tmp',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\PROGRA~~1\\552460290601.exe',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\PROGRA~~1\\696619107273..exe',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\PROGRA~~1\\644237042406..exe',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\PROGRA~~1\\978019026635.exe',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\PROGRA~~1\\701574387723..exe',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\PROGRA~~1\\627506591742..exe',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\PROGRA~~1\\235111469601..exe',
              'C:\\Program',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\PROGRA~~1\\387555357469.exe',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\PROGRA~~1\\029638970632..exe',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\PROGRA~~1\\278452550035..exe',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\PROGRA~~1\\205618046841.exe',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\PROGRA~~1\\875641555633.ico',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\PROGRA~~1\\678736017494.exe',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\PROGRA~~1\\649092752986.exe',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\PROGRA~~1\\770877590153..exe',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\RCXCDB6.tmp',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\PROGRA~~1\\260623620679.ico',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\PROGRA~~1\\307599054627.exe',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\PROGRA~~1\\215226931129.exe',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\PROGRA~~1\\456096208444.exe',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\PROGRA~~1\\175272971826..exe',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\PROGRA~~1\\182787606425..exe',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\PROGRA~~1\\509291589867..exe',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\PROGRA~~1\\874199719776..exe',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\PROGRA~~1\\077500498618.ico',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\PROGRA~~1\\857294736465.ico',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\PROGRA~~1\\333236913533..exe',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\PROGRA~~1\\079012971789.exe',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\RCXA801.tmp',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\PROGRA~~1\\524121373582.exe',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\RCXCDC7.tmp',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\PROGRA~~1\\318391314108.ico',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\PROGRA~~1\\429310733820..exe',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\PROGRA~~1\\127601649827.exe',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\PROGRA~~1\\264594834662..exe',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\RCXCAD1.tmp',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\PROGRA~~1\\125194398545.exe',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\RCXD08D.tmp',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\RCXD02B.tmp',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\PROGRA~~1\\707148268632.ico',
              'C:\\$Recycle.Bin\\S-1-5-21-3171250481-3681422803-404499418-1001\\RCX79EE.tmp',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\PROGRA~~1\\239091585784.exe',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\PROGRA~~1\\412615014316.exe',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\PROGRA~~1\\798826301658..exe',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\PROGRA~~1\\098308499774.ico',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\PROGRA~~1\\613803088837..exe',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\PROGRA~~1\\787409565052.exe',
              'c:\\$recycle.bin\\s-1-5-21-3171250481-3681422803-404499418-1001\\$i899mjr.exe',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\PROGRA~~1\\667848580624.ico',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\PROGRA~~1\\578495228401.ico',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\PROGRA~~1\\325063992754.ico',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\PROGRA~~1\\795503213389.ico',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\PROGRA~~1\\182251105861..exe',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\RCXA8F5.tmp',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\PROGRA~~1\\500722193148..exe',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\PROGRA~~1\\862495181931.ico',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\PROGRA~~1\\723168144466..exe',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\PROGRA~~1\\505531633253..exe',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\PROGRA~~1\\064878937502.ico',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\PROGRA~~1\\685429137133.exe',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\PROGRA~~1\\950005413868.ico',
              'C:\\$Recycle.Bin\\S-1-5-21-3171250481-3681422803-404499418-1001\\$IMB04KL.exe',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\PROGRA~~1\\909504277836.ico',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\PROGRA~~1\\225392808855.ico',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\PROGRA~~1\\535845542412.exe',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\RCXCB92.tmp',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\RCXCFE9.tmp',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\PROGRA~~1\\041230650014.ico',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\PROGRA~~1\\778590921968.exe',
              'C:\\Users\\buddy\\AppData\\Roaming\\Microsoft\\Windows\\Start',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\PROGRA~~1\\964284340416.ico',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\PROGRA~~1\\313226966727.exe',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\PROGRA~~1\\301282724153.exe',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\PROGRA~~1\\816597896444.ico',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\PROGRA~~1\\746465381159.exe',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\PROGRA~~1\\481452794619..exe',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\PROGRA~~1\\933297251607..exe',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\PROGRA~~1\\247965296820..exe',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\PROGRA~~1\\029423809107.ico',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\PROGRA~~1\\310303259030.exe',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\PROGRA~~1\\779837381738.exe',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\PROGRA~~1\\125194398545.ico',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\PROGRA~~1\\331450979630.ico',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\PROGRA~~1\\221560983231.ico',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\RCXB1C4.tmp',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\RCXA7CE.tmp',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\PROGRA~~1\\452884773206..exe',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\PROGRA~~1\\839127431039.ico',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\PROGRA~~1\\711401529982.exe',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\RCXCE3D.tmp',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\PROGRA~~1\\247624934575.exe',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\RCXCA6D.tmp',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\PROGRA~~1\\746025468131..exe',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\PROGRA~~1\\341873236694.exe',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\PROGRA~~1\\368297392863.ico',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\PROGRA~~1\\096119937774.exe',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\RCXA7BC.tmp',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\PROGRA~~1\\186442211380.ico',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\PROGRA~~1\\428551169133.ico',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\PROGRA~~1\\166269737944.ico',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\PROGRA~~1\\362479874863.exe',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\PROGRA~~1\\771415948869.exe',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\PROGRA~~1\\535845542412.ico',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\PROGRA~~1\\751965871830.ico',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\PROGRA~~1\\576602585041..exe',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\PROGRA~~1\\290672681360..exe',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\RCXAA3A.tmp',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\PROGRA~~1\\760332511591.exe',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\PROGRA~~1\\413765742900..exe',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\PROGRA~~1\\667848580624.exe',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\PROGRA~~1\\513899494026.exe',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\PROGRA~~1\\456096208444.ico',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\PROGRA~~1\\368297392863.exe',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\PROGRA~~1\\471404858858.exe',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\PROGRA~~1\\697960493279..exe',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\PROGRA~~1\\976446307785..exe',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\PROGRA~~1\\362479874863.ico',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\PROGRA~~1\\075558976034..exe',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\PROGRA~~1\\137034059268..exe',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\PROGRA~~1\\735864867728.exe',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\PROGRA~~1\\310303259030.ico',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\PROGRA~~1\\556733591619.exe',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\PROGRA~~1\\679105735374.ico',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\PROGRA~~1\\031487327629.ico',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\PROGRA~~1\\565587715460.exe',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\PROGRA~~1\\110447325840.exe',
              'C:\\$Recycle.Bin\\S-1-5-21-3171250481-3681422803-404499418-1001\\$RMB04KL.exe',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\PROGRA~~1\\789150092438.ico',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\PROGRA~~1\\239173888614..exe',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\PROGRA~~1\\239091585784.ico',
              'C:\\Users\\buddy\\AppData\\Local\\Microsoft\\Windows\\Caches\\{3DA71D5A-20CC-432F-A115-DFE92379E91F}.3.ver0x0000000000000064.db',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\PROGRA~~1\\260623620679.exe',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\PROGRA~~1\\165366411285..exe',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\PROGRA~~1\\627624825867..exe',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\PROGRA~~1\\658645261924..exe',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\PROGRA~~1\\763941285813..exe',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\PROGRA~~1\\509567098812..exe',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\PROGRA~~1\\960361766477.exe',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\PROGRA~~1\\922078766833.exe',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\PROGRA~~1\\280420964799.ico',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\PROGRA~~1\\687725935298.exe',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\PROGRA~~1\\033925150031.ico',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\PROGRA~~1\\147315241168.ico',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\PROGRA~~1\\707148268632.exe',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\PROGRA~~1\\900279120917.exe',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\PROGRA~~1\\140918032923.ico',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\PROGRA~~1\\794672895442..exe',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\PROGRA~~1\\187161665044.ico',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\PROGRA~~1\\372286788508.exe',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\RCXAEF7.tmp',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\RCXAF59.tmp',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\PROGRA~~1\\141596229227.ico',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\PROGRA~~1\\997535305312..exe',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\PROGRA~~1\\301282724153.ico',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\PROGRA~~1\\956892949988.exe',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\PROGRA~~1\\677790638925.ico',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\PROGRA~~1\\342650492292.exe',
              'C:\\$Recycle.Bin\\S-1-5-21-3171250481-3681422803-404499418-1001\\RCX6DC6.tmp',
              'C:\\Users\\buddy\\Documents\\diagnostics\\shost.exe',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\PROGRA~~1\\569192497786..exe',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\PROGRA~~1\\801262564548..exe',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\PROGRA~~1\\735178784244.exe',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\PROGRA~~1\\343892163672.ico',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\PROGRA~~1\\926344970048.exe',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\PROGRA~~1\\735178784244.ico',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\PROGRA~~1\\956920884433.ico',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\PROGRA~~1\\848384298038.exe',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\PROGRA~~1\\683683062245..exe',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\PROGRA~~1\\094242596383..exe',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\PROGRA~~1\\649092752986.ico',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\RCXD0C0.tmp',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\RCXAB3C.tmp',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\PROGRA~~1\\990432003852..exe',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\PROGRA~~1\\873511667248..exe',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\PROGRA~~1\\758550967601.exe',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\PROGRA~~1\\539512506967.ico',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\PROGRA~~1\\808267784882.ico',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\PROGRA~~1\\038216965989..exe',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\PROGRA~~1\\685429137133.ico',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\PROGRA~~1\\787409565052.ico',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\RCXCBF8.tmp',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\PROGRA~~1\\960361766477.ico',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\PROGRA~~1\\964875289803.ico',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\PROGRA~~1\\078258523868.exe',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\PROGRA~~1\\800891954417.exe',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\PROGRA~~1\\800891954417.ico',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\PROGRA~~1\\280938484146..exe',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\PROGRA~~1\\809189895595.exe',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\PROGRA~~1\\416069141726..exe',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\PROGRA~~1\\161739884506.exe',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\PROGRA~~1\\715067087087.exe',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\PROGRA~~1\\394663236401.ico',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\PROGRA~~1\\421236926904.ico',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\PROGRA~~1\\891502089342.ico',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\PROGRA~~1\\479955514352.ico',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\PROGRA~~1\\606065924317..exe',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\PROGRA~~1\\990148434139.exe',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\PROGRA~~1\\098062103895..exe',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\PROGRA~~1\\659128535288..exe',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\PROGRA~~1\\674674517571..exe',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\PROGRA~~1\\038787639283.exe',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\PROGRA~~1\\398334924012.ico',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\RCXCA7F.tmp',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\PROGRA~~1\\249324556113.exe',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\PROGRA~~1\\513899494026.ico',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\PROGRA~~1\\744710747824.ico',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\PROGRA~~1\\896869217003..exe',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\PROGRA~~1\\499517307956..exe',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\PROGRA~~1\\280420964799.exe',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\PROGRA~~1\\451828212666.ico',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\PROGRA~~1\\914374665214..exe',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\PROGRA~~1\\414357125176..exe',
              'C:\\$Recycle.Bin\\S-1-5-21-3171250481-3681422803-404499418-1001\\RCX7E73.tmp',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\PROGRA~~1\\269374307374.exe',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\PROGRA~~1\\552097906486.ico',
              'C:\\Users\\buddy\\AppData\\Local\\winlogon',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\PROGRA~~1\\479955514352.exe',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\PROGRA~~1\\405496068690.exe',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\PROGRA~~1\\540361346950..exe',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\PROGRA~~1\\790589301717.ico',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\PROGRA~~1\\313226966727.ico',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\PROGRA~~1\\718989109377..exe',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\PROGRA~~1\\079012971789.ico',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\PROGRA~~1\\862495181931.exe',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\PROGRA~~1\\808267784882.exe',
              'C:\\Windows\\System32\\conhost.exe',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\PROGRA~~1\\029423809107.exe',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\PROGRA~~1\\269374307374.ico',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\PROGRA~~1\\495753385900..exe',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\RCXCCC3.tmp',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\PROGRA~~1\\166269737944.exe',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\PROGRA~~1\\157204312760.exe',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\PROGRA~~1\\311206496554..exe',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\PROGRA~~1\\308108902405.exe',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\RCXD122.tmp',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\RCXA95B.tmp',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\RCXCBB5.tmp',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\PROGRA~~1\\783256052993..exe',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\PROGRA~~1\\403070978266..exe',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\PROGRA~~1\\004117250543.exe',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\RCXCBA4.tmp',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\PROGRA~~1\\490633414973..exe',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\PROGRA~~1\\220144010817.ico',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\PROGRA~~1\\308467095450..exe',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\PROGRA~~1\\761227861621..exe',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\PROGRA~~1\\889197820153.exe',
              '{3DA71D5A-20CC-432F-A115-DFE92379E91F}.3.ver0x0000000000000064.db',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\PROGRA~~1\\538105199743..exe',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\PROGRA~~1\\132080986868..exe',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\PROGRA~~1\\883315709086.exe',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\PROGRA~~1\\588556494738.exe',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\PROGRA~~1\\022608222486..exe',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\PROGRA~~1\\011980386977..exe',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\PROGRA~~1\\300220666180..exe',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\PROGRA~~1\\676660412752.exe',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\PROGRA~~1\\946287639856..exe',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\PROGRA~~1\\386963372285.exe',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\PROGRA~~1\\648400301759..exe',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\PROGRA~~1\\222368468494..exe',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\PROGRA~~1\\644405407731..exe',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\RCXA928.tmp',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\PROGRA~~1\\787546261820.ico',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\PROGRA~~1\\532707298230.ico',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\RCXD01A.tmp',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\PROGRA~~1\\923110550111.exe',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\PROGRA~~1\\175118459063.ico',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\PROGRA~~1\\712763385003.exe',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\PROGRA~~1\\532670813253..exe',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\PROGRA~~1\\004704230115..exe',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\PROGRA~~1\\179305051402..exe',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\PROGRA~~1\\717859730373..exe',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\PROGRA~~1\\341873236694.ico',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\PROGRA~~1\\112014064778..exe',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\PROGRA~~1\\426243525846..exe',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\PROGRA~~1\\203681743822.ico',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\PROGRA~~1\\064028145971.ico',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\RCXAA6B.tmp',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\PROGRA~~1\\010009331686.ico',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\PROGRA~~1\\684203558359.ico',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\PROGRA~~1\\562270890939.exe',
              'C:\\$Recycle.Bin\\S-1-5-21-3171250481-3681422803-404499418-1001\\$IYQO38I.exe',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\PROGRA~~1\\606557054162..exe',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\PROGRA~~1\\614933659214.ico',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\PROGRA~~1\\542969990306..exe',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\RCXD07B.tmp',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\PROGRA~~1\\652846009492..exe',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\PROGRA~~1\\971146245299.exe',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\PROGRA~~1\\220144010817.exe',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\PROGRA~~1\\001709526539.exe',
              '{3DA71D5A-20CC-432F-A115-DFE92379E91F}.3.ver0x0000000000000065.db',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\PROGRA~~1\\703749671569.ico',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\PROGRA~~1\\867553599260..exe',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\PROGRA~~1\\967215316207.ico',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\PROGRA~~1\\190471341097..exe',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\PROGRA~~1\\028121754839.ico',
              'C:\\$Recycle.Bin\\S-1-5-21-3171250481-3681422803-404499418-1001\\$I899MJR.exe',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\PROGRA~~1\\041230650014.exe',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\PROGRA~~1\\706170189864..exe',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\PROGRA~~1\\919498313977..exe',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\PROGRA~~1\\215226931129.ico',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\PROGRA~~1\\118913226433.exe',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\PROGRA~~1\\771181619711.ico',
              'C:\\$Recycle.Bin\\S-1-5-21-3171250481-3681422803-404499418-1001\\$R899MJR.exe',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\PROGRA~~1\\003038459104.ico',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\PROGRA~~1\\174967551782.exe',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\PROGRA~~1\\046239911892.ico',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\PROGRA~~1\\620579953346..exe',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\PROGRA~~1\\552460290601.ico',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\PROGRA~~1\\809189895595.ico',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\PROGRA~~1\\932961174773.ico',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\PROGRA~~1\\705934001634..exe',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\PROGRA~~1\\487949888026..exe',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\RCXD09F.tmp',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\PROGRA~~1\\662713200898.exe',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\PROGRA~~1\\365886805038..exe',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\PROGRA~~1\\409020137758.exe',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\PROGRA~~1\\092899038627..exe',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\PROGRA~~1\\025028086467.exe',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\PROGRA~~1\\437976056266..exe',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\PROGRA~~1\\450579050124..exe',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\PROGRA~~1\\304986349926..exe',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\PROGRA~~1\\064878937502.exe',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\PROGRA~~1\\336200230069..exe',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\PROGRA~~1\\070333995033.ico',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\PROGRA~~1\\770197903607..exe',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\PROGRA~~1\\909853366259.exe',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\RCXCB6F.tmp',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\PROGRA~~1\\515931081458.ico',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\PROGRA~~1\\990148434139.ico',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\PROGRA~~1\\951055762872.exe',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\RCXB182.tmp',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\PROGRA~~1\\755354519038.ico',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\PROGRA~~1\\878640315852.ico',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\PROGRA~~1\\347146009557.exe',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\PROGRA~~1\\771181619711.exe',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\PROGRA~~1\\540340611954.ico',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\RCXA3FD.tmp',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\PROGRA~~1\\594828615923..exe',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\PROGRA~~1\\506697857577.ico',
              'C:\\Windows\\System32\\services.exe',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\RCXCA5B.tmp',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\PROGRA~~1\\361039840130.exe',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\PROGRA~~1\\225470672250..exe',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\PROGRA~~1\\234097336155.exe',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\PROGRA~~1\\789150092438.exe',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\PROGRA~~1\\467826781435..exe',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\PROGRA~~1\\028820742088..exe',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\PROGRA~~1\\493223624867..exe',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\PROGRA~~1\\873048907351..exe',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\RCXCD95.tmp',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\PROGRA~~1\\001709526539.ico',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\PROGRA~~1\\556733591619.ico',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\PROGRA~~1\\887023871474..exe',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\PROGRA~~1\\510527846027..exe',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\PROGRA~~1\\771415948869.ico',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\PROGRA~~1\\693507806120..exe',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\PROGRA~~1\\400613790870.exe',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\PROGRA~~1\\785605643917.ico',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\PROGRA~~1\\336456151930.exe',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\PROGRA~~1\\921028820082.ico',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\PROGRA~~1\\707743128505.ico',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\PROGRA~~1\\308108902405.ico',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\PROGRA~~1\\398334924012.exe',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\PROGRA~~1\\307011268108.exe',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\RCXCB81.tmp',
              'C:\\$Recycle.Bin\\S-1-5-21-3171250481-3681422803-404499418-1001\\RCX71FD.tmp',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\PROGRA~~1\\729243582393..exe',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\PROGRA~~1\\193636871490.ico',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\PROGRA~~1\\551677876609..exe',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\PROGRA~~1\\439981109074..exe',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\PROGRA~~1\\667666866846.ico',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\PROGRA~~1\\790589301717.exe',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\PROGRA~~1\\912264606425.ico',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\PROGRA~~1\\489718743872.ico',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\PROGRA~~1\\437484270482.ico',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\PROGRA~~1\\140918032923.exe',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\PROGRA~~1\\505032071217.ico',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\PROGRA~~1\\016960516140..exe',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\PROGRA~~1\\428887124825..exe',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\PROGRA~~1\\614933659214.exe',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\PROGRA~~1\\911108644463..exe',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\PROGRA~~1\\361039840130.ico',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\PROGRA~~1\\891502089342.exe',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\PROGRA~~1\\711401529982.ico',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\RCXCFD7.tmp',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\PROGRA~~1\\123365152555.exe',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\PROGRA~~1\\114780707225.exe',
              'C:\\$Recycle.Bin\\S-1-5-21-3171250481-3681422803-404499418-1001\\RCX6AA7.tmp',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\PROGRA~~1\\696535691867..exe',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\PROGRA~~1\\457330105361.ico',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\PROGRA~~1\\536481671590..exe',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\PROGRA~~1\\584960369758.exe',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\PROGRA~~1\\078258523868.ico',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\PROGRA~~1\\225392808855.exe',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\PROGRA~~1\\557070470152..exe',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\PROGRA~~1\\947481765134..exe',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\PROGRA~~1\\779913303114..exe',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\PROGRA~~1\\412546967960..exe',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\PROGRA~~1\\532733800983..exe',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\PROGRA~~1\\967215316207.exe',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\PROGRA~~1\\067213712963.exe',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\RCXC9F8.tmp',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\PROGRA~~1\\755955890974.exe',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\PROGRA~~1\\098308499774.exe',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\PROGRA~~1\\932961174773.exe',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\PROGRA~~1\\269939015199.exe',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\PROGRA~~1\\230555138749.ico',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\PROGRA~~1\\822312384939.exe',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\PROGRA~~1\\905941319641.ico',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\PROGRA~~1\\808805797654.exe',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\RCXA9BB.tmp',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\PROGRA~~1\\182076822131.exe',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\PROGRA~~1\\418698619116..exe',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\PROGRA~~1\\307599054627.ico',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\PROGRA~~1\\928362452004..exe',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\PROGRA~~1\\912264606425.exe',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\PROGRA~~1\\351551967344..exe',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\PROGRA~~1\\760312597776..exe',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\PROGRA~~1\\372286788508.ico',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\PROGRA~~1\\816597896444.exe',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\PROGRA~~1\\107257359056..exe',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\PROGRA~~1\\660078159571.ico',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\PROGRA~~1\\878640315852.exe',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\PROGRA~~1\\604087515160..exe',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\PROGRA~~1\\524121373582.ico',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\PROGRA~~1\\940765063361.ico',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\RCXB074.tmp',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\PROGRA~~1\\883315709086.ico',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\PROGRA~~1\\318391314108.exe',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\PROGRA~~1\\457330105361.exe',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\PROGRA~~1\\039772653928.exe',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\PROGRA~~1\\876159652117.exe',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\PROGRA~~1\\785270697824..exe',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\PROGRA~~1\\584960369758.ico',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\PROGRA~~1\\394663236401.exe',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\PROGRA~~1\\347145034574.exe',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\PROGRA~~1\\599748136847.exe',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\PROGRA~~1\\976873187449.ico',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\PROGRA~~1\\748464561861..exe',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\PROGRA~~1\\648121036774..exe',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\PROGRA~~1\\569170318388.exe',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\PROGRA~~1\\820784160078..exe',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\PROGRA~~1\\127601649827.ico',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\PROGRA~~1\\023081781805.exe',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\PROGRA~~1\\133254431883..exe',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\PROGRA~~1\\721164124383.exe',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\RCXCE18.tmp',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\RCXCCB2.tmp',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\PROGRA~~1\\107719362871.exe',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\PROGRA~~1\\515931081458.exe',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\PROGRA~~1\\174967551782.ico',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\0b5032375d29b11f01ec..exe',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\PROGRA~~1\\621599285920..exe',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\PROGRA~~1\\876159652117.ico',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\PROGRA~~1\\757691706113..exe',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\PROGRA~~1\\548939023762..exe',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\PROGRA~~1\\323047634127..exe',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\PROGRA~~1\\584070887000..exe',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\PROGRA~~1\\960904819751.exe',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\PROGRA~~1\\252865810529.ico',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\PROGRA~~1\\154119351308..exe',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\RCXCE1A.tmp',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\PROGRA~~1\\939252110503.exe',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\PROGRA~~1\\751965871830.exe',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\PROGRA~~1\\964284340416.exe',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\PROGRA~~1\\625295168312..exe',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\PROGRA~~1\\983867373380..exe',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\PROGRA~~1\\410693165642..exe',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\PROGRA~~1\\404474081987.ico',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\PROGRA~~1\\141596229227.exe',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\PROGRA~~1\\161739884506.ico',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\PROGRA~~1\\119515992522..exe',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\PROGRA~~1\\096119937774.ico',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\PROGRA~~1\\312804764150.exe',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\PROGRA~~1\\359433025810.exe',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\PROGRA~~1\\939252110503.ico',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\PROGRA~~1\\297248541766..exe',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\PROGRA~~1\\359433025810.ico',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\RCXB131.tmp',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\RCXA872.tmp',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\PROGRA~~1\\965666943587.ico',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\RCXA93A.tmp',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\PROGRA~~1\\866601968754..exe',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\PROGRA~~1\\241997540780..exe',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\PROGRA~~1\\089830558035..exe',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\PROGRA~~1\\667666866846.exe',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\PROGRA~~1\\673482531911..exe',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\RCXD0D1.tmp',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\PROGRA~~1\\285805433372.ico',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\PROGRA~~1\\170845746114..exe',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\PROGRA~~1\\976873187449.exe',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\PROGRA~~1\\766570885003..exe',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\PROGRA~~1\\555280601774..exe',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\RCXCE6E.tmp',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\RCXAA8C.tmp',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\RCXC9D6.tmp',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\PROGRA~~1\\459790220706..exe',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\PROGRA~~1\\846584699849..exe',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\PROGRA~~1\\336456151930.ico',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\PROGRA~~1\\269939015199.ico',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\PROGRA~~1\\848384298038.ico',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\PROGRA~~1\\769095965394.ico',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\RCXCABF.tmp',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\RCXCD23.tmp',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\PROGRA~~1\\230166579879..exe',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\PROGRA~~1\\259239869212.exe',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\PROGRA~~1\\143993184967.exe',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\PROGRA~~1\\405496068690.ico',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\PROGRA~~1\\761165604295..exe',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\PROGRA~~1\\534290356501..exe',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\PROGRA~~1\\024827068740..exe',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\PROGRA~~1\\712763385003.ico',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\PROGRA~~1\\839127431039.exe',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\PROGRA~~1\\028121754839.exe',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\PROGRA~~1\\806748390419..exe',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\PROGRA~~1\\965666943587.exe',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\PROGRA~~1\\677790638925.exe',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\PROGRA~~1\\343892163672.exe',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\PROGRA~~1\\714951309881..exe',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\PROGRA~~1\\438330383083.exe',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\PROGRA~~1\\433200147821..exe',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\PROGRA~~1\\662713200898.ico',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\RCXCC7F.tmp',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\PROGRA~~1\\175118459063.exe',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\PROGRA~~1\\471404858858.ico',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\PROGRA~~1\\808805797654.ico',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\PROGRA~~1\\769095965394.exe',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\PROGRA~~1\\010009331686.exe',
              'C:\\Users\\buddy\\Documents\\logs.txt',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\PROGRA~~1\\157204312760.ico',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\PROGRA~~1\\960904819751.ico',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\PROGRA~~1\\280614142103.ico',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\PROGRA~~1\\110447325840.ico',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\PROGRA~~1\\106567537679..exe',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\PROGRA~~1\\021946873542..exe',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\PROGRA~~1\\811582416067..exe',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\PROGRA~~1\\259403318347.ico',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\PROGRA~~1\\678736017494.ico',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\PROGRA~~1\\332711354671.ico',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\PROGRA~~1\\578495228401.exe',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\PROGRA~~1\\011120643430..exe',
              'C:\\MSOCache\\All',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\RCXCC6D.tmp',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\PROGRA~~1\\822312384939.ico',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\PROGRA~~1\\182076822131.ico',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\PROGRA~~1\\909504277836.exe',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\PROGRA~~1\\168738533298.ico',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\PROGRA~~1\\972353688907..exe',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\RCXAB0B.tmp',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\PROGRA~~1\\787546261820.exe',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\PROGRA~~1\\257703870471..exe',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\PROGRA~~1\\114780707225.ico',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\PROGRA~~1\\569170318388.ico',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\PROGRA~~1\\312804764150.ico',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\PROGRA~~1\\603154585596..exe',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\PROGRA~~1\\921028820082.exe',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\PROGRA~~1\\592792211621..exe',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\PROGRA~~1\\428551169133.exe',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\PROGRA~~1\\272916984489.ico',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\PROGRA~~1\\789225788114..exe',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\PROGRA~~1\\715067087087.ico',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\PROGRA~~1\\193636871490.exe',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\PROGRA~~1\\958406934340.exe',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\RCXA894.tmp',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\PROGRA~~1\\046239911892.exe',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\PROGRA~~1\\434680220719.ico',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\PROGRA~~1\\436654847011.exe',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\PROGRA~~1\\922078766833.ico',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\PROGRA~~1\\259403318347.exe',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\PROGRA~~1\\486773560759..exe',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\PROGRA~~1\\347145034574.ico',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\PROGRA~~1\\562270890939.ico',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\PROGRA~~1\\278321051403..exe',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\PROGRA~~1\\985973043456.ico',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\PROGRA~~1\\412615014316.ico',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\PROGRA~~1\\489718743872.exe',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\PROGRA~~1\\168738533298.exe',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\PROGRA~~1\\539512506967.exe',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\RCXCC4C.tmp',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\PROGRA~~1\\366201927974.exe',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\PROGRA~~1\\186442211380.exe',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\PROGRA~~1\\070333995033.exe',
              'C:\\hollowshunter\\process_7960\\140000000.0b5032375d29b11f01ec.exe',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\PROGRA~~1\\890728148547.exe',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\PROGRA~~1\\889197820153.ico',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\PROGRA~~1\\451828212666.exe',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\PROGRA~~1\\713373388653..exe',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\RCXA8B5.tmp',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\PROGRA~~1\\234097336155.ico',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\RCXA7EF.tmp',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\PROGRA~~1\\203681743822.exe',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\PROGRA~~1\\143993184967.ico',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\RCXA851.tmp',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\PROGRA~~1\\395792961779.ico',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\PROGRA~~1\\687725935298.ico',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\PROGRA~~1\\187161665044.exe',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\RCXCA28.tmp',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\PROGRA~~1\\274922923471.exe',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\PROGRA~~1\\221560983231.exe',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\PROGRA~~1\\890728148547.ico',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\RCXA917.tmp',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\PROGRA~~1\\210924920910..exe',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\RCXCC0A.tmp',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\PROGRA~~1\\540340611954.exe',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\PROGRA~~1\\442234987198..exe',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\PROGRA~~1\\857294736465.exe',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\PROGRA~~1\\245673041785..exe',
              'C:\\Users\\buddy\\AppData\\Local\\Microsoft\\CLR_v4.0\\UsageLogs\\audiodg.exe.log',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\PROGRA~~1\\049455170331..exe',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\PROGRA~~1\\332711354671.exe',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\PROGRA~~1\\387555357469.ico',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\PROGRA~~1\\107719362871.ico',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\PROGRA~~1\\293989041817..exe',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\PROGRA~~1\\604564057806..exe',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\PROGRA~~1\\285805433372.exe',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\PROGRA~~1\\760332511591.ico',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\PROGRA~~1\\230555138749.exe',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\PROGRA~~1\\203308859484.ico',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\PROGRA~~1\\421236926904.exe',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\PROGRA~~1\\168286339613..exe',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\PROGRA~~1\\900279120917.ico',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\PROGRA~~1\\259239869212.ico',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\PROGRA~~1\\004117250543.ico',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\RCXCBE6.tmp',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\PROGRA~~1\\039772653928.ico',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\PROGRA~~1\\735864867728.ico',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\PROGRA~~1\\956920884433.exe',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\PROGRA~~1\\985973043456.exe',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\PROGRA~~1\\272916984489.exe',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\PROGRA~~1\\098779119904.exe',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\RCXB233.tmp',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\PROGRA~~1\\325063992754.exe',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\PROGRA~~1\\951055762872.ico',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\PROGRA~~1\\785605643917.exe',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\PROGRA~~1\\098779119904.ico',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\PROGRA~~1\\132677522204..exe',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\PROGRA~~1\\147315241168.exe',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\PROGRA~~1\\145151254278..exe',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\PROGRA~~1\\778590921968.ico',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\PROGRA~~1\\721164124383.ico',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\PROGRA~~1\\023081781805.ico',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\PROGRA~~1\\923110550111.ico',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\PROGRA~~1\\274922923471.ico',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\PROGRA~~1\\038787639283.ico',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\PROGRA~~1\\157095909592..exe',
              'c:\\$recycle.bin\\s-1-5-21-3171250481-3681422803-404499418-1001\\$imb04kl.exe',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\PROGRA~~1\\515098093472..exe',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\PROGRA~~1\\475586324673..exe',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\PROGRA~~1\\284330302336..exe',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\PROGRA~~1\\409020137758.ico',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\PROGRA~~1\\948946511026..exe',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\PROGRA~~1\\437484270482.exe',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\PROGRA~~1\\438330383083.ico',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\PROGRA~~1\\386963372285.ico',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\PROGRA~~1\\755955890974.ico',
              '405496068690.exe',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\PROGRA~~1\\876470629928.ico',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\PROGRA~~1\\342650492292.ico',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\PROGRA~~1\\395792961779.exe',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\PROGRA~~1\\033925150031.exe',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\PROGRA~~1\\909853366259.ico',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\PROGRA~~1\\586565380893..exe',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\RCXAF09.tmp',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\RCXA79B.tmp',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\PROGRA~~1\\739863873280..exe',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\PROGRA~~1\\964875289803.exe',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\PROGRA~~1\\249324556113.ico',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\PROGRA~~1\\978576709606.exe',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\PROGRA~~1\\676660412752.ico',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\PROGRA~~1\\230948882740..exe',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\PROGRA~~1\\247624934575.ico',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\PROGRA~~1\\168753336117..exe',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\PROGRA~~1\\206552021892.ico',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\PROGRA~~1\\157084807893..exe',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\PROGRA~~1\\779837381738.ico',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\PROGRA~~1\\366201927974.ico',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\PROGRA~~1\\430571433456..exe',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\PROGRA~~1\\118913226433.ico',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\RCXCC3A.tmp',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\PROGRA~~1\\203308859484.exe',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\PROGRA~~1\\824242812621..exe',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\PROGRA~~1\\445601945491..exe',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\PROGRA~~1\\705025066072..exe',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\PROGRA~~1\\043998595974..exe',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\PROGRA~~1\\746465381159.ico',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\PROGRA~~1\\620920146252..exe',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\PROGRA~~1\\243133558147..exe',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\PROGRA~~1\\434680220719.exe',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\PROGRA~~1\\502176313333..exe',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\PROGRA~~1\\080968103846..exe',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\PROGRA~~1\\115170857910..exe',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\PROGRA~~1\\541063288310..exe',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\PROGRA~~1\\505032071217.exe',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\PROGRA~~1\\588556494738.ico',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\PROGRA~~1\\499551103580..exe',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\RCXCCA0.tmp',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\PROGRA~~1\\347146009557.ico',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\PROGRA~~1\\404474081987.exe',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\PROGRA~~1\\876470629928.exe',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\PROGRA~~1\\950005413868.exe',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\RCXB1A3.tmp',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\PROGRA~~1\\679105735374.exe',
              'C:\\Users\\buddy\\AppData\\Local\\Temp\\PROGRA~~1\\130236690242..exe',
              'C:\\Users\\buddy\\AppData\\Local\\Microsoft\\Windows\\Caches\\{3DA71D5A-20CC-432F-A115-DFE92379E91F}.3.ver0x0000000000000065.db'
            ],
            'file.rule.cape': [
              'internal-cape-yara.XWorm',
              'internal-cape-community-yara.INDICATOR_SUSPICIOUS_EXE_NoneWindowsUA',
              'CAPE.XClient'
            ],
            'dynamic.process.command_line': [
              '"C:\\Users\\buddy\\AppData\\Local\\Temp\\0b5032375d29b11f01ec.exe" ',
              'C:\\WINDOWS\\system32\\services.exe',
              'C:\\WINDOWS\\system32\\services.exe 640 "batmeter.dll" f408aa6c-92a2-4e8e-b97c-5503b94626f',
              'C:\\WINDOWS\\Explorer.EXE',
              '\\??\\C:\\WINDOWS\\system32\\conhost.exe 0xffffffff -ForceV1',
              '"C:\\Users\\buddy\\Documents\\diagnostics\\audiodg.exe"',
              '"C:\\Users\\buddy\\Documents\\diagnostics\\shost.exe"',
              'PPLinject64.exe 640 C:\\dj9tgtr6\\dll\\SopHDNN.dll'
            ],
            'dynamic.processtree_id': [
              '?c\\dj9tgtr6\\bin\\rdpewxon.exe|?c\\dj9tgtr6\\bin\\pplinject64.exe',
              '?c\\dj9tgtr6\\bin\\rdpewxon.exe',
              '?sys32\\services.exe',
              '?usrtmp\\0b5032375d29b11f01ec.exe|?usr\\documents\\diagnostics\\shost.exe|?usr\\documents\\diagnostics\\audiodg.exe',
              '?c\\dj9tgtr6\\bin\\rdpewxon.exe|?c\\dj9tgtr6\\bin\\pplinject64.exe|?sys32\\conhost.exe',
              '?c\\dj9tgtr6\\bin\\rdpewxon.exe|?c\\dj9tgtr6\\bin\\pplinject64.exe|?sys32\\services.exe',
              '?pf86\\cuassistant\\culauncher.exe',
              '?usrtmp\\0b5032375d29b11f01ec.exe|?usr\\documents\\diagnostics\\shost.exe',
              '?sys32\\waasmedicagent.exe|?sys32\\conhost.exe',
              '?usrtmp\\0b5032375d29b11f01ec.exe',
              '?win\\explorer.exe',
              '?usrtmp\\0b5032375d29b11f01ec.exe|?usr\\documents\\diagnostics\\audiodg.exe',
              '?sys32\\musnotification.exe',
              '?pf86\\windowsapps\\microsoft.windowscommunicationsapps_16005.14326.21854.0_x64__8wekyb3d8bbwe\\hxtsr.exe',
              '?sys32\\musnotificationux.exe'
            ]
          },
          heuristics: [
            {
              tags: {
                'network.dynamic.domain': ['pastebin.com'],
                'network.dynamic.ip': [
                  '52.167.17.97',
                  '52.191.219.104',
                  '23.44.133.27',
                  '23.44.133.12',
                  '23.56.210.93',
                  '4.154.209.85',
                  '172.66.171.73',
                  '104.20.29.150'
                ],
                'network.protocol': ['dns']
              },
              times_raised: 1,
              heur_id: 'CAPE_1000',
              name: 'Domain detected',
              score: 10
            },
            {
              tags: {
                'network.dynamic.domain': ['pastebin.com'],
                'network.dynamic.uri': ['https://pastebin.com/raw/Fxzr3jeT'],
                'network.dynamic.uri_path': ['/raw/Fxzr3jeT']
              },
              times_raised: 1,
              heur_id: 'CAPE_1013',
              name: 'Unseen IOCs found in API calls',
              score: 1
            },
            {
              tags: {},
              times_raised: 2,
              heur_id: 'CAPE_7',
              name: 'Anti-vm',
              score: 0
            },
            {
              tags: {},
              times_raised: 6,
              heur_id: 'CAPE_9999',
              name: 'Unknown',
              score: 0
            },
            {
              tags: {
                'network.dynamic.ip': ['172.66.171.73'],
                'network.port': [443],
                'network.dynamic.domain': ['pastebin.com'],
                'network.dynamic.uri': ['https://pastebin.com/raw/Fxzr3jeT'],
                'network.dynamic.uri_path': ['/raw/Fxzr3jeT']
              },
              times_raised: 3,
              heur_id: 'CAPE_41',
              name: 'Network',
              score: 0
            },
            {
              tags: {},
              times_raised: 1,
              heur_id: 'CAPE_20',
              name: 'Discovery',
              score: 0
            },
            {
              tags: {},
              times_raised: 2,
              heur_id: 'CAPE_4',
              name: 'Anti-debug',
              score: 0
            },
            {
              tags: {},
              times_raised: 2,
              heur_id: 'CAPE_38',
              name: 'Malware',
              score: 1000
            },
            {
              tags: {},
              times_raised: 1,
              heur_id: 'CAPE_30',
              name: 'Generic',
              score: 0
            },
            {
              tags: {
                'dynamic.process.file_name': [
                  'C:\\$Recycle.Bin\\S-1-5-21-3171250481-3681422803-404499418-1001\\$I899MJR.exe',
                  'C:\\$Recycle.Bin\\S-1-5-21-3171250481-3681422803-404499418-1001\\RCX6AA7.tmp',
                  'C:\\$Recycle.Bin\\S-1-5-21-3171250481-3681422803-404499418-1001\\$IMB04KL.exe',
                  'C:\\$Recycle.Bin\\S-1-5-21-3171250481-3681422803-404499418-1001\\RCX6CFA.tmp',
                  'C:\\$Recycle.Bin\\S-1-5-21-3171250481-3681422803-404499418-1001\\$IYQO38I.exe',
                  'C:\\$Recycle.Bin\\S-1-5-21-3171250481-3681422803-404499418-1001\\RCX6DC6.tmp',
                  'C:\\$Recycle.Bin\\S-1-5-21-3171250481-3681422803-404499418-1001\\$R899MJR.exe',
                  'C:\\$Recycle.Bin\\S-1-5-21-3171250481-3681422803-404499418-1001\\RCX71FD.tmp',
                  'C:\\$Recycle.Bin\\S-1-5-21-3171250481-3681422803-404499418-1001\\$RMB04KL.exe',
                  'C:\\$Recycle.Bin\\S-1-5-21-3171250481-3681422803-404499418-1001\\RCX79EE.tmp',
                  'C:\\$Recycle.Bin\\S-1-5-21-3171250481-3681422803-404499418-1001\\$RYQO38I.exe',
                  'C:\\$Recycle.Bin\\S-1-5-21-3171250481-3681422803-404499418-1001\\RCX7E73.tmp'
                ]
              },
              times_raised: 1,
              heur_id: 'CAPE_26',
              name: 'Evasion',
              score: 0
            },
            {
              tags: {},
              times_raised: 1,
              heur_id: 'CAPE_43',
              name: 'Packer',
              score: 0
            },
            {
              tags: {
                'dynamic.process.file_name': ['C:\\Users\\buddy\\Documents\\diagnostics\\shost.exe']
              },
              times_raised: 1,
              heur_id: 'CAPE_24',
              name: 'Dropper',
              score: 0
            },
            {
              tags: {},
              times_raised: 1,
              heur_id: 'CAPE_32',
              name: 'Injection',
              score: 0
            },
            {
              tags: {
                'dynamic.process.file_name': ['C:\\Users\\buddy\\AppData\\Local\\Temp\\0b5032375d29b11f01ec..exe']
              },
              times_raised: 1,
              heur_id: 'CAPE_27',
              name: 'Execution',
              score: 0
            },
            {
              tags: {
                'dynamic.registry_key': [
                  'HKEY_CURRENT_USER\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\Run\\winlogon',
                  'HKEY_LOCAL_MACHINE\\SOFTWARE\\Classes\\exefile\\shell\\open\\command\\(Default)'
                ],
                'dynamic.process.file_name': ['C:\\Users\\buddy\\AppData\\Roaming\\Microsoft\\Windows\\Start']
              },
              times_raised: 1,
              heur_id: 'CAPE_44',
              name: 'Persistence',
              score: 0
            },
            {
              tags: {
                'dynamic.process.file_name': [
                  'C:\\Users\\buddy\\AppData\\Local\\winlogon',
                  'C:\\Users\\buddy\\AppData\\Roaming\\Microsoft\\Windows\\Start',
                  'C:\\Users\\buddy\\Documents\\logs.txt',
                  'C:\\$Recycle.Bin\\S-1-5-21-3171250481-3681422803-404499418-1001\\$I899MJR.exe',
                  'C:\\$Recycle.Bin\\S-1-5-21-3171250481-3681422803-404499418-1001\\RCX6AA7.tmp',
                  'C:\\$Recycle.Bin\\S-1-5-21-3171250481-3681422803-404499418-1001\\$IMB04KL.exe',
                  'C:\\$Recycle.Bin\\S-1-5-21-3171250481-3681422803-404499418-1001\\$IYQO38I.exe',
                  'C:\\Users\\buddy\\AppData\\Local\\Temp\\PROGRA~~1\\003038459104.ico',
                  'C:\\$Recycle.Bin\\S-1-5-21-3171250481-3681422803-404499418-1001\\$R899MJR.exe',
                  'C:\\Users\\buddy\\AppData\\Local\\Microsoft\\CLR_v4.0\\UsageLogs\\audiodg.exe.log',
                  'C:\\Users\\buddy\\AppData\\Local\\Microsoft\\PenWorkspace\\DiscoverCacheData.dat',
                  'C:\\$Recycle.Bin\\S-1-5-21-3171250481-3681422803-404499418-1001\\$RMB04KL.exe',
                  'C:\\$Recycle.Bin\\S-1-5-21-3171250481-3681422803-404499418-1001\\$RYQO38I.exe',
                  'C:\\hollowshunter\\process_7328\\140000000.shost.exe',
                  'C:\\hollowshunter\\process_7960\\140000000.0b5032375d29b11f01ec.exe',
                  'C:\\MSOCache\\All',
                  'C:\\Program',
                  '{3DA71D5A-20CC-432F-A115-DFE92379E91F}.3.ver0x0000000000000065.db',
                  '{3DA71D5A-20CC-432F-A115-DFE92379E91F}.3.ver0x0000000000000064.db',
                  '405496068690.exe'
                ]
              },
              times_raised: 1,
              heur_id: 'CAPE_46',
              name: 'Ransomware',
              score: 0
            },
            {
              tags: {
                'dynamic.process.file_name': [
                  'c:\\$recycle.bin\\s-1-5-21-3171250481-3681422803-404499418-1001\\$i899mjr.exe',
                  'c:\\$recycle.bin\\s-1-5-21-3171250481-3681422803-404499418-1001\\$imb04kl.exe',
                  'c:\\$recycle.bin\\s-1-5-21-3171250481-3681422803-404499418-1001\\$r899mjr.exe',
                  'c:\\$recycle.bin\\s-1-5-21-3171250481-3681422803-404499418-1001\\$iyqo38i.exe'
                ]
              },
              times_raised: 1,
              heur_id: 'CAPE_54',
              name: 'Virus',
              score: 0
            },
            {
              tags: {
                'file.rule.cape': [
                  'internal-cape-community-yara.INDICATOR_SUSPICIOUS_EXE_NoneWindowsUA',
                  'internal-cape-yara.XWorm',
                  'CAPE.XClient'
                ]
              },
              times_raised: 2,
              heur_id: 'CAPE_55',
              name: 'CAPE Yara Hit',
              score: 0
            },
            {
              tags: {},
              times_raised: 1,
              heur_id: 'CAPE_51',
              name: 'Static',
              score: 0
            }
          ],
          score: 10251,
          process: [
            {
              objectid: {
                tag: '?win\\explorer.exe',
                ontology_id: 'process_a7DIK9VLD7hccokZEytze',
                service_name: 'CAPE',
                guid: '{c5ed5e69-3730-68ca-7400-000000006100}',
                treeid: 'ddb872aa77c4c7ba1ec280f77e1a2f19cbd4d461fe21da009f89ade882fe26be',
                processtree: '?win\\explorer.exe',
                time_observed: '2025-10-08T01:13:20.668000Z',
                session: '74NA2gT1KCY94PnUGt8gvz'
              },
              image: 'C:\\Windows\\explorer.exe',
              start_time: '2025-10-08T01:13:20.668000Z',
              ppid: 5304,
              pid: 5340,
              command_line: 'C:\\WINDOWS\\Explorer.EXE',
              end_time: '2025-10-08T01:13:58.793000Z'
            },
            {
              objectid: {
                tag: '?usr\\documents\\diagnostics\\shost.exe',
                ontology_id: 'process_6JYjwh4RLrRbbMn78xnvJA',
                service_name: 'CAPE',
                guid: '{c5ed5e69-baa9-68e5-0103-000000006100}',
                treeid: '86ccd28caf7d3b741ba8ee47020a599207d7d2646aed9f5554363c0071a7aa12',
                processtree: '?usrtmp\\0b5032375d29b11f01ec.exe|?usr\\documents\\diagnostics\\shost.exe',
                time_observed: '2025-10-08T01:13:13.137000Z',
                session: '74NA2gT1KCY94PnUGt8gvz'
              },
              image: 'C:\\Users\\buddy\\Documents\\diagnostics\\shost.exe',
              start_time: '2025-10-08T01:13:13.002000Z',
              pobjectid: {
                tag: '?usrtmp\\0b5032375d29b11f01ec.exe',
                ontology_id: 'process_3d69JLCKfLSoGwcZR29Cis',
                service_name: 'CAPE',
                guid: '{c5ed5e69-baa6-68e5-fc02-000000006100}',
                treeid: '53ca09bd879c9fc8d8587b822369f08ff7cfb102fc79d34746cefe356dc4e2ca',
                processtree: '?usrtmp\\0b5032375d29b11f01ec.exe',
                time_observed: '2025-10-08T01:13:12.340000Z',
                session: '74NA2gT1KCY94PnUGt8gvz'
              },
              pimage: 'C:\\Users\\buddy\\AppData\\Local\\Temp\\0b5032375d29b11f01ec.exe',
              pcommand_line: '"C:\\Users\\buddy\\AppData\\Local\\Temp\\0b5032375d29b11f01ec.exe"',
              ppid: 7960,
              pid: 7328,
              command_line: '"C:\\Users\\buddy\\Documents\\diagnostics\\shost.exe"',
              end_time: '2025-10-08T01:13:51.574000Z',
              integrity_level: 'high',
              image_hash: 'F6F0F9DAE7FD6185D07A8D249B3DA11461C8529761AA4B4D5ABFA9E50CBB8FC5',
              original_file_name: '-'
            },
            {
              objectid: {
                tag: '?usr\\documents\\diagnostics\\audiodg.exe',
                ontology_id: 'process_6Gls4w0sWDj0CXixTwmJYm',
                service_name: 'CAPE',
                guid: '{c5ed5e69-baa8-68e5-fe02-000000006100}',
                treeid: '8cd0ca5e1baac669cbf353c7afa3f119abbf92861c8fd585ee6ff99068a4b247',
                processtree: '?usrtmp\\0b5032375d29b11f01ec.exe|?usr\\documents\\diagnostics\\audiodg.exe',
                time_observed: '2025-10-08T01:13:12.949000Z',
                session: '74NA2gT1KCY94PnUGt8gvz'
              },
              image: 'C:\\Users\\buddy\\Documents\\diagnostics\\audiodg.exe',
              start_time: '2025-10-08T01:13:12.840000Z',
              pobjectid: {
                tag: '?usrtmp\\0b5032375d29b11f01ec.exe',
                ontology_id: 'process_3d69JLCKfLSoGwcZR29Cis',
                service_name: 'CAPE',
                guid: '{c5ed5e69-baa6-68e5-fc02-000000006100}',
                treeid: '53ca09bd879c9fc8d8587b822369f08ff7cfb102fc79d34746cefe356dc4e2ca',
                processtree: '?usrtmp\\0b5032375d29b11f01ec.exe',
                time_observed: '2025-10-08T01:13:12.340000Z',
                session: '74NA2gT1KCY94PnUGt8gvz'
              },
              pimage: 'C:\\Users\\buddy\\AppData\\Local\\Temp\\0b5032375d29b11f01ec.exe',
              pcommand_line: '"C:\\Users\\buddy\\AppData\\Local\\Temp\\0b5032375d29b11f01ec.exe"',
              ppid: 7960,
              pid: 8164,
              command_line: '"C:\\Users\\buddy\\Documents\\diagnostics\\audiodg.exe"',
              end_time: '2025-10-08T01:13:50.371000Z',
              integrity_level: 'high',
              image_hash: '76957A7DB92ABF1667474A4E45477CEA7297E9A25C78C1FADD94795FC5390833',
              original_file_name: 'XClient.exe'
            },
            {
              objectid: {
                tag: '?sys32\\musnotification.exe',
                ontology_id: 'process_5MVTSf6kNiUYCwC7Nc4hC7',
                service_name: 'CAPE',
                guid: '{c5ed5e69-ba91-68e5-1902-000000006100}',
                treeid: '01994ffaef7effe650279414caded772ed6ed773660f62c770d515df7047831b',
                processtree: '?sys32\\musnotification.exe',
                time_observed: '2025-10-08T01:12:50.000000Z',
                session: '74NA2gT1KCY94PnUGt8gvz'
              },
              image: 'C:\\Windows\\System32\\MusNotification.exe',
              start_time: '2025-10-08T01:12:50.000000Z',
              pid: 5820,
              end_time: '2025-10-08T01:13:27.293000Z'
            },
            {
              objectid: {
                tag: '?usr\\documents\\diagnostics\\audiodg.exe',
                ontology_id: 'process_5aksmiMZDEAKCiDncbvbcB',
                service_name: 'CAPE',
                guid: '{c5ed5e69-baab-68e5-0b03-000000006100}',
                treeid: 'c0c72425bfdad8717c68c845e815b171819ee423c5d93d51d17441e63d24943e',
                processtree:
                  '?usrtmp\\0b5032375d29b11f01ec.exe|?usr\\documents\\diagnostics\\shost.exe|?usr\\documents\\diagnostics\\audiodg.exe',
                time_observed: '2025-10-08T01:13:16.246000Z',
                session: '74NA2gT1KCY94PnUGt8gvz'
              },
              image: 'C:\\Users\\buddy\\Documents\\diagnostics\\audiodg.exe',
              start_time: '2025-10-08T01:13:15.312000Z',
              pobjectid: {
                tag: '?usr\\documents\\diagnostics\\shost.exe',
                ontology_id: 'process_6JYjwh4RLrRbbMn78xnvJA',
                service_name: 'CAPE',
                guid: '{c5ed5e69-baa9-68e5-0103-000000006100}',
                treeid: '86ccd28caf7d3b741ba8ee47020a599207d7d2646aed9f5554363c0071a7aa12',
                processtree: '?usrtmp\\0b5032375d29b11f01ec.exe|?usr\\documents\\diagnostics\\shost.exe',
                time_observed: '2025-10-08T01:13:13.137000Z',
                session: '74NA2gT1KCY94PnUGt8gvz'
              },
              pimage: 'C:\\Users\\buddy\\Documents\\diagnostics\\shost.exe',
              pcommand_line: '"C:\\Users\\buddy\\Documents\\diagnostics\\shost.exe"',
              ppid: 7328,
              pid: 2696,
              command_line: '"C:\\Users\\buddy\\Documents\\diagnostics\\audiodg.exe"',
              end_time: '2025-10-08T01:13:26.746000Z',
              integrity_level: 'high',
              image_hash: '76957A7DB92ABF1667474A4E45477CEA7297E9A25C78C1FADD94795FC5390833',
              original_file_name: 'XClient.exe'
            },
            {
              objectid: {
                tag: '?c\\dj9tgtr6\\bin\\pplinject64.exe',
                ontology_id: 'process_cKXBYzcsSRVri4oRLFgud',
                service_name: 'CAPE',
                guid: '{c5ed5e69-bab4-68e5-1503-000000006100}',
                treeid: '4038f53792d12fa80c7cf0ae8fa1b710751f02bdf5f6d4791ff341c2c9fb4958',
                processtree: '?c\\dj9tgtr6\\bin\\rdpewxon.exe|?c\\dj9tgtr6\\bin\\pplinject64.exe',
                time_observed: '2025-10-08T01:12:50.000000Z',
                session: '74NA2gT1KCY94PnUGt8gvz'
              },
              image: 'C:\\dj9tgtr6\\bin\\PPLinject64.exe',
              start_time: '2025-10-08T01:13:24.971000Z',
              pobjectid: {
                tag: '?c\\dj9tgtr6\\bin\\rdpewxon.exe',
                ontology_id: 'process_6IR95ZKp9QYAl5dsAdzi42',
                service_name: 'CAPE',
                guid: '{c5ed5e69-bab4-68e5-1403-000000006100}',
                treeid: 'de5407878ae15806866a4f5aacd6b6b7d2b859afa5d26f8a1cc13b3c2c22b3bb',
                processtree: '?c\\dj9tgtr6\\bin\\rdpewxon.exe',
                time_observed: '2025-10-08T01:12:50.000000Z',
                session: '74NA2gT1KCY94PnUGt8gvz'
              },
              pimage: 'C:\\dj9tgtr6\\bin\\RdpEwXoN.exe',
              pcommand_line: 'C:\\dj9tgtr6\\bin\\RdpEwXoN.exe inject 640 0 C:\\dj9tgtr6\\dll\\SopHDNN.dll',
              ppid: 2328,
              pid: 7404,
              command_line: 'PPLinject64.exe 640 C:\\dj9tgtr6\\dll\\SopHDNN.dll',
              end_time: '2025-10-08T01:13:26.481000Z',
              integrity_level: 'high',
              image_hash: 'A8E8CE929A145A0C6BA7E537DA571E0F78A11B3E46820FE22FFAE4C55EF26EE1',
              original_file_name: '-'
            },
            {
              objectid: {
                tag: '?sys32\\services.exe',
                ontology_id: 'process_72WMD4rrB2RDy8BaQQKhP5',
                service_name: 'CAPE',
                guid: '{c5ed5e69-bab5-68e5-1903-000000006100}',
                treeid: '669b01c6e1f52c5a2f63155a0a7ef64739a54a2302ae91d65a6f8cc0dcc38ac9',
                processtree: '?c\\dj9tgtr6\\bin\\rdpewxon.exe|?c\\dj9tgtr6\\bin\\pplinject64.exe|?sys32\\services.exe',
                time_observed: '2025-10-08T01:12:50.000000Z',
                session: '74NA2gT1KCY94PnUGt8gvz'
              },
              image: 'C:\\Windows\\System32\\services.exe',
              start_time: '2025-10-08T01:13:25.605000Z',
              pobjectid: {
                tag: '?c\\dj9tgtr6\\bin\\pplinject64.exe',
                ontology_id: 'process_cKXBYzcsSRVri4oRLFgud',
                service_name: 'CAPE',
                guid: '{c5ed5e69-bab4-68e5-1503-000000006100}',
                treeid: '4038f53792d12fa80c7cf0ae8fa1b710751f02bdf5f6d4791ff341c2c9fb4958',
                processtree: '?c\\dj9tgtr6\\bin\\rdpewxon.exe|?c\\dj9tgtr6\\bin\\pplinject64.exe',
                time_observed: '2025-10-08T01:12:50.000000Z',
                session: '74NA2gT1KCY94PnUGt8gvz'
              },
              pimage: 'C:\\dj9tgtr6\\bin\\PPLinject64.exe',
              pcommand_line: 'PPLinject64.exe 640 C:\\dj9tgtr6\\dll\\SopHDNN.dll',
              ppid: 7404,
              pid: 7728,
              command_line:
                'C:\\WINDOWS\\system32\\services.exe 640 "batmeter.dll" f408aa6c-92a2-4e8e-b97c-5503b94626f',
              end_time: '2025-10-08T01:13:26.449000Z',
              integrity_level: 'system',
              image_hash: '2E18DC3466566DF55792D6AFAD818D1E28FFA2C32017770A959419736DB577EE',
              original_file_name: 'services.exe'
            },
            {
              objectid: {
                tag: '?sys32\\conhost.exe',
                ontology_id: 'process_4uzabtu5624nlbVJ2dwVnQ',
                service_name: 'CAPE',
                guid: '{c5ed5e69-bab5-68e5-1803-000000006100}',
                treeid: 'cb97843cdc4f965a5b30b2cdaf7db26ce72b8d417398d2519ac888f4f05e7a28',
                processtree: '?sys32\\waasmedicagent.exe|?sys32\\conhost.exe',
                time_observed: '2025-10-08T01:13:25.256000Z',
                session: '74NA2gT1KCY94PnUGt8gvz'
              },
              image: 'C:\\Windows\\System32\\conhost.exe',
              start_time: '2025-10-08T01:13:25.256000Z',
              pobjectid: {
                tag: '?sys32\\waasmedicagent.exe',
                ontology_id: 'process_6RiDi9FlsuN8DRjgMHH8hc',
                service_name: 'CAPE',
                guid: '{c5ed5e69-bab5-68e5-1703-000000006100}',
                treeid: '25a026bdd54385f3aaefb8e1723f5be97b7c36e255b2c48f7f7f8a66d9df7eb8',
                processtree: '?sys32\\waasmedicagent.exe',
                time_observed: '2025-10-08T01:12:50.000000Z',
                session: '74NA2gT1KCY94PnUGt8gvz'
              },
              pimage: 'C:\\Windows\\System32\\WaaSMedicAgent.exe',
              pcommand_line:
                'C:\\WINDOWS\\System32\\WaaSMedicAgent.exe b23946b81092cc4985f3ea868ae901fb vjhDvQMMfU+6dPSXexUzvg.0.1.0.0.0',
              ppid: 6672,
              pid: 3248,
              command_line: '\\??\\C:\\WINDOWS\\system32\\conhost.exe 0xffffffff -ForceV1',
              end_time: '2025-10-08T01:14:15.000000Z',
              integrity_level: 'system',
              image_hash: '57B0CCD3AEBC6C7126E7C19F5DAC492DF51D904A505C5F5B0CB02270D53F8684',
              original_file_name: 'CONHOST.EXE'
            },
            {
              objectid: {
                tag: '?c\\dj9tgtr6\\bin\\rdpewxon.exe',
                ontology_id: 'process_6IR95ZKp9QYAl5dsAdzi42',
                service_name: 'CAPE',
                guid: '{c5ed5e69-bab4-68e5-1403-000000006100}',
                treeid: 'de5407878ae15806866a4f5aacd6b6b7d2b859afa5d26f8a1cc13b3c2c22b3bb',
                processtree: '?c\\dj9tgtr6\\bin\\rdpewxon.exe',
                time_observed: '2025-10-08T01:12:50.000000Z',
                session: '74NA2gT1KCY94PnUGt8gvz'
              },
              image: 'C:\\dj9tgtr6\\bin\\RdpEwXoN.exe',
              start_time: '2025-10-08T01:12:50.000000Z',
              pid: 2328,
              end_time: '2025-10-08T01:13:24.996000Z'
            },
            {
              objectid: {
                tag: '?sys32\\conhost.exe',
                ontology_id: 'process_26wohfcJdhGtqgWvXcyjDG',
                service_name: 'CAPE',
                guid: '{c5ed5e69-bab4-68e5-1603-000000006100}',
                treeid: 'c305bae6b46dee6979fa5cca4cc291e74cca05f140cf1005866e0522120ea48c',
                processtree: '?c\\dj9tgtr6\\bin\\rdpewxon.exe|?c\\dj9tgtr6\\bin\\pplinject64.exe|?sys32\\conhost.exe',
                time_observed: '2025-10-08T01:13:24.999000Z',
                session: '74NA2gT1KCY94PnUGt8gvz'
              },
              image: 'C:\\Windows\\System32\\conhost.exe',
              start_time: '2025-10-08T01:13:24.999000Z',
              pobjectid: {
                tag: '?c\\dj9tgtr6\\bin\\pplinject64.exe',
                ontology_id: 'process_cKXBYzcsSRVri4oRLFgud',
                service_name: 'CAPE',
                guid: '{c5ed5e69-bab4-68e5-1503-000000006100}',
                treeid: '4038f53792d12fa80c7cf0ae8fa1b710751f02bdf5f6d4791ff341c2c9fb4958',
                processtree: '?c\\dj9tgtr6\\bin\\rdpewxon.exe|?c\\dj9tgtr6\\bin\\pplinject64.exe',
                time_observed: '2025-10-08T01:12:50.000000Z',
                session: '74NA2gT1KCY94PnUGt8gvz'
              },
              pimage: 'C:\\dj9tgtr6\\bin\\PPLinject64.exe',
              pcommand_line: 'PPLinject64.exe 640 C:\\dj9tgtr6\\dll\\SopHDNN.dll',
              ppid: 7404,
              pid: 4512,
              command_line: '\\??\\C:\\WINDOWS\\system32\\conhost.exe 0xffffffff -ForceV1',
              end_time: '2025-10-08T01:14:15.000000Z',
              integrity_level: 'high',
              image_hash: '57B0CCD3AEBC6C7126E7C19F5DAC492DF51D904A505C5F5B0CB02270D53F8684',
              original_file_name: 'CONHOST.EXE'
            },
            {
              objectid: {
                tag: '?c\\dj9tgtr6\\bin\\rdpewxon.exe',
                ontology_id: 'process_61J4BOR2Ov09lOwDjjX6pW',
                service_name: 'CAPE',
                guid: '{c5ed5e69-bab0-68e5-0e03-000000006100}',
                treeid: 'de5407878ae15806866a4f5aacd6b6b7d2b859afa5d26f8a1cc13b3c2c22b3bb',
                processtree: '?c\\dj9tgtr6\\bin\\rdpewxon.exe',
                time_observed: '2025-10-08T01:12:50.000000Z',
                session: '74NA2gT1KCY94PnUGt8gvz'
              },
              image: 'C:\\dj9tgtr6\\bin\\RdpEwXoN.exe',
              start_time: '2025-10-08T01:12:50.000000Z',
              pid: 7436,
              end_time: '2025-10-08T01:13:21.871000Z'
            },
            {
              objectid: {
                tag: '?usrtmp\\0b5032375d29b11f01ec.exe',
                ontology_id: 'process_3d69JLCKfLSoGwcZR29Cis',
                service_name: 'CAPE',
                guid: '{c5ed5e69-baa6-68e5-fc02-000000006100}',
                treeid: '53ca09bd879c9fc8d8587b822369f08ff7cfb102fc79d34746cefe356dc4e2ca',
                processtree: '?usrtmp\\0b5032375d29b11f01ec.exe',
                time_observed: '2025-10-08T01:13:12.340000Z',
                session: '74NA2gT1KCY94PnUGt8gvz'
              },
              image: 'C:\\Users\\buddy\\AppData\\Local\\Temp\\0b5032375d29b11f01ec.exe',
              start_time: '2025-10-08T01:13:12.340000Z',
              ppid: 4720,
              pid: 7960,
              command_line: '"C:\\Users\\buddy\\AppData\\Local\\Temp\\0b5032375d29b11f01ec.exe" ',
              end_time: '2025-10-08T01:13:17.668000Z'
            },
            {
              objectid: {
                tag: '?pf86\\cuassistant\\culauncher.exe',
                ontology_id: 'process_7pzNZm6brXT9OWOKgPbJ5',
                service_name: 'CAPE',
                guid: '{c5ed5e69-ba91-68e5-1102-000000006100}',
                treeid: 'acc8ad71f8b5eaea0a4e49e6f4a4ab0340d31c3be1a23a6c7183be6aa861e299',
                processtree: '?pf86\\cuassistant\\culauncher.exe',
                time_observed: '2025-10-08T01:12:50.000000Z',
                session: '74NA2gT1KCY94PnUGt8gvz'
              },
              image: 'C:\\Program Files\\CUAssistant\\culauncher.exe',
              start_time: '2025-10-08T01:12:50.000000Z',
              pid: 1756,
              end_time: '2025-10-08T01:13:17.496000Z'
            },
            {
              objectid: {
                tag: '?c\\dj9tgtr6\\bin\\rdpewxon.exe',
                ontology_id: 'process_6sSVX71EcrpPW8i8pyKPwN',
                service_name: 'CAPE',
                guid: '{c5ed5e69-baab-68e5-0d03-000000006100}',
                treeid: 'de5407878ae15806866a4f5aacd6b6b7d2b859afa5d26f8a1cc13b3c2c22b3bb',
                processtree: '?c\\dj9tgtr6\\bin\\rdpewxon.exe',
                time_observed: '2025-10-08T01:12:50.000000Z',
                session: '74NA2gT1KCY94PnUGt8gvz'
              },
              image: 'C:\\dj9tgtr6\\bin\\RdpEwXoN.exe',
              start_time: '2025-10-08T01:12:50.000000Z',
              pid: 8096,
              end_time: '2025-10-08T01:13:15.965000Z'
            },
            {
              objectid: {
                tag: '?c\\dj9tgtr6\\bin\\rdpewxon.exe',
                ontology_id: 'process_5wZrwNJabw2NtHSig2Y3aR',
                service_name: 'CAPE',
                guid: '{c5ed5e69-baab-68e5-0c03-000000006100}',
                treeid: 'de5407878ae15806866a4f5aacd6b6b7d2b859afa5d26f8a1cc13b3c2c22b3bb',
                processtree: '?c\\dj9tgtr6\\bin\\rdpewxon.exe',
                time_observed: '2025-10-08T01:12:50.000000Z',
                session: '74NA2gT1KCY94PnUGt8gvz'
              },
              image: 'C:\\dj9tgtr6\\bin\\RdpEwXoN.exe',
              start_time: '2025-10-08T01:12:50.000000Z',
              pid: 2604,
              end_time: '2025-10-08T01:13:15.855000Z'
            },
            {
              objectid: {
                tag: '?sys32\\musnotificationux.exe',
                ontology_id: 'process_3FiqkAXsQ5itovtIA4Mc1E',
                service_name: 'CAPE',
                guid: '{c5ed5e69-baa9-68e5-0803-000000006100}',
                treeid: '4d947c76ee0d099f2d6c39fda6d6fdfdbbccc245e1898950999236c56e3ace55',
                processtree: '?sys32\\musnotificationux.exe',
                time_observed: '2025-10-08T01:12:50.000000Z',
                session: '74NA2gT1KCY94PnUGt8gvz'
              },
              image: 'C:\\Windows\\System32\\MusNotificationUx.exe',
              start_time: '2025-10-08T01:12:50.000000Z',
              pid: 7712,
              end_time: '2025-10-08T01:13:14.543000Z'
            },
            {
              objectid: {
                tag: '?c\\dj9tgtr6\\bin\\rdpewxon.exe',
                ontology_id: 'process_3uDf8foR7u9JBIuUFw98H8',
                service_name: 'CAPE',
                guid: '{c5ed5e69-baa9-68e5-0303-000000006100}',
                treeid: 'de5407878ae15806866a4f5aacd6b6b7d2b859afa5d26f8a1cc13b3c2c22b3bb',
                processtree: '?c\\dj9tgtr6\\bin\\rdpewxon.exe',
                time_observed: '2025-10-08T01:12:50.000000Z',
                session: '74NA2gT1KCY94PnUGt8gvz'
              },
              image: 'C:\\dj9tgtr6\\bin\\RdpEwXoN.exe',
              start_time: '2025-10-08T01:12:50.000000Z',
              pid: 7356,
              end_time: '2025-10-08T01:13:13.090000Z'
            },
            {
              objectid: {
                tag: '?c\\dj9tgtr6\\bin\\rdpewxon.exe',
                ontology_id: 'process_2dDpwKKM7mK9dUmqCpnSYa',
                service_name: 'CAPE',
                guid: '{c5ed5e69-baa9-68e5-0203-000000006100}',
                treeid: 'de5407878ae15806866a4f5aacd6b6b7d2b859afa5d26f8a1cc13b3c2c22b3bb',
                processtree: '?c\\dj9tgtr6\\bin\\rdpewxon.exe',
                time_observed: '2025-10-08T01:12:50.000000Z',
                session: '74NA2gT1KCY94PnUGt8gvz'
              },
              image: 'C:\\dj9tgtr6\\bin\\RdpEwXoN.exe',
              start_time: '2025-10-08T01:12:50.000000Z',
              pid: 7332,
              end_time: '2025-10-08T01:13:13.063000Z'
            },
            {
              objectid: {
                tag: '?c\\dj9tgtr6\\bin\\rdpewxon.exe',
                ontology_id: 'process_7XhyHOpSzxmw7EtYBjtQBo',
                service_name: 'CAPE',
                guid: '{c5ed5e69-baa8-68e5-0003-000000006100}',
                treeid: 'de5407878ae15806866a4f5aacd6b6b7d2b859afa5d26f8a1cc13b3c2c22b3bb',
                processtree: '?c\\dj9tgtr6\\bin\\rdpewxon.exe',
                time_observed: '2025-10-08T01:12:50.000000Z',
                session: '74NA2gT1KCY94PnUGt8gvz'
              },
              image: 'C:\\dj9tgtr6\\bin\\RdpEwXoN.exe',
              start_time: '2025-10-08T01:12:50.000000Z',
              pid: 2784,
              end_time: '2025-10-08T01:13:12.902000Z'
            },
            {
              objectid: {
                tag: '?c\\dj9tgtr6\\bin\\rdpewxon.exe',
                ontology_id: 'process_5jGQINWHyYwSvSgW07Amuy',
                service_name: 'CAPE',
                guid: '{c5ed5e69-baa8-68e5-ff02-000000006100}',
                treeid: 'de5407878ae15806866a4f5aacd6b6b7d2b859afa5d26f8a1cc13b3c2c22b3bb',
                processtree: '?c\\dj9tgtr6\\bin\\rdpewxon.exe',
                time_observed: '2025-10-08T01:12:50.000000Z',
                session: '74NA2gT1KCY94PnUGt8gvz'
              },
              image: 'C:\\dj9tgtr6\\bin\\RdpEwXoN.exe',
              start_time: '2025-10-08T01:12:50.000000Z',
              pid: 8184,
              end_time: '2025-10-08T01:13:12.871000Z'
            },
            {
              objectid: {
                tag: '?c\\dj9tgtr6\\bin\\rdpewxon.exe',
                ontology_id: 'process_4atzlKzX8ZECIDIAJbNMqG',
                service_name: 'CAPE',
                guid: '{c5ed5e69-baa6-68e5-fd02-000000006100}',
                treeid: 'de5407878ae15806866a4f5aacd6b6b7d2b859afa5d26f8a1cc13b3c2c22b3bb',
                processtree: '?c\\dj9tgtr6\\bin\\rdpewxon.exe',
                time_observed: '2025-10-08T01:12:50.000000Z',
                session: '74NA2gT1KCY94PnUGt8gvz'
              },
              image: 'C:\\dj9tgtr6\\bin\\RdpEwXoN.exe',
              start_time: '2025-10-08T01:12:50.000000Z',
              pid: 7980,
              end_time: '2025-10-08T01:13:10.293000Z'
            },
            {
              objectid: {
                tag: '?pf86\\windowsapps\\microsoft.windowscommunicationsapps_16005.14326.21854.0_x64__8wekyb3d8bbwe\\hxtsr.exe',
                ontology_id: 'process_1eCV80vehnVkawgbNwsa9d',
                service_name: 'CAPE',
                guid: '{c5ed5e69-ba91-68e5-2102-000000006100}',
                treeid: '6e0da68bff7dc331bee3070f7226f933a4645136f6e30a0840bdf3b9186fa78c',
                processtree:
                  '?pf86\\windowsapps\\microsoft.windowscommunicationsapps_16005.14326.21854.0_x64__8wekyb3d8bbwe\\hxtsr.exe',
                time_observed: '2025-10-08T01:12:50.000000Z',
                session: '74NA2gT1KCY94PnUGt8gvz'
              },
              image:
                'C:\\Program Files\\WindowsApps\\microsoft.windowscommunicationsapps_16005.14326.21854.0_x64__8wekyb3d8bbwe\\HxTsr.exe',
              start_time: '2025-10-08T01:12:50.000000Z',
              pid: 6404,
              end_time: '2025-10-08T01:13:10.121000Z'
            },
            {
              objectid: {
                tag: '?sys32\\services.exe',
                ontology_id: 'process_5Tl22Cgk0gD7U8P461mpRp',
                service_name: 'CAPE',
                guid: '{48EBD5FB-EEFE-4186-8B1E-60FA8C415396}',
                treeid: 'a364a5fcf64b5d9e29ba27262a73ccfbb88725651716677862622411c7d3d2f3',
                processtree: '?sys32\\services.exe',
                time_observed: '2025-10-08T01:13:26.012000Z',
                session: '74NA2gT1KCY94PnUGt8gvz'
              },
              image: 'C:\\Windows\\System32\\services.exe',
              start_time: '2025-10-08T01:13:26.012000Z',
              ppid: 524,
              pid: 640,
              command_line: 'C:\\WINDOWS\\system32\\services.exe',
              end_time: '2025-10-08T01:14:15.000000Z'
            }
          ],
          sandbox: [
            {
              objectid: {
                tag: 'CAPE',
                ontology_id: 'sandbox_DAKmOsnhVj5GRNxRl8NXd',
                service_name: 'CAPE',
                session: '74NA2gT1KCY94PnUGt8gvz'
              },
              analysis_metadata: {
                task_id: '113697',
                start_time: '2025-10-08T01:12:50.000000Z',
                end_time: '2025-10-08T01:14:15.000000Z',
                routing: 'internet',
                machine_metadata: {
                  ip: '169.254.128.180',
                  hypervisor: 'KVM',
                  hostname: 'cape_u-10_win10x64-131',
                  platform: 'Windows',
                  version: '10',
                  architecture: 'x64'
                }
              },
              sandbox_name: 'CAPE',
              sandbox_version: '2.4-CAPE'
            }
          ],
          signature: [
            {
              objectid: {
                tag: 'CUCKOO.antivm_checks_available_memory',
                ontology_id: 'signature_6KYLP4FLOfnYbUCQJf2It7',
                service_name: 'CAPE',
                session: '74NA2gT1KCY94PnUGt8gvz'
              },
              name: 'antivm_checks_available_memory',
              type: 'CUCKOO',
              classification: 'TLP:CLEAR',
              attributes: [
                {
                  source: {
                    tag: '?usr\\documents\\diagnostics\\audiodg.exe',
                    ontology_id: 'process_6Gls4w0sWDj0CXixTwmJYm',
                    service_name: 'CAPE',
                    guid: '{c5ed5e69-baa8-68e5-fe02-000000006100}',
                    treeid: '8cd0ca5e1baac669cbf353c7afa3f119abbf92861c8fd585ee6ff99068a4b247',
                    processtree: '?usrtmp\\0b5032375d29b11f01ec.exe|?usr\\documents\\diagnostics\\audiodg.exe',
                    time_observed: '2025-10-08T01:13:12.949000Z',
                    session: '74NA2gT1KCY94PnUGt8gvz'
                  }
                }
              ],
              attacks: [
                {
                  attack_id: 'T1497',
                  pattern: 'Virtualization/Sandbox Evasion',
                  categories: ['defense-evasion', 'discovery']
                },
                {
                  attack_id: 'T1007',
                  pattern: 'System Service Discovery',
                  categories: ['discovery']
                }
              ],
              actors: [],
              malware_families: []
            },
            {
              objectid: {
                tag: 'CUCKOO.queries_computer_name',
                ontology_id: 'signature_2ktOvOXEVXJOBa4obEgXBl',
                service_name: 'CAPE',
                session: '74NA2gT1KCY94PnUGt8gvz'
              },
              name: 'queries_computer_name',
              type: 'CUCKOO',
              classification: 'TLP:CLEAR',
              attributes: [
                {
                  source: {
                    tag: '?usr\\documents\\diagnostics\\audiodg.exe',
                    ontology_id: 'process_6Gls4w0sWDj0CXixTwmJYm',
                    service_name: 'CAPE',
                    guid: '{c5ed5e69-baa8-68e5-fe02-000000006100}',
                    treeid: '8cd0ca5e1baac669cbf353c7afa3f119abbf92861c8fd585ee6ff99068a4b247',
                    processtree: '?usrtmp\\0b5032375d29b11f01ec.exe|?usr\\documents\\diagnostics\\audiodg.exe',
                    time_observed: '2025-10-08T01:13:12.949000Z',
                    session: '74NA2gT1KCY94PnUGt8gvz'
                  }
                }
              ],
              attacks: [],
              actors: [],
              malware_families: []
            },
            {
              objectid: {
                tag: 'CUCKOO.dead_connect',
                ontology_id: 'signature_2QsHMLs8fKZES88Iam3D4h',
                service_name: 'CAPE',
                session: '74NA2gT1KCY94PnUGt8gvz'
              },
              name: 'dead_connect',
              type: 'CUCKOO',
              classification: 'TLP:CLEAR',
              attributes: [
                {
                  source: {
                    tag: '?usr\\documents\\diagnostics\\audiodg.exe',
                    ontology_id: 'process_6Gls4w0sWDj0CXixTwmJYm',
                    service_name: 'CAPE',
                    guid: '{c5ed5e69-baa8-68e5-fe02-000000006100}',
                    treeid: '8cd0ca5e1baac669cbf353c7afa3f119abbf92861c8fd585ee6ff99068a4b247',
                    processtree: '?usrtmp\\0b5032375d29b11f01ec.exe|?usr\\documents\\diagnostics\\audiodg.exe',
                    time_observed: '2025-10-08T01:13:12.949000Z',
                    session: '74NA2gT1KCY94PnUGt8gvz'
                  },
                  action: 'network_connection'
                }
              ],
              attacks: [],
              actors: [],
              malware_families: []
            },
            {
              objectid: {
                tag: 'CUCKOO.queries_keyboard_layout',
                ontology_id: 'signature_1OFMsA5dPs5lScnnpY6Scr',
                service_name: 'CAPE',
                session: '74NA2gT1KCY94PnUGt8gvz'
              },
              name: 'queries_keyboard_layout',
              type: 'CUCKOO',
              classification: 'TLP:CLEAR',
              attributes: [
                {
                  source: {
                    tag: '?usr\\documents\\diagnostics\\shost.exe',
                    ontology_id: 'process_6JYjwh4RLrRbbMn78xnvJA',
                    service_name: 'CAPE',
                    guid: '{c5ed5e69-baa9-68e5-0103-000000006100}',
                    treeid: '86ccd28caf7d3b741ba8ee47020a599207d7d2646aed9f5554363c0071a7aa12',
                    processtree: '?usrtmp\\0b5032375d29b11f01ec.exe|?usr\\documents\\diagnostics\\shost.exe',
                    time_observed: '2025-10-08T01:13:13.137000Z',
                    session: '74NA2gT1KCY94PnUGt8gvz'
                  }
                }
              ],
              attacks: [],
              actors: [],
              malware_families: []
            },
            {
              objectid: {
                tag: 'CUCKOO.queries_locale_api',
                ontology_id: 'signature_62tEFSZEcUkKbeQPRV9o4j',
                service_name: 'CAPE',
                session: '74NA2gT1KCY94PnUGt8gvz'
              },
              name: 'queries_locale_api',
              type: 'CUCKOO',
              classification: 'TLP:CLEAR',
              attributes: [
                {
                  source: {
                    tag: '?usr\\documents\\diagnostics\\audiodg.exe',
                    ontology_id: 'process_6Gls4w0sWDj0CXixTwmJYm',
                    service_name: 'CAPE',
                    guid: '{c5ed5e69-baa8-68e5-fe02-000000006100}',
                    treeid: '8cd0ca5e1baac669cbf353c7afa3f119abbf92861c8fd585ee6ff99068a4b247',
                    processtree: '?usrtmp\\0b5032375d29b11f01ec.exe|?usr\\documents\\diagnostics\\audiodg.exe',
                    time_observed: '2025-10-08T01:13:12.949000Z',
                    session: '74NA2gT1KCY94PnUGt8gvz'
                  }
                }
              ],
              attacks: [],
              actors: [],
              malware_families: []
            },
            {
              objectid: {
                tag: 'CUCKOO.antivm_network_adapters',
                ontology_id: 'signature_3rlkvRqjtYcQNKGu7jVHax',
                service_name: 'CAPE',
                session: '74NA2gT1KCY94PnUGt8gvz'
              },
              name: 'antivm_network_adapters',
              type: 'CUCKOO',
              classification: 'TLP:CLEAR',
              attributes: [
                {
                  source: {
                    tag: '?usr\\documents\\diagnostics\\audiodg.exe',
                    ontology_id: 'process_6Gls4w0sWDj0CXixTwmJYm',
                    service_name: 'CAPE',
                    guid: '{c5ed5e69-baa8-68e5-fe02-000000006100}',
                    treeid: '8cd0ca5e1baac669cbf353c7afa3f119abbf92861c8fd585ee6ff99068a4b247',
                    processtree: '?usrtmp\\0b5032375d29b11f01ec.exe|?usr\\documents\\diagnostics\\audiodg.exe',
                    time_observed: '2025-10-08T01:13:12.949000Z',
                    session: '74NA2gT1KCY94PnUGt8gvz'
                  }
                }
              ],
              attacks: [
                {
                  attack_id: 'T1497',
                  pattern: 'Virtualization/Sandbox Evasion',
                  categories: ['defense-evasion', 'discovery']
                },
                {
                  attack_id: 'T1007',
                  pattern: 'System Service Discovery',
                  categories: ['discovery']
                }
              ],
              actors: [],
              malware_families: []
            },
            {
              objectid: {
                tag: 'CUCKOO.dll_load_uncommon_file_types',
                ontology_id: 'signature_lX4ucrPzZWB8LY1yikoqH',
                service_name: 'CAPE',
                session: '74NA2gT1KCY94PnUGt8gvz'
              },
              name: 'dll_load_uncommon_file_types',
              type: 'CUCKOO',
              classification: 'TLP:CLEAR',
              attributes: [
                {
                  source: {
                    tag: '?usr\\documents\\diagnostics\\audiodg.exe',
                    ontology_id: 'process_6Gls4w0sWDj0CXixTwmJYm',
                    service_name: 'CAPE',
                    guid: '{c5ed5e69-baa8-68e5-fe02-000000006100}',
                    treeid: '8cd0ca5e1baac669cbf353c7afa3f119abbf92861c8fd585ee6ff99068a4b247',
                    processtree: '?usrtmp\\0b5032375d29b11f01ec.exe|?usr\\documents\\diagnostics\\audiodg.exe',
                    time_observed: '2025-10-08T01:13:12.949000Z',
                    session: '74NA2gT1KCY94PnUGt8gvz'
                  }
                }
              ],
              attacks: [
                {
                  attack_id: 'T1057',
                  pattern: 'Process Discovery',
                  categories: ['discovery']
                },
                {
                  attack_id: 'T1518.001',
                  pattern: 'Security Software Discovery',
                  categories: ['discovery']
                }
              ],
              actors: [],
              malware_families: []
            },
            {
              objectid: {
                tag: 'CUCKOO.anomalous_deletefile',
                ontology_id: 'signature_2hc5DGNG9t8rRWuneOmkrK',
                service_name: 'CAPE',
                session: '74NA2gT1KCY94PnUGt8gvz'
              },
              name: 'anomalous_deletefile',
              type: 'CUCKOO',
              classification: 'TLP:CLEAR',
              attributes: [
                {
                  source: {
                    tag: '?usr\\documents\\diagnostics\\shost.exe',
                    ontology_id: 'process_6JYjwh4RLrRbbMn78xnvJA',
                    service_name: 'CAPE',
                    guid: '{c5ed5e69-baa9-68e5-0103-000000006100}',
                    treeid: '86ccd28caf7d3b741ba8ee47020a599207d7d2646aed9f5554363c0071a7aa12',
                    processtree: '?usrtmp\\0b5032375d29b11f01ec.exe|?usr\\documents\\diagnostics\\shost.exe',
                    time_observed: '2025-10-08T01:13:13.137000Z',
                    session: '74NA2gT1KCY94PnUGt8gvz'
                  }
                }
              ],
              attacks: [],
              actors: [],
              malware_families: []
            },
            {
              objectid: {
                tag: 'CUCKOO.antidebug_guardpages',
                ontology_id: 'signature_7QxJzP8QsrggpoW91N5NXi',
                service_name: 'CAPE',
                session: '74NA2gT1KCY94PnUGt8gvz'
              },
              name: 'antidebug_guardpages',
              type: 'CUCKOO',
              classification: 'TLP:CLEAR',
              attributes: [
                {
                  source: {
                    tag: '?usr\\documents\\diagnostics\\audiodg.exe',
                    ontology_id: 'process_6Gls4w0sWDj0CXixTwmJYm',
                    service_name: 'CAPE',
                    guid: '{c5ed5e69-baa8-68e5-fe02-000000006100}',
                    treeid: '8cd0ca5e1baac669cbf353c7afa3f119abbf92861c8fd585ee6ff99068a4b247',
                    processtree: '?usrtmp\\0b5032375d29b11f01ec.exe|?usr\\documents\\diagnostics\\audiodg.exe',
                    time_observed: '2025-10-08T01:13:12.949000Z',
                    session: '74NA2gT1KCY94PnUGt8gvz'
                  }
                }
              ],
              attacks: [
                {
                  attack_id: 'T1057',
                  pattern: 'Process Discovery',
                  categories: ['discovery']
                },
                {
                  attack_id: 'T1518.001',
                  pattern: 'Security Software Discovery',
                  categories: ['discovery']
                }
              ],
              actors: [],
              malware_families: []
            },
            {
              objectid: {
                tag: 'CUCKOO.mouse_movement_detect',
                ontology_id: 'signature_Icytkxgvcsl7RQtxiV3v1',
                service_name: 'CAPE',
                session: '74NA2gT1KCY94PnUGt8gvz'
              },
              name: 'mouse_movement_detect',
              type: 'CUCKOO',
              classification: 'TLP:CLEAR',
              attributes: [
                {
                  source: {
                    tag: '?win\\explorer.exe',
                    ontology_id: 'process_a7DIK9VLD7hccokZEytze',
                    service_name: 'CAPE',
                    guid: '{c5ed5e69-3730-68ca-7400-000000006100}',
                    treeid: 'ddb872aa77c4c7ba1ec280f77e1a2f19cbd4d461fe21da009f89ade882fe26be',
                    processtree: '?win\\explorer.exe',
                    time_observed: '2025-10-08T01:13:20.668000Z',
                    session: '74NA2gT1KCY94PnUGt8gvz'
                  }
                }
              ],
              attacks: [],
              actors: [],
              malware_families: []
            },
            {
              objectid: {
                tag: 'CUCKOO.http_request',
                ontology_id: 'signature_2tCXXPwmJ4GXnvWXZAGW7x',
                service_name: 'CAPE',
                session: '74NA2gT1KCY94PnUGt8gvz'
              },
              name: 'http_request',
              type: 'CUCKOO',
              classification: 'TLP:CLEAR',
              attributes: [
                {
                  source: {
                    tag: '?usr\\documents\\diagnostics\\audiodg.exe',
                    ontology_id: 'process_6Gls4w0sWDj0CXixTwmJYm',
                    service_name: 'CAPE',
                    guid: '{c5ed5e69-baa8-68e5-fe02-000000006100}',
                    treeid: '8cd0ca5e1baac669cbf353c7afa3f119abbf92861c8fd585ee6ff99068a4b247',
                    processtree: '?usrtmp\\0b5032375d29b11f01ec.exe|?usr\\documents\\diagnostics\\audiodg.exe',
                    time_observed: '2025-10-08T01:13:12.949000Z',
                    session: '74NA2gT1KCY94PnUGt8gvz'
                  }
                }
              ],
              attacks: [],
              actors: [],
              malware_families: []
            },
            {
              objectid: {
                tag: 'CUCKOO.reads_memory_remote_process',
                ontology_id: 'signature_6TFUNXUUstmocF78QVuX5d',
                service_name: 'CAPE',
                session: '74NA2gT1KCY94PnUGt8gvz'
              },
              name: 'reads_memory_remote_process',
              type: 'CUCKOO',
              classification: 'TLP:CLEAR',
              attributes: [
                {
                  source: {
                    tag: '?usr\\documents\\diagnostics\\audiodg.exe',
                    ontology_id: 'process_6Gls4w0sWDj0CXixTwmJYm',
                    service_name: 'CAPE',
                    guid: '{c5ed5e69-baa8-68e5-fe02-000000006100}',
                    treeid: '8cd0ca5e1baac669cbf353c7afa3f119abbf92861c8fd585ee6ff99068a4b247',
                    processtree: '?usrtmp\\0b5032375d29b11f01ec.exe|?usr\\documents\\diagnostics\\audiodg.exe',
                    time_observed: '2025-10-08T01:13:12.949000Z',
                    session: '74NA2gT1KCY94PnUGt8gvz'
                  }
                }
              ],
              attacks: [],
              actors: [],
              malware_families: []
            },
            {
              objectid: {
                tag: 'CUCKOO.accesses_recyclebin',
                ontology_id: 'signature_199WaRhDP1VZhIDVI5PMrJ',
                service_name: 'CAPE',
                session: '74NA2gT1KCY94PnUGt8gvz'
              },
              name: 'accesses_recyclebin',
              type: 'CUCKOO',
              classification: 'TLP:CLEAR',
              attributes: [
                {
                  source: {
                    tag: '?usr\\documents\\diagnostics\\shost.exe',
                    ontology_id: 'process_6JYjwh4RLrRbbMn78xnvJA',
                    service_name: 'CAPE',
                    guid: '{c5ed5e69-baa9-68e5-0103-000000006100}',
                    treeid: '86ccd28caf7d3b741ba8ee47020a599207d7d2646aed9f5554363c0071a7aa12',
                    processtree: '?usrtmp\\0b5032375d29b11f01ec.exe|?usr\\documents\\diagnostics\\shost.exe',
                    time_observed: '2025-10-08T01:13:13.137000Z',
                    session: '74NA2gT1KCY94PnUGt8gvz'
                  }
                }
              ],
              attacks: [],
              actors: [],
              malware_families: []
            },
            {
              objectid: {
                tag: 'CUCKOO.injection_rwx',
                ontology_id: 'signature_393nkF9LiA5mtOWVl1rrh3',
                service_name: 'CAPE',
                session: '74NA2gT1KCY94PnUGt8gvz'
              },
              name: 'injection_rwx',
              type: 'CUCKOO',
              classification: 'TLP:CLEAR',
              attributes: [
                {
                  source: {
                    tag: '?usr\\documents\\diagnostics\\audiodg.exe',
                    ontology_id: 'process_6Gls4w0sWDj0CXixTwmJYm',
                    service_name: 'CAPE',
                    guid: '{c5ed5e69-baa8-68e5-fe02-000000006100}',
                    treeid: '8cd0ca5e1baac669cbf353c7afa3f119abbf92861c8fd585ee6ff99068a4b247',
                    processtree: '?usrtmp\\0b5032375d29b11f01ec.exe|?usr\\documents\\diagnostics\\audiodg.exe',
                    time_observed: '2025-10-08T01:13:12.949000Z',
                    session: '74NA2gT1KCY94PnUGt8gvz'
                  }
                }
              ],
              attacks: [
                {
                  attack_id: 'T1055',
                  pattern: 'Process Injection',
                  categories: ['defense-evasion', 'privilege-escalation']
                }
              ],
              actors: [],
              malware_families: []
            },
            {
              objectid: {
                tag: 'CUCKOO.process_creation_suspicious_location',
                ontology_id: 'signature_5BdNLyMjs9nkzbWO7fWF9c',
                service_name: 'CAPE',
                session: '74NA2gT1KCY94PnUGt8gvz'
              },
              name: 'process_creation_suspicious_location',
              type: 'CUCKOO',
              classification: 'TLP:CLEAR',
              attributes: [
                {
                  source: {
                    tag: '?usrtmp\\0b5032375d29b11f01ec.exe',
                    ontology_id: 'process_3d69JLCKfLSoGwcZR29Cis',
                    service_name: 'CAPE',
                    guid: '{c5ed5e69-baa6-68e5-fc02-000000006100}',
                    treeid: '53ca09bd879c9fc8d8587b822369f08ff7cfb102fc79d34746cefe356dc4e2ca',
                    processtree: '?usrtmp\\0b5032375d29b11f01ec.exe',
                    time_observed: '2025-10-08T01:13:12.340000Z',
                    session: '74NA2gT1KCY94PnUGt8gvz'
                  }
                }
              ],
              attacks: [],
              actors: [],
              malware_families: []
            },
            {
              objectid: {
                tag: 'CUCKOO.persistence_autorun',
                ontology_id: 'signature_2EpuJ5DJg7a31Llprz8uEh',
                service_name: 'CAPE',
                session: '74NA2gT1KCY94PnUGt8gvz'
              },
              name: 'persistence_autorun',
              type: 'CUCKOO',
              classification: 'TLP:CLEAR',
              attributes: [
                {
                  source: {
                    tag: '?usrtmp\\0b5032375d29b11f01ec.exe',
                    ontology_id: 'process_3d69JLCKfLSoGwcZR29Cis',
                    service_name: 'CAPE',
                    guid: '{c5ed5e69-baa6-68e5-fc02-000000006100}',
                    treeid: '53ca09bd879c9fc8d8587b822369f08ff7cfb102fc79d34746cefe356dc4e2ca',
                    processtree: '?usrtmp\\0b5032375d29b11f01ec.exe',
                    time_observed: '2025-10-08T01:13:12.340000Z',
                    session: '74NA2gT1KCY94PnUGt8gvz'
                  }
                }
              ],
              attacks: [
                {
                  attack_id: 'T1547.001',
                  pattern: 'Registry Run Keys / Startup Folder',
                  categories: ['persistence', 'privilege-escalation']
                },
                {
                  attack_id: 'T1546.010',
                  pattern: 'AppInit DLLs',
                  categories: ['privilege-escalation', 'persistence']
                },
                {
                  attack_id: 'T1098',
                  pattern: 'Account Manipulation',
                  categories: ['persistence', 'privilege-escalation']
                }
              ],
              actors: [],
              malware_families: []
            },
            {
              objectid: {
                tag: 'CUCKOO.ransomware_file_modifications',
                ontology_id: 'signature_5hYTgpgLhFlUbggacvODfq',
                service_name: 'CAPE',
                session: '74NA2gT1KCY94PnUGt8gvz'
              },
              name: 'ransomware_file_modifications',
              type: 'CUCKOO',
              classification: 'TLP:CLEAR',
              attributes: [
                {
                  source: {
                    tag: '?usr\\documents\\diagnostics\\audiodg.exe',
                    ontology_id: 'process_6Gls4w0sWDj0CXixTwmJYm',
                    service_name: 'CAPE',
                    guid: '{c5ed5e69-baa8-68e5-fe02-000000006100}',
                    treeid: '8cd0ca5e1baac669cbf353c7afa3f119abbf92861c8fd585ee6ff99068a4b247',
                    processtree: '?usrtmp\\0b5032375d29b11f01ec.exe|?usr\\documents\\diagnostics\\audiodg.exe',
                    time_observed: '2025-10-08T01:13:12.949000Z',
                    session: '74NA2gT1KCY94PnUGt8gvz'
                  }
                }
              ],
              attacks: [
                {
                  attack_id: 'T1486',
                  pattern: 'Data Encrypted for Impact',
                  categories: ['impact']
                }
              ],
              actors: [],
              malware_families: []
            },
            {
              objectid: {
                tag: 'CUCKOO.virus',
                ontology_id: 'signature_6hrBdMk4brIzubOjPIPokt',
                service_name: 'CAPE',
                session: '74NA2gT1KCY94PnUGt8gvz'
              },
              name: 'virus',
              type: 'CUCKOO',
              classification: 'TLP:CLEAR',
              attributes: [
                {
                  source: {
                    tag: '?usr\\documents\\diagnostics\\shost.exe',
                    ontology_id: 'process_6JYjwh4RLrRbbMn78xnvJA',
                    service_name: 'CAPE',
                    guid: '{c5ed5e69-baa9-68e5-0103-000000006100}',
                    treeid: '86ccd28caf7d3b741ba8ee47020a599207d7d2646aed9f5554363c0071a7aa12',
                    processtree: '?usrtmp\\0b5032375d29b11f01ec.exe|?usr\\documents\\diagnostics\\shost.exe',
                    time_observed: '2025-10-08T01:13:13.137000Z',
                    session: '74NA2gT1KCY94PnUGt8gvz'
                  }
                }
              ],
              attacks: [],
              actors: [],
              malware_families: []
            }
          ],
          netflow: [
            {
              objectid: {
                tag: '169.254.128.1:53',
                ontology_id: 'network_dns_3OhCFsg6ehWkixfO7iKnLV',
                service_name: 'CAPE',
                guid: '{6022FEED-5970-461A-9FD9-5FA3B6066729}',
                treeid: 'f2e7963aaf57b6cbaddfe28cd607d112b183ff4d1eb19766a7e0ad4ed92ff08b',
                processtree:
                  '?usrtmp\\0b5032375d29b11f01ec.exe|?usr\\documents\\diagnostics\\audiodg.exe|169.254.128.1:53',
                time_observed: '2025-10-08T01:13:27.315000Z',
                session: '74NA2gT1KCY94PnUGt8gvz'
              },
              destination_ip: '169.254.128.1',
              destination_port: 53,
              transport_layer_protocol: 'udp',
              direction: 'outbound',
              process: {
                objectid: {
                  tag: '?usr\\documents\\diagnostics\\audiodg.exe',
                  ontology_id: 'process_6Gls4w0sWDj0CXixTwmJYm',
                  service_name: 'CAPE',
                  guid: '{c5ed5e69-baa8-68e5-fe02-000000006100}',
                  treeid: '8cd0ca5e1baac669cbf353c7afa3f119abbf92861c8fd585ee6ff99068a4b247',
                  processtree: '?usrtmp\\0b5032375d29b11f01ec.exe|?usr\\documents\\diagnostics\\audiodg.exe',
                  time_observed: '2025-10-08T01:13:12.949000Z',
                  session: '74NA2gT1KCY94PnUGt8gvz'
                },
                image: 'C:\\Users\\buddy\\Documents\\diagnostics\\audiodg.exe',
                start_time: '2025-10-08T01:13:12.840000Z',
                pobjectid: {
                  tag: '?usrtmp\\0b5032375d29b11f01ec.exe',
                  ontology_id: 'process_3d69JLCKfLSoGwcZR29Cis',
                  service_name: 'CAPE',
                  guid: '{c5ed5e69-baa6-68e5-fc02-000000006100}',
                  treeid: '53ca09bd879c9fc8d8587b822369f08ff7cfb102fc79d34746cefe356dc4e2ca',
                  processtree: '?usrtmp\\0b5032375d29b11f01ec.exe',
                  time_observed: '2025-10-08T01:13:12.340000Z',
                  session: '74NA2gT1KCY94PnUGt8gvz'
                },
                pimage: 'C:\\Users\\buddy\\AppData\\Local\\Temp\\0b5032375d29b11f01ec.exe',
                pcommand_line: '"C:\\Users\\buddy\\AppData\\Local\\Temp\\0b5032375d29b11f01ec.exe"',
                ppid: 7960,
                pid: 8164,
                command_line: '"C:\\Users\\buddy\\Documents\\diagnostics\\audiodg.exe"',
                end_time: '2025-10-08T01:13:50.371000Z',
                integrity_level: 'high',
                image_hash: '76957A7DB92ABF1667474A4E45477CEA7297E9A25C78C1FADD94795FC5390833',
                original_file_name: 'XClient.exe'
              },
              dns_details: {
                domain: 'pastebin.com',
                resolved_ips: ['172.66.171.73', '104.20.29.150'],
                lookup_type: 'A'
              },
              connection_type: 'dns'
            }
          ]
        },
        body_config: {},
        body_format: 'SANDBOX',
        classification: 'TLP:CLEAR//VIRUSTOTAL',
        depth: 0,
        heuristic: null,
        promote_to: null,
        tags: [],
        title_text: 'Analysis Environment Target: win10x64'
      }
    ]
  },
  section_hierarchy: [
    {
      children: [
        {
          children: [],
          id: 1
        },
        {
          children: [],
          id: 2
        },
        {
          children: [
            {
              children: [],
              id: 4
            },
            {
              children: [],
              id: 5
            }
          ],
          id: 3
        },
        {
          children: [
            {
              children: [],
              id: 7
            },
            {
              children: [],
              id: 8
            },
            {
              children: [],
              id: 9
            },
            {
              children: [],
              id: 10
            },
            {
              children: [],
              id: 11
            },
            {
              children: [],
              id: 12
            },
            {
              children: [],
              id: 13
            },
            {
              children: [],
              id: 14
            },
            {
              children: [],
              id: 15
            },
            {
              children: [],
              id: 16
            },
            {
              children: [],
              id: 17
            },
            {
              children: [],
              id: 18
            },
            {
              children: [],
              id: 19
            },
            {
              children: [],
              id: 20
            },
            {
              children: [],
              id: 21
            },
            {
              children: [],
              id: 22
            },
            {
              children: [],
              id: 23
            }
          ],
          id: 6
        },
        {
          children: [],
          id: 24
        },
        {
          children: [],
          id: 25
        },
        {
          children: [],
          id: 26
        },
        {
          children: [
            {
              children: [],
              id: 28
            }
          ],
          id: 27
        },
        {
          children: [],
          id: 29
        }
      ],
      id: 0
    },
    {
      children: [],
      id: 30
    }
  ],
  sha256: 'fbef05223e03ebdbea9b1f22114e13ea5622e73f0a34e2a52364ce3b3d14a02f',
  size: 786432,
  type: 'executable/windows/pe32'
} as unknown as FileResult;
