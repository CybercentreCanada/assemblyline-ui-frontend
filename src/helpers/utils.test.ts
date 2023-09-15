import { describe, expect, it } from '@jest/globals';
import { bytesToSize, getFileName, toTitleCase } from 'helpers/utils';

describe('Test `toTitleCase`', () => {
  it('Should split on whitespace and underscores', () => {
    expect(toTitleCase('title')).toBe('Title');
    expect(toTitleCase('TITLE')).toBe('Title');
    expect(toTitleCase('TiTlE')).toBe('Title');
    expect(toTitleCase('the_title')).toBe('The Title');
    expect(toTitleCase('the title')).toBe('The Title');
    expect(toTitleCase('theTitle')).toBe('Thetitle');
    expect(toTitleCase('TheTitle')).toBe('Thetitle');
    expect(toTitleCase('_the_title_')).toBe('The Title');
    expect(toTitleCase('the title 0')).toBe('The Title 0');
  });

  it('Should trim extra whitespace', () => {
    expect(toTitleCase(' the title')).toBe('The Title');
    expect(toTitleCase('the  title')).toBe('The Title');
    expect(toTitleCase('the title ')).toBe('The Title');
    expect(toTitleCase('  the   title ')).toBe('The Title');
  });

  it('Should leave special characters', () => {
    expect(toTitleCase('*the-title>')).toBe('*the-title>');
    expect(toTitleCase('*the* *title*')).toBe('*the* *title*');
  });
});

describe('Test `getFileName`', () => {
  it('Should return `null` if `filename=` not found', () => {
    expect(getFileName('C:\\file.txt')).toBe(null);
    expect(getFileName('/etc/file.js')).toBe(null);
    expect(getFileName('~/downloads/file.js')).toBe(null);
    expect(getFileName('form-data; name="fieldName"')).toBe(null);
  });

  it('Should identify ascii filenames', () => {
    expect(getFileName('form-data; name="fieldName"; filename="filename.jpg"')).toBe('filename.jpg');
    expect(getFileName('form-data; filename="filename.jpg"; name="fieldName"')).toBe('filename.jpg');
    expect(getFileName('attachment; filename="filename.jpg"')).toBe('filename.jpg');
  });

  it('Should identify utf8 filenames', () => {
    expect(getFileName("attachment; filename*=UTF-8''%EA%B3%A0%EC%96%91%EC%9D%B4.jpg;")).toBe('고양이.jpg');
    // most modern browsers and application allow the use of non-ISO-8859-1 characters in HTTP fields
    // Should we test for these as they might be present?
    // expect(getFileName('attachment; filename=고양이.jpg;')).toBe('고양이.jpg');
    // expect(getFileName("attachment; filename*=UTF-8''고양이.jpg;")).toBe('고양이.jpg');
  });

  it('Should extract the utf8 filename if both ascii and utf8 are present', () => {
    expect(getFileName('attachment; filename="cat.jpg"; filename*=UTF-8\'\'%EA%B3%A0%EC%96%91%EC%9D%B4.jpg;')).toBe(
      '고양이.jpg'
    );
  });
});

describe('Test `bytesToSize`', () => {
  it('Should return NaN undefined for negative numbers', () => {
    expect(bytesToSize(-1)).toBe('NaN undefined');
  });

  it('Should return bytes if size less than 1024 B', () => {
    expect(bytesToSize(0)).toBe('0 B');
    expect(bytesToSize(5)).toBe('5 B');
    expect(bytesToSize(512)).toBe('512 B');
    expect(bytesToSize(1000)).toBe('1000 B');
    expect(bytesToSize(1023)).toBe('1023 B');
  });

  it('Should return KB if size between 1024 B to under 1 MB', () => {
    expect(bytesToSize(1024)).toBe('1 KB');
    expect(bytesToSize(1025)).toBe('1 KB');
    expect(bytesToSize(500000)).toBe('488 KB');
    expect(bytesToSize(1000000)).toBe('977 KB');
    expect(bytesToSize(1048575)).toBe('1024 KB');
  });

  it('Should return MB if size between 1 MB to under 1 GB', () => {
    expect(bytesToSize(1048576)).toBe('1 MB');
    expect(bytesToSize(1048586)).toBe('1 MB');
    expect(bytesToSize(500000000)).toBe('477 MB');
    expect(bytesToSize(750000000)).toBe('715 MB');
    expect(bytesToSize(1073741823)).toBe('1024 MB');
  });

  it('Should return GB if size between 1 GB to under 1 TB', () => {
    expect(bytesToSize(1073741824)).toBe('1 GB');
    expect(bytesToSize(50000000000)).toBe('47 GB');
    expect(bytesToSize(75000000000)).toBe('70 GB');
    expect(bytesToSize(1099511627775)).toBe('1024 GB');
  });

  it('Should return TB if size over 1024 GB', () => {
    expect(bytesToSize(1099511627776)).toBe('1 TB');
    expect(bytesToSize(5000000000000)).toBe('5 TB');
    expect(bytesToSize(10000000000000)).toBe('9 TB');
    expect(bytesToSize(1125899906842620)).toBe('1024 TB');
  });

  it('Should return `undefined` on 1 PB+', () => {
    expect(bytesToSize(1125899906842621)).toBe('1 undefined');
    expect(bytesToSize(1125899906842624)).toBe('1 undefined');
  });
});
