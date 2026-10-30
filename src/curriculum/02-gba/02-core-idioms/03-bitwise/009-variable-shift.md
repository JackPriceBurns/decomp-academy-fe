---
id: fe12ad8e-f3d0-4425-a98d-eb867bff5279
slug: gba-bitwise-variable-shift
title: Shifting by a Register
difficulty: 3
concepts:
  - shifts
  - registers
  - calling-convention
symbol: func_080f2324
hints:
  - Both shifts read their count from the same register, and that register is
    never written to. It is a parameter, and it sits between the two values
    being shifted.
  - The function takes three `u32` arguments and returns a `u32`. The second
    argument is the shift amount for both of the others, and the two shifted
    values are or-ed together.
---

# A count that lives in a register

`lsl`, `lsr` and `asr` each have a second encoding that takes the shift amount
from a register instead of an immediate. It prints without a `#`, and that is
the only difference you can see:

```asm
0        mov       r2, #1
2        lsl       r2, r1
4        add       r0, r2
6        bx        lr
```

The function moves a 1 into a scratch register, shifts it up by the amount in
`r1`, and then adds it. There is no constant mask anywhere in that function,
because the value was computed. Whenever you see a small `mov` followed by a
register shift, treat the pair as a single value built at run time.

Here is the same idea with a subtraction at the end:

```asm
0        mov       r1, r0
2        mov       r0, #1
4        lsl       r0, r1
6        sub       r0, #1
8        bx        lr
```

The argument arrived in `r0`, and it had to be moved to `r1` before the 1 could
be loaded. A constant mask would have moved it in exactly the same way. The
shift then reads its count from `r1`, and one is subtracted from the result.

Thumb has no way to attach a shift to another instruction. ARM mode can write
`ldr r0, [r0, r1, lsl #2]` and do a scaled load in one instruction. Thumb has
no shifted-operand field anywhere in its encoding, so every shift is a separate
instruction, and every scaled index costs its own line. That is why GBA listings
are much longer than the ARM-mode code you may have read elsewhere. It is also
why counting shifts is a reliable way to recover the structure of the C.

One more thing to look for: a register that supplies a shift count and is never
written to is almost always a parameter. Notice which argument register it is,
and where it sits relative to the values being shifted.

## Your task

Write `func_080f2324` to reproduce the target assembly.

<!-- solution -->
```c
u32 func_080f2324(u32 a, u32 n, u32 b) {
    return (a << n) | (b >> n);
}
```
