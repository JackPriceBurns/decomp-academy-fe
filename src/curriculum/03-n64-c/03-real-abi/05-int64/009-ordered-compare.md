---
id: dcee4393-324e-4aa5-a4c5-857182959048
slug: int64-ordered-compare
title: "Less, Greater: The Two-Level Compare"
difficulty: 3
concepts:
  - int64
  - comparison
  - branches
symbol: func_8033b90c
hints:
  - "Both high-half compares are `sltu`, not `slt` — what does that say about the argument type?"
  - "The first compare computes second-argument < first-argument. Which C comparison direction is that?"
---

# Ordering needs a hierarchy

`==` treated all 64 bits alike. Ordering can't: the high words outrank the
low words completely. Only if the highs *tie* do the lows get a vote. That
hierarchy needs branches. Here's `below(a, b)`, returning 1 if `s64 a < b`:

```asm
 0:  sw     a0, 0(sp)
 4:  sw     a1, 4(sp)
 8:  sw     a2, 8(sp)
 c:  sw     a3, 12(sp)
10:  lw     t6, 0(sp)      # a-high
14:  lw     t8, 8(sp)      # b-high
18:  lw     t7, 4(sp)      # a-low
1c:  lw     t9, 12(sp)     # b-low
20:  slt    v0, t6, t8     # SIGNED: a-high < b-high?
24:  bgtz   v0, 0x38       # yes — the answer is that 1, done
28:  slt    at, t8, t6     # (slot) or b-high < a-high?
2c:  bnez   at, 0x38       # yes — the answer stays 0, done
30:  nop
34:  sltu   v0, t7, t9     # highs tied: the lows decide, UNSIGNED
38:  jr     ra
3c:  nop
```

Three compares, two branches, and a subtle signed/unsigned split:

- The **high** words are compared with `slt` — *signed* — because for an
  `s64` the top word carries the sign.
- The **low** words are compared with `sltu` — *unsigned* — because a low
  word is just magnitude; its bit 31 is worth 2³¹, not a minus sign.
- The two branches ask "already greater?" then "already less?"; falling
  through both means the highs tied, and the low-word `sltu` supplies the
  final answer into `v0`.

That mixed `slt`-then-`sltu` staircase is the signature of an *ordered*
64-bit compare — once you spot it, the only questions left are the type
and the direction. For an **unsigned** comparison the high words lose
their special status and both levels use `sltu`. For direction, read the
operand order: `slt v0, x, y` computes `x < y`, so note which argument's
half sits on which side.

The target answers a different question about a different type. The two
questions above *are* the exercise.

## Your task

Write `func_8033b90c` to reproduce the target assembly.

<!-- solution -->
```c
s32 func_8033b90c(u64 a, u64 b) {
    return a > b;
}
```
