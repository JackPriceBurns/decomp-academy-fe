---
id: control-guard-or
title: A Multi-Condition Guard
difficulty: 3
concepts:
  - guard
  - short-circuit
  - early-return
  - combining
symbol: safe_scale
hints:
  - A `||` guard is two compares that both bail to the *same* early-return block.
  - After both checks pass, the real work runs at the branch target (a `divw`,
    `mullw`, …).
---

# Guarding with more than one condition

One bad input was enough to send lesson 8's guard packing. Most functions want
more reassurance than that, screening two or three things before they commit to
any work. That's what `||` buys you here. Both compares branch to the *same*
sentinel block, and only the path that clears every check reaches the real math.
The branch shape itself is lesson 16's. The one twist is that the surviving arm
now computes something instead of parroting a constant.

Take `safe_avg(sum, count)`. Count zero or negative? Sum below zero? Either way
it refuses the call. Otherwise, it divides.

```asm
cmpwi r4,0         # count <= 0 ?
ble-  .bail        # yes -> bail out
cmpwi r3,0         # sum < 0 ?
bge-  .work        # no (sum >= 0) -> proceed to the work
.bail:
li    r3,-1        # sentinel for a rejected call
blr
.work:
divw  r3,r3,r4     # the real computation
blr
```

Notice both compares funnel into the one `.bail` block. That shared early-return
target is what gives them away as two halves of a single `||` guard. Whichever
condition trips *first* heads straight for the sentinel. The *last* condition, if
it holds, drops through to the real work. Read the instruction at `.work`, a
`divw` in this case, and you know what the function does once its inputs check
out.

Your version screens two conditions of its own and finishes on its own
operation. Follow each compare to wherever it lands. Once you've watched them
meet at a single bailout, the sentinel hands you the rejected value and the
instruction past the fall-through hands you the rest.

## Your task

Write `safe_scale`, taking a value `x` and a `factor`, to reproduce the assembly
above.

<!-- starter -->
```c
int safe_scale(int x, int factor) {
    return 0;
}
```

<!-- solution -->
```c
int safe_scale(int x, int factor) {
    if (factor <= 0 || x == 0) return 0;
    return x * factor;
}
```
