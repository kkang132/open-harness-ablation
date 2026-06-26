# Fix `chunk`

`workdir/chunk.ts` exports a function `chunk` that should split an array into
consecutive sub-arrays ("chunks") of a given size.

## Spec

- `chunk(items, size)` returns an array of arrays.
- Each chunk holds `size` elements, in their original order.
- If `items.length` is not a multiple of `size`, the final chunk is shorter.
- `size` is a positive integer. You do not need to validate it.
- `chunk([], size)` returns `[]`.
- The input array is not modified.

## Examples

- `chunk([1, 2, 3, 4], 2)` -> `[[1, 2], [3, 4]]`
- `chunk([1, 2, 3, 4, 5], 2)` -> `[[1, 2], [3, 4], [5]]`
- `chunk([1, 2, 3], 1)` -> `[[1], [2], [3]]`

The implementation has a bug and the tests fail. Fix `workdir/chunk.ts` so its
behaviour matches the spec. Do not edit the tests.
