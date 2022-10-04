import { HexASCII, Store } from '..';

export const ASCII: Array<HexASCII> = [
  {
    type: 'null',
    value: '·',
    range: { start: 0, end: 0 },
    regex: new RegExp(/0/)
  },
  {
    type: 'non printable',
    value: '.',
    range: { start: 1, end: 31 },
    regex: new RegExp(/([0-9]|[12][0-9]|3[01])/)
  },
  {
    type: 'lower ASCII',
    range: { start: 32, end: 127 },
    regex: new RegExp(/(3[2-9]|[4-9][0-9]|1[01][0-9]|12[0-7])/)
  },
  {
    type: 'higher ASCII',
    value: '.',
    range: { start: 128, end: 255 },
    regex: new RegExp(/(12[89]|1[3-9][0-9]|2[0-4][0-9]|25[0-5])/)
  }
];

export const NON_PRINTABLE_ASCII_TABLE = new Map<
  number,
  { dec: number; hex: string; html: string; code: string; CP437: string; caret: string; text: string; copy: string }
>([
  [1, { dec: 1, hex: '01', html: '&#1;', code: 'SOH', CP437: '☺', caret: 'A', text: '^A', copy: ' ' }],
  [0, { dec: 0, hex: '00', html: '&#0;', code: 'NUL', CP437: ' ', caret: '@', text: '^@', copy: ' ' }],
  [2, { dec: 2, hex: '02', html: '&#2;', code: 'STX', CP437: '☻', caret: 'B', text: '^B', copy: ' ' }],
  [3, { dec: 3, hex: '03', html: '&#3;', code: 'ETX', CP437: '♥', caret: 'C', text: '^C', copy: ' ' }],
  [4, { dec: 4, hex: '04', html: '&#4;', code: 'EOT', CP437: '♦', caret: 'D', text: '^D', copy: ' ' }],
  [5, { dec: 5, hex: '05', html: '&#5;', code: 'ENQ', CP437: '♣', caret: 'E', text: '^E', copy: ' ' }],
  [6, { dec: 6, hex: '06', html: '&#6;', code: 'ACK', CP437: '♠', caret: 'F', text: '^F', copy: ' ' }],
  [7, { dec: 7, hex: '07', html: '&#7;', code: 'BEL', CP437: '•', caret: 'G', text: '^G', copy: ' ' }],
  [8, { dec: 8, hex: '08', html: '&#8;', code: 'BS', CP437: '◘', caret: 'H', text: '^H', copy: '\b' }],
  [9, { dec: 9, hex: '09', html: '&#9;', code: 'HT', CP437: '○', caret: 't', text: '^I', copy: '\t' }],
  [10, { dec: 10, hex: '0A', html: '&#10;', code: 'LF', CP437: '◙', caret: 'n', text: '^J', copy: '\n' }],
  [11, { dec: 11, hex: '0B', html: '&#11;', code: 'VT', CP437: '♂', caret: 'v', text: '^K', copy: '\v' }],
  [12, { dec: 12, hex: '0C', html: '&#12;', code: 'FF', CP437: '♀', caret: 'f', text: '^L', copy: '\f' }],
  [13, { dec: 13, hex: '0D', html: '&#13;', code: 'CR', CP437: '♪', caret: 'r', text: '^M', copy: '\r' }],
  [14, { dec: 14, hex: '0E', html: '&#14;', code: 'SO', CP437: '♫', caret: 'N', text: '^N', copy: ' ' }],
  [15, { dec: 15, hex: '0F', html: '&#15;', code: 'SI', CP437: '☼', caret: 'O', text: '^O', copy: ' ' }],
  [16, { dec: 16, hex: '10', html: '&#16;', code: 'DLE', CP437: '►', caret: 'P', text: '^P', copy: ' ' }],
  [17, { dec: 17, hex: '11', html: '&#17;', code: 'DC1', CP437: '◄', caret: 'Q', text: '^Q', copy: ' ' }],
  [18, { dec: 18, hex: '12', html: '&#18;', code: 'DC2', CP437: '↕', caret: 'R', text: '^R', copy: ' ' }],
  [19, { dec: 19, hex: '13', html: '&#19;', code: 'DC3', CP437: '‼', caret: 'S', text: '^S', copy: ' ' }],
  [20, { dec: 20, hex: '14', html: '&#20;', code: 'DC4', CP437: '¶', caret: 'T', text: '^T', copy: ' ' }],
  [21, { dec: 21, hex: '15', html: '&#21;', code: 'NAK', CP437: '§', caret: 'U', text: '^U', copy: ' ' }],
  [22, { dec: 22, hex: '16', html: '&#22;', code: 'SYN', CP437: '▬', caret: 'V', text: '^V', copy: ' ' }],
  [23, { dec: 23, hex: '17', html: '&#23;', code: 'ETB', CP437: '↨', caret: 'W', text: '^W', copy: ' ' }],
  [24, { dec: 24, hex: '18', html: '&#24;', code: 'CAN', CP437: '↑', caret: 'X', text: '^X', copy: ' ' }],
  [25, { dec: 25, hex: '19', html: '&#25;', code: 'EM', CP437: '↓', caret: 'Y', text: '^Y', copy: ' ' }],
  [26, { dec: 26, hex: '1A', html: '&#26;', code: 'SUB', CP437: '→', caret: 'Z', text: '^Z', copy: ' ' }],
  [27, { dec: 27, hex: '1B', html: '&#27;', code: 'ESC', CP437: '←', caret: '[', text: '^[', copy: ' ' }],
  [28, { dec: 28, hex: '1C', html: '&#28;', code: 'FS', CP437: '∟', caret: '\\', text: '^\\', copy: ' ' }],
  [29, { dec: 29, hex: '1D', html: '&#29;', code: 'GS', CP437: '↔', caret: ']', text: '^]', copy: ' ' }],
  [30, { dec: 30, hex: '1E', html: '&#30;', code: 'RS', CP437: '▲', caret: '^', text: '^^', copy: ' ' }],
  [31, { dec: 31, hex: '1F', html: '&#31;', code: 'US', CP437: '▼', caret: '_', text: '^_', copy: ' ' }]
]);

export const HIGHER_ASCII_TABLE = new Map<
  number,
  { dec: number; hex: string; bin: string; html: string; CP437: string; windows1252: string }
>([
  [127, { dec: 127, hex: '7F', bin: '01111111', html: '&#127;', CP437: '', windows1252: '' }],
  [128, { dec: 128, hex: '80', bin: '10000000', html: '-', CP437: 'Ç', windows1252: '€' }],
  [129, { dec: 129, hex: '81', bin: '10000001', html: '-', CP437: 'ü', windows1252: '' }],
  [130, { dec: 130, hex: '82', bin: '10000010', html: '-', CP437: 'é', windows1252: '‚' }],
  [131, { dec: 131, hex: '83', bin: '10000011', html: '-', CP437: 'â', windows1252: 'ƒ' }],
  [132, { dec: 132, hex: '84', bin: '10000100', html: '-', CP437: 'ä', windows1252: '„' }],
  [133, { dec: 133, hex: '85', bin: '10000101', html: '-', CP437: 'à', windows1252: '…' }],
  [134, { dec: 134, hex: '86', bin: '10000110', html: '-', CP437: 'å', windows1252: '†' }],
  [135, { dec: 135, hex: '87', bin: '10000111', html: '-', CP437: 'ç', windows1252: '‡' }],
  [136, { dec: 136, hex: '88', bin: '10001000', html: '-', CP437: 'ê', windows1252: 'ˆ' }],
  [137, { dec: 137, hex: '89', bin: '10001001', html: '-', CP437: 'ë', windows1252: '‰' }],
  [138, { dec: 138, hex: '8A', bin: '10001010', html: '-', CP437: 'è', windows1252: 'Š' }],
  [139, { dec: 139, hex: '8B', bin: '10001011', html: '-', CP437: 'ï', windows1252: '‹' }],
  [140, { dec: 140, hex: '8C', bin: '10001100', html: '-', CP437: 'î', windows1252: 'Œ' }],
  [141, { dec: 141, hex: '8D', bin: '10001101', html: '-', CP437: 'ì', windows1252: '' }],
  [142, { dec: 142, hex: '8E', bin: '10001110', html: '-', CP437: 'Ä', windows1252: 'Ž' }],
  [143, { dec: 143, hex: '8F', bin: '10001111', html: '-', CP437: 'Å', windows1252: '' }],
  [144, { dec: 144, hex: '90', bin: '10010000', html: '-', CP437: 'É', windows1252: '' }],
  [145, { dec: 145, hex: '91', bin: '10010001', html: '-', CP437: 'æ', windows1252: '‘' }],
  [146, { dec: 146, hex: '92', bin: '10010010', html: '-', CP437: 'Æ', windows1252: '’' }],
  [147, { dec: 147, hex: '93', bin: '10010011', html: '-', CP437: 'ô', windows1252: '“' }],
  [148, { dec: 148, hex: '94', bin: '10010100', html: '-', CP437: 'ö', windows1252: '”' }],
  [149, { dec: 149, hex: '95', bin: '10010101', html: '-', CP437: 'ò', windows1252: '•' }],
  [150, { dec: 150, hex: '96', bin: '10010110', html: '-', CP437: 'û', windows1252: '–' }],
  [151, { dec: 151, hex: '97', bin: '10010111', html: '-', CP437: 'ù', windows1252: '—' }],
  [152, { dec: 152, hex: '98', bin: '10011000', html: '-', CP437: 'ÿ', windows1252: '˜' }],
  [153, { dec: 153, hex: '99', bin: '10011001', html: '-', CP437: 'Ö', windows1252: '™' }],
  [154, { dec: 154, hex: '9A', bin: '10011010', html: '-', CP437: 'Ü', windows1252: 'š' }],
  [155, { dec: 155, hex: '9B', bin: '10011011', html: '-', CP437: '¢', windows1252: '›' }],
  [156, { dec: 156, hex: '9C', bin: '10011100', html: '-', CP437: '£', windows1252: 'œ' }],
  [157, { dec: 157, hex: '9D', bin: '10011101', html: '-', CP437: '¥', windows1252: '' }],
  [158, { dec: 158, hex: '9E', bin: '10011110', html: '-', CP437: '₧', windows1252: 'ž' }],
  [159, { dec: 159, hex: '9F', bin: '10011111', html: '-', CP437: 'ƒ', windows1252: 'Ÿ' }],
  [160, { dec: 160, hex: 'A0', bin: '10101101', html: '&#173;', CP437: 'á', windows1252: '­' }],
  [161, { dec: 161, hex: 'A1', bin: '10100001', html: '&#161;', CP437: 'í', windows1252: '¡' }],
  [162, { dec: 162, hex: 'A2', bin: '10100010', html: '&#162;', CP437: 'ó', windows1252: '¢' }],
  [163, { dec: 163, hex: 'A3', bin: '10100011', html: '&#163;', CP437: 'ú', windows1252: '£' }],
  [164, { dec: 164, hex: 'A4', bin: '10100100', html: '&#164;', CP437: 'ñ', windows1252: '¤' }],
  [165, { dec: 165, hex: 'A5', bin: '10100101', html: '&#165;', CP437: 'Ñ', windows1252: '¥' }],
  [166, { dec: 166, hex: 'A6', bin: '10100110', html: '&#166;', CP437: 'ª', windows1252: '¦' }],
  [167, { dec: 167, hex: 'A7', bin: '10100111', html: '&#167;', CP437: 'º', windows1252: '§' }],
  [168, { dec: 168, hex: 'A8', bin: '10101000', html: '&#168;', CP437: '¿', windows1252: '¨' }],
  [169, { dec: 169, hex: 'A9', bin: '10101001', html: '&#169;', CP437: '⌐', windows1252: '©' }],
  [170, { dec: 170, hex: 'AA', bin: '10101010', html: '&#170;', CP437: '¬', windows1252: 'ª' }],
  [171, { dec: 171, hex: 'AB', bin: '10101011', html: '&#171;', CP437: '½', windows1252: '«' }],
  [172, { dec: 172, hex: 'AC', bin: '10101100', html: '&#172;', CP437: '¼', windows1252: '¬' }],
  [173, { dec: 173, hex: 'AD', bin: '10101101', html: '&#173;', CP437: '¡', windows1252: '­' }],
  [174, { dec: 174, hex: 'AE', bin: '10101110', html: '&#174;', CP437: '«', windows1252: '®' }],
  [175, { dec: 175, hex: 'AF', bin: '10101111', html: '&#175;', CP437: '»', windows1252: '¯' }],
  [176, { dec: 176, hex: 'B0', bin: '10110000', html: '&#176;', CP437: '░', windows1252: '°' }],
  [177, { dec: 177, hex: 'B1', bin: '10110001', html: '&#177;', CP437: '▒', windows1252: '±' }],
  [178, { dec: 178, hex: 'B2', bin: '10110010', html: '&#178;', CP437: '▓', windows1252: '²' }],
  [179, { dec: 179, hex: 'B3', bin: '10110011', html: '&#179;', CP437: '│', windows1252: '³' }],
  [180, { dec: 180, hex: 'B4', bin: '10110100', html: '&#180;', CP437: '┤', windows1252: '´' }],
  [181, { dec: 181, hex: 'B5', bin: '10110101', html: '&#181;', CP437: '╡', windows1252: 'µ' }],
  [182, { dec: 182, hex: 'B6', bin: '10110110', html: '&#182;', CP437: '╢', windows1252: '¶' }],
  [183, { dec: 183, hex: 'B7', bin: '10110111', html: '&#183;', CP437: '╖', windows1252: '·' }],
  [184, { dec: 184, hex: 'B8', bin: '10111000', html: '&#184;', CP437: '╕', windows1252: '¸' }],
  [185, { dec: 185, hex: 'B9', bin: '10111001', html: '&#185;', CP437: '╣', windows1252: '¹' }],
  [186, { dec: 186, hex: 'BA', bin: '10111010', html: '&#186;', CP437: '║', windows1252: 'º' }],
  [187, { dec: 187, hex: 'BB', bin: '10111011', html: '&#187;', CP437: '╗', windows1252: '»' }],
  [188, { dec: 188, hex: 'BC', bin: '10111100', html: '&#188;', CP437: '╝', windows1252: '¼' }],
  [189, { dec: 189, hex: 'BD', bin: '10111101', html: '&#189;', CP437: '╜', windows1252: '½' }],
  [190, { dec: 190, hex: 'BE', bin: '10111110', html: '&#190;', CP437: '╛', windows1252: '¾' }],
  [191, { dec: 191, hex: 'BF', bin: '10111111', html: '&#191;', CP437: '┐', windows1252: '¿' }],
  [192, { dec: 192, hex: 'C0', bin: '11000000', html: '&#192;', CP437: '└', windows1252: 'À' }],
  [193, { dec: 193, hex: 'C1', bin: '11000001', html: '&#193;', CP437: '┴', windows1252: 'Á' }],
  [194, { dec: 194, hex: 'C2', bin: '11000010', html: '&#194;', CP437: '┬', windows1252: 'Â' }],
  [195, { dec: 195, hex: 'C3', bin: '11000011', html: '&#195;', CP437: '├', windows1252: 'Ã' }],
  [196, { dec: 196, hex: 'C4', bin: '11000100', html: '&#196;', CP437: '─', windows1252: 'Ä' }],
  [197, { dec: 197, hex: 'C5', bin: '11000101', html: '&#197;', CP437: '┼', windows1252: 'Å' }],
  [198, { dec: 198, hex: 'C6', bin: '11000110', html: '&#198;', CP437: '╞', windows1252: 'Æ' }],
  [199, { dec: 199, hex: 'C7', bin: '11000111', html: '&#199;', CP437: '╟', windows1252: 'Ç' }],
  [200, { dec: 200, hex: 'C8', bin: '11001000', html: '&#200;', CP437: '╚', windows1252: 'È' }],
  [201, { dec: 201, hex: 'C9', bin: '11001001', html: '&#201;', CP437: '╔', windows1252: 'É' }],
  [202, { dec: 202, hex: 'CA', bin: '11001010', html: '&#202;', CP437: '╩', windows1252: 'Ê' }],
  [203, { dec: 203, hex: 'CB', bin: '11001011', html: '&#203;', CP437: '╦', windows1252: 'Ë' }],
  [204, { dec: 204, hex: 'CC', bin: '11001100', html: '&#204;', CP437: '╠', windows1252: 'Ì' }],
  [205, { dec: 205, hex: 'CD', bin: '11001101', html: '&#205;', CP437: '═', windows1252: 'Í' }],
  [206, { dec: 206, hex: 'CE', bin: '11001110', html: '&#206;', CP437: '╬', windows1252: 'Î' }],
  [207, { dec: 207, hex: 'CF', bin: '11001111', html: '&#207;', CP437: '╧', windows1252: 'Ï' }],
  [208, { dec: 208, hex: 'D0', bin: '11010000', html: '&#208;', CP437: '╨', windows1252: 'Ð' }],
  [209, { dec: 209, hex: 'D1', bin: '11010001', html: '&#209;', CP437: '╤', windows1252: 'Ñ' }],
  [210, { dec: 210, hex: 'D2', bin: '11010010', html: '&#210;', CP437: '╥', windows1252: 'Ò' }],
  [211, { dec: 211, hex: 'D3', bin: '11010011', html: '&#211;', CP437: '╙', windows1252: 'Ó' }],
  [212, { dec: 212, hex: 'D4', bin: '11010100', html: '&#212;', CP437: '╘', windows1252: 'Ô' }],
  [213, { dec: 213, hex: 'D5', bin: '11010101', html: '&#213;', CP437: '╒', windows1252: 'Õ' }],
  [214, { dec: 214, hex: 'D6', bin: '11010110', html: '&#214;', CP437: '╓', windows1252: 'Ö' }],
  [215, { dec: 215, hex: 'D7', bin: '11010111', html: '&#215;', CP437: '╫', windows1252: '×' }],
  [216, { dec: 216, hex: 'D8', bin: '11011000', html: '&#216;', CP437: '╪', windows1252: 'Ø' }],
  [217, { dec: 217, hex: 'D9', bin: '11011001', html: '&#217;', CP437: '┘', windows1252: 'Ù' }],
  [218, { dec: 218, hex: 'DA', bin: '11011010', html: '&#218;', CP437: '┌', windows1252: 'Ú' }],
  [219, { dec: 219, hex: 'DB', bin: '11011011', html: '&#219;', CP437: '█', windows1252: 'Û' }],
  [220, { dec: 220, hex: 'DC', bin: '11011100', html: '&#220;', CP437: '▄', windows1252: 'Ü' }],
  [221, { dec: 221, hex: 'DD', bin: '11011101', html: '&#221;', CP437: '▌', windows1252: 'Ý' }],
  [222, { dec: 222, hex: 'DE', bin: '11011110', html: '&#222;', CP437: '▐', windows1252: 'Þ' }],
  [223, { dec: 223, hex: 'DF', bin: '11011111', html: '&#223;', CP437: '▀', windows1252: 'ß' }],
  [224, { dec: 224, hex: 'E0', bin: '11100000', html: '&#224;', CP437: 'α', windows1252: 'à' }],
  [225, { dec: 225, hex: 'E1', bin: '11100001', html: '&#225;', CP437: 'ß', windows1252: 'á' }],
  [226, { dec: 226, hex: 'E2', bin: '11100010', html: '&#226;', CP437: 'Γ', windows1252: 'â' }],
  [227, { dec: 227, hex: 'E3', bin: '11100011', html: '&#227;', CP437: 'π', windows1252: 'ã' }],
  [228, { dec: 228, hex: 'E4', bin: '11100100', html: '&#228;', CP437: 'Σ', windows1252: 'ä' }],
  [229, { dec: 229, hex: 'E5', bin: '11100101', html: '&#229;', CP437: 'σ', windows1252: 'å' }],
  [230, { dec: 230, hex: 'E6', bin: '11100110', html: '&#230;', CP437: 'µ', windows1252: 'æ' }],
  [231, { dec: 231, hex: 'E7', bin: '11100111', html: '&#231;', CP437: 'τ', windows1252: 'ç' }],
  [232, { dec: 232, hex: 'E8', bin: '11101000', html: '&#232;', CP437: 'Φ', windows1252: 'è' }],
  [233, { dec: 233, hex: 'E9', bin: '11101001', html: '&#233;', CP437: 'Θ', windows1252: 'é' }],
  [234, { dec: 234, hex: 'EA', bin: '11101010', html: '&#234;', CP437: 'Ω', windows1252: 'ê' }],
  [235, { dec: 235, hex: 'EB', bin: '11101011', html: '&#235;', CP437: 'δ', windows1252: 'ë' }],
  [236, { dec: 236, hex: 'EC', bin: '11101100', html: '&#236;', CP437: '∞', windows1252: 'ì' }],
  [237, { dec: 237, hex: 'ED', bin: '11101101', html: '&#237;', CP437: 'φ', windows1252: 'í' }],
  [238, { dec: 238, hex: 'EE', bin: '11101110', html: '&#238;', CP437: 'ε', windows1252: 'î' }],
  [239, { dec: 239, hex: 'EF', bin: '11101111', html: '&#239;', CP437: '∩', windows1252: 'ï' }],
  [240, { dec: 240, hex: 'F0', bin: '11110000', html: '&#240;', CP437: '≡', windows1252: 'ð' }],
  [241, { dec: 241, hex: 'F1', bin: '11110001', html: '&#241;', CP437: '±', windows1252: 'ñ' }],
  [242, { dec: 242, hex: 'F2', bin: '11110010', html: '&#242;', CP437: '≥', windows1252: 'ò' }],
  [243, { dec: 243, hex: 'F3', bin: '11110011', html: '&#243;', CP437: '≤', windows1252: 'ó' }],
  [244, { dec: 244, hex: 'F4', bin: '11110100', html: '&#244;', CP437: '⌠', windows1252: 'ô' }],
  [245, { dec: 245, hex: 'F5', bin: '11110101', html: '&#245;', CP437: '⌡', windows1252: 'õ' }],
  [246, { dec: 246, hex: 'F6', bin: '11110110', html: '&#246;', CP437: '÷', windows1252: 'ö' }],
  [247, { dec: 247, hex: 'F7', bin: '11110111', html: '&#247;', CP437: '≈', windows1252: '÷' }],
  [248, { dec: 248, hex: 'F8', bin: '11111000', html: '&#248;', CP437: '°', windows1252: 'ø' }],
  [249, { dec: 249, hex: 'F9', bin: '11111001', html: '&#249;', CP437: '∙', windows1252: 'ù' }],
  [250, { dec: 250, hex: 'FA', bin: '11111010', html: '&#250;', CP437: '·', windows1252: 'ú' }],
  [251, { dec: 251, hex: 'FB', bin: '11111011', html: '&#251;', CP437: '√', windows1252: 'û' }],
  [252, { dec: 252, hex: 'FC', bin: '11111100', html: '&#252;', CP437: 'ⁿ', windows1252: 'ü' }],
  [253, { dec: 253, hex: 'FD', bin: '11111101', html: '&#253;', CP437: '²', windows1252: 'ý' }],
  [254, { dec: 254, hex: 'FE', bin: '11111110', html: '&#254;', CP437: '■', windows1252: 'þ' }],
  [255, { dec: 255, hex: 'FF', bin: '11111111', html: '&#255;', CP437: '⍽', windows1252: 'ÿ' }]
]);

export const getNonPrintableAsciiFromDec = (index: number, encoding: 'CP437' | 'caret' | 'copy', prefix: string = '') =>
  !['CP437', 'caret', 'copy'].includes(encoding) || index < 0 || index > 31
    ? ''
    : prefix.slice(-1) + NON_PRINTABLE_ASCII_TABLE.get(index)[encoding];

export const getNonPrintableAsciiFromHex = (hex: string, encoding: 'CP437' | 'caret' | 'copy', prefix: string = '') => {
  const index: number = parseInt(hex, 16);
  return !['CP437', 'caret', 'copy'].includes(encoding) ||
    isNaN(index) ||
    index === undefined ||
    index < 0 ||
    index > 31
    ? ''
    : prefix.slice(-1) + NON_PRINTABLE_ASCII_TABLE.get(index)[encoding];
};

export const getHigherAsciiFromDec = (index: number, encoding: 'CP437' | 'windows1252') =>
  !['CP437', 'windows1252'].includes(encoding) || index < 127 || index > 255
    ? ''
    : HIGHER_ASCII_TABLE.get(index)[encoding];

export const getHigherAsciiFromHex = (hex: string, encoding: 'CP437' | 'windows1252') => {
  const index: number = parseInt(hex, 16);
  return !['CP437', 'windows1252'].includes(encoding) ||
    isNaN(index) ||
    index === undefined ||
    index < 127 ||
    index > 255
    ? ''
    : HIGHER_ASCII_TABLE.get(index)[encoding];
};

export const parseDataToHexcodeMap = (data: string) => {
  if (data === undefined || data === null || data === '') return new Map();
  let map = new Map();
  data.split(/[ ]+/).forEach((hex, index) => {
    map.set(index, hex);
  });
  return map;
};

export const parseStringToHexString = (text: string) =>
  Buffer.from(text)
    .toString('hex')
    .replace(/(.{2})/g, '$& ');

export const parseHexToString = (hex: string) => Buffer.from(hex, 'hex').toString('utf8');

export const parseDataToHexMap = (data: string) => {
  if (data === undefined || data === null || data === '') return new Map();
  let map = new Map();
  data
    .split('\n')
    .map(el => el.slice(11, 58))
    .join(' ')
    .split(/[ ]+/)
    .forEach((hex, index) => {
      map.set(index, hex);
    });
  return map;
};

export const parseDataToTextMap = (data: string) => {
  let map = new Map();
  data
    .split('\n')
    .map(el => el.slice(61, 77))
    .join('')
    .split('')
    .forEach((text, index) => {
      text === '.' ? map.set(index, '·') : map.set(index, text);
    });
  return map;
};

export const parseDataToTextContent = (data: string) =>
  data
    .split('\n')
    .map(el => el.slice(61, 77))
    .join('');

export const parseHexDataToHexMap = (data: string) => {
  let map = new Map();
  data.split(/[ ]+/).forEach((hex, index) => {
    map.set(index, hex);
  });
  return map;
};

export const isHexString = (hex: string) =>
  hex
    .replace(/\s/g, '')
    .replace(/(.{2})/g, '$& ')
    .split(' ')
    .filter(e => e !== '')
    .map(e => parseInt(e, 16))
    .findIndex(e => isNaN(e)) === -1;

export const toHexChar = (hexcode: string) => {
  const value: number = parseInt(hexcode, 16);
  const char: string = Buffer.from(hexcode, 'hex').toString();
  const ascii = ASCII.find(element => value >= element.range.start && value <= element.range.end);

  if (ascii.type === 'null') return ascii.value;
  else if (ascii.type === 'non printable') return ascii.value;
  else if (ascii.type === 'lower ASCII') return char;
  else if (ascii.type === 'higher ASCII') return ascii.value;
  else return '';
};

export const toHexChar2 = (store: Store, hexcode: string, copy: boolean = false) => {
  const value: number = parseInt(hexcode, 16);
  if (isNaN(value)) return '';

  if (value === 0) {
    if (copy) return NON_PRINTABLE_ASCII_TABLE.get(0).copy;
    else return store.hex.null.char;
  } else if (1 <= value && value <= 31) {
    if (copy) return NON_PRINTABLE_ASCII_TABLE.get(value).copy;
    else if (store.hex.nonPrintable.set === 'hidden') return store.hex.nonPrintable.char;
    else if (store.hex.nonPrintable.set === 'caret') return NON_PRINTABLE_ASCII_TABLE.get(value).caret;
    else if (store.hex.nonPrintable.set === 'CP437') return NON_PRINTABLE_ASCII_TABLE.get(value).CP437;
    else return NON_PRINTABLE_ASCII_TABLE.get(value).caret;
  } else if (32 <= value && value <= 127) {
    return Buffer.from(hexcode, 'hex').toString();
  } else if (128 <= value && value <= 255) {
    if (store.hex.higher.set === 'hidden') return store.hex.higher.char;
    else if (['CP437', 'windows1252'].includes(store.hex.higher.set))
      return HIGHER_ASCII_TABLE.get(value)[store.hex.higher.set];
    else if (
      ['ascii', 'base64', 'base64url', 'hex', 'latin1', 'ucs-2', 'ucs2', 'utf-8', 'utf16le', 'utf8'].includes(
        store.hex.higher.set
      )
    )
      return Buffer.from(hexcode, 'hex').toString(store.hex.higher.set as BufferEncoding);
    else return '';
  } else return '';
};

export const getHexType = (hexcode: string) => {
  const value: number = parseInt(hexcode, 16);
  const ascii = ASCII.find(element => value >= element.range.start && value <= element.range.end);
  return ascii.type;
};

export const getAddressValue = (offsetBase: number, offsetSize: number, index: number) =>
  index.toString(offsetBase).toUpperCase().padStart(offsetSize, '0');

export const getHexValue = (hexCodes: Map<number, string>, index: number) =>
  index >= 0 && index < hexCodes.size ? hexCodes.get(index).toUpperCase() : '';

export const getTextValue = (store: Store, hexCodes: Map<number, string>, index: number) =>
  index >= 0 && index < hexCodes.size ? toHexChar2(store, hexCodes.get(index)) : '';

// Math.min(Math.max(_value, _min), _max)
export const clampHexIndex = (hexcodes: Map<number, string>, index: number): number => {
  if (index <= 0) return 0;
  else if (index >= hexcodes.size) return hexcodes.size - 1;
  else return index;
};

export const singleCharacterString = (value: any, base: string = undefined) =>
  value === undefined || value === null || typeof value !== 'string' || value === '' ? base : value.slice(-1);
