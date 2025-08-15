import type { SelectedServiceCategory, ServiceSpecification } from 'components/models/base/service';

export const MOCK_SERVICE_SPEC: ServiceSpecification[] = [
  {
    name: 'APKaye',
    params: [
      {
        default: false,
        hide: false,
        name: 'resubmit_apk_as_jar',
        type: 'bool',
        value: false
      }
    ]
  },
  {
    name: 'AVClass',
    params: [
      {
        default: true,
        hide: false,
        name: 'include_malpedia_dataset',
        type: 'bool',
        value: true
      }
    ]
  },
  {
    name: 'CAPA',
    params: [
      {
        default: 'default',
        hide: false,
        list: ['default', 'simple', 'verbose'],
        name: 'renderer',
        type: 'list',
        value: 'default'
      }
    ]
  },
  {
    name: 'CAPE',
    params: [
      {
        default: 60,
        hide: false,
        name: 'analysis_timeout_in_seconds',
        type: 'int',
        value: 60
      },
      {
        default: 'auto',
        hide: false,
        list: ['auto', 'auto_all', 'all', 'win10x64'],
        name: 'specific_image',
        type: 'list',
        value: 'auto'
      },
      {
        default: '',
        hide: false,
        name: 'dll_function',
        type: 'str',
        value: ''
      },
      {
        default: false,
        hide: false,
        name: 'dump_memory',
        type: 'bool',
        value: false
      },
      {
        default: true,
        hide: false,
        name: 'force_sleepskip',
        type: 'bool',
        value: true
      },
      {
        default: false,
        hide: false,
        name: 'no_monitor',
        type: 'bool',
        value: false
      },
      {
        default: true,
        hide: false,
        name: 'simulate_user',
        type: 'bool',
        value: true
      },
      {
        default: false,
        hide: true,
        name: 'reboot',
        type: 'bool',
        value: false
      },
      {
        default: '',
        hide: false,
        name: 'arguments',
        type: 'str',
        value: ''
      },
      {
        default: '',
        hide: false,
        name: 'custom_options',
        type: 'str',
        value: ''
      },
      {
        default: '',
        hide: true,
        name: 'clock',
        type: 'str',
        value: ''
      },
      {
        default: '',
        hide: true,
        name: 'specific_machine',
        type: 'str',
        value: ''
      },
      {
        default: 'none',
        hide: false,
        list: ['none', 'windows', 'linux'],
        name: 'platform',
        type: 'list',
        value: 'none'
      },
      {
        default: 'none',
        hide: false,
        list: ['none', 'inetsim', 'drop', 'internet', 'tor', 'vpn'],
        name: 'routing',
        type: 'list',
        value: 'none'
      },
      {
        default: false,
        hide: false,
        name: 'ignore_cape_cache',
        type: 'bool',
        value: false
      },
      {
        default: '',
        hide: false,
        name: 'password',
        type: 'str',
        value: ''
      },
      {
        default: '',
        hide: false,
        name: 'hh_args',
        type: 'str',
        value: ''
      },
      {
        default: false,
        hide: false,
        name: 'monitored_and_unmonitored',
        type: 'bool',
        value: false
      },
      {
        default: 'None',
        hide: false,
        list: [
          'Ie4uinit',
          'access',
          'applet',
          'archive',
          'autoit',
          'batch',
          'chm',
          'chrome',
          'chromium',
          'chromium_ext',
          'cpl',
          'crx',
          'dll',
          'doc',
          'doc2016',
          'doc_antivm',
          'edge',
          'eml',
          'exe',
          'firefox',
          'firefox_ext',
          'generic',
          'hta',
          'hwp',
          'ichitaro',
          'ie',
          'inf',
          'inp',
          'jar',
          'js',
          'js_antivm',
          'lnk',
          'mht',
          'msbuild',
          'msg',
          'msi',
          'msix',
          'nsis',
          'ollydbg',
          'one',
          'pdf',
          'ppt',
          'ppt2016',
          'ps1',
          'pub',
          'pub2016',
          'python',
          'rar',
          'rdp',
          'reg',
          'regsvr',
          'sct',
          'service',
          'service_dll',
          'shellcode',
          'shellcode_x64',
          'swf',
          'tor_browser',
          'vbejse',
          'vbs',
          'wsf',
          'xls',
          'xls2016',
          'xps',
          'xslt',
          'zip',
          'zip_compound',
          'None'
        ],
        name: 'package',
        type: 'list',
        value: 'None'
      }
    ]
  },
  {
    name: 'ConfigExtractor',
    params: [
      {
        default: false,
        hide: false,
        name: 'include_empty_config',
        type: 'bool',
        value: false
      }
    ]
  },
  {
    name: 'DeobfuScripter',
    params: [
      {
        default: false,
        hide: false,
        name: 'extract_original_iocs',
        type: 'bool',
        value: false
      },
      {
        default: 5000000,
        hide: false,
        name: 'max_file_size',
        type: 'int',
        value: 5000000
      }
    ]
  },
  {
    name: 'DocumentPreview',
    params: [
      {
        default: 1,
        hide: false,
        name: 'max_pages_rendered',
        type: 'int',
        value: 1
      },
      {
        default: 1,
        hide: false,
        name: 'run_ocr_on_first_n_pages',
        type: 'int',
        value: 1
      },
      {
        default: false,
        hide: false,
        name: 'load_email_images',
        type: 'bool',
        value: false
      },
      {
        default: false,
        hide: false,
        name: 'analyze_render',
        type: 'bool',
        value: false
      },
      {
        default: 'no',
        hide: false,
        list: ['no', 'as_extracted', 'as_supplementary'],
        name: 'save_ocr_output',
        type: 'list',
        value: 'no'
      }
    ]
  },
  {
    name: 'EmlParser',
    params: [
      {
        default: false,
        hide: false,
        name: 'extract_body_text',
        type: 'bool',
        value: false
      },
      {
        default: false,
        hide: false,
        name: 'save_emlparser_output',
        type: 'bool',
        value: false
      }
    ]
  },
  {
    name: 'Extract',
    params: [
      {
        default: '',
        hide: false,
        name: 'password',
        type: 'str',
        value: ''
      },
      {
        default: false,
        hide: false,
        name: 'extract_executable_sections',
        type: 'bool',
        value: false
      },
      {
        default: false,
        hide: false,
        name: 'continue_after_extract',
        type: 'bool',
        value: false
      },
      {
        default: true,
        hide: false,
        name: 'use_custom_safelisting',
        type: 'bool',
        value: true
      },
      {
        default: false,
        hide: false,
        name: 'score_failed_password',
        type: 'bool',
        value: false
      }
    ]
  },
  {
    name: 'FrankenStrings',
    params: [
      {
        default: 3000000,
        hide: false,
        name: 'max_file_size',
        type: 'int',
        value: 3000000
      },
      {
        default: 5000,
        hide: false,
        name: 'max_string_length',
        type: 'int',
        value: 5000
      }
    ]
  },
  {
    name: 'JsJaws',
    params: [
      {
        default: 30,
        hide: false,
        name: 'tool_timeout',
        type: 'int',
        value: 30
      },
      {
        default: false,
        hide: false,
        name: 'add_supplementary',
        type: 'bool',
        value: false
      },
      {
        default: true,
        hide: false,
        name: 'static_signatures',
        type: 'bool',
        value: true
      },
      {
        default: true,
        hide: false,
        name: 'display_iocs',
        type: 'bool',
        value: true
      },
      {
        default: false,
        hide: false,
        name: 'static_analysis_only',
        type: 'bool',
        value: false
      },
      {
        default: false,
        hide: false,
        name: 'ignore_stdout_limit',
        type: 'bool',
        value: false
      },
      {
        default: false,
        hide: false,
        name: 'no_shell_error',
        type: 'bool',
        value: false
      },
      {
        default: 'IE8',
        hide: false,
        list: ['IE8', 'IE11_W10', 'IE7', 'iPhone', 'Firefox', 'Chrome'],
        name: 'browser',
        type: 'list',
        value: 'IE8'
      },
      {
        default: false,
        hide: false,
        name: 'wscript_only',
        type: 'bool',
        value: false
      },
      {
        default: false,
        hide: false,
        name: 'throw_http_exc',
        type: 'bool',
        value: false
      },
      {
        default: false,
        hide: false,
        name: 'download_payload',
        type: 'bool',
        value: false
      },
      {
        default: false,
        hide: false,
        name: 'extract_function_calls',
        type: 'bool',
        value: false
      },
      {
        default: false,
        hide: false,
        name: 'extract_eval_calls',
        type: 'bool',
        value: false
      },
      {
        default: false,
        hide: false,
        name: 'log_errors',
        type: 'bool',
        value: false
      },
      {
        default: false,
        hide: false,
        name: 'override_eval',
        type: 'bool',
        value: false
      },
      {
        default: false,
        hide: false,
        name: 'file_always_exists',
        type: 'bool',
        value: false
      },
      {
        default: false,
        hide: false,
        name: 'enable_synchrony',
        type: 'bool',
        value: false
      }
    ]
  },
  {
    name: 'Overpower',
    params: [
      {
        default: 90,
        hide: false,
        name: 'tool_timeout',
        type: 'int',
        value: 90
      },
      {
        default: false,
        hide: false,
        name: 'add_supplementary',
        type: 'bool',
        value: false
      },
      {
        default: true,
        hide: false,
        name: 'fake_web_download',
        type: 'bool',
        value: true
      }
    ]
  },
  {
    name: 'PDFId',
    params: [
      {
        default: 750,
        hide: false,
        name: 'carved_obj_size_limit',
        type: 'int',
        value: 750
      }
    ]
  },
  {
    name: 'Pixaxe',
    params: [
      {
        default: 'no',
        hide: false,
        list: ['no', 'as_extracted', 'as_supplementary'],
        name: 'save_ocr_output',
        type: 'list',
        value: 'no'
      },
      {
        default: false,
        hide: false,
        name: 'extract_ocr_uri',
        type: 'bool',
        value: false
      }
    ]
  },
  {
    name: 'Suricata',
    params: [
      {
        default: true,
        hide: false,
        name: 'extract_files',
        type: 'bool',
        value: true
      }
    ]
  },
  {
    name: 'URLCreator',
    params: [
      {
        default: 300,
        hide: false,
        name: 'minimum_maliciousness',
        type: 'int',
        value: 300
      }
    ]
  },
  {
    name: 'URLDownloader',
    params: [
      {
        default: 'staging',
        hide: false,
        list: ['no_proxy', 'localhost_proxy', 'staging'],
        name: 'proxy',
        type: 'list',
        value: 'staging'
      },
      {
        default: 'image/svg|text/json',
        hide: false,
        name: 'regex_extract_filetype',
        type: 'str',
        value: 'image/svg|text/json'
      },
      {
        default: 'image/*|text/*|unknown|code/css',
        hide: false,
        name: 'regex_supplementary_filetype',
        type: 'str',
        value: 'image/*|text/*|unknown|code/css'
      },
      {
        default: true,
        hide: false,
        name: 'extract_unmatched_filetype',
        type: 'bool',
        value: true
      }
    ]
  },
  {
    name: 'VirusTotal',
    params: [
      {
        default: '',
        hide: false,
        name: 'api_key',
        type: 'str',
        value: ''
      },
      {
        default: false,
        hide: false,
        name: 'dynamic_submit',
        type: 'bool',
        value: false
      },
      {
        default: false,
        hide: false,
        list: [],
        name: 'exhaustive_search',
        type: 'bool',
        value: false
      }
    ]
  },
  {
    name: 'XLMMacroDeobfuscator',
    params: [
      {
        default: '',
        hide: false,
        name: 'start point',
        type: 'str',
        value: ''
      }
    ]
  }
];

export const MOCK_SERVICES: SelectedServiceCategory[] = [
  {
    name: 'Static Analysis',
    selected: true,
    services: [
      {
        category: 'Static Analysis',
        description:
          'This service extracts library imports from windows PE files or memory dump to generate api vector classification.',
        is_external: false,
        name: 'APIVector',
        selected: true
      },
      {
        category: 'Static Analysis',
        description: 'This Assemblyline service analyzes Android APKs by decompilation and inspection.',
        is_external: false,
        name: 'APKaye',
        selected: true
      },
      {
        category: 'Static Analysis',
        description:
          "ALv4 Badlist service\nThis service will check the file hashes against Assemblyline's internal badlist infrastructure and mark files as bad accordingly.\n",
        is_external: false,
        name: 'Badlist',
        selected: true
      },
      {
        category: 'Static Analysis',
        description: 'This service parses and interprets batch files.',
        is_external: false,
        name: 'Batchdeobfuscator',
        selected: true
      },
      {
        category: 'Static Analysis',
        description: 'This service uses the CAPA open source library to identify what the program at hand could do.',
        is_external: false,
        name: 'CAPA',
        selected: true
      },
      {
        category: 'Static Analysis',
        description: 'This service partitions the file and calculates visual entropy for each partition.',
        is_external: false,
        name: 'Characterize',
        selected: true
      },
      {
        category: 'Static Analysis',
        description: 'This service runs parsers to extract malware configuration data.',
        is_external: false,
        name: 'ConfigExtractor',
        selected: true
      },
      {
        category: 'Static Analysis',
        description:
          'Static script de-obfuscator. The purpose is not to get surgical de-obfuscation, but rather to extract obfuscated IOCs.',
        is_external: false,
        name: 'DeobfuScripter',
        selected: true
      },
      {
        category: 'Static Analysis',
        description: 'This service analyzes executable Linux files and provides metadata about the file.',
        is_external: false,
        name: 'ELF',
        selected: true
      },
      {
        category: 'Static Analysis',
        description:
          'This Assemblyline service runs the elfparser application against linux executables. It will extract information from the output and format it for easy viewing in the web interface.',
        is_external: false,
        name: 'ELFPARSER',
        selected: true
      },
      {
        category: 'Static Analysis',
        description:
          'This service parses emails using GOVCERT-LU eml_parser library while extracting header information, attachments, and URIs.',
        is_external: false,
        name: 'EmlParser',
        selected: true
      },
      {
        category: 'Static Analysis',
        description:
          'This Assemblyline service analyzes Java JAR files. All classes are extracted, decompiled and analyzed for malicious behavior.',
        is_external: false,
        name: 'Espresso',
        selected: true
      },
      {
        category: 'Static Analysis',
        description:
          'This service uses FireEye Labs Obfuscated String Solver (FLOSS) to find obfuscated strings such as stacked strings.',
        is_external: false,
        name: 'Floss',
        selected: true
      },
      {
        category: 'Static Analysis',
        description:
          'This service performs file and IOC extractions using pattern matching, simple encoding decoder and script deobfuscators.',
        is_external: false,
        name: 'FrankenStrings',
        selected: true
      },
      {
        category: 'Static Analysis',
        description: 'This service extracts information from IPA package files.',
        is_external: false,
        name: 'IPArse',
        selected: true
      },
      {
        category: 'Static Analysis',
        description: 'Provides sandboxing for JavaScript.\n',
        is_external: false,
        name: 'JsJaws',
        selected: true
      },
      {
        category: 'Static Analysis',
        description:
          'This Assemblyline service checks the metadata of the submitted file to look for anomalies (name, extension, etc).',
        is_external: false,
        name: 'MetaPeek',
        selected: true
      },
      {
        category: 'Static Analysis',
        description:
          'This Assemblyline service extracts metadata and network information, and reports on anomalies in Microsoft OLE and XML documents using the Python library py-oletools and hachoir.',
        is_external: false,
        name: 'Oletools',
        selected: true
      },
      {
        category: 'Static Analysis',
        description: 'De-obfuscates PowerShell files, profiles them and runs them.',
        is_external: false,
        name: 'Overpower',
        selected: true
      },
      {
        category: 'Static Analysis',
        description:
          'This Assemblyline service extracts metadata and objects from PDF files using Didier Stevens PDFId (Version 2.7) and PDFParser (Version 7.4) tools.',
        is_external: false,
        name: 'PDFId',
        selected: true
      },
      {
        category: 'Static Analysis',
        description:
          'This service extracts attributes (imports, exports, section names, ...) from windows PE files using the python library LIEF.',
        is_external: false,
        name: 'PE',
        selected: true
      },
      {
        category: 'Static Analysis',
        description:
          'This service uses the Python PeePDF library information from PDFs including JavaScript blocks which it will attempt to deobfuscate, if necessary, for further analysis.',
        is_external: false,
        name: 'PeePDF',
        selected: true
      },
      {
        category: 'Static Analysis',
        description: 'This Assemblyline service provides image analysis.',
        is_external: false,
        name: 'Pixaxe',
        selected: true
      },
      {
        category: 'Static Analysis',
        description:
          'This assemblyline service automates detection of Windows Sysmon Event logs that indicate malicious behavior.',
        is_external: false,
        name: 'Sigma',
        selected: true
      },
      {
        category: 'Static Analysis',
        description:
          "This Assemblyline service uses the Python pyswf library to extract metadata and perform anomaly detection on 'audiovisual/flash' files.",
        is_external: false,
        name: 'Swiffer',
        selected: true
      },
      {
        category: 'Static Analysis',
        description:
          'A post-service that compares all TAGs generated by an AL result to a signature set using the yara externals feature.',
        is_external: false,
        name: 'TagCheck',
        selected: true
      },
      {
        category: 'Static Analysis',
        description: 'Extracts information from torrent files with the help of `bencode`.',
        is_external: false,
        name: 'TorrentSlicer',
        selected: true
      },
      {
        category: 'Static Analysis',
        description:
          'This Assemblyline service creates URI files for URIs that were extracted by other services with an associated score that is high enough, or if the URI fits a certain set of criteria.',
        is_external: false,
        name: 'URLCreator',
        selected: true
      },
      {
        category: 'Static Analysis',
        description: 'This Assemblyline service unpacks UPX packed executables for further analysis.',
        is_external: false,
        name: 'Unpacker',
        selected: true
      },
      {
        category: 'Static Analysis',
        description: 'This service analyzes and emulates VBA macros contained in Microsoft Office files.',
        is_external: false,
        name: 'ViperMonkey',
        selected: true
      },
      {
        category: 'Static Analysis',
        description: 'This services decodes obfuscated XLM macros (also known as Excel 4.0 macros).',
        is_external: false,
        name: 'XLMMacroDeobfuscator',
        selected: true
      },
      {
        category: 'Static Analysis',
        description:
          'This services runs all DEPLOYED and NOISY signatures on submitted files. NOISY rules are reported but do not influence the score. DEPLOYED rules score according to their rule group (implant => 1000 | exploit & tool => 500 | technique => 100 | info => 0).',
        is_external: false,
        name: 'YARA',
        selected: true
      }
    ]
  },
  {
    name: 'Antivirus',
    selected: true,
    services: [
      {
        category: 'Antivirus',
        description:
          'This service consumes Anti-Virus tags (`av.virus_name`) and extracts family, behavior, and platform information based on [AVClass2](https://github.com/malicialab/avclass/tree/master/avclass2).',
        is_external: false,
        name: 'AVClass',
        selected: true
      }
    ]
  },
  {
    name: 'Dynamic Analysis',
    selected: false,
    services: [
      {
        category: 'Dynamic Analysis',
        description: 'This Assemblyline service submits files to a CAPEv2 deployment and parses the report returned.',
        is_external: false,
        name: 'CAPE',
        selected: false
      }
    ]
  },
  {
    name: 'Networking',
    selected: true,
    services: [
      {
        category: 'Networking',
        description: 'This service scans network capture files with signature and extract files from network capture.',
        is_external: false,
        name: 'Suricata',
        selected: true
      }
    ]
  },
  {
    name: 'Extraction',
    selected: true,
    services: [
      {
        category: 'Extraction',
        description: 'This service extracts embedded files from file containers (like ZIP, RAR, 7z, ...).',
        is_external: false,
        name: 'Extract',
        selected: true
      }
    ]
  },
  {
    name: 'Internet Connected',
    selected: false,
    services: [
      {
        category: 'Internet Connected',
        description: 'This service downloads potentially malicious URLs.',
        is_external: true,
        name: 'URLDownloader',
        selected: false
      }
    ]
  },
  {
    name: 'Filtering',
    selected: true,
    services: [
      {
        category: 'Filtering',
        description:
          "This service will check the file hashes against Assemblyline's internal safelist infrastructure and mark files as safe accordingly.",
        is_external: false,
        name: 'Safelist',
        selected: true
      }
    ]
  },
  {
    name: 'External',
    selected: false,
    services: [
      {
        category: 'External',
        description: 'This service checks (and optionally submits) files/URLs to VirusTotal for analysis.\n',
        is_external: true,
        name: 'VirusTotal',
        selected: false
      }
    ]
  }
];
