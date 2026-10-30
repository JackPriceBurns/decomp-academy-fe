---
id: a8b7c6b7-2435-42a1-b2b4-3d3b5bcbf5ca
slug: int64-equality
title: Equality Tests with xor, or and sltiu
difficulty: 3
concepts:
  - int64
  - comparison
  - branchless
symbol: func_8022df18
hints:
  - "The last four instructions (xor, xor, or, sltiu) are the equality chain from the worked example, unchanged."
  - "Look at what the two addiu instructions that start from zero build. That pair is the value `x` is being compared against."
---

# Equality without a single branch

Comparing two `s64`s for equality sounds like it needs branches: check the
high words, then maybe the low words. IDO does it with no branches at all.
Here is `same(a, b)`, which returns 1 if two `s64`s are equal and 0
otherwise:

```asm
sw     a0, 0(sp)
sw     a1, 4(sp)
sw     a2, 8(sp)
sw     a3, 12(sp)
lw     t6, 0(sp)      # a-high
lw     t7, 4(sp)      # a-low
lw     t8, 8(sp)      # b-high
lw     t9, 12(sp)     # b-low
xor    at, t6, t8     # every bit where the high halves differ
xor    v0, t7, t9     # every bit where the low halves differ
or     v0, v0, at     # any differing bit, anywhere in 64?
sltiu  v0, v0, 1      # nothing differs → 1, something does → 0
jr     ra
nop
```

Here is how it works. `xor` sets exactly the bits where two words *differ*.
So if you xor both pairs and `or` the results together, you get a word that is
zero **only when all 64 bits match**. The final `sltiu reg, reg, 1` is the "is
it zero?" idiom, because only zero is unsigned-less-than 1. These four
instructions have no branches, and you can read them as one unit: *xor, xor,
or, sltiu* means `==` on 64 bits.

Expect one quirk in real code. When one side of the comparison is a
**constant**, the compiler still uses the same chain. It first builds the
constant in a register pair, using the cheap loads you already know, and then
xors against it. At this debug level it does this even for a constant that a
human would handle as a special case. The chain stays exactly the same. Only
the place the second pair *comes from* is different.

The target has the same final chain, and one side of its comparison is not an
argument. Work out what the pair-building instructions produce, and write
that in C.

## Your task

Write `func_8022df18` to reproduce the target assembly.

<!-- solution -->
```c
s32 func_8022df18(s64 x) {
    return x == 0;
}
```
