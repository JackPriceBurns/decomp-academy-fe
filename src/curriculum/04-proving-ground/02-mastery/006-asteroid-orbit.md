---
id: mastery-asteroid-orbit
title: "Orbital Math: fmadds, fdivs, and Saved Float Registers"
difficulty: 4
concepts:
  - float
  - fmadds
  - calls
  - paired-single
symbol: asteroid_orbit
hints:
  - Declare the trig/convert helpers as `f32 fn(...)` so no spurious `frsp`
    appears.
  - "`a + b * c` written in that order fuses into one `fmadds`."
  - Recompute `radius = s32AsFloat(...)` before each position component,
    matching the call sequence.
  - The `psq_st`/`psq_l` pairs in the prologue/epilogue are MWCC saving the
    callee `f30`/`f31` as one 64-bit paired-single write instead of two `stfs` —
    it's automatic, so don't try to reproduce it in your C.
---

# A per-frame float workout

This is the most float-heavy capstone yet, distilled from SFA's
`worldasteroids_update`. An asteroid spins on three axes and orbits an anchor
object; computing its position calls into trig approximations and an int-to-float
helper, then fuses everything with multiply-adds.

```c
typedef struct {
    s16 rotStepX; s16 rotStepY; s16 rotStepZ;
    u16 orbitAngle; s32 orbitRadius;
} AsteroidState;
typedef struct {
    AsteroidState* state;
    f32 posX; f32 posY; f32 posZ;
    s16 rotX; s16 rotY; s16 rotZ;
} AsteroidObject;
extern AsteroidObject* ObjList_FindObjectById(int id);
extern f32 fsin16Approx(u16 a);
extern f32 fcos16Approx(u16 a);
extern f32 s32AsFloat(s32 v);
extern f32 lbl_orbitStep;
extern u16 lbl_tilt;
```

Three forces converge here. **(1)** Because the function holds float values
across calls, MWCC saves `f30`/`f31` using **paired-single** `psq_st`/`psq_l`
in the prologue/epilogue — a GameCube-only idiom. **(2)** `a + b*c` collapses
into a single fused `fmadds`. **(3)** Advancing the angle divides a float and
converts to int with `fdivs` then `fctiwz`:

```asm
psq_st  f31, 56(r1), 0, 0  # save callee float regs (paired-single)
...
fdivs   f0, f0, f1         # lbl_orbitStep / radius
fctiwz  f0, f0             # -> integer
...
fmuls   f1, f1, f31
lfs     f0, 4(r31)         # anchor->posX
fmadds  f0, f30, f1, f0    # posX = radius*sin*cos + anchor->posX
stfs    f0, 4(r29)
...
```

Two helper-call hygiene notes worth keeping in mind: declare the trig helpers as
`f32 fn(...)`, **not** `double` — a `double` return would inject a stray
`frsp`. And keep the call order exactly as written: each `fsin/fcos/s32AsFloat`
result is consumed before the next call, so the compiler reloads radius between
the X and Z computations rather than caching it.

## Your task

With the structs above, write `asteroid_orbit`. Find the anchor by id `0x64`;
add each `rotStep*` into the matching `rot*`; advance `orbitAngle` by
`(u16)(lbl_orbitStep / s32AsFloat(orbitRadius))`; then set
`posX = radius*sin(angle)*cos(tilt) + anchor->posX` and
`posZ = radius*cos(angle) + anchor->posZ`, where `radius = s32AsFloat(orbitRadius)`.
Crucially, **recompute `radius = s32AsFloat(orbitRadius)` immediately before each of
`posX` and `posZ`**: register pressure across the intervening trig calls means the
compiler reloads it (you'll see a second `bl s32AsFloat` rather than a cached value),
and caching it in one local will mismatch. Mirror the call order shown.

<!-- starter -->
```c
void asteroid_orbit(AsteroidObject* obj) {
    // spin on three axes, then orbit the anchor with trig + fmadds
}
```

<!-- solution -->
```c
void asteroid_orbit(AsteroidObject* obj) {
    AsteroidState* state;
    AsteroidObject* anchor;
    f32 radius, s, c;
    state = obj->state;
    anchor = ObjList_FindObjectById(0x64);
    obj->rotX += state->rotStepX;
    obj->rotY += state->rotStepY;
    obj->rotZ += state->rotStepZ;
    state->orbitAngle += (u16)(lbl_orbitStep / s32AsFloat(state->orbitRadius));
    c = fcos16Approx(lbl_tilt);
    s = fsin16Approx(state->orbitAngle);
    radius = s32AsFloat(state->orbitRadius);
    obj->posX = radius * s * c + anchor->posX;
    c = fcos16Approx(state->orbitAngle);
    radius = s32AsFloat(state->orbitRadius);
    obj->posZ = radius * c + anchor->posZ;
}
```

<!-- context -->
```c
typedef struct {
    s16 rotStepX; s16 rotStepY; s16 rotStepZ;
    u16 orbitAngle; s32 orbitRadius;
} AsteroidState;
typedef struct {
    AsteroidState* state;
    f32 posX; f32 posY; f32 posZ;
    s16 rotX; s16 rotY; s16 rotZ;
} AsteroidObject;
extern AsteroidObject* ObjList_FindObjectById(int id);
extern f32 fsin16Approx(u16 a);
extern f32 fcos16Approx(u16 a);
extern f32 s32AsFloat(s32 v);
extern f32 lbl_orbitStep;
extern u16 lbl_tilt;
```
