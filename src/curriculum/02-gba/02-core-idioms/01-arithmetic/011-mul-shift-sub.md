---
id: 35d25f29-b50a-4127-b863-d3020805ae6c
slug: gba-arithmetic-mul-shift-sub
title: A Shift Followed by a Subtract
difficulty: 3
concepts:
  - multiply
  - strength-reduction
  - shifts
symbol: func_08061468
hints:
  - If you shift left by k and subtract the original, you get 2^k minus one
    times the value. Check which register holds the shifted value and which
    holds the original.
  - The function takes three `s32` parameters and returns an `s32`. The first
    parameter is unused. The third is multiplied by 63, and the second is added
    to the result.
---

# Constants one below a power of two

This is the other half of the strength-reduction family: constants one *below*
a power of two. gcc builds them by shifting left and then subtracting the
original value.

Here is `x * 7`:

```asm
0        mov       r1, r0
2        lsl       r0, r1, #3
4        sub       r0, r1
6        bx        lr
```

That is eight times `x`, minus `x`. The `mov` at the start is there because the
multiplicand arrived in `r0`, and the shift is about to overwrite it. So a copy
has to be kept for the `sub` to read.

Now change one character in the source, and multiply by −7 instead:

```asm
0        lsl       r1, r0, #3
2        sub       r0, r1
4        bx        lr
```

The negative version is **shorter**. There is no `neg` anywhere, and the copy
is gone.

Look at what changed. gcc needs x − 8x instead of 8x − x. So it puts the
shifted value in the scratch register and subtracts it *from* the original. The
original is already in `r0`, which is where the answer has to go. No value
needs to be saved, so nothing is copied. Negating a multiply that ends in a
subtract costs nothing at all. It only swaps the two operands.

This gives you an exact way to read any shift followed by a subtract:

- If the `sub` destination holds the **shifted** value, the factor is 2^k − 1.
- If the `sub` destination holds the **original** value, the factor is 1 − 2^k,
  which is a negative multiplier.

You can tell this form apart from the adding form just as clearly. An `add`
after the shift means the multiplicand is added back, so the constant is one
*above* a power of two. A `sub` means it is taken away, so the constant is one
*below*. The two patterns use the same instructions apart from one mnemonic,
and their constants differ by two.

Read the shift in your target and decide which side of the subtract the
original is on. Then see what the last instruction adds.

## Your task

Write `func_08061468` to reproduce the target assembly.

<!-- solution -->
```c
s32 func_08061468(s32 a, s32 b, s32 c) {
    return c * 63 + b;
}
```
