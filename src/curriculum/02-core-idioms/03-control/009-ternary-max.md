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

# Selecting one of two values based on a comparison

A ternary `cond ? x : y` that selects between the *same two input registers*
compiles to a compare, a conditional skip, and a pair of `mr` (move register)
instructions that funnel the chosen value into the return register:

```asm
cmpw r3, r4      # compare a, b (signed int)
ble- .else       # conditional skip
mr   r4, r3      # one arm: overwrite r4 with r3
.else:
mr   r3, r4      # merge: return whichever value is now in r4
blr
```

Trace the data flow. On entry: `r3 = a`, `r4 = b`. When the branch is *not*
taken, `mr r4, r3` fires and stages `a` into `r4`; the final `mr r3, r4` then
returns that. When the branch *is* taken, the copy is skipped and `b` (already
in `r4`) passes through to the merge. The double `mr` is how the compiler merges
both arms into a single exit.

The branch mnemonic is the key: it tells you under which condition `r4` (which
holds `b`) is kept unchanged — and therefore which arm returns `b` and which
returns `a`. From that you can reconstruct the ternary comparison.

## Your task

Write `maxi`, taking two signed `int`s, to reproduce the assembly above.

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
