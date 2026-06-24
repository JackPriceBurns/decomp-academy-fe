---
id: mastery-clamp-health
title: Clamping a Float Into Range
difficulty: 4
concepts:
  - float
  - control-flow
  - fcmpo
  - fmr
symbol: actor_clampHealth
hints:
  - Keep the running value in one local `h` so it stays in `f1` across both
    clamps.
  - Each `if` is an `fcmpo` plus a branch on the inverted condition, then an
    `fmr`.
  - Store back only once at the end with `stfs f1, 0(r3)`.
---

# The two-sided clamp

A staple of every game update loop: add a delta, then pin the result between a
floor and a ceiling. SFA does this all over its health, timer, and fade code.
The shape is two independent `if`s, each comparing a float and conditionally
overwriting it.

```c
typedef struct { f32 health; f32 maxHealth; } Actor;
extern f32 lbl_zero;
```

**Float compare and branch.** A float comparison that feeds a conditional
overwrite compiles to `fcmpo` plus a conditional jump over a `fmr`. The jump
uses the *opposite* condition of the `if` — the branch skips the body when the
test is *false*, so `if (x < y)` becomes `fcmpo` + `bge-` (branch if
not-less-than).

**`fmr` is "assign this float register".** A `fmr` surrounded by `fcmpo`/branch
on one side and the next statement on the other is almost always one arm of a
clamp. No store/reload between clamps — the candidate value stays live in a float
register across both checks.

**Named label vs literal zero.** Using `0.0f` in C lets the compiler synthesize
the constant from its own pool, producing a different `lfs` source and different
register assignment. When the assembly shows `lfs fN, lbl_zero`, the C must
reference the named extern.

For a comparable function clamping a vehicle's speed between `lbl_zero` and
`v->maxSpeed`:

```asm
lfs     f0, 0(r3)          # v->speed
lfs     f2, lbl_zero(0)
fadds   f1, f0, f1         # s = speed + delta
fcmpo   cr0, f1, f2        # s < lbl_zero ?
bge-    .lo_ok
fmr     f1, f2             #   s = lbl_zero
.lo_ok:
lfs     f0, 4(r3)          # v->maxSpeed
fcmpo   cr0, f1, f0        # s > maxSpeed ?
ble-    .hi_ok
fmr     f1, f0             #   s = maxSpeed
.hi_ok:
stfs    f1, 0(r3)          # v->speed = s
blr
```

Now apply those rules to the actual target:

```asm
lfs     f0, 0(r3)
lfs     f2, lbl_zero(0)
fadds   f1, f0, f1
fcmpo   cr0, f1, f2
bge-    .lo_ok
fmr     f1, f2
.lo_ok:
lfs     f0, 4(r3)
fcmpo   cr0, f1, f0
ble-    .hi_ok
fmr     f1, f0
.hi_ok:
stfs    f1, 0(r3)
blr
```

Read the load offsets to identify which struct fields are the floor, the ceiling,
and the store target. Identify the step before the first compare to find the
initial arithmetic.

## Your task

With the struct above, write `actor_clampHealth` to reproduce the assembly above.

<!-- starter -->
```c
void actor_clampHealth(Actor* a, f32 amount) {
    // h = health + amount; clamp to [lbl_zero, maxHealth]; store back
}
```

<!-- solution -->
```c
void actor_clampHealth(Actor* a, f32 amount) {
    f32 h = a->health + amount;
    if (h < lbl_zero) {
        h = lbl_zero;
    }
    if (h > a->maxHealth) {
        h = a->maxHealth;
    }
    a->health = h;
}
```

<!-- context -->
```c
typedef struct { f32 health; f32 maxHealth; } Actor;
extern f32 lbl_zero;
```
