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

A floating compare that feeds a branch becomes `fcmpo` plus a conditional jump,
and "replace the value" is the register-move `fmr`. No memory round-trips
between the clamps — the candidate stays live in `f1`:

```asm
lfs     f0, 0(r3)          # a->health
lfs     f2, lbl_zero
fadds   f1, f0, f1         # h = health + amount
fcmpo   cr0, f1, f2        # h < 0 ?
bge-    .lo_ok
fmr     f1, f2             #   h = 0
.lo_ok:
lfs     f0, 4(r3)          # a->maxHealth
fcmpo   cr0, f1, f0        # h > max ?
ble-    .hi_ok
fmr     f1, f0             #   h = max
.hi_ok:
stfs    f1, 0(r3)          # a->health = h
blr
```

Two things to internalize. First, `h < lbl_zero` compiles to `fcmpo` + `bge-`
(the *opposite* condition skips the assignment) — that inversion is normal.
Second, `fmr` is just "this float now equals that one"; a lone `fmr` guarded by
a float compare is almost always a clamp arm.

One trap: the floor here is the *external* `lbl_zero`, not the literal `0.0f`.
The original loads the floor from a named label (`lfs f2, lbl_zero`); writing
`0.0f` instead makes MWCC synthesize the zero from its own constant pool — a
different load (and a different register assignment) that looks cleaner but will
not match. Always use `lbl_zero` where the data tells you the constant lived in
a named symbol.

## Your task

With the struct above, write `actor_clampHealth`: compute
`a->health + amount`, clamp it below by `lbl_zero` and above by
`a->maxHealth`, then store it back into `a->health`.

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
