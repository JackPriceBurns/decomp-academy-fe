---
id: floats-two-sided-clamp
title: Clamping Between Two Constants
difficulty: 3
concepts:
  - floating-point
  - fcmpo
  - fmr
  - clamp
symbol: saturate
hints:
  - Two independent `if`s, each an `fcmpo` + branch + `fmr`; the value stays live
    in f1 across both — no store/reload between them.
  - The first branch skips its body on the inverted condition; the last clamp can
    fold into a conditional `blr`.
---

# Two clamps, one running value

A two-sided clamp pins a value between a floor and a ceiling: two independent
`if`s, each comparing against a constant and conditionally overwriting. Because
the candidate value lives in `f1` the whole time, there's **no store or reload
between the two checks** — the running value just stays in the register.

Consider `clampPct(v)`, pinning a value into the range `[0, 100]`:

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

Two rules carry over from earlier compares. First, each forward branch uses the
**inverted** condition of its `if` — `bge-` skips the body of `if (v < 0)`,
because the branch jumps when the test is *false*. Second, the **last** clamp can
fold its skip into a conditional return (`blelr-`) instead of jumping over a
`fmr`. Each `lfs` reveals one bound; read the two constants to recover the range.

The target assembly has the same two-clamp skeleton with different bounds. Read
each `lfs` constant and each branch condition to recover the floor, the ceiling,
and which order they're applied.

## Your task

Write `saturate`, taking one `f32`, to reproduce the assembly above. Use two
plain `if` statements that overwrite the value.

<!-- starter -->
```c
f32 saturate(f32 x) {
    return 0.0f;
}
```

<!-- solution -->
```c
f32 saturate(f32 x) {
    if (x < 0.0f) x = 0.0f;
    if (x > 1.0f) x = 1.0f;
    return x;
}
```
