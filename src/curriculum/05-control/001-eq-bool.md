---
id: control-eq-bool
title: Returning a Comparison as a Bool
difficulty: 1
concepts:
  - comparison
  - boolean
  - idiom
symbol: is_equal
hints:
  - Returning a comparison gives a 0/1 value with no branch.
  - Equality is the `subf` / `cntlzw` / `srwi r3, r0, 5` idiom.
---

# A comparison with no branch in sight

When a function *returns* `a == b`, the result is a 0/1 integer, not a jump.
MWCC has a slick branchless idiom for equality. It subtracts the two values —
the difference is zero exactly when they're equal — then counts the leading
zero bits and shifts:

```asm
subf   r0, r3, r4    # r0 = b - a   (zero iff a == b)
cntlzw r0, r0        # count leading zeros: 32 if r0==0, else < 32
srwi   r3, r0, 5     # r0 >> 5  ==  1 if it was 32, else 0
blr
```

The trick: `cntlzw` returns **32** only for an all-zero word, and `32 >> 5` is
`1`; any non-zero difference counts fewer than 32 leading zeros, so `>> 5` gives
`0`. That `subf` → `cntlzw` → `srwi r3, r0, 5` trio is MWCC's signature for
"return `a == b`".

## Your task

Write `is_equal` so it compiles to the `subf` / `cntlzw` / `srwi` idiom above.

<!-- starter -->
```c
int is_equal(int a, int b) {
    /* TODO: return the result of comparing a and b */
    return 0;
}
```

<!-- solution -->
```c
int is_equal(int a, int b) {
    return a == b;
}
```
