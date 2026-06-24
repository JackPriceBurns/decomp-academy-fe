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
A **signed** narrow operand compares with **`cmpwi`**, preceded by a sign-extend
that fills the top bits before comparing. For example, a signed 16-bit parameter
compared against 100:

```asm
extsh  r0,r3       # sign-extend narrow signed value
cmpwi  r0,100      # signed compare
bne-   skip
bl     trigger
```

An **unsigned** narrow operand compares with **`cmplwi`** — *compare **l**ogical
word immediate* — instead, preceded by a zero-extend to clear the high bits:

```asm
clrlwi r0,r3,16    # zero-extend narrow unsigned value
cmplwi r0,100      # unsigned compare
bne-   skip
bl     trigger
```

The difference is one letter — `cmplwi` vs `cmpwi` — and the preceding extend:
`clrlwi` (zero-extend) for unsigned, `extsh`/`extsb` (sign-extend) for signed.
The bit-width of the `clrlwi` shift matches the width of the source type. If the
target uses `cmplwi`, your operand must be unsigned; match the parameter to the
correct width and sign.

## Your task

`act` is a function. The starter below declares the parameter as **`s16 x`**,
which produces `extsh` + `cmpwi` (the signed compare). Change the parameter type
so the comparison emits `cmplwi` instead — the target assembly uses the logical
(unsigned) compare with the same 16-bit width.

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
