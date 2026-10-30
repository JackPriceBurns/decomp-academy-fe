---
id: 7ed5ed80-1e1c-4fd3-8b28-290beadb0fca
slug: gba-int64-compare
title: Comparing 64-bit Values
difficulty: 5
concepts:
  - int64
  - branches
  - memory
symbol: func_083a6460
hints:
  - The high halves are compared before the low half is loaded. The second `ldr`
    sits inside the ladder, because that half is only needed when the high
    halves are equal.
  - It takes an `s64` and an `s64 *` and returns nothing. The body is a single
    `if` that overwrites the value at the pointer when the argument is the
    larger of the two.
---

# The ladder and its repeated cmp

There is no 64-bit compare instruction. A relational test between two pairs
becomes three steps of compares and branches, which this lesson calls a ladder.
It always has the same shape:

1. Compare the **high** halves and branch on a greater-than test: `bgt` for a
   signed pair, `bhi` for an unsigned one. This settles every case where one
   high half is above the other.
2. Compare the high halves **again**, so that a `bne` can catch the cases where
   they differ in the other direction and send them to the opposite side.
3. Only when the high halves are equal, compare the **low** halves with an
   unsigned condition.

Where each branch goes depends on where the compiler placed the two answers, so
read the destination addresses instead of guessing.

Here is `a <= b` on two unsigned values, computed as a 0 or a 1:

```asm
0        push      {r4, lr}
2        mov       r4, #0
4        cmp       r1, r3
6        bhi       18 ~>
8        cmp       r1, r3
10       bne       16 ~>
12       cmp       r0, r2
14       bhi       18 ~>
16     ~>mov       r4, #1
18     ~>mov       r0, r4
20       pop       {r4}
22       pop       {r1}
24       bx        r1
```

`r4` holds the answer and starts at 0. `cmp r1, r3` / `bhi 18` handles the case
where the high half of `a` is above the high half of `b`. That makes the whole
comparison false, so the branch jumps past the `mov r4, #1` at 16. Then the same
`cmp r1, r3` runs again, so that `bne 16` can catch the other way the high
halves can differ. That branch lands **on** the `mov r4, #1`. Only when the high
halves are known to be equal does `cmp r0, r2` compare the low halves.

You cannot write the C in a way that removes the repeated `cmp`. gcc 2.9 issues
the comparison again whenever it needs two different conditions from one pair
of operands. If your listing has no repeated `cmp`, your listing is the one that
is wrong.

You can read two things from the branches. The first branch is always the
greater-than test, whatever direction the source comparison used, because gcc
swaps the `cmp` operands instead of changing the condition. So `bgt` or `bhi`
tells you the signedness, and the operand order together with the destination
address tells you `<` from `>`. The **low-half** branch is unsigned whatever the
type is, because the bottom 32 bits are a plain magnitude with no sign.

A comparison against zero does not use the ladder at all:

```asm
0        lsr       r0, r1, #31
2        bx        lr
```

The sign of a 64-bit value is the top bit of its high half, so `v < 0` is one
shift.

Your target runs the full ladder with one of the two values in memory, and that
moves one of the loads to an unusual place.

## Your task

Write `func_083a6460` to reproduce the target assembly.

<!-- solution -->
```c
void func_083a6460(s64 v, s64 *p) {
    if (v > *p) *p = v;
}
```
