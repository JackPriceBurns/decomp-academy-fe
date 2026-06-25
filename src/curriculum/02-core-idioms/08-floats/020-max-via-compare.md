---
id: floats-max-via-compare
title: "Picking the Larger: fcmpo + Conditional fmr"
difficulty: 3
concepts:
  - floating-point
  - fcmpo
  - fmr
  - branch
symbol: fmaxf2
hints:
  - The early-return arm is a conditional `blr` (e.g. `bgtlr-`); the fall-through
    `fmr` supplies the other result.
  - Read the branch condition to learn which comparison returns the first
    argument directly.
---

# Selecting one of two floats

Choosing the larger or smaller of two floats is a float compare feeding a
branch — `fcmpo` to set the condition register, then a *conditional return*. If
the test passes, control returns one argument as-is; otherwise an `fmr` moves
the other argument into `f1` before the final `blr`.

Consider `smaller(p, q)`, returning whichever of two values is less:

```asm
fcmpo cr0, f1, f2    # compare p against q
bltlr-               # if p < q, return p (already in f1)
fmr   f1, f2         # else f1 = q
blr
```

The pattern: `fcmpo` then a `b<cond>lr-` that returns the first argument when the
test holds, with a trailing `fmr` + `blr` for the other case. The branch
*condition* tells you the comparison — `bltlr` is "branch (return) if less
than", so the C `if` tested `p < q`. The `-` suffix is just a static
branch-prediction hint; ignore it when decoding the logic. The argument left in
`f1` on the early return is the value returned untouched.

The target assembly has the same `fcmpo` → conditional-`blr` → `fmr` shape but a
*different* branch condition. Read that condition to determine which comparison
is being made and therefore which argument each path returns.

## Your task

Write `fmaxf2`, taking two `f32`s, to reproduce the assembly above. Use a plain
`if` with an early `return`.

<!-- starter -->
```c
f32 fmaxf2(f32 a, f32 b) {
    return 0.0f;
}
```

<!-- solution -->
```c
f32 fmaxf2(f32 a, f32 b) {
    if (a > b) return a;
    return b;
}
```
