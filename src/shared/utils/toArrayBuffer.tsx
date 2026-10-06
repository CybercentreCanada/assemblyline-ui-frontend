/**
 *
 * Convert the given data iterable into a Uint8Array.
 *
 * @param data - data to convert
 *
 * @returns A uint8Array buffer
 *
 */
export default function toArrayBuffer(data) {
  const uint8Array = new Uint8Array(data.length);
  for (let i = 0; i < uint8Array.length; i++) {
    uint8Array[i] = data[i];
  }

  return uint8Array;
}
