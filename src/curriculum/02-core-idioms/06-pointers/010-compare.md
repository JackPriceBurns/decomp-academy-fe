---
id: pointers-compare
title: Comparing Two Pointers
difficulty: 4
concepts:
  - pointers
  - comparison
  - boolean
symbol: same
hints:
  - Pointer equality is address equality — write the plain `a == b`.
  - The branchless form is `subf`, `cntlzw`, then `srwi r3, r0, 5`.
---

# Equality without a branch

Two pointers are equal when their addresses are equal, so `a == b` is really an
integer equality. Returning that comparison as a `BOOL` (in the GameCube SDK
headers `BOOL` is just a typedef for `int`, with `TRUE == 1` and `FALSE == 0`,
so it carries no special compiler semantics) without branching, MWCC reaches for
a clever trick: subtract, then count leading zeros.

```asm
subf   r0, r3, r4     # subf rD,rA,rB = rB - rA, i.e. r4 - r3 (zero iff equal)
cntlzw r0, r0         # count leading zero bits (32 iff the value was 0)
srwi   r3, r0, 5      # 32 >> 5 == 1# anything < 32 >> 5 == 0
blr
```

`cntlzw` returns 32 only when its input is exactly zero; shifting that by 5
maps 32 → 1 and every other count → 0. So this three-instruction idiom is the
branchless "are these equal?" — recognize it as `a == b`.

## Your task

Write `same`, taking two `int*` and returning whether they point at the same
address.

<!-- starter -->
```c
BOOL same(int* a, int* b) {
    return FALSE;
}
```

<!-- solution -->
```c
BOOL same(int* a, int* b) {
    return a == b;
}
```
