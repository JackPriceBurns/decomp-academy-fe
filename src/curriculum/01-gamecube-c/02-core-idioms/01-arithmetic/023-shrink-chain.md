---
id: abd6a2d1-a55d-55bd-8395-41a400498841
slug: arithmetic-shrink-chain
title: A Shift-Divide in a Chain
difficulty: 2
concepts:
  - arithmetic
  - division
  - strength-reduction
  - chaining
symbol: shrink3
hints:
  - An early `srwi` on an unsigned value is a constant divide; convert the shift
    amount to its power of two (`srwi rX, rX, 4` is `/ 16`).
  - After the shift, the rest of the chain is ordinary add/subtract threading
    through the scratch register.
---

# A shift-divide in a chain

You already know `slwi` stands in for a power-of-two multiply. The unsigned divide
pulls the same trick, and `srwi` at the front of a chain is really `÷ 2ⁿ`. Read it
that way and what follows is plain add/subtract threading.

Take `decay(p, q, r)`. It divides the first unsigned argument by a power of two,
then adds the second and subtracts the third.

```asm
srwi r0, r3, 5    # r0 = p >> 5  =  p / 32
add  r0, r0, r4   # r0 = (p / 32) + q
subf r3, r5, r0   # r3 = r0 - r5
blr
```

Here the `srwi` is the divide (a right shift of 5 means `÷ 32`), and it drops the
result into `r0`. From there `add` and `subf` walk the total down to `r3`. The
shift isn't anything exotic, just the first arithmetic step.

Your target runs the same way with a different shift amount. Recover the divisor
from the count, then follow the two operations after it.

## Your task

Write `shrink3`, taking three `u32`s, to reproduce the assembly above.

<!-- starter -->
```c
u32 shrink3(u32 a, u32 b, u32 c) {
    return 0;
}
```

<!-- solution -->
```c
u32 shrink3(u32 a, u32 b, u32 c) {
    return a / 8 + b - c;
}
```
