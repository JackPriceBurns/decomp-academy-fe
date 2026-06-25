---
id: finale-guarded-float-accumulate
title: "A Guarded Float Accumulator"
difficulty: 3
concepts:
  - finale
  - floats
  - loops
  - pointers
  - control
symbol: sum_positive
hints:
  - "`lfsx` is the float cousin of `lwzx` — an indexed load of an `f32` array
    element using the scaled counter."
  - "`fcmpo` feeding a branch is just a plain float `if`; read the branch
    mnemonic for the comparison and which elements it lets through."
---

# The finale: floats, a loop, and a guard

Everything in this tier converges here. An `f32` array walked by a counted loop,
each element loaded with an **indexed float load**, an **ordered float compare**
steering a **guard**, and a **`fadds`** accumulator — pointers, loops, control,
and floating point in one body.

Three rules carry over unchanged:

- The loop scales `i` by 4 (`f32` is four bytes) and loads with `lfsx`, the
  float twin of the integer `lwzx`.
- A float compare that **feeds a branch** is the plain operator: `fcmpo` sets
  `cr0`, and a conditional branch reads it. The constant it compares against is
  loaded with `lfs`.
- The accumulator is a running `fadds`, the single-precision add.

Consider `sum_small(v, n)`, which adds up only the elements below `1.0f`:

```asm
lfs   f1,...        # acc = 0.0f
body:
slwi  r0,r5,2       # i * 4
lfs   f0,...        # load the 1.0f bound
lfsx  f2,r3,r0      # load v[i]
fcmpo cr0,f2,f0     # compare v[i] against 1.0
bge-  .skip         # >= 1.0 -> contribute nothing
lfsx  f0,r3,r0      # reload v[i]
fadds f1,f1,f0      # acc += v[i]
.skip:
addi  r5,r5,1
test:
cmpw  r5,r4
blt+  body
blr                 # return acc in f1
```

`fcmpo`/`bge-` is the guard: the example keeps elements *below* the bound, so the
branch skips when the element is greater-or-equal. The accumulator lives in `f1`
across the whole loop and is returned directly.

Your `sum_positive` has the same skeleton, but it guards on a *different* bound
and a *different* comparison direction — read the `lfs` constant and the branch
mnemonic to see which elements survive the guard. The `lfsx` loads and the
`fadds` accumulation are identical.

## Your task

Write `sum_positive`, taking an `f32*` and an `int` count, to reproduce the
assembly above.

<!-- starter -->
```c
#pragma optimization_level 1
f32 sum_positive(f32 *a, int n) {
    int i;
    f32 s = 0.0f;
    // accumulate only the elements that pass the guard
    return s;
}
```

<!-- solution -->
```c
#pragma optimization_level 1
f32 sum_positive(f32 *a, int n) {
    int i;
    f32 s = 0.0f;
    for (i = 0; i < n; i++) {
        if (a[i] > 0.0f) {
            s += a[i];
        }
    }
    return s;
}
```
