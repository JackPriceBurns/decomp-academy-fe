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
  - The high halves are compared before the low half is even loaded. The second
    `ldr` sits inside the ladder because that half is only needed when the high
    halves turn out to be equal.
  - An `s64` and an `s64 *`, nothing returned. A single `if` that overwrites the
    pointed-to value when the argument is the larger of the two.
---

# The ladder, and its duplicated cmp

There is no 64-bit compare instruction, so a relational test between two pairs
becomes a three-step ladder that always has the same shape:

1. compare the **high** halves and branch on a greater-than test - `bgt` for a
   signed pair, `bhi` for an unsigned one - which settles every case where one
   high half is above the other;
2. compare the high halves **again**, so a `bne` can send the cases where they
   differ the other way to the opposite side;
3. only when the high halves are equal, compare the **low** halves with an
   unsigned condition.

Which side each branch lands on depends on where the compiler put the two
answers, so read the destination addresses rather than assuming.

Here is `a <= b` on a pair of unsigned values, materialised as a 0 or a 1:

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

`r4` holds the answer and starts at 0. `cmp r1, r3` / `bhi 18` handles the high
half of `a` being above the high half of `b`: that makes the whole comparison
false, so the branch jumps clean over the `mov r4, #1` at 16. The identical
`cmp r1, r3` then runs again so `bne 16` can catch the other way the high halves
can differ, and that one lands **on** the `mov r4, #1`. Only with the high
halves proven equal does `cmp r0, r2` look at the low halves.

The repeated `cmp` is not an optimiser failure you can write around. gcc 2.9
re-issues the comparison whenever it needs two different conditions off one
pair of operands, and a listing without the duplicate is the one that is wrong.

Two things to read off the branches. The first one is always that greater-than
test whichever direction the source comparison ran, because gcc reverses the
`cmp` operands instead of flipping the condition - so `bgt` versus `bhi` gives
you the signedness, and the operand order plus the destination address give you
`<` from `>`. The **low-half** branch is unsigned whatever the type is, since
the bottom 32 bits are a magnitude. A comparison against zero skips the ladder
entirely:

```asm
0        lsr       r0, r1, #31
2        bx        lr
```

The sign of a 64-bit value is the top bit of its high half, so `v < 0` is one
shift.

Your target runs the full ladder with one of the two values in memory, which
moves a load to a place you would not expect it.

## Your task

Write `func_083a6460` to reproduce the target assembly.

<!-- solution -->
```c
void func_083a6460(s64 v, s64 *p) {
    if (v > *p) *p = v;
}
```
