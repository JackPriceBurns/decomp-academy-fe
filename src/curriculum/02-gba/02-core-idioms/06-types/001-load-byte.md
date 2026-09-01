---
id: aa857096-290d-4168-8b69-11e4575d73a8
slug: gba-types-load-byte
title: Loading a Byte
difficulty: 1
concepts:
  - narrow-types
  - loads
  - pointers
symbol: func_081b23a0
hints:
  - Each `ldrb` is one element read through the pointer, and the immediate on
    the load is that element's byte offset.
  - "Three `u8` reads through a single pointer, combined into an `s32` result -
    the offsets 0, 4 and 9 are the subscripts."
---

# The load that has already done the work

The ARM7TDMI has no instruction that widens a value in a register. There is no
`sxtb`, no `uxtb`, nothing that takes eight bits and turns them into
thirty-two. Everything you are about to see in this chapter follows from that.

The one place where widening comes free is the load. `ldrb rD, [rB, #off]`
fetches a single byte from memory and writes it into a 32-bit register with the
top 24 bits cleared. An unsigned byte is therefore the cheapest narrow type on
this machine: one instruction, no follow-up, and the value that lands in the
register is already a correct `int`.

Here is a function reading two bytes and adding them:

```asm
0        mov       r1, r0
2        ldrb      r0, [r1, #2]
4        ldrb      r1, [r1, #5]
6        add       r0, r1
8        bx        lr
```

The opening `mov r1, r0` is a gcc 2.9 habit you will see constantly: it copies
the pointer somewhere safe so `r0` is free to receive the result. Then two byte
loads at offsets 2 and 5, and an add. No masking anywhere. The compiler knows
each loaded value is 0..255 and that the sum of two of them cannot leave the
register, so there is nothing to clean up.

The immediate on `ldrb` is a plain byte count, so it is also the array
subscript: `[r1, #5]` is element five of a byte array. Read the offsets and you
have read the indices.

Your target has three byte loads at three offsets and two ALU instructions
folding the results together. Work out each subscript from its offset, then read
how the loaded values combine.

## Your task

Write `func_081b23a0` to reproduce the target assembly.

<!-- solution -->
```c
s32 func_081b23a0(u8 *p) {
    return p[0] + p[4] - p[9];
}
```
