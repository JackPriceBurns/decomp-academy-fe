---
id: 1355d23d-0711-5023-a686-bf65be763514
slug: control-eq-bool
title: Returning a Comparison as a Bool
difficulty: 1
concepts:
  - comparison
  - boolean
  - idiom
symbol: func_800d5748
hints:
  - Returning a comparison gives a 0/1 value with no branch.
  - Equality is the `subf` / `cntlzw` / `srwi r3, r0, 5` idiom.
---

# A comparison with no branch in sight

When a function *returns* a comparison result, the output is a 0/1 integer, not
a jump. MWCC has a slick branchless idiom for equality: subtract the two values
(the difference is zero exactly when they're equal), count the leading zero
bits, and shift. For example, testing whether a value equals the constant 7:

```asm
subfic  r0,r3,7
cntlzw  r0,r0
srwi    r3,r0,5
blr
```

The trick: `cntlzw` returns **32** only for an all-zero word, and `32 >> 5` is
`1`. Any non-zero difference has fewer than 32 leading zeros, so `>> 5` gives
`0`. The `subf`/`subfic` → `cntlzw` → `srwi r3, r0, 5` trio is MWCC's
signature for a branchless equality check.

Note that `subfic` is the immediate form (subtracting a constant) and `subf` is
the register form (subtracting two variables). The surrounding instructions are
the same either way — only the subtraction operand changes.

Your target uses the register form. Look at which registers are subtracted and
write the equality expression over the corresponding parameters.

## Your task

Write `func_800d5748` so it compiles to the `subf` / `cntlzw` / `srwi` idiom
above.

<!-- solution -->
```c
int func_800d5748(int a, int b) {
    return a == b;
}
```
