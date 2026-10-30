---
id: 75e5c560-f861-493b-adb4-07eaee634255
slug: gba-types-mixed
title: Mixing Widths
difficulty: 4
concepts:
  - narrow-types
  - promotion
  - comparisons
symbol: func_081ec484
hints:
  - Both shift pairs are complete here, so this is not the same-width comparison
    shortcut. Work out the width and signedness of each pair separately.
  - "The parameters are a `u8` and an `s16`, in that order. The `s32` result is
    one comparison between them."
---

# One expression, two widths

Promotion applies to each operand separately. When an expression mixes a `u8`
with an `s16`, each one is widened to `int` according to its own type. So the
function contains two different patterns at once, and you read each one on its
own.

For values in registers, this means two shift pairs with different counts:

```asm
0        lsl       r1, #24
2        lsr       r1, #24
4        lsl       r0, #16
6        asr       r0, #16
8        sub       r0, r1
10       bx        lr
```

`r1` is shifted by 24 and uses `lsr`, so it is a `u8`. `r0` is shifted by 16
and uses `asr`, so it is an `s16`. The subtraction then happens between two
correct 32-bit values, as C requires.

When the values are read through pointers, each width uses its own load
instruction instead:

```asm
0        mov       r2, r0
2        mov       r3, #0
4        ldrsh     r0, [r1, r3]
6        ldrb      r1, [r2, #3]
8        sub       r0, r1
10       bx        lr
```

There is one `ldrb` for the byte array. For the halfword array, a zero is put in
a register and used with `ldrsh`. The expression is the same as before. This
time the widths are shown by which load instruction is used, instead of by shift
counts.

Mixing widths has a real cost in comparisons. In an earlier lesson, two operands
of the same width were compared at the top of the register, after one `lsl`
each. That shortcut needs both values shifted by the same amount, so it cannot
be used when the widths differ. Instead, each operand is fully extended,
including the second shift, and the `cmp` runs on the real values.

Your target does exactly that. Both pairs are complete, and the zero for the
result is put into a register between them.

## Your task

Write `func_081ec484` to reproduce the target assembly.

<!-- solution -->
```c
s32 func_081ec484(u8 a, s16 b) {
    return a < b;
}
```
