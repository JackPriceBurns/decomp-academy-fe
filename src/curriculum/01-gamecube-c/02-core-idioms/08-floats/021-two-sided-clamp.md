---
id: 736c08fb-3cd9-5393-a331-dda27d5622ac
slug: floats-two-sided-clamp
title: Clamping Between Two Constants
difficulty: 3
concepts:
  - floating-point
  - fcmpo
  - fmr
  - clamp
symbol: clampRange
hints:
  - Two independent `if`s, each an `fcmpo` + branch + `fmr`; the value stays live
    in f1 across both — no store/reload between them.
  - The first branch skips its body on the inverted condition; the last clamp can
    fold into a conditional `blr`.
---

# Two clamps, one running value

A two-sided clamp squeezes a value between a floor and a ceiling. Two `if`s,
nothing fancier, each testing against a constant and overwriting when the value
steps out of line. And since the candidate stays in `f1` from start to finish,
there is **no store or reload between the checks**. It just rides in the
register.

Take `clampPct(v)`, holding a value inside `[0, 100]`:

```asm
lfs   f0, ...        # load 0.0f
fcmpo cr0, f1, f0    # v < 0 ?
bge-  .lo_ok         #   skip when v >= 0 (inverted test)
fmr   f1, f0         #   v = 0
.lo_ok:
lfs   f0, ...        # load 100.0f
fcmpo cr0, f1, f0    # v > 100 ?
blelr-               #   if v <= 100, return v as-is
fmr   f1, f0         #   else v = 100
blr
```

A couple of habits from earlier compares resurface here. Each forward branch
carries the *inverted* condition of its `if`, which is why `bge-` is what skips
the body of `if (v < 0)`. The branch jumps when the test is false, not when it
is true. The final clamp gets a shortcut too. Rather than hopping over an `fmr`,
it folds the skip straight into a conditional return, `blelr-`. As for the
bounds, they are the `lfs` constants. Two loads, two numbers, that is your range.

Same two-clamp skeleton waits in the target, only the bounds differ. Read each
`lfs` constant and each branch condition and you can pin down the floor, the
ceiling, and the order they apply in.

## Your task

Write `clampRange` to reproduce the assembly above. Use two
plain `if` statements that overwrite the value.

<!-- solution -->
```c
f32 clampRange(f32 x) {
    if (x < 0.0f) x = 0.0f;
    if (x > 1.0f) x = 1.0f;
    return x;
}
```
