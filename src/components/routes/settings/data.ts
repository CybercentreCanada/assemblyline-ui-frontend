import type { UserSettings } from 'components/models/base/user_settings';

export const SETTINGS = {
  default_external_sources: [],
  default_metadata: {},
  default_zip_password: 'zippy',
  download_encoding: 'cart',
  executive_summary: true,
  expand_min_score: 500,
  preferred_submission_profile: 'static',
  service_spec: [
    {
      name: 'APKaye',
      params: [
        {
          default: false,
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
      name: 'AnoMark',
      params: [
        {
          default: '',
          hide: false,
          name: 'submitted_shortcut_command',
          type: 'str',
          value: ''
        },
        {
          default: '',
          hide: false,
          name: 'submitted_dynamic_command',
          type: 'str',
          value: ''
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
          default: 30,
          hide: false,
          name: 'analysis_timeout_in_seconds',
          type: 'int',
          value: 30
        },
        {
          default: 'auto',
          hide: true,
          list: ['auto', 'all', 'win10x64', 'ub22x64'],
          name: 'specific_image',
          type: 'list',
          value: 'auto'
        },
        {
          default: '',
          hide: true,
          name: 'dll_function',
          type: 'str',
          value: ''
        },
        {
          default: true,
          hide: true,
          name: 'force_sleepskip',
          type: 'bool',
          value: true
        },
        {
          default: false,
          hide: true,
          name: 'no_monitor',
          type: 'bool',
          value: false
        },
        {
          default: true,
          hide: true,
          name: 'simulate_user',
          type: 'bool',
          value: true
        },
        {
          default: '',
          hide: true,
          name: 'arguments',
          type: 'str',
          value: ''
        },
        {
          default: '',
          hide: true,
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
          hide: true,
          list: ['none', 'windows', 'linux'],
          name: 'platform',
          type: 'list',
          value: 'none'
        },
        {
          default: 'inetsim',
          hide: true,
          list: ['none', 'inetsim', 'internet'],
          name: 'routing',
          type: 'list',
          value: 'inetsim'
        },
        {
          default: false,
          hide: true,
          name: 'ignore_cape_cache',
          type: 'bool',
          value: false
        },
        {
          default: '',
          hide: false,
          list: [],
          name: 'password',
          type: 'str',
          value: ''
        },
        {
          default: false,
          hide: false,
          list: [],
          name: 'monitored_and_unmonitored',
          type: 'bool',
          value: false
        },
        {
          default: 'None',
          hide: false,
          list: [
            'None',
            'le4uinit',
            'access',
            'applet',
            'archive',
            'autoit',
            'batch',
            'chm',
            'cpl',
            'crx',
            'dll',
            'doc',
            'doc_antivm',
            'edge',
            'eml',
            'exe',
            'generic',
            'hta',
            'hwp',
            'ichitaro',
            'ie',
            'lnk',
            'inf',
            'inp',
            'jar',
            'js',
            'js_antivm',
            'mht',
            'msbuild',
            'msg',
            'msi',
            'msix',
            'nodejs',
            'nsis',
            'ollydbg',
            'one',
            'pdf',
            'ppt',
            'ps1',
            'pub',
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
            'vbejse',
            'vbs',
            'wsf',
            'xls',
            'xps',
            'xslt',
            'zip',
            'zip_compound'
          ],
          name: 'package',
          type: 'list',
          value: 'None'
        },
        {
          default: false,
          hide: false,
          name: 'dump_memory',
          type: 'bool',
          value: false
        },
        {
          default: false,
          hide: false,
          name: 'reboot',
          type: 'bool',
          value: false
        },
        {
          default: '',
          hide: false,
          name: 'hh_args',
          type: 'str',
          value: ''
        }
      ]
    },
    {
      name: 'CyberDeck',
      params: [
        {
          default: false,
          hide: false,
          name: 'resubmit_metadata',
          type: 'bool',
          value: false
        },
        {
          default: 5,
          hide: false,
          name: 'min_transaction_threshold',
          type: 'int',
          value: 5
        }
      ]
    },
    {
      name: 'DeobfuScripter',
      params: [
        {
          default: false,
          name: 'extract_original_iocs',
          type: 'bool',
          value: false
        }
      ]
    },
    {
      name: 'DocumentPreview',
      params: [
        {
          default: 2,
          hide: false,
          name: 'max_pages_rendered',
          type: 'int',
          value: 2
        },
        {
          default: true,
          hide: false,
          list: [],
          name: 'load_email_images',
          type: 'bool',
          value: true
        },
        {
          default: 'no',
          hide: false,
          list: ['no', 'as_extracted', 'as_supplementary'],
          name: 'save_ocr_output',
          type: 'list',
          value: 'no'
        },
        {
          default: 0,
          hide: false,
          list: [],
          name: 'run_ocr_on_first_n_pages',
          type: 'int',
          value: 0
        },
        {
          default: false,
          hide: false,
          list: [],
          name: 'analyze_render',
          type: 'bool',
          value: false
        }
      ]
    },
    {
      name: 'EmlParser',
      params: [
        {
          default: false,
          name: 'extract_body_text',
          type: 'bool',
          value: false
        },
        {
          default: false,
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
          name: 'password',
          type: 'str',
          value: ''
        },
        {
          default: false,
          name: 'extract_executable_sections',
          type: 'bool',
          value: false
        },
        {
          default: false,
          name: 'continue_after_extract',
          type: 'bool',
          value: false
        },
        {
          default: true,
          hide: false,
          list: [],
          name: 'use_custom_safelisting',
          type: 'bool',
          value: true
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
      name: 'Intezer',
      params: [
        {
          default: true,
          hide: false,
          name: 'dynamic_submit',
          type: 'bool',
          value: true
        },
        {
          default: '',
          hide: false,
          name: 'analysis_id',
          type: 'str',
          value: ''
        }
      ]
    },
    {
      name: 'JsJaws',
      params: [
        {
          default: 60,
          hide: false,
          name: 'tool_timeout',
          type: 'int',
          value: 60
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
          default: true,
          hide: false,
          list: [],
          name: 'display_iocs',
          type: 'bool',
          value: true
        },
        {
          default: false,
          hide: false,
          list: [],
          name: 'log_errors',
          type: 'bool',
          value: false
        },
        {
          default: false,
          hide: false,
          list: [],
          name: 'override_eval',
          type: 'bool',
          value: false
        },
        {
          default: false,
          hide: false,
          list: [],
          name: 'enable_synchrony',
          type: 'bool',
          value: false
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
          name: 'file_always_exists',
          type: 'bool',
          value: false
        }
      ]
    },
    {
      name: 'Overpower',
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
          default: 10000,
          name: 'carved_obj_size_limit',
          type: 'int',
          value: 10000
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
        },
        {
          default: false,
          hide: false,
          name: 'use_internet',
          type: 'bool',
          value: false
        },
        {
          default: 'https_proxy',
          hide: false,
          list: ['https_proxy'],
          name: 'proxy',
          type: 'list',
          value: 'https_proxy'
        }
      ]
    },
    {
      name: 'URLDownloader',
      params: [
        {
          default: 'pb_proxy',
          hide: false,
          list: ['pb_proxy'],
          name: 'proxy',
          type: 'list',
          value: 'pb_proxy'
        },
        {
          default: false,
          hide: false,
          list: [],
          name: 'force_requests',
          type: 'bool',
          value: false
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
          default: true,
          hide: false,
          name: 'exhaustive_search',
          type: 'bool',
          value: true
        }
      ]
    },
    {
      name: 'XLMMacroDeobfuscator',
      params: [
        {
          default: '',
          name: 'password',
          type: 'str',
          value: ''
        },
        {
          default: '',
          name: 'start point',
          type: 'str',
          value: ''
        }
      ]
    }
  ],
  services: [
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
          description: 'Signature-based Assemblyline service that focuses on file genealogy.',
          is_external: false,
          name: 'Ancestry',
          selected: true
        },
        {
          category: 'Static Analysis',
          description: 'A command line anomaly detection service using the AnoMark tool.',
          is_external: false,
          name: 'AnoMark',
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
          description:
            'ALv4 Braindump service This service searches for indicators of malware, that are specific to dumped, running memory\n',
          is_external: false,
          name: 'Braindump',
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
          description:
            'CSLite service\nThis service runs the CSLite program, formats the output and assigns a score based on the probability of file submitted being malware\n',
          is_external: false,
          name: 'CSLite',
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
          description:
            'ALv4 Codevector service\nThis service creates vectors based on executable code to:\n   - detect code in dumped memory blocks\n   - find dumped memory blocks with the same code\n   - find files with the same code\n',
          is_external: false,
          name: 'Codevector',
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
          description: 'Use OCR to detect for signs of malicious behaviour in Office and PDF files\n\n',
          is_external: false,
          name: 'DocumentPreview',
          selected: true
        },
        {
          category: 'Static Analysis',
          description: 'This Assemblyline service decompiles .NET dlls.',
          is_external: false,
          name: 'DotnetDecompiler',
          selected: true
        },
        {
          category: 'Static Analysis',
          description: 'This Assemblyline service tries to deobfuscate .Net dlls.',
          is_external: false,
          name: 'DotnetDeobfuscator',
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
          description: 'This Assemblyline service leverage LLM to determine if anything should be raised.',
          is_external: false,
          name: 'GwAIome',
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
          description: 'This service wraps the proprietary martello classifier',
          is_external: false,
          name: 'MartelloProprietary',
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
          description: 'Assemblyline service for analyzing OneNote Documents.',
          is_external: false,
          name: 'OneNote',
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
          description: 'This service wraps the proprietary Silent Auction',
          is_external: false,
          name: 'SilentAuctionProprietary',
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
          description: 'This service checks (and optionally submits) files/URLs to VirusTotal for analysis.\n',
          is_external: false,
          name: 'VirusTotal',
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
        },
        {
          category: 'Antivirus',
          description:
            'This service provides integration of various anti-virus products with the Assemblyline platform.',
          is_external: false,
          name: 'AntiVirus',
          selected: true
        },
        {
          category: 'Antivirus',
          description: "This service fetches results from Intezer based on the submitted file's SHA256 hash.",
          is_external: false,
          name: 'Intezer',
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
          description: 'CyberDeck networking service',
          is_external: false,
          name: 'CyberDeck',
          selected: true
        },
        {
          category: 'Networking',
          description:
            'This service scans network capture files with signature and extract files from network capture.',
          is_external: false,
          name: 'Suricata',
          selected: true
        },
        {
          category: 'Networking',
          description: 'This Assemblyline service uses Zeek to analyze PCAP files.',
          is_external: false,
          name: 'Zeek',
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
    }
  ],
  submission_profiles: {
    default: {
      classification: 'TLP:CLEAR',
      deep_scan: false,
      generate_alert: false,
      ignore_cache: false,
      ignore_filtering: false,
      ignore_recursion_prevention: false,
      priority: 1000,
      service_spec: {},
      services: {
        excluded: [],
        rescan: [],
        resubmit: [],
        selected: ['Antivirus', 'Extraction', 'Filtering', 'Networking', 'Static Analysis']
      },
      ttl: 30
    },
    static: {
      classification: 'TLP:CLEAR',
      deep_scan: false,
      generate_alert: false,
      ignore_cache: false,
      ignore_filtering: false,
      ignore_recursion_prevention: false,
      priority: 1000,
      service_spec: {},
      services: {
        excluded: [],
        rescan: [],
        resubmit: [],
        selected: ['Antivirus', 'Extraction', 'Filtering', 'Networking', 'Static Analysis']
      },
      ttl: 30
    },
    static_and_dynamic_with_internet: {
      classification: 'TLP:CLEAR',
      deep_scan: false,
      generate_alert: false,
      ignore_cache: false,
      ignore_filtering: false,
      ignore_recursion_prevention: false,
      priority: 1000,
      service_spec: {
        CAPE: {
          routing: 'internet'
        },
        URLDownloader: {
          proxy: 'pb_proxy'
        }
      },
      services: {
        excluded: [],
        rescan: [],
        resubmit: [],
        selected: ['Antivirus', 'Extraction', 'Filtering', 'Networking', 'Static Analysis']
      },
      ttl: 30
    },
    static_with_dynamic: {
      classification: 'TLP:CLEAR',
      deep_scan: false,
      generate_alert: false,
      ignore_cache: false,
      ignore_filtering: false,
      ignore_recursion_prevention: false,
      priority: 1000,
      service_spec: {},
      services: {
        excluded: [],
        rescan: [],
        resubmit: [],
        selected: ['Antivirus', 'Extraction', 'Filtering', 'Networking', 'Static Analysis']
      },
      ttl: 30
    },
    static_with_internet: {
      classification: 'TLP:CLEAR',
      deep_scan: false,
      generate_alert: false,
      ignore_cache: false,
      ignore_filtering: false,
      ignore_recursion_prevention: false,
      priority: 1000,
      service_spec: {
        URLDownloader: {
          proxy: 'pb_proxy'
        }
      },
      services: {
        excluded: [],
        rescan: [],
        resubmit: [],
        selected: ['Antivirus', 'Extraction', 'Filtering', 'Networking', 'Static Analysis']
      },
      ttl: 30
    },
    unshorten: {
      classification: 'TLP:CLEAR',
      deep_scan: false,
      generate_alert: false,
      ignore_cache: false,
      ignore_filtering: false,
      ignore_recursion_prevention: false,
      priority: 1000,
      service_spec: {
        URLCreator: {
          use_internet: true
        }
      },
      services: {
        excluded: [],
        rescan: [],
        resubmit: [],
        selected: ['URLCreator']
      },
      ttl: 30
    }
  },
  submission_view: 'details'
} as unknown as UserSettings;
