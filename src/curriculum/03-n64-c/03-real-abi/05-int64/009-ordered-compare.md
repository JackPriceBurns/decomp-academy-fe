---
id: dcee4393-324e-4aa5-a4c5-857182959048
slug: int64-ordered-compare
title: "Less and Greater: The Two-Level Compare"
difficulty: 3
concepts:
  - int64
  - comparison
  - branches
symbol: func_8033b90c
hints:
  - "Both high-half compares are `sltu`, not `slt`. What does that tell you about the argument type?"
  - "The first compare computes second-argument < first-argument. Which C comparison direction is that?"
---

# Ordering needs two levels

`==` treated all 64 bits the same way. Ordering cannot do that, because the
high words completely outrank the low words. The low words only matter if the
high words are *equal*. That order of priority needs branches. Here is
`below(a, b)`, which returns 1 if `s64 a < b`:

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
24:  bgtz   v0, 0x38       # yes: the answer is that 1, done
28:  slt    at, t8, t6     # (slot) or b-high < a-high?
2c:  bnez   at, 0x38       # yes: the answer stays 0, done
30:  nop
34:  sltu   v0, t7, t9     # highs tied: the lows decide, UNSIGNED
38:  jr     ra
3c:  nop
```

This uses three compares, two branches, and a careful split between signed
and unsigned:

- The **high** words are compared with `slt`, which is *signed*, because the
  top word of an `s64` holds the sign.
- The **low** words are compared with `sltu`, which is *unsigned*, because a
  low word is only a magnitude. Its bit 31 is worth 2³¹ and is not a sign bit.
- The first branch checks whether the first argument is already less, and
  the second checks whether it is already greater. If neither branch is
  taken, the high words were equal, and the low-word `sltu` puts the final
  answer in `v0`.

A `slt` on the high words followed by an `sltu` on the low words is the
pattern of an *ordered* 64-bit compare. Once you spot it, only two questions
are left: the type and the direction. For an **unsigned** comparison, the high
words are no longer special, and both levels use `sltu`. For the direction,
read the operand order: `slt v0, x, y` computes `x < y`, so note which
argument's half is on which side.

The target answers a different question about a different type. Those two
questions *are* the exercise.

## Your task

Write `func_8033b90c` to reproduce the target assembly.

<!-- solution -->
```c
s32 func_8033b90c(u64 a, u64 b) {
    return a > b;
}
```
