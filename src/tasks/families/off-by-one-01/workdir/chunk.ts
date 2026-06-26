// Split an array into consecutive chunks of a given size.
// See prompt.md for the full spec. This implementation has a bug.
export function chunk<T>(items: T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < items.length; i += size) {
    out.push(items.slice(i, i + size - 1));
  }
  return out;
}
