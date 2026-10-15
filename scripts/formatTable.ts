/**
 * Formats plain ASCII report cells without quoting string values.
 * @param {readonly string[]} headers - Column labels.
 * @param {readonly (readonly string[])[]} rows - Formatted report cells.
 * @returns {string} A bordered table ready for console output.
 */
export function formatTable(
  headers: readonly string[],
  rows: readonly (readonly string[])[],
): string {
  const widths = headers.map((header, index) => {
    let width = header.length
    for (const row of rows) {
      width = Math.max(width, row[index]?.length ?? 0)
    }
    return width
  })
  const border = (left: string, middle: string, right: string): string =>
    `${left}${widths.map(width => '─'.repeat(width + 2)).join(middle)}${right}`
  const formatRow = (row: readonly string[]): string =>
    `│ ${widths.map((width, index) => (row[index] ?? '').padEnd(width)).join(' │ ')} │`

  return [
    border('┌', '┬', '┐'),
    formatRow(headers),
    border('├', '┼', '┤'),
    ...rows.map(row => formatRow(row)),
    border('└', '┴', '┘'),
  ].join('\n')
}
