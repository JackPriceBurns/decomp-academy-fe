---
id: 0582d038-70af-43d1-a067-d193593a0788
slug: gba-division-average
title: The Average Trap
difficulty: 4
concepts:
  - division
  - signedness
  - shifts
symbol: func_080c5aa8
hints:
  - Only one of the three `add`s belongs to the halving — the one that adds the
    sign bit back on. Work out what the other two are doing.
  - Two `s32` parameters in, an `s32` out. Their sum, plus one, halved.
---

# The same three characters, twice the code

Averaging two numbers is the most common division in game code, and it is the
place where signedness costs you the most per character of C. Here is half the
gap between two signed values:

```asm
0        sub       r0, r1
2        lsr       r1, r0, #31
4        add       r0, r1
6        asr       r0, #1
8        bx        lr
```

Five instructions, three of them the branchless halving from earlier in the
chapter. Now the identical expression on unsigned values:

```asm
0        sub       r0, r1
2        lsr       r0, #1
4        bx        lr
```

Three. The sign bit cannot be set, so there is nothing to bias, and `/ 2`
collapses to the shift.

This is a trap in both directions. Reading a listing with the bias in it and
writing `u32` gives you a diff you will stare at for a while, because the C looks
right and the arithmetic is right. Reading a listing without the bias and writing
`s32` gives you two spare instructions. The average is short enough that
nothing else in the function disambiguates the types for you — the halving *is*
the type information.

Two more things about averages that the assembly will not warn you about. The
sum can overflow, and gcc emits no check for it; a decomp that faithfully
reproduces `(a + b) / 2` is faithfully reproducing that bug. And `>>` on a signed
sum is a genuinely different function, one instruction shorter, which real code
does use deliberately when it wants the flooring behaviour.

Averages in real code rarely arrive plain, and the extra arithmetic lands right
next to the compiler's own, in instructions that look exactly like it. Your
target has more `add`s in it than a halving needs. Find the bias sequence first,
and whatever is left over is yours.

## Your task

Write `func_080c5aa8` to reproduce the target assembly.

<!-- solution -->
```c
s32 func_080c5aa8(s32 a, s32 b) {
    return (a + b + 1) / 2;
}
```
