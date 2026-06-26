# Fix `normalizePath`

`workdir/normalize.ts` exports `normalizePath(path)`, which should normalize a
POSIX-style path string. The implementation is incomplete and fails several cases.

## Spec

- Collapse repeated slashes: `a//b` becomes `a/b`.
- Drop `.` segments: `a/./b` becomes `a/b`.
- Resolve `..` by removing the preceding segment: `a/b/../c` becomes `a/c`.
- A path starting with `/` is absolute. `..` at the root has no effect: `/a/../../b` becomes `/b`.
- A path not starting with `/` is relative. Leading `..` segments that cannot be
  resolved are preserved: `../a` stays `../a`, and `a/../../b` becomes `../b`.
- Remove a trailing slash, except for the root: `a/b/` becomes `a/b`, `/` stays `/`.
- The empty string normalizes to `.`. A path that resolves to nothing also becomes `.`:
  `a/..` becomes `.`.

## Examples

- `normalizePath("a/b/../c")` -> `"a/c"`
- `normalizePath("../a")` -> `"../a"`
- `normalizePath("a/..")` -> `"."`
- `normalizePath("/a/../../b")` -> `"/b"`

Fix `workdir/normalize.ts` so its behaviour matches the spec. Do not edit the tests.
