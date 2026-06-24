---
id: arithmetic-mul-const-pow2
title: Multiply by a Power of Two
difficulty: 2
concepts:
  - strength-reduction
  - shifts
symbol: times8
hints:
  - 8 is a power of two, so this is a shift, not a multiply.
  - Shifting left by 3 is the same as ×8 — write the multiply and the compiler
    reduces it for you.
---

# Strength reduction

Compilers replace expensive operations with cheap equivalent ones — **strength
reduction**. Multiplying by a power of two becomes a left shift, which on
PowerPC is the `rlwinm` rotate instruction (MWCC prints it via the `slwi`
extended mnemonic).

For example, `times16(n) = n * 16` compiles to:

```asm
slwi r3, r3, 4    # n << 4  ==  n * 16
blr
```

The shift amount is the base-2 logarithm of the multiplier: `2^4 = 16`, so the
shift is 4. If you write `n * 16` *or* `n << 4` in C you get the same
instruction — they are identical to the compiler.

Look at the shift amount in the target assembly and ask: what power of two does
that correspond to? That's your multiplier. Either `* N` or `<< log2(N)` will
match — pick whichever reads more naturally as C.

## Your task

Write `times8` to match the target.

<!-- starter -->
```c
int times8(int x) {
    return 0;
}
```

<!-- solution -->
```c
int times8(int x) {
    return x * 8;
}
```
