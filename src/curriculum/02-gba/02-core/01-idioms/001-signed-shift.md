---
id: gba-idioms-signed-shift
title: Signed Division by a Power of Two
difficulty: 2
concepts:
  - arithmetic
  - shifts
symbol: div16
hints:
  - Dividing a signed value by a power of two is not a bare arithmetic shift.
  - For negatives the compiler adds a bias first so the quotient truncates toward
    zero, then shifts.
---

# Why signed division isn't just a shift

Dividing an **unsigned** value by eight is a single `lsr #3`. Signed division is
trickier: an arithmetic shift rounds toward negative infinity, but C requires
division to truncate toward zero. So for a signed `/ 8` the compiler biases
negative values before shifting. A function that divides its argument by eight
compiles to this:

```asm
cmp	r0, #0
bge	.L3
add	r0, r0, #0x7
asr	r0, r0, #0x3
bx	lr
```

When the value is non-negative (`bge`) it shifts straight away. When it is
negative it first adds `2^n - 1` — here `#0x7` for a `>> 3` — so the truncation
lands on the correct side of zero, then does the arithmetic shift `asr`.

Read the target: the `asr` amount tells you the power of two, and the added bias
confirms it.

## Your task

Write `div16`, taking an `int`, to reproduce the target assembly.

<!-- starter -->
```c
int div16(int x) {
    return 0;
}
```

<!-- solution -->
```c
int div16(int x) {
    return x / 16;
}
```
