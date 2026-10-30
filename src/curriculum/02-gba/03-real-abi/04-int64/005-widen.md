---
id: b5621a53-faf4-4534-9a82-d8dfef6549ba
slug: gba-int64-widen
title: Widening to 64 Bits
difficulty: 4
concepts:
  - int64
  - types
  - memory
symbol: func_0839d578
hints:
  - "`asr rX, rY, #31` and `mov rX, #0` both build a new high half. Which one
    appears depends on whether the value being widened is signed."
  - It takes three parameters (an `s32`, a `u32` and an `s64 *`) and returns
    nothing. The two 8-byte slots at +0 and +8 each get one of the first two
    parameters.
---

# Building a high half

When a 32-bit value is promoted to 64 bits, it needs a high half that does not
exist yet. The compiler has exactly two ways to create one. For a signed value,
the high half is the sign bit repeated 32 times, which is `asr rHi, rLo, #31`.
For an unsigned value, it is `mov rHi, #0`. Every widening in every listing uses
one of those two instructions, and the one you see tells you whether the widened
value was signed.

Here is a sum of two 32-bit values done in 64-bit arithmetic:

```asm
0        push      {r4, lr}
2        mov       r3, r0
4        asr       r4, r3, #31
6        asr       r2, r1, #31
8        add       r3, r1
10       adc       r4, r2
12       mov       r1, r4
14       mov       r0, r3
16       pop       {r4}
18       pop       {r2}
20       bx        r2
```

`asr r4, r3, #31` and `asr r2, r1, #31` fill the high halves of both operands,
and then the usual `add`/`adc` runs on the two pairs. Look at `push {r4, lr}`.
This function calls nothing and touches no memory, but it still opens a stack
frame. Each operand has to sit in a *consecutive* pair of registers. The two
incoming values are already next to each other in `r0` and `r1`, so one of them
is moved up out of the way, and the pair it moves into reaches as far as `r4`.

If the widening happens one step later, the same arithmetic gives a different
function:

```asm
0        mov       r2, r0
2        add       r2, r1
4        asr       r3, r2, #31
6        mov       r1, r3
8        mov       r0, r2
10       bx        lr
```

This version adds in 32 bits first, then fills the high half once. It is six
instructions, with no frame and no saved register. Casting only one of the
operands would not give you this version. The other operand is promoted
implicitly, and you get the first listing back. The two ways of writing it give
different results on overflow, so you have to read the assembly instead of
guessing which one the source used.

Your target contains both fills, and the offsets tell you where each result
went.

## Your task

Write `func_0839d578` to reproduce the target assembly.

<!-- solution -->
```c
void func_0839d578(s32 a, u32 b, s64 *p) {
    p[0] = a;
    p[1] = b;
}
```
