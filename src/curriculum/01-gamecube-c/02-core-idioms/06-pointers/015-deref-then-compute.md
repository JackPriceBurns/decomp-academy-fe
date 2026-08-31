---
id: 63da77f3-f4e8-59d9-898f-7343dfd99e56
slug: pointers-deref-then-compute
title: Dereference, Then Compute With an Argument
difficulty: 3
concepts:
  - loads
  - arrays
  - multiplication
  - chaining
symbol: func_800f69dc
hints:
  - A loaded element is multiplied by a *register* argument, not a constant — so
    the multiply is `mullw`, not `mulli`.
  - The scalar arrives in r4; the pointer in r3. The product then combines with a
    second element.
---

# A loaded value and a scalar argument

Up to now the scaling values have been constants. Swap in a function argument
and the multiply changes shape: instead of the immediate `mulli`, you get the
register-register `mullw rD, rA, rB`. It's the constant-versus-variable split
from the arithmetic chapter, except now there's a dereference underneath it.

Loads come first, then the arithmetic blends a loaded value with the scalar
waiting in its argument register.

`offset_first(q, n)` shows the addition version. It dereferences the pointer,
adds the scalar `n`, and subtracts a later element:

```asm
lwz  r0, 0(r3)    # *q   (q[0])
lwz  r3, 8(r3)    # q[2]
add  r0, r0, r4   # *q + n        (n is the argument in r4)
subf r3, r3, r0   # r0 - q[2]
blr
```

`n` sits in `r4` and folds in through a plain `add` — addition doesn't need
scaling. The target does something different: it multiplies a loaded element by
that scalar argument. Look for a `mullw` that reads `r4`, then combines with a
second element. Follow the registers to work out which element gets scaled and
how the other one enters.

## Your task

Write `func_800f69dc` to reproduce the assembly above.

<!-- solution -->
```c
int func_800f69dc(int* p, int k) {
    return *p * k + p[1];
}
```
