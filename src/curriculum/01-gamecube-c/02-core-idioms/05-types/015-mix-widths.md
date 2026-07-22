---
id: 14ce85e5-babe-563f-ad4a-3884f5596132
slug: types-mix-widths
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

Every PowerPC arithmetic instruction wants full 32-bit registers, so mixing two
operands of unlike narrow widths means widening each to 32 bits first. The catch
is that the extend gets chosen one operand at a time, according to whatever that
operand's own type happens to be. Anything unsigned, a `u8` or a `u16`, gets the
`clrlwi` mask that zeros its top bits; anything signed, an `s8` or `s16`, gets
`extsb` or `extsh` to copy its sign up. Only once both sit at full width does the
arithmetic itself get to run.

Take `combine(a, b)`, summing a `u16` with a `u8`. Both are unsigned, so both
lean on a mask, and only the shift count separates them, since the widths are not
equal:

```asm
clrlwi r3, r3, 16   # a: keep low 16 bits (u16, zero-extended)
clrlwi r0, r4, 24   # b: keep low 8 bits  (u8, zero-extended)
add    r3, r3, r0   # 32-bit add of the two widened values
blr
```

So you get two extends and a lone `add`. Those two `clrlwi` shift amounts spell
the source widths right out for you. A `…,16` betrays a 16-bit operand, a `…,24`
an 8-bit one.

Your target pairs an unsigned operand with a signed one, which means one extend
lands as a `clrlwi` while the other shows up as `extsh` or `extsb`. Read each one
to pull back its operand's width along with its signedness, then work out how the
two end up joined.

## Your task

Write `mix_widths` to match the target assembly.

<!-- solution -->
```c
int mix_widths(u8 a, s16 b) {
    return a + b;
}
```
