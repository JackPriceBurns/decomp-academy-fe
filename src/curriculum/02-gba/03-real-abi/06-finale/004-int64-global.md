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
  - "`ldr r2, [r4, #0]` and `ldr r3, [r4, #4]` load the two halves of one
    variable. `add`/`adc` is a single 64-bit addition that adds the pair in
    r0:r1 to the pair in r2:r3."
  - Two `.word` rows mean two globals. The second one is loaded before the
    multiply, so it is one of the multiply's operands.
  - "`void func_083fb1fc(u32 n)` is the signature. It adds `gFrameStep * n` to
    `gTotalFrames`. The product is computed in 32 bits, because there is no
    cast."
---

# A 64-bit global in two words

A 64-bit global still needs only one pool word. A pool word holds an address,
and one address covers both halves. Everything after that load changes. It takes
two loads to get the value, `add`/`adc` or `sub`/`sbc` to do the arithmetic, and
two stores to write it back. The low half is at offset 0 and the high half is at
offset 4. The ARM7TDMI is little-endian, so the word at the lower address holds
the lower half of the value.

A 32-bit operand has to be widened to 64 bits before it can be used, and the
instruction that widens it tells you whether it is signed. `asr rHi, rLo,
#31` copies the sign bit into every bit of the high word, which only makes sense
for a signed value. `mov rHi, #0` fills the high word with zeros, which only
makes sense for an unsigned value. You can read the declared type of the 32-bit
operand directly from that one instruction.

Here is `loseTime`, which subtracts a 32-bit amount from the 64-bit global
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

The address goes into r4. r4 is callee-saved, so it has to be pushed even
though this function calls nothing. If you count the live values, you can see
why the function ran out of scratch registers. r0 and r1 hold the widened
operand, r2 and r3 hold the two halves of the global, and the base address needs
a fifth register. Then `sub` and `sbc` carry the borrow from the low half into
the high half, and the two stores write the pair back.

Also read carefully **where** the widening happens compared with the other
arithmetic. If the widening comes last, the 32-bit work was done first, in
32-bit registers, with 32-bit overflow. The arithmetic was done at the narrow
width, and the result was widened afterward. A cast that widens an operand
*before* the multiply produces something very different: a `bl __muldi3`,
which calls the library routine for a full 64-bit product.

Your target has two `.word` rows, and one of the two addresses is used for
something other than the accumulator. Work out what the `mul` multiplies, and
use the widening instruction after it to decide the type.

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
