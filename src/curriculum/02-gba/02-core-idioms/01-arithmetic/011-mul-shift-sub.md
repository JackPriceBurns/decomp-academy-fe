---
id: 35d25f29-b50a-4127-b863-d3020805ae6c
slug: gba-arithmetic-mul-shift-sub
title: The Subtracting Kind
difficulty: 3
concepts:
  - multiply
  - strength-reduction
  - shifts
symbol: func_08061468
hints:
  - Shift left by k and subtract the original and you have 2^k minus one copies.
    Check which register holds the shifted value and which holds the original.
  - "Three `s32` parameters in, an `s32` out, with the first unused. The third is
    scaled by 63 and the second is added to the result."
---

# One below a power of two

The other half of the strength-reduction family: constants one *below* a power of
two, built by shifting up and taking the original back off.

Here is `x * 7`:

```asm
0        mov       r1, r0
2        lsl       r0, r1, #3
4        sub       r0, r1
6        bx        lr
```

Eight copies minus one. The leading `mov` is there because the multiplicand
arrived in `r0` and the shift is about to overwrite it, so a copy has to survive
for the `sub` to read.

Now change one character in the source and multiply by −7 instead:

```asm
0        lsl       r1, r0, #3
2        sub       r0, r1
4        bx        lr
```

The negative version is **shorter**. There is no `neg` anywhere, and the copy has
vanished.

Look at what moved. gcc needs x − 8x rather than 8x − x, so it puts the shifted
copy in the scratch register and subtracts *from* the original — which is
already in `r0`, exactly where the answer belongs. Nothing needs preserving, so
nothing gets copied. Negating a multiply that ends in a subtract costs nothing at
all; it just swaps which operand is which.

That gives you a precise reading for any shift-then-subtract pair:

- the destination of the `sub` holds the **shifted** value: factor is 2^k − 1;
- the destination of the `sub` holds the **original**: factor is 1 − 2^k, a
  negative multiplier.

The distinction from the adding form is just as sharp. An `add` after the shift
means the multiplicand is being put back, so the constant sits one *above* a
power of two; a `sub` means it is being taken away, one *below*. Same two
instructions, one mnemonic apart, and the constants differ by two.

Read the shift in your target, decide which side of the subtract the original is
on, then see what the last instruction adds.

## Your task

Write `func_08061468` to reproduce the target assembly.

<!-- solution -->
```c
s32 func_08061468(s32 a, s32 b, s32 c) {
    return c * 63 + b;
}
```
