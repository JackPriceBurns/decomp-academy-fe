---
id: 3baf8882-cbfa-44b7-9130-e50b940d9bc8
slug: int64-bitwise-halves
title: Bitwise Operations on Each Half
difficulty: 2
concepts:
  - int64
  - bitwise
  - register-pairing
symbol: func_802ebe20
hints:
  - "This has the same structure as the worked example. Only the operation applied to each pair is different, so read its mnemonic."
  - "First label the four loaded registers as a-high, a-low, b-high and b-low. Then the two combining instructions show you what happens to each half."
---

# The simplest 64-bit operations

Start with the 64-bit operations that are least affected by the split. A
bitwise operation treats every bit independently. Nothing carries from one bit
to the next, so on a split value it is *the same instruction twice*: once for
the high words and once for the low words. Here is `mask64(a, b)`, which
returns `a & b` for two `s64`s:

```asm
sw     a0, 0(sp)      # homing stores: two s64s, four words
sw     a1, 4(sp)
sw     a2, 8(sp)
sw     a3, 12(sp)
lw     t6, 0(sp)      # a-high
lw     t7, 4(sp)      # a-low
lw     t8, 8(sp)      # b-high
lw     t9, 12(sp)     # b-low
and    v0, t6, t8     # high halves combined…
and    v1, t7, t9     # …low halves combined
jr     ra
nop
```

Ten of these instructions are overhead, and only two do the real work.
Practice the labeling from the last lesson: offsets 0/4 hold the first
argument's high and low words, and 8/12 hold the second argument's. Once you
have named the four `lw`s, the result is clear. High is combined with high
into `v0`, low is combined with low into `v1`, and no bits move between the
two pairs.

This "same operation twice" shape covers `&`, `|` and `^` on 64-bit values.
When you see it (four homing stores, four loads, and two instructions with the
same mnemonic writing `v0` and `v1`), the C is one operator between two `s64`
arguments. The mnemonic tells you which operator it is.

The target uses a different bitwise instruction. Read it the same way.

## Your task

Write `func_802ebe20` to reproduce the target assembly.

<!-- solution -->
```c
s64 func_802ebe20(s64 a, s64 b) {
    return a | b;
}
```
