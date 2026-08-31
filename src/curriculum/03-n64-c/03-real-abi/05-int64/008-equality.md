---
id: a8b7c6b7-2435-42a1-b2b4-3d3b5bcbf5ca
slug: int64-equality
title: Are They Equal? xor, or, sltiu
difficulty: 3
concepts:
  - int64
  - comparison
  - branchless
symbol: func_8022df18
hints:
  - "The tail — xor, xor, or, sltiu — is the equality chain from the worked example, unchanged."
  - "Look at what the two addiu-from-zero lines build. That pair is the value `x` is being compared against."
---

# Equality without a single branch

Comparing two `s64`s for equality sounds like branching work — check the
highs, then maybe the lows. IDO does it with no branches at all. Here's
`same(a, b)`, which returns 1 if two `s64`s are equal, else 0:

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

The trick is beautiful: `xor` lights up exactly the bits where two words
*disagree*, so xor-ing both pairs and `or`-ing the results gives a word
that's zero **only when all 64 bits match**. The closing `sltiu reg, reg, 1`
is the "is it zero?" idiom — only zero is unsigned-less-than 1. Four
instructions, no branches, and the whole thing reads as one unit:
*xor, xor, or, sltiu* means `==` on 64 bits.

One quirk to expect in the wild: when one side of the comparison is a
**constant**, the compiler still plays the same game — it materializes the
constant as a register pair first, with the low-effort loads you know, and
then xors against it. At this debug level it does so even when the constant
is something a human would special-case. The chain survives verbatim; only
where the second pair *comes from* changes.

That's the target: same tail, but one side of the comparison isn't an
argument. Read what the pair-building instructions produce, and say it in C.

## Your task

Write `func_8022df18` to reproduce the target assembly.

<!-- solution -->
```c
s32 func_8022df18(s64 x) {
    return x == 0;
}
```
