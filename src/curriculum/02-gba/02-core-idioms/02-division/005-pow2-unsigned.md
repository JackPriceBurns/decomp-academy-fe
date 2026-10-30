---
id: d2e36555-cf86-4f59-9973-772b1810399f
slug: gba-division-pow2-unsigned
title: Unsigned Division by a Power of Two
difficulty: 2
concepts:
  - division
  - shifts
  - strength-reduction
symbol: func_080a1e30
hints:
  - There are two shifts with different amounts, and then an add. Turn each
    shift amount back into the divisor it stands for.
  - Two `u32` parameters in, a `u32` out. Each is divided by its own power of two
    and the two quotients are added.
---

# When the divisor is a power of two

Every division so far has needed a call. When the divisor is a constant, the
compiler can choose a different method at compile time. When that constant is a
power of two and the dividend is unsigned, the method is a single instruction.

`lsr` (**l**ogical **s**hift **r**ight) moves the bits down and fills the top
with zeros. Shifting down by `n` throws away the bottom `n` bits. That is
exactly what dividing an unsigned number by 2 to the power `n` does. Here is a
whole function that divides by 64:

```asm
0        lsr       r0, #6
2        bx        lr
```

There is no `push {lr}` and no helper call, so there is no frame. The function
is a leaf again. Check for this first when you find a listing with no `push` in
it: whatever division it does, the divisor was a constant that the compiler
could replace with cheaper instructions.

The shift amount is the exponent. `lsr #6` divides by 64, `lsr #3` by 8, and `lsr
#10` by 1024. Always read the amount as a power of two, never as the divisor
itself.

There is one thing this listing does *not* tell you. `v >> 6` on an unsigned
value compiles to the same single instruction, so an `lsr` cannot tell you
which of the two the author wrote. Both spellings match. Pick the one that reads
better for the value: a right shift for something you think of as a bit field,
and a division for something you think of as a number.

Here is a longer example. It converts a pair of pixel coordinates into a tile
index in a map 32 tiles wide:

```asm
0        mov       r2, r0
2        lsr       r0, r1, #3
4        lsl       r0, #5
6        lsr       r2, #3
8        add       r0, r2
10       bx        lr
```

The second argument is divided by 8 into `r0`, then multiplied by 32 by the `lsl
#5` you met in the arithmetic chapter. The first argument was copied to `r2` by
the opening `mov`, because `r0` was about to be overwritten. It is divided by 8
and added on. The function uses three constants and has no `mul` and no `bl`.

Your target divides by two different powers of two. Work out each shift
separately before you decide what happens to the results.

## Your task

Write `func_080a1e30` to reproduce the target assembly.

<!-- solution -->
```c
u32 func_080a1e30(u32 a, u32 b) {
    return a / 8 + b / 4;
}
```
