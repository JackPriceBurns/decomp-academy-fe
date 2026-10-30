---
id: 781adc2a-c43a-4f6a-9eb3-42635f1a30e3
slug: gba-arithmetic-affine
title: Scale and Offset
difficulty: 4
concepts:
  - strength-reduction
  - multiply
  - immediates
symbol: func_080782e0
hints:
  - After each line, track what multiple of the original value the running
    result holds. A shift multiplies that count, and adding the original adds
    one to it.
  - The function takes two `s32` parameters and returns an `s32`. The first
    parameter is unused. The second is multiplied by 24, and then 100 is added
    to the result.
---

# Reading a chain, then the constant at the end

Scaling a value and then adding an offset covers most of the arithmetic in a
game. Examples are turning a tile index into an address, a frame counter into a
table position, or a percentage into a bar width. On this compiler, that is a
shift chain followed by one immediate instruction, and you have to read the two
parts separately.

Here is `x * 17 - 50`:

```asm
0        mov       r1, r0
2        lsl       r0, r1, #4
4        add       r0, r1
6        sub       r0, #50
8        bx        lr
```

The first three instructions are the multiply you already know. They copy the
multiplicand to another register, shift by 4 for sixteen times the value, and
add the original for seventeen times. The fourth instruction is the offset. You
can recognise it because it uses an **immediate** instead of a register. The
chain itself only ever refers back to the saved multiplicand.

Longer chains work the same way. Track the running factor line by line:

- `lsl rD, #n` multiplies the factor you have so far by 2^n.
- `add rD, rM`, where `rM` is the saved original, adds one to the factor.
- `sub rD, rM`, where `rM` is the saved original, subtracts one from it.

Start the count at 1 and apply each line in order. A chain that ends in a shift
gives an even constant. gcc splits it into an odd number times a power of two.
It builds the odd part first, and shifts at the end.

Be careful to decide where the multiply stops and the offset starts. An `lsl`
at the end of the chain belongs to the scale. The immediate `add` or `sub` after
it is the offset. If you put that boundary in the wrong place, you will look for
a constant that does not exist.

Work out the factor of the chain in your target before you look at the last
line.

## Your task

Write `func_080782e0` to reproduce the target assembly.

<!-- solution -->
```c
s32 func_080782e0(s32 a, s32 b) {
    return b * 24 + 100;
}
```
