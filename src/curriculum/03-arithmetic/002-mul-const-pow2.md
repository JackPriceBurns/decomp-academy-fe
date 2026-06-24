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
extended mnemonic):

```asm
slwi r3, r3, 3    # x << 3  == x * 8
blr
```

If you wrote `x * 8` *or* `x << 3` you'd get the same instruction — they're
identical to the compiler. Recognizing that `* 8` is "really" a shift is a core
decompiler instinct.

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
