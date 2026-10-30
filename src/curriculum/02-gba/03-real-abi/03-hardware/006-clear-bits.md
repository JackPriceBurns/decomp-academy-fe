---
id: e1e27c9f-f804-478c-a1d7-f8c3e6b42b5c
slug: gba-hardware-clear-bits
title: Clearing Control Bits
difficulty: 4
concepts:
  - hardware
  - bitwise
  - constants
symbol: func_0836c57c
hints:
  - A `bic` means the compiler could not work out the complement at compile
    time. So the `~` in the source was applied to something it only knows at
    run time. Everything before the `ldrh` builds that operand.
  - "One `u32` goes in and nothing comes out. The register is 0x04000004, and
    the mask being cleared is the caller's bit position ored with a constant 8."
---

# Two forms of "turn this off"

Clearing a bit is `x &= ~mask`. gcc compiles it in two very different ways,
depending on whether it knows the mask at compile time.

When the mask is a constant, the complement is computed at compile time. The
result is an `and` with an ordinary number:

```asm
0        mov       r2, #128
2        lsl       r2, #19
4        ldrh      r1, [r2, #0]
6        ldr       r0, [pc, #8] (->16)
8        and       r0, r1
10       strh      r0, [r2, #0]
12       bx        lr
14       .hword    0
16       .word     64511
```

That code turns background 2 off in `DISPCNT`. 64511 is 0xFBFF: sixteen bits of
ones with bit 10 cleared. The `~` never appears in the instructions. The mask is
also already narrowed to the width of the access. So a pool word that is mostly
ones is the sign of a bit clear with a constant mask.

When the mask is computed at run time, there is nothing to fold. Thumb has an
instruction for exactly this case:

```asm
0        ldr       r2, [pc, #12] (->16)
2        mov       r1, #3
4        lsl       r1, r0
6        ldr       r0, [r2, #0]
8        bic       r0, r1
10       str       r0, [r2, #0]
12       bx        lr
14       .hword    0
16       .word     67109376
```

`bic r0, r1` means "bit clear": `r0 &= ~r1`. The complement is part of the
instruction, so the mask register holds the bits to *remove*, exactly as the
source wrote them. `mov r1, #3` / `lsl r1, r0` is a two-bit field shifted up to
a position the compiler only learns at run time. 67109376 is `0x04000200`, the
interrupt-enable register. So this code turns off two adjacent interrupt
sources.

This gives you a reliable way to read the code. A `bic` proves that the source
complemented something whose value the compiler could not know. Whatever is in
the second register is the mask as the programmer wrote it, before the `~`.

Your target builds its mask from two pieces before the `bic`. Read those
instructions as one expression. Remember that everything inside the
parentheses of the `~` has to be built first.

## Your task

Write `func_0836c57c` to reproduce the target assembly.

<!-- solution -->
```c
void func_0836c57c(u32 bit)
{
    *(vu16 *)0x04000004 &= ~((1 << bit) | 8);
}
```
