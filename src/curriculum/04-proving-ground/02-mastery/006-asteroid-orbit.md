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

Three forces converge here.

**Paired-single prologue.** Because the function holds float values across calls,
MWCC saves `f30`/`f31` using `psq_st`/`psq_l` rather than two separate `stfs`
instructions — a GameCube-only callee-save idiom. It happens automatically; don't
try to reproduce it in C.

**`fmadds` fusion.** The expression `a + b * c` (addition on the outside) fuses
into a single `fmadds` when all operands are `f32`. The operand order inside the
instruction reflects source order.

**Recomputed radius.** Register pressure across intervening trig calls forces the
compiler to reload the radius conversion from `s32AsFloat` rather than cache it.
If you compute radius once and store it in a single local, the compiler will not
match — it will cache the value across the calls. The trick is to call
`s32AsFloat` again immediately before each use.

**Call-order hygiene.** Declare trig helpers as `f32 fn(...)`, not `double` —
a `double` return type injects a stray `frsp`. Keep the exact call sequence: each
result is consumed before the next call.

For comparison, a simpler satellite variant that orbits a center using only `posX`
and `posZ` (no tilt axis) produces this structure:

```asm
bl      FindSatellite          # anchor lookup
...
bl      s32AsFloat             # radius for angle advance
lfs     f0, lbl_rotRate
fdivs   f0, f0, f1             # rotRate / radius
fctiwz  f0, f0                 # -> int
...                            # accumulate into heading
bl      fsin16Approx           # sin(angle)
fmr     f31, f1                # save result
bl      s32AsFloat             # radius for posX
lfs     f0, 4(r31)             # anchor->posX
fmadds  f0, f1, f31, f0        # fmadds
stfs    f0, 4(r29)
bl      s32AsFloat             # radius for posZ (recomputed)
fmr     f31, f1                # save result
bl      fcos16Approx           # cos(angle)
lfs     f0, 8(r31)             # anchor->posZ
fmadds  f0, f31, f1, f0        # fmadds
stfs    f0, 8(r29)
```

Now read the actual target:

```asm
stwu    r1, -64(r1)
...
psq_st  f31, 56(r1), 0, 0  # save f31 (paired-single)
psq_st  f30, 40(r1), 0, 0  # save f30
...
li      r3, 100
lwz     r30, 0(r29)         # state = obj->state
bl      ObjList_FindObjectById
...                         # rotX, rotY, rotZ += rotStep* (lha/add/sth x3)
lwz     r3, 8(r30)
bl      s32AsFloat           # convert orbitRadius
lfs     f0, lbl_orbitStep
lhz     r0, 6(r30)          # load orbitAngle
fdivs   f0, f0, f1          # lbl_orbitStep / radius
fctiwz  f0, f0
...                         # orbitAngle += (u16)(...)
lhz     r3, 0(lbl_tilt)
bl      fcos16Approx        # c = cos(lbl_tilt)
fmr     f30, f1
lhz     r3, 6(r30)          # orbitAngle
bl      fsin16Approx        # s = sin(orbitAngle)
fmr     f31, f1
lwz     r3, 8(r30)
bl      s32AsFloat           # radius (first call)
fmuls   f1, f1, f31
lfs     f0, 4(r31)          # anchor->posX
fmadds  f0, f30, f1, f0
stfs    f0, 4(r29)          # obj->posX
lhz     r3, 6(r30)
bl      fcos16Approx
fmr     f31, f1
lwz     r3, 8(r30)
bl      s32AsFloat           # radius (second call)
lfs     f0, 12(r31)         # anchor->posZ
fmadds  f0, f1, f31, f0
stfs    f0, 12(r29)         # obj->posZ
...
psq_l   f31, 56(r1), 0, 0
psq_l   f30, 40(r1), 0, 0
...
blr
```

Trace the call sequence: find the id passed to `ObjList_FindObjectById`, count
the rot-step increments, identify the formula used to advance `orbitAngle`
(`fdivs` + `fctiwz`), and read each `fmadds` to reconstruct the position
expressions.

## Your task

With the structs above, write `asteroid_orbit` to reproduce the assembly above.

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
