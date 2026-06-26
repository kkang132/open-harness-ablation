# Implement `deepMerge`

Implement `workdir/deepmerge.ts`. Do not edit the tests.

Implement `deepMerge(a, b)` for config objects:
- return a new object; do not mutate the inputs
- if a key exists in both and both values are plain objects, merge them recursively
- otherwise the value from b wins
- arrays are treated as plain values (b replaces a; they are not concatenated)

Examples: deepMerge({a:{x:1}},{a:{y:2}}) -> {a:{x:1,y:2}}; deepMerge({a:[1]},{a:[2]}) -> {a:[2]}.
