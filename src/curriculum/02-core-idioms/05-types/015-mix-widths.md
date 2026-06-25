---
id: types-mix-widths
title: Combining Two Widths
difficulty: 3
concepts:
  - widening
  - zero-extension
  - sign-extension
  - mixed-width
symbol: mix_widths
hints:
  - "Each narrow operand is widened to 32 bits *before* the arithmetic — one
    extend per operand, chosen by that operand's own type."
  - "A `u8` widens with `clrlwi …,24` (zero-extend); an `s16` widens with `extsh`
    (sign-extend). Then a single `add` combines them."
---

# Each operand is widened on its own terms

PowerPC arithmetic works on full 32-bit registers, so when you combine values of
*different* narrow widths, the compiler first widens each one to 32 bits — and it
picks the extend **per operand**, based on that operand's own type. A `u8` or
`u16` zero-extends (a `clrlwi` mask); an `s8` or `s16` sign-extends (`extsb` /
`extsh`). Only after both are full-width does the actual arithmetic run.

Consider `combine(a, b)` adding a `u16` and a `u8`. Both are unsigned, so both
widen with a mask — the shift count differs because the widths differ:

```asm
clrlwi r3, r3, 16   # a: keep low 16 bits (u16, zero-extended)
clrlwi r0, r4, 24   # b: keep low 8 bits  (u8, zero-extended)
add    r3, r3, r0   # 32-bit add of the two widened values
blr
```

Two extends, then one `add`. The pair of `clrlwi` shift amounts is a direct
read-out of the two source widths: `…,16` means a 16-bit operand, `…,24` an
8-bit one.

The target mixes an *unsigned* operand with a *signed* one, so one extend will be
a `clrlwi` and the other an `extsh`/`extsb` — read each extend to recover that
operand's width *and* signedness, then see how they're combined.

## Your task

Write `mix_widths`, taking a `u8` and an `s16` and returning their sum as an
`int`, to match the target assembly.

<!-- starter -->
```c
int mix_widths(u8 a, s16 b) {
    return 0;
}
```

<!-- solution -->
```c
int mix_widths(u8 a, s16 b) {
    return a + b;
}
```
