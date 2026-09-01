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
  - Track what multiple of the original value the accumulator holds after each
    line. A shift multiplies that count, an add of the original adds one to it.
  - "Two `s32` parameters in, an `s32` out, with the first unused. The second is
    scaled by 24 and 100 is added to the result."
---

# Reading a chain, then the constant on the end

Scale a value and offset it and you have most of the arithmetic in a game: a tile
index into an address, a frame counter into a table position, a percentage into a
bar width. On this compiler that is a shift chain followed by one immediate
instruction, and the two halves have to be read separately.

Here is `x * 17 - 50`:

```asm
0        mov       r1, r0
2        lsl       r0, r1, #4
4        add       r0, r1
6        sub       r0, #50
8        bx        lr
```

The first three instructions are the multiply you already know — copy the
multiplicand aside, shift by 4 for sixteen copies, add the original for
seventeen. The fourth is the offset, and it is recognisable because it carries an
**immediate** rather than a register: the chain only ever refers back to the
preserved multiplicand.

Longer chains work the same way if you track the running factor line by line:

- `lsl rD, #n` multiplies the factor you have so far by 2^n;
- `add rD, rM` where `rM` is the preserved original adds one to the factor;
- `sub rD, rM` against the original subtracts one from it.

Start the count at 1 and apply each line in order. A chain ending in a shift is
an even constant — gcc factors it as an odd number times a power of two, builds
the odd part first, and shifts at the end.

The trap is deciding where the multiply stops and the offset starts. A trailing
`lsl` belongs to the scale; the immediate `add` or `sub` after it is the offset.
Get that boundary wrong and you will be looking for a constant that does not
exist.

Count your target's chain out to its factor before you go anywhere near the last
line.

## Your task

Write `func_080782e0` to reproduce the target assembly.

<!-- solution -->
```c
s32 func_080782e0(s32 a, s32 b) {
    return b * 24 + 100;
}
```
