---
id: 97255fae-9bf5-43b7-8d8c-25f9d9275c63
slug: gba-memory-var-index
title: A Variable Index
difficulty: 2
concepts:
  - pointers
  - arrays
  - addressing
symbol: func_0820713c
hints:
  - Each `lsl` that feeds an `add` onto the base is one index being scaled.
    Two of them means two separate indices, each scaled once.
  - It takes one `s32 *` and two `s32` indices, and returns an `s32`. The order
    of the registers in the final `sub` tells you which index the C wrote first.
---

# When the index is not known until runtime

A constant index fits into the load's offset field. A variable index cannot,
because the field holds a fixed number. So the address has to be computed, and
the compiler always does it the same way. It scales the index by the element
size with a shift, adds it to the base, then loads at offset zero.

```asm
0        lsl       r1, #2
2        add       r1, r0
4        ldr       r1, [r1, #0]
6        lsl       r0, r1, #1
8        add       r0, r1
10       bx        lr
```

The six instructions contain two shifts that do different jobs. The `lsl r1,
#2` at the top is addressing. Each element is four bytes, so the index is
multiplied by four before it is added to the base. The `lsl r0, r1, #1`
further down is arithmetic. It is the strength-reduced multiply from the
arithmetic chapter, and it shifts the loaded value instead of an index.

To tell them apart, follow the register. A shift whose result is added to a
pointer and then dereferenced is a scale. A shift on a value that came from a
load is a multiply. In the first case, the shift amount is the base-two
logarithm of the element size. That makes it the best clue to the pointer's
type: `lsl #2` before an `add` and an `ldr` means 4-byte elements.

This next fact will save you some guessing. Thumb does have a register-offset
load, `ldr rD, [rB, rM]`, but agbcc never emits it for `ldr`, `ldrh` or `ldrb`.
The compiler always adds the scaled index to the base with a real `add` first.
Do not try to make this compiler produce a register-offset word load. It does
not produce one.

Your target scales twice before it loads anything.

## Your task

Write `func_0820713c` to reproduce the target assembly.

<!-- solution -->
```c
s32 func_0820713c(s32 *p, s32 i, s32 j) {
    return p[i] - p[j];
}
```
