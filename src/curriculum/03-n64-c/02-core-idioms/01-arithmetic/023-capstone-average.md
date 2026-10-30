---
id: 4013a287-c1c7-4896-81d2-554702f75635
slug: arithmetic-capstone-average
title: "Capstone: The Average"
difficulty: 4
concepts:
  - arithmetic
  - divide
  - shifts
  - delay-slots
  - capstone
symbol: func_80004e88
hints:
  - "An addition feeds into a guarded `sra` pair. You have decoded that divide shape before. This time its input is a sum instead of an argument."
  - "The fix-up block ends by copying its result into the return register with an `or` with `zero`. None of that is extra C. One expression produces the whole listing."
---

# A sum fed into a divide

This is the last capstone. Game code computes averages all the time, for
positions, blends and midpoints. They compile into the pieces this chapter
taught, combined. Here's an average of three values, `(p + q + r) / 3`:

```asm
addu  t6, a0, a1     # t6 = p + q
addu  v0, t6, a2     # v0 = p + q + r
addiu at, zero, 3
div   zero, v0, at   # LO = sum / 3
mflo  v0
nop
nop
jr    ra
nop
```

First the sum, then the divide sequence you already know. Note one thing about
the structure: the `div` uses `v0`, the *computed sum*, instead of an argument
register. As with the multiply chain in the first capstone, the sub-expression
feeds into the input of the pattern. Finding that register is the first step
of decoding.

The target below divides its sum by a different constant, one that the
compiler handles without the divide unit at all. After the sum comes the
*guarded* shape: a branch, an `sra` in the delay slot that does two jobs, a
small bias, and a final register copy that moves the result into `v0`. You
have seen every line of it earlier in this chapter. The only new part is
seeing them together.

Read it in two passes, as with every compound expression. First, name the
value that the first instruction computes. Then recognize the pattern that the
value feeds into. Write the one line of C. This two-pass habit is the main
skill of this chapter, and you will use it from now on.

## Your task

Write `func_80004e88` to reproduce the target assembly.

<!-- solution -->
```c
s32 func_80004e88(s32 a, s32 b) {
    return (a + b) / 2;
}
```
