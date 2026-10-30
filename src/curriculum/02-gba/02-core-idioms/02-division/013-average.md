---
id: 0582d038-70af-43d1-a067-d193593a0788
slug: gba-division-average
title: Signed and Unsigned Averages
difficulty: 4
concepts:
  - division
  - signedness
  - shifts
symbol: func_080c5aa8
hints:
  - Only one of the three `add`s belongs to the halving, the one that adds the
    sign bit. Work out what the other two are doing.
  - Two `s32` parameters in, an `s32` out. It returns their sum plus one,
    halved.
---

# Signedness changes the halving

Averaging two numbers is the most common division in game code. It is also
where signedness makes the biggest difference for the smallest amount of C.
Here is half the difference between two signed values:

```asm
0        sub       r0, r1
2        lsr       r1, r0, #31
4        add       r0, r1
6        asr       r0, #1
8        bx        lr
```

That is five instructions, and three of them are the halving without a branch
from earlier in the chapter. Now here is the same expression on unsigned values:

```asm
0        sub       r0, r1
2        lsr       r0, #1
4        bx        lr
```

That is three instructions. An unsigned value cannot be negative, so there is
nothing to bias, and `/ 2` is just the shift.

This mistake can happen in both directions. If the listing has the bias and you
write `u32`, your diff will be confusing, because the C looks right and the
arithmetic is right. If the listing has no bias and you write `s32`, you get two
extra instructions. An average is so short that nothing else in the function
shows you the types. The halving is the only type information you have.

The assembly will not warn you about two more things. First, the sum can
overflow, and gcc emits no check for it. A decomp that exactly reproduces
`(a + b) / 2` also reproduces that bug. Second, `>>` on a signed sum is a
different function, one instruction shorter. Real code does use it on purpose
when it wants the result rounded down, toward negative infinity.

In real code, averages often come with extra arithmetic. That arithmetic sits
right next to the compiler's own instructions and looks exactly like them. Your
target has more `add`s than a halving needs. Find the bias sequence first.
Whatever is left over came from the C you have to write.

## Your task

Write `func_080c5aa8` to reproduce the target assembly.

<!-- solution -->
```c
s32 func_080c5aa8(s32 a, s32 b) {
    return (a + b + 1) / 2;
}
```
