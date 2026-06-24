---
id: mastery-mine-reset
title: "The Capstone: A Full Reset-to-Idle"
difficulty: 5
concepts:
  - calls
  - structs
  - float
  - fmadds
  - control-flow
symbol: mine_resetToIdle
hints:
  - Load `lbl_zero` into a local `zero` and assign it to both velocity fields so
    one `lfs` is reused.
  - Compute `dist = triggerDistance - lbl_bias`, then `dist * lbl_distScale +
    lbl_base` fuses into `fmadds`.
  - "`ObjHits_EnableObject` is called *twice* on purpose — once before the
    explosion and once after; keep both, don't collapse them."
  - The free takes the field address `&state->effectHandle` and is guarded by
    `if (state->effectHandle != NULL)`.
---

# Everything at once

The finale is SFA's `proximitymine_resetToIdle`, reshaped to compile
standalone — and it earns its place: **nine** helper calls, struct writes
through a saved state pointer, a fused float expression feeding a 9-argument
call, and a closing NULL-guarded free. If you can match this, you can match real
game code.

```c
typedef struct {
    f32 renderTimer; f32 resetTimer; int mode;
    f32 triggerDistance; void* effectHandle;
} MineState;
typedef struct {
    MineState* state;
    f32 velocityX; f32 velocityY; f32 velocityZ;
} MineObject;
extern void* Obj_GetPlayerObject(void);
extern void Sfx_StopFromObject(u32 obj, int id);
extern void Sfx_PlayFromObject(u32 obj, int id);
extern void storeZeroToFloatParam(f32* p);
extern void s16toFloat(f32* p, s16 v);
extern void ObjHits_EnableObject(u32 obj);
extern void ObjHits_MarkObjectPositionDirty(int obj);
extern void fn_lightUpdate(MineObject* obj, f32 v);
extern void spawnExplosion(MineObject* obj, f32 scale,
                           int a, int b, int c, int d, int e, int f, int g);
extern void modelLightStruct_freeSlot(void** handle);
extern f32 lbl_zero, lbl_light, lbl_base, lbl_bias, lbl_distScale;
```

The signature stretch is the explosion call. `dist * lbl_distScale + lbl_base`
fuses into one `fmadds`, and the seven trailing `int` constants each get their
own `li` into `r4..r10` — a wall of immediates that is the fingerprint of a
many-argument call:

```asm
lfs     f2, 12(r31)        # state->triggerDistance
lfs     f0, lbl_bias
lfs     f1, lbl_distScale
fsubs   f2, f2, f0         # dist = triggerDistance - lbl_bias
lfs     f0, lbl_base
li      r6, 0
li      r7, 1
...
fmadds  f1, f2, f1, f0     # dist*scale + base  -> the float arg
li      r10, 0
bl      spawnExplosion
```

Three things make or break the match. **(1)** Storing the *same* zero to two
velocity fields reuses one loaded `f0` — write `zero = lbl_zero;` to a local and
assign it twice. **(2)** Passing `&state->effectHandle` to the free routine
takes the field's *address* (`addi r3, r31, 16`), guarded by a NULL test of the
value. **(3)** Keep the call order exactly: the result of `fn_lightUpdate`
matters for scheduling, and the explosion's scale is computed inline right
before the call.

## Your task

With the structs above, write `mine_resetToIdle` reproducing the sequence:
call `Obj_GetPlayerObject()`; stop sfx `0x2e9` and `0x2e8`, play `0xf1`; zero
`velocityX`/`velocityZ` from `lbl_zero` (`velocityY` is deliberately **not**
zeroed in the original — only X and Z); `storeZeroToFloatParam(&state->renderTimer)`
then `s16toFloat(&state->renderTimer, 10)`; set `mode = 0`; enable hits and mark
position dirty; zero `resetTimer`; `fn_lightUpdate(obj, lbl_light)`; spawn the
explosion with scale `(triggerDistance - lbl_bias) * lbl_distScale + lbl_base`
and args `1,1,0,1,0,1,0`; enable hits again; and if `effectHandle != NULL`, free
it via `&state->effectHandle`.

<!-- starter -->
```c
void mine_resetToIdle(MineObject* obj) {
    // the full reset: sfx, velocity, timers, mode, hits, explosion, free
}
```

<!-- solution -->
```c
void mine_resetToIdle(MineObject* obj) {
    MineState* state;
    f32 zero;
    state = obj->state;
    Obj_GetPlayerObject();
    Sfx_StopFromObject((u32)obj, 0x2e9);
    Sfx_StopFromObject((u32)obj, 0x2e8);
    Sfx_PlayFromObject((u32)obj, 0xf1);
    zero = lbl_zero;
    obj->velocityX = zero;
    obj->velocityZ = zero;
    storeZeroToFloatParam(&state->renderTimer);
    s16toFloat(&state->renderTimer, 10);
    state->mode = 0;
    ObjHits_EnableObject((u32)obj);
    ObjHits_MarkObjectPositionDirty((int)obj);
    storeZeroToFloatParam(&state->resetTimer);
    fn_lightUpdate(obj, lbl_light);
    {
        f32 dist = state->triggerDistance - lbl_bias;
        spawnExplosion(obj, dist * lbl_distScale + lbl_base, 1, 1, 0, 1, 0, 1, 0);
    }
    ObjHits_EnableObject((u32)obj);
    if (state->effectHandle != NULL) {
        modelLightStruct_freeSlot(&state->effectHandle);
    }
}
```

<!-- context -->
```c
typedef struct {
    f32 renderTimer; f32 resetTimer; int mode;
    f32 triggerDistance; void* effectHandle;
} MineState;
typedef struct {
    MineState* state;
    f32 velocityX; f32 velocityY; f32 velocityZ;
} MineObject;
extern void* Obj_GetPlayerObject(void);
extern void Sfx_StopFromObject(u32 obj, int id);
extern void Sfx_PlayFromObject(u32 obj, int id);
extern void storeZeroToFloatParam(f32* p);
extern void s16toFloat(f32* p, s16 v);
extern void ObjHits_EnableObject(u32 obj);
extern void ObjHits_MarkObjectPositionDirty(int obj);
extern void fn_lightUpdate(MineObject* obj, f32 v);
extern void spawnExplosion(MineObject* obj, f32 scale,
                           int a, int b, int c, int d, int e, int f, int g);
extern void modelLightStruct_freeSlot(void** handle);
extern f32 lbl_zero, lbl_light, lbl_base, lbl_bias, lbl_distScale;
```
