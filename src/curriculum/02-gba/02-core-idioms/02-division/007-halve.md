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
  - The `mov` at the top happens before anything is computed, so it is protecting
    a value the rest of the function is going to need.
  - Two `s32` parameters in, an `s32` out. The second is halved and the first is
    subtracted from the result.
---

# The bias for a halving is one bit

The bias sequence from the last lesson has a branch in it, and a branch is
expensive on a chip that refills its pipeline every time one is taken. For one
divisor gcc can avoid it entirely.

Dividing by 2 needs a bias of 1 for negative values and 0 for non-negative ones.
That is the sign bit. `lsr rD, rS, #31` slides the top bit all the way to the
bottom and zeroes everything else, producing exactly 1 or 0 with no test at all,
so the add can be made unconditional:

```asm
0        lsr       r1, r0, #31
2        add       r0, r1
4        asr       r0, #1
6        bx        lr
```

The halving is three instructions, with no compare and no branch. This is the
only power of two that gets the treatment. The very next one is back to the
shape you already know:

```asm
0        cmp       r0, #0
2        bge       6 ~>
4        add       r0, #3
6      ~>asr       r0, #2
8        bx        lr
```

For every divisor from 4 upwards, the bias is a number that has to be added
conditionally, and gcc has no cheaper way to produce it than the compare.

The practical value of this is that a signed halving is unmistakable. The
sequence `lsr rN, rM, #31` / `add` / `asr #1` has no other source in gcc 2.9's
output, and it always means a signed `/ 2` is happening somewhere, even when it
turns up buried in something larger. Real GBA code is full of them —
centring a sprite, splitting a rectangle, stepping a binary search — and once
you can see the three instructions as a single unit, the surrounding arithmetic
becomes easy to read.

Note also which register `lsr` writes. It is the three-operand form, because the
value being tested has to survive to be added to. The compiler picks any free
register for the sign bit, so the name of that register is worth nothing to you
and the shape is worth everything.

Your target halves something, and it opens with an instruction that runs before
any of the arithmetic. Ask what the rest of the function would lose if that
instruction were missing.

## Your task

Write `func_080aac44` to reproduce the target assembly.

<!-- solution -->
```c
s32 func_080aac44(s32 a, s32 b) {
    return b / 2 - a;
}
```
