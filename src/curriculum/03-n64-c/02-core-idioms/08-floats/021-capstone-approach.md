---
id: 740a584b-037f-48af-bc4b-3cde2106438e
slug: floats-capstone-approach
title: "Capstone: Approach"
difficulty: 5
concepts:
  - floats
  - compares
  - clamp
  - constants
  - capstone
symbol: func_80102960
hints:
  - "Start at the `sub.s` — note its operand order — and name its result `d`. Then read the two guards as a symmetric clamp on `d`, decoding `0x3f00` and `0xbf00`."
  - "The final `add.s` combines an *argument* with the clamped `d`. Three statements and two `if`s reproduce everything, likely-slot tricks included."
---

# Chase a target, gently

The classic smoothing function: move a value toward a target, but
never by more than a fixed step. Every camera, door, and volume
slider in the game runs something like it. First, a cousin to warm
up on — `rebound(v)`, which reflects and dampens a speed, zeroing it
when it gets weak:

```c
f32 rebound(f32 v) {
    v = -v * 0.5f;
    if (v < 1.0f) {
        v = 0.0f;
    }
    return v;
}
```

```asm
 0:  lui    at, 0x3f00     # 0.5f
 4:  mtc1   at, ft1
 8:  neg.s  ft0, fa0       # -v
 c:  lui    at, 0x3f80     # 1.0f, staged while the mul runs
10:  mul.s  fa0, ft0, ft1  # -v * 0.5f — overwriting the argument
14:  mtc1   at, ft2
18:  nop
1c:  c.lt.s fa0, ft2       # weak?
20:  nop
24:  bc1fl  0x38           # no: return it…
28:  mov.s  fv0, fa0       #   (likely slot)
2c:  mtc1   zero, fa0      # yes: v = 0.0f
30:  nop
34:  mov.s  fv0, fa0
38:  jr     ra
3c:  nop
```

Note how *reassigning a C variable* shows up: `fa0` stops being "the
argument" the moment the `mul.s` overwrites it, and just means `v`,
whatever `v` currently is. Track variables, not registers.

The target is denser — the same ingredients, aggressively
scheduled. Expect, and don't be knocked over by:

- **A compare in a likely slot.** One guard's `c.lt.s` starts inside
  the *previous* branch's annullable slot — and is duplicated on the
  other path. Same instruction twice, two ways to arrive at it.
- **`fv0` living two lives**: it carries a *constant* early on and
  only becomes the return value at the end. Dataflow over names,
  one more time.
- **Symmetric bounds**: two `lui`s differing only in their top bit.

Un-schedule it patiently: find the `sub.s` first, watch its result
get squeezed from both sides, and see what the final `add.s` sums.
The C that produces all of it is short and completely ordinary.

## Your task

Write `func_80102960` to reproduce the target assembly.

<!-- solution -->
```c
f32 func_80102960(f32 v, f32 t) {
    f32 d = t - v;
    if (d > 0.5f) {
        d = 0.5f;
    }
    if (d < -0.5f) {
        d = -0.5f;
    }
    return v + d;
}
```
