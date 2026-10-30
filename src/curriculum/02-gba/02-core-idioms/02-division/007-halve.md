---
id: 03716451-7d13-4bbe-80e1-93031fb9900c
slug: gba-division-halve
title: Halving Without a Branch
difficulty: 3
concepts:
  - division
  - shifts
  - register-allocation
symbol: func_080aac44
hints:
  - The `mov` at the top runs before anything is computed, so it is saving a
    value that the rest of the function needs later.
  - Two `s32` parameters in, an `s32` out. The second is halved and the first is
    subtracted from the result.
---

# The bias for a halving is one bit

The bias sequence from the last lesson contains a branch. Branches are
expensive on this chip, because it refills its pipeline every time a branch is
taken. For one divisor, gcc can avoid the branch completely.

Dividing by 2 needs a bias of 1 for negative values and 0 for all other values.
That is exactly the sign bit. `lsr rD, rS, #31` moves the top bit all the way
down to the bottom and clears every other bit. The result is 1 or 0 without any
test, so the add can always run:

```asm
0        lsr       r1, r0, #31
2        add       r0, r1
4        asr       r0, #1
6        bx        lr
```

The halving takes three instructions, with no compare and no branch. This is
the only power of two that is handled this way. The next one already goes back
to the shape you know:

```asm
0        cmp       r0, #0
2        bge       6 ~>
4        add       r0, #3
6      ~>asr       r0, #2
8        bx        lr
```

For every divisor from 4 upwards, the bias is a number that must be added only
for negative values. gcc has no cheaper way to do that than the compare.

This means a signed halving is always recognisable. The sequence
`lsr rN, rM, #31`, `add`, `asr #1` comes from nothing else in gcc 2.9's output.
It always means a signed `/ 2` is happening, even when it is part of a larger
expression. Real GBA code has many of them, for example when centring a sprite,
splitting a rectangle or stepping through a binary search. Once you see the
three instructions as one unit, the arithmetic around them becomes much clearer.

Also note which register `lsr` writes. It uses the three-operand form, because
the value being tested must still be there for the add. The compiler uses any
free register for the sign bit, so the name of that register tells you nothing.
Only the shape matters.

Your target halves a value, and it starts with an instruction that runs before
any of the arithmetic. Ask what the rest of the function would lose without that
instruction.

## Your task

Write `func_080aac44` to reproduce the target assembly.

<!-- solution -->
```c
s32 func_080aac44(s32 a, s32 b) {
    return b / 2 - a;
}
```
