const BYTES_PER_KB = 1000
const BYTES_PER_MB = 1_000_000

/**
 * Formats report sizes using decimal units (1 KB = 1,000 bytes).
 * @param {number} bytes - Raw size in bytes.
 * @returns {string} A readable size with its unit.
 */
export function formatBytes(bytes: number): string {
  if (bytes >= BYTES_PER_MB) {
    return `${(bytes / BYTES_PER_MB).toFixed(2)} MB`
  }
  if (bytes >= BYTES_PER_KB) {
    return `${(bytes / BYTES_PER_KB).toFixed(2)} KB`
  }
  return `${bytes} B`
}
