---
id: control-clamp-range
title: Clamping Between Two Bounds
difficulty: 2
concepts:
  - clamp
  - if
  - branch
  - combining
symbol: clamp_range
hints:
  - Two independent guards run back to back — first the low bound, then the high.
  - The high-bound arm merges through `li r0, <hi>` / `mr r0, r3` / `mr r3, r0`.
---

# Two guards, stacked

So far each control-flow lesson tested a single condition. Real code stacks
them. The simplest stack is a **two-sided clamp**: push a value up to a floor,
then down to a ceiling. The two checks are independent and run one after the
other — the assembly is just lesson 4's clamp followed by its mirror image.

Consider `clamp_volume(v)`, which holds a value inside `[10, 50]`:

```asm
cmpwi r3,10        # below the floor?
bge-  .check_hi
li    r3,10        # yes: return the floor
blr
.check_hi:
cmpwi r3,50        # above the ceiling?
li    r0,50        # speculative: the ceiling
bgt-  .merge       # above -> keep r0 = 50
mr    r0,r3        # not above -> pass the value through
.merge:
mr    r3,r0
blr
```

The first compare guards the floor and exits early with its own `blr` when the
value is too low. Everything past that point already knows the value is at or
above the floor, so the second compare only has to cap it: it speculatively
loads the ceiling into `r0`, then `bgt-` decides whether to keep that ceiling or
copy the original value through. The two `mr`s funnel the winner into `r3`.

Read the two constants and the two branch directions: the first pair is the
*lower* bound, the second pair the *upper*. Reconstruct each guard from the
compare it sits on.

## Your task

Write `clamp_range`, taking one `int`, to reproduce the assembly above.

<!-- starter -->
```c
int clamp_range(int x) {
    return 0;
}
```

<!-- solution -->
```c
int clamp_range(int x) {
    if (x < 0) return 0;
    if (x > 100) return 100;
    return x;
}
```
