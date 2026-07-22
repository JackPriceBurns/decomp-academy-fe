---
id: 0c1de2b4-b2d1-5368-a8e7-ee413d785f8e
slug: abi-declaration-order
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

Picture two locals that both have to be alive once a call returns. A volatile
register would get trampled, so each one retreats to a callee-saved register
instead. MWCC hands those out starting at the high end, which means `r31` before
`r30`. The order they get claimed traces straight back to your source. Whichever
local you declared earlier walks off with `r31`, and the later one is stuck with
`r30`.

`order_alt(s32 x, s32 y)` puts that on display. `beta` appears above `alpha`,
and both draw their value from a `scale()` call.

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

`beta` went first and bagged `r31`, leaving `alpha` down in `r30`. There is real
leverage in that. Catch a target with its registers reversed and you fix it by
swapping the two declarations and building again.

Now `order_demo`, the one you actually write. Its target calls `transform` twice
and hangs onto both answers, one in `r31` and one in `r30`. Walk each parameter
to the local it feeds and notice the register that local ends up in; the
declaration order falls right out of that. Whatever the last instruction does to
the two values is the operation you owe the return.

## Your task

Write `order_demo`, calling `transform` twice and returning a combination of the
results. `transform` is declared for you. Match the register assignments in the
target assembly by choosing the right declaration order.

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
