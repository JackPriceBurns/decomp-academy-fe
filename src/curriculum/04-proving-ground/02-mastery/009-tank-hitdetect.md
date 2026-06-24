---
id: mastery-tank-hitdetect
title: "Guarded Hit Detection: NULL Chains and a Type Check"
difficulty: 5
concepts:
  - control-flow
  - structs
  - float
  - calls
symbol: tank_hitDetect
hints:
  - The `&&` guard chain compiles to several `cmplwi`/`beq-` all jumping to the
    shared exit.
  - "`objType == 0x38c` reads the `s16` with `lha` then `cmpwi r0, 908`."
  - Guard the game bit with `if (def->hitEvent != -1)` → `cmpwi r3, -1` / `beq-`.
---

# Early-out guards stacked deep

This is SFA's `crfueltank_hitDetect`, faithfully shaped: three nested guards
(two NULL checks and a magic type-id check) all funnel to the **same exit**, and
only the innermost block does the work — disable hits, set status bytes, fire a
game bit behind a `!= -1` guard, and copy a biased position.

```c
typedef struct { f32 posX; f32 posY; f32 posZ; s16 objType; } HitObj;
typedef struct { HitObj* hitObj; } Collider;
typedef struct { int hitEvent; } TankDef;
typedef struct {
    Collider* collider; TankDef* def;
    f32 posX; f32 posY; f32 posZ;
    u8 fadeTimer; u8 triggered;
} TankObject;
extern void ObjHits_DisableObject(TankObject* o);
extern void GameBit_Set(int e, int v);
extern f32 lbl_yBias;
```

The key recognition skill is that a chain of `&&`-guards becomes a *cascade of
`beq-`/`bne-` to one shared label*, not nested basic blocks:

```asm
lwz     r4, 0(r3)          # collider
lwz     r30, 4(r3)         # def
cmplwi  r4, 0
beq-    .out               # collider == NULL
lwz     r31, 0(r4)         # collider->hitObj
cmplwi  r31, 0
beq-    .out               # hitObj == NULL
lha     r0, 12(r31)
cmpwi   r0, 908            # hitObj->objType == 0x38c ?
bne-    .out
...                        # the work block
lwz     r3, 0(r30)
cmpwi   r3, -1             # def->hitEvent != -1 ?
beq-    .skipbit
li      r4, 1
bl      GameBit_Set
.skipbit:
lfs     f0, 0(r31)         # copy position, Y gets lbl_yBias
...
.out:
```

The magic number is a tell: a lone `cmpwi r0, 908` against a halfword field is a
type/id check — the kind of constant you'd later name with an enum. And the
`!= -1` sentinel guard producing `cmpwi r3, -1` / `beq-` is the everyday way SFA
skips an optional event.

It doesn't matter whether you write all three guards as one flat
`collider != NULL && collider->hitObj != NULL && hitObj->objType == 0x38c` or
split the type check into its own nested `if` (as the solution does to name the
`hitObj` local): both lower to the *same* cascade of `beq-`/`bne-` to the shared
exit, so pick whichever reads clearest.

## Your task

With the structs above, write `tank_hitDetect` to match the assembly above.
Read `collider` and `def` up front. Trace the three-way guard chain, determine
what work the innermost block performs on `obj`'s fields and which helper calls
it makes, and reconstruct the `hitEvent != -1` optional-event guard and the
biased position copy.

<!-- starter -->
```c
void tank_hitDetect(TankObject* obj) {
    // guard on collider/hitObj/type, then do the work
}
```

<!-- solution -->
```c
void tank_hitDetect(TankObject* obj) {
    Collider* collider = obj->collider;
    TankDef* def = obj->def;
    if (collider != NULL && collider->hitObj != NULL) {
        HitObj* hitObj = collider->hitObj;
        if (hitObj->objType == 0x38c) {
            ObjHits_DisableObject(obj);
            obj->fadeTimer = 0xfa;
            obj->triggered = 1;
            if (def->hitEvent != -1) {
                GameBit_Set(def->hitEvent, 1);
            }
            obj->posX = hitObj->posX;
            obj->posY = lbl_yBias + hitObj->posY;
            obj->posZ = hitObj->posZ;
        }
    }
}
```

<!-- context -->
```c
typedef struct { f32 posX; f32 posY; f32 posZ; s16 objType; } HitObj;
typedef struct { HitObj* hitObj; } Collider;
typedef struct { int hitEvent; } TankDef;
typedef struct {
    Collider* collider; TankDef* def;
    f32 posX; f32 posY; f32 posZ;
    u8 fadeTimer; u8 triggered;
} TankObject;
extern void ObjHits_DisableObject(TankObject* o);
extern void GameBit_Set(int e, int v);
extern f32 lbl_yBias;
```
