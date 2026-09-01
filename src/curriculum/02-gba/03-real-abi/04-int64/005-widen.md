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
  - "`asr rX, rY, #31` and `mov rX, #0` are both building a high half out of
    nothing. Which one appears depends on the signedness of the value being
    widened."
  - Three parameters - an `s32`, a `u32` and an `s64 *` - and nothing returned.
    The two 8-byte slots at +0 and +8 each receive one of them.
---

# Inventing a high half

A 32-bit value promoted to 64 bits needs a high half that does not exist yet,
and the compiler has exactly two ways to invent one. For a signed value the high
half is the sign bit repeated 32 times, which is `asr rHi, rLo, #31`. For an
unsigned value it is `mov rHi, #0`. Every widening in every listing is one of
those two instructions, and spotting which one tells you the signedness of the
value that was widened.

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
and then the usual `add`/`adc` runs on the two pairs. The interesting part is
`push {r4, lr}`: this function calls nothing and touches no memory, yet it opens
a stack frame. Each operand has to occupy a *consecutive* pair, and the two
incoming values are already adjacent in `r0` and `r1`, so one of them is moved
up out of the way and the pair it lands in reaches as far as `r4`.

The same arithmetic, widened one step later, is a different function:

```asm
0        mov       r2, r0
2        add       r2, r1
4        asr       r3, r2, #31
6        mov       r1, r3
8        mov       r0, r2
10       bx        lr
```

Add first in 32 bits, then fill the high half once. Six instructions, no frame,
no saved register. Casting only one of the operands would not have helped
either - the other is promoted implicitly and you get the first listing back.
The two spellings differ in what happens on overflow, which is exactly why you
have to read the assembly instead of guessing.

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
