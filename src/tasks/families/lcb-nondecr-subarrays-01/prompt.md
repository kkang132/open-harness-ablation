# Implement `countNonDecreasingSubarrays`

`workdir/solution.ts` exports `countNonDecreasingSubarrays(nums, k)`, a stub.
Implement it.

## Problem

You are given an array `nums` of `n` integers and an integer `k`.

For each subarray of `nums`, you may apply up to `k` operations on it. In each
operation, you **increment any element of the subarray by 1**. Each subarray is
considered independently: changes to one subarray do not carry over to another.

Return the number of subarrays that can be made **non-decreasing** after at most
`k` operations. An array is non-decreasing if each element is greater than or
equal to the element before it.

## Examples

- `countNonDecreasingSubarrays([6,3,1,2,4,4], 7)` -> `17`
- `countNonDecreasingSubarrays([6,3,1,3,6], 4)` -> `12`

## Signature

```ts
export function countNonDecreasingSubarrays(nums: number[], k: number): number
```

Implement `workdir/solution.ts` to match the spec. Do not edit the tests.
