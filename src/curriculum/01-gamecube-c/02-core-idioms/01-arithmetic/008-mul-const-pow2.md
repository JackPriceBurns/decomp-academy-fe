---
id: 881c6262-4120-5a8e-8a46-8d8ce99d5c1a
slug: arithmetic-mul-const-pow2
title: Multiply by a Power of Two
difficulty: 2
concepts:
  - strength-reduction
  - shifts
symbol: scalePow2
hints:
  - 8 is a power of two, so this is a shift, not a multiply.
  - Shifting left by 3 is the same as ×8 — write the multiply and the compiler
    reduces it for you.
---

# Strength reduction

A constant multiply usually becomes `mulli`. A **power of two** is the exception:
it never multiplies at all. The compiler rewrites it as a left shift, which is
cheaper and gives the identical answer. That rewrite has a name, **strength
reduction**, and you'll see it constantly. The shift
instruction itself is `rlwinm`, though MWCC dresses it up as the `slwi` extended
mnemonic.

Say `times16(n) = n * 16`. Out comes:

```asm
slwi r3, r3, 4    # n << 4  ==  n * 16
blr
```

The 4 is log base 2 of 16; the shift count is always log base 2 of the
multiplier. Your C can say `n * 16` or `n << 4`, and neither survives into the
object code as anything but that single shift.

A target that shifts left by some amount is hiding a multiply by two to that
power. Recover the power and you have the multiplier. `* N` and `<< log2(N)` are
interchangeable here, so the prettier one wins.

## Your task

Write `scalePow2` to match the target.

<!-- starter -->
```c
int scalePow2(int x) {
    return 0;
}
```

<!-- solution -->
```c
int scalePow2(int x) {
    return x * 8;
}
```
