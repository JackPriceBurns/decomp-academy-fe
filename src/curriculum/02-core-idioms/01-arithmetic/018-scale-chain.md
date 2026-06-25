---
id: arithmetic-scale-chain
title: A Shift Inside a Mixed Chain
difficulty: 2
concepts:
  - arithmetic
  - multiplication
  - strength-reduction
  - chaining
symbol: scale3
hints:
  - A lone `slwi` early in a chain is a constant multiply; convert the shift
    amount to its power of two (`slwi rX, rX, 4` is `× 16`).
  - After the shift, the rest of the chain is ordinary add/subtract threading
    through the scratch register.
---

# A shift inside a mixed chain

Now drop a constant multiply into a longer chain. Because `× 2ⁿ` becomes a
`slwi`, the first step of the chain can be a *shift* even though, in C, it reads
as a multiplication. The remaining steps are the ordinary add/subtract threading
you already know.

Consider `offset(p, q, r)`, which scales the first argument by a power of two,
adds the second, and subtracts the third:

```asm
slwi r0, r3, 5    # r0 = p << 5  =  p * 32
add  r0, r4, r0   # r0 = q + (p * 32)
subf r3, r5, r0   # r3 = r0 - r5
blr
```

The `slwi` strength-reduces the constant multiply (shift by 5 is `× 32`), parks
the scaled value in `r0`, and the `add`/`subf` carry the running total to `r3`.
Don't let the shift throw you — it's just the first arithmetic step.

The target assembly follows the same shape — a constant-multiply shift, then two
more operations — but with a different shift amount. Read the shift count to
recover the multiplier, then trace the rest of the chain.

## Your task

Write `scale3`, taking three `int`s, to reproduce the assembly above.

<!-- starter -->
```c
int scale3(int a, int b, int c) {
    return 0;
}
```

<!-- solution -->
```c
int scale3(int a, int b, int c) {
    return a * 8 + b - c;
}
```
