---
id: abi-declaration-order
title: Declaration Order Colors the Registers
difficulty: 3
concepts:
  - saved-registers
  - register-allocation
  - declaration-order
symbol: order_demo
hints:
  - Both results survive a call, so they go in r31 and r30.
  - "Declaration order decides which: `first` is declared first, so it takes
    r31; swapping the two declarations would swap the registers."
---

# A rule that decides r31 vs r30

When **two** values must survive calls, both get non-volatile homes — the first
in `r31`, the second in `r30` (MWCC allocates downward from the top). Which
value is "first"? It is set by the **order the locals are declared** in your C:
the first-declared surviving local takes the highest register, `r31`.

Consider `order_alt(s32 x, s32 y)` below, where `beta` is declared first and
`alpha` second, both receiving their values from `scale()` calls:

```asm
stwu   r1,-16(r1)
mflr   r0
stw    r0,20(r1)
stw    r31,12(r1)
stw    r30,8(r1)
mr     r30,r3      # park x (r3) for the second call
mr     r3,r4       # pass y (r4) first
bl     scale       # beta = scale(y)
mr     r31,r3      # beta -> r31  (declared first -> highest register)
mr     r3,r30
bl     scale       # alpha = scale(x)
lwz    r0,20(r1)
add    r3,r31,r3   # beta + alpha
lwz    r31,12(r1)
lwz    r30,8(r1)
mtlr   r0
addi   r1,r1,16
blr
```

`beta`, declared first, ends up in `r31`. `alpha`, declared second, lives in
`r30`. The key lever for decompilers: **if the target assembly has the register
assignments flipped**, swap the declaration order in your C and recompile.

Now look at the target assembly for `order_demo`. Two locals land in `r31` and
`r30` across two `transform` calls. Identify which parameter feeds which local
and which register that local settles in — that tells you the declaration order.
Then determine what the final instruction does with those two values.

## Your task

Write `order_demo`, calling `transform` twice and returning a combination of the
results. `transform` is declared for you. Match the register assignments in the
target assembly by choosing the right declaration order.

<!-- starter -->
```c
int order_demo(int x, int y) {
    return 0;
}
```

<!-- solution -->
```c
int order_demo(int x, int y) {
    int first = transform(x);
    int second = transform(y);
    return first - second;
}
```

<!-- context -->
```c
extern int transform(int v);
```
