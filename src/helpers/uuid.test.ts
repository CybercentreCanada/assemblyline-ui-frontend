import { describe, expect, it } from '@jest/globals';
import generateUUID from 'helpers/uuid';

describe('Test `generateUUID`', () => {
  it('Should generate a standard UUID', () => {
    expect(generateUUID().length).toBe(36);
    const [p1, p2, p3, p4, p5] = generateUUID().split('-');
    expect(p1.length).toBe(8);
    expect(p2.length).toBe(4);
    expect(p3.length).toBe(4);
    expect(p3.startsWith('4')).toBe(true);
    expect(p4.length).toBe(4);
    expect(p5.length).toBe(12);
  });
});
