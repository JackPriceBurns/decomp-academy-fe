---
id: floats-compare-branch
title: "Comparing Floats: fcmpo Feeding a Branch"
difficulty: 4
concepts:
  - floating-point
  - compare
  - fcmpo
  - branch
symbol: relu
hints:
  - A float compare feeding a branch is the plain operator → `fcmpo` plus a
    conditional branch.
  - "`if (x < 0.0f) return 0.0f;` compiles to `lfs` of 0.0f, `fcmpo`, and a
    branch."
---

# The compare-then-branch rule

When a float comparison feeds an `if`, MWCC uses **`fcmpo`** (floating compare,
ordered) to set a condition register, then branches on it. Comparing against a
constant first loads it with `lfs`. Consider a function that clamps a value at
`1.0f` from above:

```asm
lfs   f0, ...        # load 1.0f
fcmpo cr0, f1, f0    # compare v against 1.0
blelr-               # if v <= 1.0, return v as-is
fmr   f1, f0         # else result = 1.0
blr
```

A reliable rule of thumb: **a float compare that feeds a branch is just the plain
operator** — write `if (v > 1.0f)` and you get `fcmpo` + branch. (A float
comparison whose *boolean result is stored or returned* compiles to a different,
messier form — the compiler still does the `fcmpo`, but then *materializes* the
0/1 result into a GPR, typically with an `mfcr` plus `rlwinm` to extract and
shift the condition bit. If you see the compare's result land in a general
register rather than steer a branch, the original C stored or returned the
boolean — so reach for the plain branch shape first.) "Ordered" (`fcmpo`) vs
"unordered" matters only for NaN handling; normal C comparisons use `fcmpo`.

Now look at the target assembly for `relu`. Identify the constant loaded by
`lfs`, read the branch mnemonic to determine which comparison it encodes, and
figure out which return path is the early return.

## Your task

Write `relu` taking an `f32 x`: examine the assembly to determine the comparison
and the two possible return values. Use a plain `if` statement.

<!-- starter -->
```c
f32 relu(f32 x) {
    // return x when non-negative, else 0
    return x;
}
```

<!-- solution -->
```c
f32 relu(f32 x) {
    if (x < 0.0f) {
        return 0.0f;
    }
    return x;
}
```
