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
  - Each `ldrb` reads one element through the pointer. The immediate on the load
    is that element's byte offset.
  - "There are three `u8` reads through a single pointer, combined into an `s32`
    result. The offsets 0, 4 and 9 are the subscripts."
---

# The load widens the byte for you

The ARM7TDMI has no instruction that widens a value in a register. There is no
`sxtb` and no `uxtb`. No instruction takes eight bits and turns them into
thirty-two. The rest of this chapter follows from that fact.

The only place where widening is free is the load. `ldrb rD, [rB, #off]` reads
one byte from memory and writes it into a 32-bit register, with the top 24 bits
cleared. This makes an unsigned byte the cheapest narrow type on this machine.
It takes one instruction with nothing after it, and the value in the register
is already a correct `int`.

Here is a function that reads two bytes and adds them:

```asm
0        mov       r1, r0
2        ldrb      r0, [r1, #2]
4        ldrb      r1, [r1, #5]
6        add       r0, r1
8        bx        lr
```

The first instruction, `mov r1, r0`, is something gcc 2.9 does very often. It
copies the pointer into another register so that `r0` is free to hold the
result. After that come two byte loads, at offsets 2 and 5, and an add. There is
no masking. The compiler knows each loaded value is in the range 0..255, and
that the sum of two such values fits in the register. So there is nothing to
clean up.

The immediate on `ldrb` is a count of bytes, so it is also the array subscript.
`[r1, #5]` is element five of a byte array. Each offset gives you an index
directly.

Your target has three byte loads at three different offsets, followed by two ALU
instructions that combine the results. Work out each subscript from its offset.
Then read how the loaded values are combined.

## Your task

Write `func_081b23a0` to reproduce the target assembly.

<!-- solution -->
```c
s32 func_081b23a0(u8 *p) {
    return p[0] + p[4] - p[9];
}
```
