---
id: 4981705b-197c-49bf-ad75-96c8fdf1083f
slug: bitwise-capstone-swap
title: "Capstone: A Rotate Built From Shifts"
difficulty: 3
concepts:
  - bitwise
  - shifts
  - capstone
symbol: func_802605c0
hints:
  - "Both shifts read the SAME source register, and the two amounts add up to 32. That is the rotate pattern. Write both shifts and the OR."
  - "Check each shift's direction against its operand in your C. If you swap `<<` and `>>`, the code still compiles but does not match."
---

# Building a rotate from shifts

MIPS has no rotate instruction. A rotate moves bits off one end of a register
and puts them back in at the other end. In C, a rotate is written as two
shifts of the *same* value, OR'd together, and the compiler emits exactly
that. Here is a rotate left by 8:

```asm
sll  t6, a0, 8      # everything moves up a byte, and the top byte is lost
srl  t7, a0, 24     # the same top byte, moved down to the bottom
or   v0, t6, t7     # the two parts don't overlap, so OR combines them
jr   ra
nop
```

It looks like the packing pattern from three lessons ago, but the fingerprint
is different in two ways:

- **Both shifts read the same register** (`a0` twice). One *value* is split
  into two parts, instead of two values being merged.
- **The shift amounts add up to 32** (8 + 24). The bits that `sll` pushes off
  the top are the bits that `srl` brings back at the bottom. No bit is lost,
  and the word only rotates.

When you see those two properties, you can write the C straight away:
`(x << 8) | (x >> 24)`, with an unsigned `x` so that the right shift is
`srl`.

The target below is the same idiom with different amounts. This pair of
amounts is common enough to have its own name in most codebases. Look at what
it does to the two 16-bit halves of the word. A rotate by half the width
*swaps the two halves* of the word. You will see this often in code that
packs and unpacks 16-bit values.

## Your task

Write `func_802605c0` to reproduce the target assembly.

<!-- solution -->
```c
u32 func_802605c0(u32 x) {
    return (x << 16) | (x >> 16);
}
```
