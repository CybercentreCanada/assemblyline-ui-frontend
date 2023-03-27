export const suricataDef = {
  defaultToken: 'invalid',

  action_keywords: [
    "alert",
    "pass",
    "drop",
    "reject",
    "rejectsrc",
    "rejectdst",
    "rejectboth",
  ],

  header_keywords: [
    "tcp",
    "udp",
    "icmp",
    "ip",
    "http",
    "ftp",
    "tls",
    "smb",
    "dns",
    "dcerpc",
    "dhcp",
    "ssh",
    "smtp",
    "imap",
    "modbus",
    "dnp3",
    "enip",
    "nfs",
    "ike",
    "krb5",
    "bittorrent-dht",
    "ntp",
    "dhcp",
    "rfb",
    "rdp",
    "snmp",
    "tftp",
    "sip",
    "http2",
  ],

  ipv4: /(?:[0-9]{1,3}\.){3}[0-9]{1,3}/,
  ipv4_net: /(@ipv4)(\/)([12][0-9]|3[012]|[1-9])/,
  ipv6: /(?:(?::|64|100|[0-9A-Fa-f]{4}):(?:[0-9A-Fa-f:]{1,50})|::)/,
  ipv6_net: /(@ipv6)(\/)(12[0-8]|1[01][0-9]|[0-9]{1,2})/,

  comparison_operators: [
    '!',
    '<',
    '>',
    '=',
    '<=',
    '>=',
    '&',
    '^',
  ],
  math_operators: [
    '+',
    '-',
    '*',
    '/',
    '<<',
    '>>',
  ],

  hexdigits: /0x[0-9a-fA-F]+/,
  digits: /-?[0-9]+/,
  hexchars: /([0-9a-fA-F?]{2}\s*)+/,

  variable_name: /\$[0-9A-Z_a-z]+/,
  direction: /->|<>/,

  string_escapes: /\\[\\";:|]/,
  pcre_operators: /[.?+*{}\[\]()|]/,
  pcre_escapes: /\\(?:[\\\/";:0nrt]|x[0-9A-Fa-f]{2}|c[^"]|[ABbDdSsWwZ]|@pcre_operators)/,
  pcre_flags: /[ismAEGRUIPQHDMCSYBOVW]*/,

  // The main tokenizer for our languages
  tokenizer: {
    root: [
      // whitespace
      { include: '@whitespace'},

      // action
      [ /^[a-z]+/, { cases: {
          '@action_keywords': {token: 'keyword', next: '@header'},
          '@default': {token: 'keyword', next: '@header'},
          }}],

      // Not a comment or a rule
      [/[^#]+$/, 'invalid'],
    ],
    header: [
      {include: '@whitespace'},
      // [/[a-zA-Z_][\w\$]*/, { token: 'annotation', log: 'annotation token2: $0' }],
      [/[a-z]+/, { cases: {
          '@header_keywords': {token:'keyword', switchTo: '@connections'},
          '@default': {token:'invalid', switchTo: '@connections'},
        }}],
    ],
    connections: [
      {include: '@whitespace'},
      [/[^( ]*[^\\]$/, 'invalid', '@popall'],
      ['any', 'keyword'],
      ['!', 'operator'],
      [/@variable_name/, 'variable'],
      [/@direction/, 'operator'],
      {include: '@ip_networks'},
      [/([0-9]{1,5})( *: *)([0-9]{1,5})/, ['number', 'delimiter', 'number']],
      [/[0-9]{1,5}/, 'number'],
      [/[\[\]]/, '@brackets'],
      [/\(/, '@brackets', '@rule_options'],
    ],
    ip_networks: [
      [/@ipv4_net/, ['variable', 'delimiter', 'number']],
      [/@ipv6_net/, ['variable', 'delimiter', 'number']],
      {include: '@ip_addresses'},
    ],
    ip_addresses: [
      [/@ipv4/, 'variable'],
      [/@ipv6/, 'variable'],
    ],

    // TODO: Highlight variables from byte_extract and used elsewhere
    rule_options: [
      [/[\w.:;]+[^\\]$/, 'invalid', '@popall'],
      {include: '@whitespace'},
      [/!/, 'operators'],  // operators (!=) and some option keywords (content:!"value", isdataat:!2) can be negated
      [/[&*+\-/<=>^]+/, {cases: {'@comparison_operators': 'operators'}}],
      [/[*+\-/<>]+/, {cases: {'@math_operators': 'operators'}}],
      [/[a-z][a-z-.]+/,
        {cases: {
          'pcre': {token: 'keyword', next: '@pcre_string'},
          '@default': {token: 'keyword'},
        }}
      ],
      [/@hexdigits/, 'number'],
      [/@digits/, 'number'],
      [/[:,;]/, 'delimiter'],
      [/"/, { token: 'string', bracket: '@open', next: '@string' }],
      [/(\))(?! *#)(.+)$/, ['delimiter', {token: 'invalid', next: '@popall'}]],
      [/\)/, 'delimiter', '@popall'],
    ],

    string: [
      [/[^"]+$/, 'invalid', '@popall'],
      [/[^\\";:|]+/,  'string'],
      [/(\|)( *(?:[0-9A-Fa-f]{2} *)+)(\|)/, ['delimiter', 'number', 'delimiter']],
      [/@string_escapes/, 'escape'],
      [/\\./, 'invalid'],
      [/"/, { token: 'string', bracket: '@close', next: '@pop' } ]
    ],

    pcre_string: [
      {include: '@whitespace'},
      [/:/, 'delimiter'],
      [/"\//, { token: 'regexp', bracket: '@open', switchTo: '@pcre'}],
      [/(?=[^ \r\n])/, 'invalid', '@pop'],
    ],
    pcre: [
      [/(?:\\.|[^"\/])*(?="|$)/, 'invalid', '@pop'],
      [/@pcre_operators/,  'operator'],
      [/@pcre_escapes/, 'escape'],
      [/[^\\\/";:.|\{}()[\]]+/,  'regexp'],
      [/(\/)(@pcre_flags)(")/, [
          { token: 'regexp', bracket: '@close', next: '@pop' },
          'keyword',
          'regexp',
        ]
      ],
    ],

    whitespace: [
      [/[ \t\r\n]+/, 'white'],
      [/\\$/, 'comment'], // Broken escaped newline
      [/\\ +$/, 'invalid', '@popall'], // Broken escaped newline
      [/#.*$/, 'comment'],
    ],
  }
};

export const suricataConfig = {
  comments: {
    lineComment: '#',
  },
  brackets: [
    ['{', '}'],
    ['[', ']'],
    ['(', ')']
  ],
  autoClosingPairs: [
    {
      open: '"',
      close: '"',
      notIn: ['string', 'regexp', 'comment']
    },
    {
      open: '{',
      close: '}',
      notIn: ['string', 'comment']
    },
    {
      open: '[',
      close: ']',
      notIn: ['string', 'comment']
    },
    {
      open: '(',
      close: ')',
      notIn: ['string', 'comment']
    }
  ],
  // symbols that that can be used to surround a selection
  surroundingPairs: [
    ['{', '}'],
    ['[', ']'],
    ['(', ')'],
    ['"', '"'],
  ]
};
