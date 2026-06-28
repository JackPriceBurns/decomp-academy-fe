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

One condition was enough for every lesson before this. Most real functions aren't
that tidy. Stacking shows up everywhere, and the cleanest case to learn it on is
a **two-sided clamp**, which pushes a value up to a floor and then trims it down
to a ceiling. Neither test depends on the other. Lay them end to end and the
assembly is simply lesson 4's clamp followed by its mirror image.

Take `clamp_volume(v)`, pinning a value into `[10, 50]`:

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

The opening compare is the floor guard. A value that arrives too low returns
immediately through its own `blr`. After that the code can assume the value sits
at or above the floor, leaving the second compare to worry only about the
ceiling. It parks the ceiling in `r0` up front, then `bgt-` decides between
keeping that ceiling and letting the original value pass. The two `mr`s shove
whichever value wins into `r3`.

The rest is just reading. Pick out the two constants and the way each branch
turns. One pair marks the *lower* bound, the other the *upper*, and every guard
falls back out of the compare it rides on.

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
