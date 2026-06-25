---
id: abi-two-survivors-call
title: "Chaining: Two Survivors Feeding a Final Call"
difficulty: 4
concepts:
  - saved-registers
  - declaration-order
  - calls
  - arguments
  - chaining
symbol: fuse
hints:
  - Two results have to survive across calls, so both `r31` and `r30` appear —
    declaration order decides which holds which.
  - A third parameter that is only used at the very end also has to be preserved;
    after the calls, all the kept values are marshalled into the final call's
    argument registers.
---

# Three values alive at once

When two computed values must both outlive calls, they take `r31` and `r30` (the
first-declared survivor gets `r31`). Stack a third preserved value on top and a
final call that consumes all of them, and you get the densest register juggling
this chapter teaches: two saved-register slots, several survival moves, and a
full argument marshalling pass right before the last `bl`.

Consider `twoway(x, y)`, which converts each input with `t()` and combines the
two results arithmetically:

```asm
stwu   r1,-16(r1)
mflr   r0
stw    r0,20(r1)
stw    r31,12(r1)
stw    r30,8(r1)
mr     r30,r4       # y kept for the second call
bl     t            # t(x)
mr     r31,r3       # first result -> r31 (declared first)
mr     r3,r30
bl     t            # t(y)
mullw  r0,r31,r3    # first * second
subf   r3,r31,r0    # ... - first
lwz    r0,20(r1)
lwz    r31,12(r1)
lwz    r30,8(r1)
mtlr   r0
addi   r1,r1,16
blr
```

Here both `t()` results survive: the first lands in `r31`, the second is fresh in
`r3`, and the tail is plain arithmetic. The `r31`/`r30` pair and their paired
`stw`/`lwz` at `12(r1)` and `8(r1)` are the signature of two live saved values.

The target assembly for `fuse` keeps the two-survivor structure but ends in a
**call** instead of arithmetic — and it carries a *third* value through to that
final call as well. After the two conversions, watch the registers get marshalled
into `r3`, `r4`, `r5` before the last `bl`. Recover which parameter feeds each
conversion, which one is passed straight through, and the order they land in.

## Your task

Write `fuse`, which converts two of its inputs and passes all the pieces to a
final call, to reproduce the target assembly. `conv` and `join` are declared for
you.

<!-- starter -->
```c
int fuse(int a, int b, int c) {
    return 0;
}
```

<!-- solution -->
```c
int fuse(int a, int b, int c) {
    int u = conv(a);
    int v = conv(b);
    return join(u, v, c);
}
```

<!-- context -->
```c
extern int conv(int p);
extern int join(int p, int q, int r);
```
