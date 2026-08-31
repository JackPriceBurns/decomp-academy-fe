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
symbol: func_80133a14
hints:
  - "Each narrow operand is widened to 32 bits *before* the arithmetic — one
    extend per operand, chosen by that operand's own type."
  - "A `u8` widens with `clrlwi …,24` (zero-extend); an `s16` widens with `extsh`
    (sign-extend). Then a single `add` combines them."
---

# Don't mix widths before you extend each side

PowerPC arithmetic works on full 32-bit registers. When you add two narrow
operands of different widths, the compiler widens each one separately before
the add. The choice of extend is per-operand: unsigned values zero-extend,
signed values sign-extend. Then a single `add` does the real work.

Take `combine(a, b)`, adding a `u16` to a `u8`. Both are unsigned, so both use
masks — the only difference is how many bits to keep:

```asm
clrlwi r3, r3, 16   # a: keep low 16 bits (u16, zero-extended)
clrlwi r0, r4, 24   # b: keep low 8 bits  (u8, zero-extended)
add    r3, r3, r0   # 32-bit add of the widened values
blr
```

Two extends, one `add`. The shift counts in the `clrlwi`s tell you the source
widths: `…,16` is 16-bit, `…,24` is 8-bit.

Your target pairs an unsigned operand with a signed one, so one extend is
`clrlwi` and the other is `extsh` or `extsb`. Read each one to recover its
width and signedness, then work out how they fit together.

## Your task

Write `func_80133a14` to match the target assembly.

<!-- solution -->
```c
int func_80133a14(u8 a, s16 b) {
    return a + b;
}
```
