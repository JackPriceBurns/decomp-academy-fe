---
id: d2e36555-cf86-4f59-9973-772b1810399f
slug: gba-division-pow2-unsigned
title: An Unsigned Divide That Is Free
difficulty: 2
concepts:
  - division
  - shifts
  - strength-reduction
symbol: func_080a1e30
hints:
  - Two shifts with different amounts, and then an add. Turn each shift amount
    back into the divisor it stands for.
  - Two `u32` parameters in, a `u32` out. Each is divided by its own power of two
    and the two quotients are added.
---

# When the divisor is a power of two

Everything so far has cost a call. A constant divisor lets the compiler pick the
algorithm at compile time instead, and when that constant is a power of two and
the dividend is unsigned, the algorithm is a single instruction.

`lsr` — **l**ogical **s**hift **r**ight — slides the bits down and feeds zeros
in at the top. Sliding down by `n` throws away the bottom `n` bits, which is
precisely what dividing an unsigned number by 2 to the power `n` does. Dividing
by 64 is this whole function:

```asm
0        lsr       r0, #6
2        bx        lr
```

No `push {lr}`, no helper, no frame. The function is a leaf again, and that is
the first thing to check when you meet a listing with no `push` in it: whatever
division it does, the divisor was a constant the compiler could reduce.

The shift amount is the exponent. `lsr #6` divides by 64, `lsr #3` by 8, `lsr
#10` by 1024. Read it as a power of two and never as the number itself.

Be honest about what that listing does *not* tell you. `v >> 6` on an unsigned
value compiles to the same single instruction, so an `lsr` gives you no way to
recover which of the two the author wrote. Both spellings match. Pick whichever
reads better for the value in question — a right shift for something you think
of as a bit field, a division for something you think of as a number.

Here is a longer one, converting a pixel coordinate pair into a tile index in a
32-tile-wide map:

```asm
0        mov       r2, r0
2        lsr       r0, r1, #3
4        lsl       r0, #5
6        lsr       r2, #3
8        add       r0, r2
10       bx        lr
```

The second argument is divided by 8 into `r0`, multiplied by 32 with the `lsl
#5` you met in the arithmetic chapter, and the first argument — parked in `r2`
by that opening `mov` because `r0` was about to be overwritten — is divided by 8
and added on. Three constants, no `mul`, no `bl`.

Your target divides by two different powers of two. Decode each shift on its own
before you decide what happens to the results.

## Your task

Write `func_080a1e30` to reproduce the target assembly.

<!-- solution -->
```c
u32 func_080a1e30(u32 a, u32 b) {
    return a / 8 + b / 4;
}
```
