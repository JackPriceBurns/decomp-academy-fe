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
the game copies the *hitter's* position onto the tank, lifting one axis by a
constant so the effect spawns slightly offset from the impact point. It's a clean
exercise in moving `f32` fields between two different structs while a couple of
`u8` status bytes get set.

```c
typedef struct { f32 posX; f32 posY; f32 posZ; } HitObj;
typedef struct {
    f32 posX; f32 posY; f32 posZ;
    s16 flags; u8 fadeTimer; u8 triggered;
} CrFuelTankObject;
extern f32 lbl_yBias;
```

**Byte fields after a halfword.** `flags` is `s16` (2 bytes), so `fadeTimer` and
`triggered` land at offsets 14 and 15 within `CrFuelTankObject`. Loading or
storing a `u8` field uses `lbz`/`stb`.

**Float copies.** Copying an `f32` field from one struct to another is a bare
`lfs` followed by `stfs` — no arithmetic register involved. Only when a bias is
added does an `fadds` appear between the load and the store.

**Statement order drives instruction order.** The compiler schedules `stb`
byte-store statements roughly in source order. If you write the byte stores
*after* the float copies, MWCC reschedules them to the end and produces a
non-matching layout. Write the byte stores in whatever order the assembly shows
them.

Consider an analogous function that spawns an explosion, biasing posX instead
of posY and using a different timer value:

```asm
li      r5, 30
li      r0, 1
stb     r5, 14(r3)         # obj->lifetime = 0x1e
stb     r0, 15(r3)         # obj->active = 1
lfs     f1, lbl_xBias(0)
lfs     f0, 0(r4)          # src->posX
fadds   f0, f1, f0
stfs    f0, 0(r3)          # obj->posX = lbl_xBias + src->posX
lfs     f0, 4(r4)
stfs    f0, 4(r3)
lfs     f0, 8(r4)
stfs    f0, 8(r3)
blr
```

The bias appears on posX in the example (offset 0), not posY. Now read the actual
target to find which component gets the `fadds`, the byte-field values, and the
bias symbol:

```asm
li      r5, 250
li      r0, 1
stb     r5, 14(r3)
stb     r0, 15(r3)
lfs     f0, 0(r4)
stfs    f0, 0(r3)
lfs     f1, lbl_yBias(0)
lfs     f0, 4(r4)
fadds   f0, f1, f0
stfs    f0, 4(r3)
lfs     f0, 8(r4)
stfs    f0, 8(r3)
blr
```

## Your task

With the structs above, write `crfueltank_apply` to reproduce the assembly above.

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
