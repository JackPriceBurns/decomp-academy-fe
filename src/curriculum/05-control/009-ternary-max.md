---
id: control-ternary-max
title: Ternary Max
difficulty: 3
concepts:
  - ternary
  - comparison
  - select
symbol: maxi
hints:
  - "`a > b ? a : b` is max; expect a `cmpw` and a `ble-` skip."
  - Both arms merge through `mr r4, r3` / `mr r3, r4`.
---

# Selecting the larger of two

The ternary `a > b ? a : b` is just `max(a, b)`. MWCC compiles it to a compare,
a conditional skip, and a pair of moves that funnel the chosen value into the
return register:

```asm
cmpw r3, r4      # compare a, b (signed int)
ble- .else       # if a <= b, keep b
mr   r4, r3      # a wins: stage a into r4
.else:
mr   r3, r4      # return whichever value is in r4
blr
```

Read it carefully: when `a > b` the `ble-` is *not* taken, so `mr r4, r3`
copies `a` into `r4`; the final `mr r3, r4` then returns it. When `a <= b` the
branch skips that copy and `b` (already in `r4`) is returned. The double `mr` is
how the compiler merges both arms into a single exit.

## Your task

Write `maxi`, returning the larger of two signed `int`s using a ternary.

<!-- starter -->
```c
int maxi(int a, int b) {
    return 0;
}
```

<!-- solution -->
```c
int maxi(int a, int b) {
    return a > b ? a : b;
}
```
