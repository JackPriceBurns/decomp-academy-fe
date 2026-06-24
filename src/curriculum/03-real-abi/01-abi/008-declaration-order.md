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

In `order_demo`, `first` is declared before `second`:

```asm
stw  r31, 12(r1)
stw  r30, 8(r1)
mr   r30, r4         # y parked for the second call
bl   transform       # first = transform(x)
mr   r31, r3         # first -> r31  (declared first -> highest reg)
mr   r3, r30
bl   transform       # second = transform(y)
subf r3, r3, r31     # first - second
```

The snippet above is the real output for the solution: `first`, declared first,
lands in `r31` (via `mr r31, r3` after its call), and the final `subf` reads
`first - second` as `subf r3, r3, r31`.

Now the decompiler's lever: **if the target had `first` in r30 and `second` in
r31, you'd simply swap the two declarations.** Reordering
`int first; int second;` to `int second; int first;` flips their register
homes — `second` would take `r31` and `first` would take `r30`, leaving the
result `first - second` unchanged (the two `transform` calls are independent, so
only their order shifts). The swapped source compiles to the mirror image, with
`second` parked in `r31` and the subtraction reading `subf r3, r31, r3`:

```asm
mr   r31, r3         # second -> r31  (now declared first -> highest reg)
...
subf r3, r31, r3     # first - second
```

Register coloring you can't otherwise reach is often just a declaration-order
edit away.

## Your task

Write `order_demo`. Declare `first = transform(x)` first, then `second =
transform(y)`, and return `first - second`. `transform` is declared for you.
The first-declared local, `first`, should land in `r31`.

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
