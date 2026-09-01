---
id: fe7228f8-c5ea-4a9d-b903-85f134e104c0
slug: gba-realfinale-int64-global
title: A 64-bit Global
difficulty: 4
concepts:
  - int64
  - globals
  - carry
symbol: func_083fb1fc
hints:
  - "`ldr r2, [r4, #0]` and `ldr r3, [r4, #4]` are the two halves of one
    variable, and `add`/`adc` is a single 64-bit addition of the pair in r0:r1
    into the pair in r2:r3."
  - Two `.word` rows mean two globals. The second one is loaded before the
    multiply, so it is one of the multiply's operands.
  - "`void func_083fb1fc(u32 n)`, accumulating `gFrameStep * n` into
    `gTotalFrames`. The product is computed in 32 bits — there is no cast."
---

# Sixty-four bits, two words at a time

A 64-bit global still costs exactly one pool word, because a pool word is an
address and one address covers both halves. What changes is everything after it:
two loads to get the value, `add`/`adc` or `sub`/`sbc` to do the arithmetic, and
two stores to put it back. Low half at offset 0, high half at offset 4 — the
ARM7TDMI is little-endian, so the lower-addressed word is the lower-valued one.

A 32-bit operand has to be widened to 64 before it can join in, and the
instruction that does the widening is a free signedness oracle. `asr rHi, rLo,
#31` smears the sign bit across the whole high word, which only makes sense for
a signed source. `mov rHi, #0` fills the high word with zeros, which only makes
sense for an unsigned one. You can read the declared type of the addend straight
off that one instruction.

Here is `loseTime`, subtracting a 32-bit amount from the 64-bit global
`gElapsed`:

```asm
0        push      {r4, lr}
2        ldr       r4, [pc, #20] (->24)
4        asr       r1, r0, #31
6        ldr       r2, [r4, #0]
8        ldr       r3, [r4, #4]
10       sub       r2, r0
12       sbc       r3, r1
14       str       r2, [r4, #0]
16       str       r3, [r4, #4]
18       pop       {r4}
20       pop       {r0}
22       bx        r0
24       .word     gElapsed
```

The address goes into r4, which is callee-saved and therefore has to be pushed
even though this function calls nothing. Count the live values and you can see
why it ran out of scratch: r0 and r1 hold the widened operand, r2 and r3 hold
the two halves of the global, and the base address needs a fifth register. Then
`sub` and `sbc` carry the borrow across the seam, and the two stores put the
pair back.

The other thing to read carefully is **where** the widening sits relative to any
other arithmetic. Widening last means the 32-bit work finished first, in 32-bit
registers, with 32-bit overflow — the arithmetic happened at the narrow width
and the result was stretched afterward. A cast that widens an operand *before*
the multiply produces something you cannot miss instead: a `bl __muldi3`, the
library routine for a true 64-bit product.

Your target has two `.word` rows, and one of the two addresses is used for
something other than the accumulator. Work out what the `mul` is multiplying,
and let the widening instruction that follows it settle the type.

## Your task

Write `func_083fb1fc` to reproduce the target assembly.

<!-- context -->
```c
extern u64 gTotalFrames;
extern u32 gFrameStep;
```

<!-- solution -->
```c
void func_083fb1fc(u32 n) {
    gTotalFrames += gFrameStep * n;
}
```
