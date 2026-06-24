---
id: mastery-tumbler-integratespin
title: "peephole off: When You Must Write the (s16) Cast Yourself"
difficulty: 5
concepts:
  - peephole
  - narrow-types
  - float
  - fmadds
  - int-to-float
symbol: tumbler_integrateSpin
hints:
  - Put `#pragma peephole off` at the top of the function's translation unit —
    the lever is that the cleanup pass is gone.
  - Cast the whole store expression with `(s16)(...)`. Don't compute into an
    `int` local first — that emits an `extsh` the disabled Peepholer can no
    longer delete.
  - "`(f32)(int)rate * timeDelta + (f32)(int)spin` fuses into a single `fmadds`;
    the int-to-float `xoris ...,32768` / `lfd` / `fsubs` magic-constant sequence
    is automatic."
---

# The cleanup pass is gone — narrow it yourself

This is the rotation-integration tail of SFA's `tumbleweed_updateRollingMotion`,
the function that earned a match by flipping `#pragma peephole on` to **off** and
rewriting three rotation-field stores as direct `(s16)` casts. It's the clearest
demonstration of how `peephole off` changes the *C you must write*, not just the
asm you read.

```c
typedef struct { s16 spinX; s16 spinY; s16 spinZ; } GameObject;
typedef struct { s16 rateX; s16 rateY; s16 rateZ; } RollState;
```

Each axis integrates an `s16` angular rate into an `s16` angle:
`spin += rate * timeDelta`. Both fields are `s16`, so each one is read with
`lha`, promoted to float, fused, and truncated back. MWCC's int-to-float has no
native instruction here — it builds a double from a magic constant
(`lis r5, 17200` / `xoris rX, rX, 32768` / `lfd` / `fsubs`), then the
`rate*timeDelta + spin` collapses into one `fmadds`:

```asm
lha     r6, 0(r4)          # state->rateX
lha     r0, 0(r3)          # obj->spinX
xoris   r6, r6, 32768      # int -> double (magic-constant idiom)
xoris   r0, r0, 32768
lfd     f3, @@6(0)
fsubs   f2, f0, f3         # rate as float
fsubs   f0, f0, f3         # spin as float
fmadds  f0, f2, f1, f0     # rate*timeDelta + spin   (one fused op)
fctiwz  f0, f0             # -> integer
stfd    f0, 24(r1)
lwz     r0, 28(r1)
sth     r0, 0(r3)          # store back as s16 — NO extsh before it
```

The decisive detail is what is **missing**: there is no `extsh r0, r0` between
the `lwz` and the `sth`. That mask only disappears for one of two reasons —
either the Peepholer deletes it, or you never emit it in the first place. Under
`peephole off` the Peepholer is disabled, so the *only* way to get a clean `sth`
is to write the narrowing yourself.

Route the result through an `int` local first —
`int v = (int)(...); obj->spinX = v;` — and MWCC dutifully emits `extsh r0, r0`
before every `sth`. With `peephole on` those `extsh`s vanish (the Peepholer
removes the redundant sign-extend); with `peephole off` they **survive** and the
function won't match. Casting the store expression directly,
`obj->spinX = (s16)(...)`, narrows it in the IR so no `extsh` is ever generated —
and that is exactly the edit the real match made.

## Your task

With the structs above, write `tumbler_integrateSpin` under `#pragma peephole off`.
For each of X, Y, Z, integrate the rate into the angle to match the assembly above.
Cast directly on the store value — do **not** route through an `int` local, or the
`extsh` masks will reappear and break the match.

<!-- starter -->
```c
#pragma peephole off
void tumbler_integrateSpin(GameObject* obj, RollState* state, f32 timeDelta) {
    // spin += rate * timeDelta, per axis, narrowed back to s16
}
```

<!-- solution -->
```c
#pragma peephole off
void tumbler_integrateSpin(GameObject* obj, RollState* state, f32 timeDelta) {
    obj->spinX = (s16)((f32)(int)state->rateX * timeDelta + (f32)(int)obj->spinX);
    obj->spinY = (s16)((f32)(int)state->rateY * timeDelta + (f32)(int)obj->spinY);
    obj->spinZ = (s16)((f32)(int)state->rateZ * timeDelta + (f32)(int)obj->spinZ);
}
```

<!-- context -->
```c
typedef struct { s16 spinX; s16 spinY; s16 spinZ; } GameObject;
typedef struct { s16 rateX; s16 rateY; s16 rateZ; } RollState;
```
