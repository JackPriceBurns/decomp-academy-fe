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
  - A `bic` means the compiler could not fold the complement at compile time, so
    the `~` in the source was wrapped around something it only knows at run
    time. Everything before the `ldrh` is that operand being assembled.
  - "One `u32` in, nothing out. The register is 0x04000004 and the mask being
    cleared is the caller's bit position ored with a constant 8."
---

# Two spellings of "turn this off"

Clearing a bit is `x &= ~mask`, and gcc renders it two completely different ways
depending on whether it knows the mask while compiling.

When the mask is a constant, the complement is computed at compile time and the
result is just an `and` with an ordinary number:

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

That switches background 2 off in `DISPCNT`. 64511 is 0xFBFF — sixteen bits of
ones with bit 10 punched out. The `~` never reaches the instruction stream, and
the mask is already narrowed to the width of the access, so a pool word of
mostly-ones is the signature of a constant bit clear.

When the mask is computed at run time there is nothing to fold, and Thumb has an
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

`bic r0, r1` is "bit clear": `r0 &= ~r1`. The complement lives in the opcode, so
the mask register holds the bits to *remove*, in the same polarity the source
wrote them. `mov r1, #3` / `lsl r1, r0` is a two-bit field slid up to a position
the compiler only learns at run time, and 67109376 is `0x04000200`, the
interrupt-enable register — so this switches off an adjacent pair of interrupt
sources.

That gives you a reliable reading. A `bic` proves the source complemented
something the compiler could not see the value of. Whatever ends up in the
second register is the mask as the programmer wrote it, before the `~`.

Your target assembles its mask out of two pieces before the `bic` — read those
instructions as one expression, and remember that everything inside the
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
