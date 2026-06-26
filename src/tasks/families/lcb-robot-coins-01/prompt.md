# Implement `maximumAmount`

`workdir/solution.ts` exports `maximumAmount(coins)`, currently a stub. Implement it.

## Problem

You are given an `m x n` grid `coins`. A robot starts at the top-left corner
`(0, 0)` and wants to reach the bottom-right corner `(m-1, n-1)`. The robot can
move only **right** or **down**.

Each cell holds a value `coins[i][j]`:

- If `coins[i][j] >= 0`, the robot gains that many coins.
- If `coins[i][j] < 0`, a robber steals `abs(coins[i][j])` coins.

The robot may **neutralize** the robber in at most **2 cells** on its path,
preventing the theft in those cells (the cell then contributes 0).

Return the maximum total profit over all valid paths. The total may be negative.

## Examples

- `maximumAmount([[0,1,-1],[1,-2,3],[2,-3,4]])` -> `8`
- `maximumAmount([[10,10,10],[10,10,10]])` -> `40`
- `maximumAmount([[-4]])` -> `0` (neutralize the only cell)

## Signature

```ts
export function maximumAmount(coins: number[][]): number
```

Implement `workdir/solution.ts` to match the spec. Do not edit the tests.
