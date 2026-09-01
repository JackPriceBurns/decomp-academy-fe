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
  - Both shift pairs are complete here, which rules out the same-width
    comparison shortcut - solve each pair separately for its own width and
    signedness.
  - "A `u8` and an `s16`, in that order, and the `s32` result is one comparison
    between them."
---

# One expression, two widths

Promotion is per operand. When an expression mixes a `u8` with an `s16`, each
one is widened to `int` on its own terms, so the function carries two different
narrowing shapes at once and you read them independently.

In registers that means two shift pairs with different counts:

```asm
0        lsl       r1, #24
2        lsr       r1, #24
4        lsl       r0, #16
6        asr       r0, #16
8        sub       r0, r1
10       bx        lr
```

`r1` gets 24 and `lsr`, so it is a `u8`. `r0` gets 16 and `asr`, so it is an
`s16`. The subtraction then happens between two honest 32-bit values, which is
what C requires.

Through pointers, each width brings its own load instruction instead:

```asm
0        mov       r2, r0
2        mov       r3, #0
4        ldrsh     r0, [r1, r3]
6        ldrb      r1, [r2, #3]
8        sub       r0, r1
10       bx        lr
```

One `ldrb` for the byte array, one materialised zero and `ldrsh` for the
halfword array. Same expression shape as before, and the widths are now spelled
out by which load appeared rather than by shift counts.

Comparisons are where mixing widths costs you something real. In the last lesson
two same-width operands were compared up at the top of the register with a lone
`lsl` each. That shortcut needs both values shifted by the same amount, so as
soon as the widths differ it is off the table: each operand is fully extended,
second shift and all, and the `cmp` runs on the real values.

Your target does exactly that. Both pairs are complete, and the zero for the
result is materialised in the gap between them.

## Your task

Write `func_081ec484` to reproduce the target assembly.

<!-- solution -->
```c
s32 func_081ec484(u8 a, s16 b) {
    return a < b;
}
```
