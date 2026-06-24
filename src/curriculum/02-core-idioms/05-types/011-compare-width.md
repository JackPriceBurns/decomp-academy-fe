---
id: types-compare-width
title: The Compare Opcode Follows the Type
difficulty: 4
concepts:
  - comparison
  - signed
  - unsigned
  - branch
symbol: maybe_act
hints:
  - An unsigned operand feeding a branch compares with `cmplwi`, not `cmpwi`.
  - Change the parameter from `s16` to `u16`; that yields `clrlwi` then `cmplwi
    r0, 256`.
---

# `cmplwi` vs `cmpwi` is a type tell

When a value feeds a *branch*, the comparison opcode reveals its declared type.
An **unsigned** operand (like a `u16`) compares with **`cmplwi`** — *compare
**l**ogical word immediate* — after being zero-extended to clear the high bits:

```asm
clrlwi r0, r3, 16   # zero-extend the u16
cmplwi r0, 256      # unsigned compare
bne-   skip
bl     act
```

A **signed narrow** operand of the same width (an `s16`) compares with
**`cmpwi`** — the signed compare — preceded by a sign-extend. (A plain 32-bit
`int` is already full-width, so it gets the `cmpwi` with *no* extend.)

```asm
extsh  r0, r3       # sign-extend the s16
cmpwi  r0, 256      # signed compare
bne-   skip
bl     act
```

The difference is one letter — `cmpl**w**i` vs `cmp**w**i` — and the preceding
`clrlwi` vs `extsh`. If the target uses `cmplwi`, your operand must be unsigned;
match the local or field to the field's actual width and sign.

## Your task

`act` is a function. The starter below declares the parameter as **`s16 x`**,
which produces `extsh` + `cmpwi` (the signed compare). Change the parameter to
the type that makes the comparison emit `cmplwi` — the target uses the *logical*
(unsigned) compare, so pick the type whose zero-extend feeds it.

<!-- starter -->
```c
void maybe_act(s16 x) {
    if (x == 256) {
        act();
    }
}
```

<!-- solution -->
```c
void maybe_act(u16 x) {
    if (x == 256) {
        act();
    }
}
```

<!-- context -->
```c
void act(void);
```
