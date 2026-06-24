---
id: mastery-fueltank-apply
title: Copying a Position With a Bias
difficulty: 3
concepts:
  - structs
  - float
  - narrow-types
  - pointers
symbol: crfueltank_apply
hints:
  - "`fadeTimer`/`triggered` are `u8`s after the `s16 flags`, so they land at
    offsets 14 and 15 (`stb`)."
  - X and Z are bare `lfs`/`stfs` copies — no float math.
  - Write `lbl_yBias + hitObj->posY` (constant first) to match the `fadds f0,
    f1, f0` operand order.
---

# Two structs, one position copy

Modeled on the tail of SFA's `crfueltank_hitDetect`: when a fuel tank is hit,
the game copies the *hitter's* position onto the tank, lifting `Y` by a constant
so the effect spawns slightly above the impact. It's a clean exercise in moving
`f32` fields between two different structs while a couple of `u8` status bytes
get set.

```c
typedef struct { f32 posX; f32 posY; f32 posZ; } HitObj;
typedef struct {
    f32 posX; f32 posY; f32 posZ;
    s16 flags; u8 fadeTimer; u8 triggered;
} CrFuelTankObject;
extern f32 lbl_yBias;
```

`fadeTimer` and `triggered` are `u8`s right after the `s16 flags`, landing at
offsets 14 and 15. The float copies are straight `lfs`/`stfs` pairs except `Y`,
which adds the bias:

```asm
li      r5, 250
li      r0, 1
stb     r5, 14(r3)         # obj->fadeTimer = 0xfa
stb     r0, 15(r3)         # obj->triggered = 1
lfs     f0, 0(r4)          # hitObj->posX
stfs    f0, 0(r3)          # obj->posX = ...
lfs     f1, lbl_yBias
lfs     f0, 4(r4)          # hitObj->posY
fadds   f0, f1, f0
stfs    f0, 4(r3)          # obj->posY = lbl_yBias + hitObj->posY
lfs     f0, 8(r4)
stfs    f0, 8(r3)
blr
```

Note that a plain field-to-field float copy is just `lfs` then `stfs` — no
float register math at all. Only the biased `Y` brings in an `fadds`. Watch the
operand order MWCC picks: `lbl_yBias + hitObj->posY` puts the constant in `f1`
first, exactly as written.

Statement order matters: the two `stb` byte stores come *first* because that's
how the original ordered them. Write the position copies first and MWCC reorders
the byte stores to the tail (and reschedules around them) — a functional but
non-matching layout. Match the source statement order to the instruction order.

## Your task

With the structs above, write `crfueltank_apply`: set `fadeTimer` to `0xfa` and
`triggered` to `1`, then copy all three position components from `hitObj`,
adding `lbl_yBias` to `Y`.

<!-- starter -->
```c
void crfueltank_apply(CrFuelTankObject* obj, HitObj* hitObj) {
    // set the status bytes, then copy the position (Y gets a bias)
}
```

<!-- solution -->
```c
void crfueltank_apply(CrFuelTankObject* obj, HitObj* hitObj) {
    obj->fadeTimer = 0xfa;
    obj->triggered = 1;
    obj->posX = hitObj->posX;
    obj->posY = lbl_yBias + hitObj->posY;
    obj->posZ = hitObj->posZ;
}
```

<!-- context -->
```c
typedef struct { f32 posX; f32 posY; f32 posZ; } HitObj;
typedef struct {
    f32 posX; f32 posY; f32 posZ;
    s16 flags; u8 fadeTimer; u8 triggered;
} CrFuelTankObject;
extern f32 lbl_yBias;
```
