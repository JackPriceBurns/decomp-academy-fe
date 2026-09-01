---
id: 5bc5c248-2a3c-4965-b803-d2950f8dab13
slug: gba-division-const-nonpow2
title: A Constant Divisor Is Still a Call
difficulty: 3
concepts:
  - division
  - helper-calls
  - constants
symbol: func_080b8054
hints:
  - The two instructions in front of the call build one number between them.
    Multiply before you read any further.
  - One `s32` parameter in, an `s32` out, divided by the constant those two
    instructions build.
---

# The constant still goes to the helper

Modern compilers turn `x / 3` into a multiply by a magic reciprocal and a shift.
gcc 2.9 targeting Thumb does not. Every constant divisor that is not a power of
two is loaded into `r1` and handed to the same helper a variable divisor would
use:

```asm
0        push      {lr}
2        mov       r1, #60
4        bl        __divsi3-4
8        pop       {r1}
10       bx        r1
```

That is a division by 60, and it costs the whole call. Two consequences. Any
`bl __divsi3` in a listing might have a constant divisor, so check `r1` before
you assume the divisor is a parameter. And when a real GBA game divides by a
constant in a hot loop, this is why it does not.

The divisor's *value* is the thing you have to recover, and materialising it
follows the ladder from the arithmetic chapter. Up to 255 it is a single `mov
r1, #k`, as above. A value that is a small number shifted left becomes `mov` and
`lsl` — and the number in the `mov` is not the divisor, so a pair like that has
to be multiplied out before it means anything. Anything else comes from the
literal pool:

```asm
0        push      {lr}
2        ldr       r1, [pc, #8] (->12)
4        bl        __divsi3-4
8        pop       {r1}
10       bx        r1
12       .word     257
```

257 needs nine significant bits, so there is no way to build it in one or two
instructions, and it is parked after the code as data. The `(->12)` points at
the row holding it.

Keep reading the `(->12)` rather than the `#8`, as you did in the arithmetic
chapter. The immediate is measured from the PC, which runs four bytes ahead of
the instruction and is rounded down to a multiple of four before the offset is
added, so it never matches the gap you can count on the page. The arrow has
already done that arithmetic.

Your target's divisor comes from the middle rung of the ladder.

## Your task

Write `func_080b8054` to reproduce the target assembly.

<!-- solution -->
```c
s32 func_080b8054(s32 x) {
    return x / 1000;
}
```
