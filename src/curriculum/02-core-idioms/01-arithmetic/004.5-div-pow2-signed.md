---
id: arithmetic-div-pow2-signed
title: Signed Divide by a Power of Two
difficulty: 3
concepts:
  - strength-reduction
  - shifts
  - signed
  - rounding
symbol: sdiv4
hints:
  - Signed divide by a power of two is an arithmetic shift plus a rounding fixup.
  - Look for `srawi` followed by `addze` — the carry corrects the rounding for
    negatives.
---

# Signed division rounds, so it needs a fixup

The unsigned case was a clean `srwi`. Signed division by a power of two is
trickier: C rounds *toward zero*, but an arithmetic shift rounds *toward
negative infinity*. For a negative dividend those differ — `-1 / 4` is `0` in C,
yet `-1 >> 2` is `-1` — so MWCC adds a correction:

```asm
srawi r0, r3, 2    # x >> 2, biased the wrong way for negatives
addze r3, r0       # add the carry back: +1 only when x was negative
blr
```

`srawi` sets the carry bit when it shifts a 1 out of a negative value; `addze`
("add to zero, extended with carry") then nudges the quotient back toward zero
exactly when needed. A positive dividend produces no carry, so `addze` adds
nothing. This **`srawi` + `addze`** pair is the unmistakable signature of a
signed divide by a power of two — distinct from the lone `srwi` of the unsigned
case.

## Your task

Write `sdiv4`, taking a signed `int x`, to reproduce the `srawi`/`addze` pair above.

<!-- starter -->
```c
int sdiv4(int x) {
    return 0;
}
```

<!-- solution -->
```c
int sdiv4(int x) {
    return x / 4;
}
```
