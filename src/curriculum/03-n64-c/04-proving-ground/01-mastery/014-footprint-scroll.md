---
id: 6aa02379-319f-46e2-8ffa-304c440cbf6b
slug: mastery-footprint-scroll
title: "Grand Capstone: Footprints in a Moving World"
difficulty: 5
concepts:
  - real-code
  - unrolling
  - floats
  - globals
  - capstone
symbol: func_802a808c
hints:
  - "Skeleton: an outer loop over the 40-entry global array (stride 144, with `beqzl` skipping inactive entries using `132(v1)`). Two deltas, each a global minus the field at 120/124, are added back into those fields. The vertex adjustments come last."
  - "The inner loop over four vertices is fully unrolled. Write it as a plain `for (k = 0; k < 4; k++)` over the entry's `Vtx_t`s, subtracting one delta from `ob[0]` and the other from `ob[2]`. The two float locals must be initialized to 0 before the loop."
---

# Moving the footprints with the world

The game world is bigger than an N64 can handle with float precision. So the
engine *slides the world* under the player and keeps the camera near the
origin. `gWorldX` and `gWorldZ` record the current shift. Anything placed in
world space must move too when the origin jumps. This function moves the
**footprints**. There are up to 40 of them. Each one is a small quad of four
vertices, and each one stores the world offset it was last adjusted to (fields
`unk78`/`unk7C`).

You have matched everything in it before, but here it is all together, as
dense as shipped code usually is. There are `%hi`/`%lo` address builds moved
to the top, a loop over 144-byte structs guarded by `beqzl`, float deltas
computed from globals, and the main pattern of this capstone: a **fully
unrolled** inner loop. The original C says `for (k = 0; k < 4; k++)`. The
assembly repeats the body four times with no branch, as tier 3 showed for
loops with a constant trip count.

Each unrolled iteration subtracts a float from an `s16` vertex coordinate.
That chain of conversions is the one part that may feel new, so here it is on
its own, in `sinkOne`, which lowers a single vertex coordinate:

```asm
 0:  mtc1  a1, fa0          # the f32 arg (it followed a pointer arg)
 4:  nop
 8:  lh    t6, 0(a0)        # pt[0], an s16
 c:  mtc1  t6, ft0          # integer bits moved to the FPU…
10:  nop
14:  cvt.s.w ft1, ft0       # …become a float
18:  sub.s ft2, ft1, fa0    # pt[0] - d, computed as a float
1c:  trunc.w.s ft3, ft2     # back to int, rounding toward zero
20:  mfc1  t8, ft3
24:  nop
28:  sh    t8, 0(a0)        # stored as s16 again
2c:  jr    ra
30:  nop
```

Each coordinate goes through this chain once:
`lh` → `mtc1`/`cvt.s.w` → `sub.s` → `trunc.w.s` → `mfc1` → `sh`. The target
has eight such chains, two coordinates (`ob[0]` and `ob[2]`) times four
vertices, and the scheduler mixes them together. Do not try to read them in order. Pick one `sh`, trace its value
backwards, and trust that the C is only the loop.

Three details decide the match:

- **The homing store.** The `sw a0, 0(sp)` on line one is `-g3` homing. The
  store appears even when the function never reads that argument, and it
  disappears if the C does not declare it. Work out from it what the
  signature must contain.
- **The loop bound.** The `addiu` that builds the end address holds the size
  of the whole array in its `%lo`, because the compiler walks a pointer from
  the start of the array to its end. Your C loops `i` up to 40, and IDO does
  the strength reduction, as tier 3 showed.
- **The two deltas** are computed from the globals *once per entry*, added
  back into `unk78`/`unk7C` with `add.s`, and only then applied to the
  vertices. Declare them as `f32` locals set to 0 before the loop. The
  original did this, and the compiler's layout depends on it.

The struct, with its display-list header and vertex array, is in the context.
This is the last target of the course. Take your time, label the listing, and
write the function in the same plain way its author did.

## Your task

Write `func_802a808c` to reproduce the target assembly.

<!-- solution -->
```c
void func_802a808c(s32 arg) {
    f32 var1;
    f32 var2;
    s32 i;
    s32 k;
    Vtx_t *ptr;

    var1 = 0;
    var2 = 0;

    for (i = 0; i < 40; i++) {
        if (gUnkFootstepStructs[i].unk84 != 0) {
            ptr = &gUnkFootstepStructs[i].unk18[0];

            var1 = gWorldX - gUnkFootstepStructs[i].unk78;
            var2 = gWorldZ - gUnkFootstepStructs[i].unk7C;

            gUnkFootstepStructs[i].unk78 += var1;
            gUnkFootstepStructs[i].unk7C += var2;

            for (k = 0; k < 4; k++) {
                ptr->ob[0] -= var1;
                ptr->ob[2] -= var2;
                ptr++;
            }
        }
    }
}
```

<!-- context -->
```c
/* One display-list command; the s64 keeps the struct 8-byte aligned. */
typedef union {
    u32 words[2];
    s64 force_structure_alignment;
} Gfx;

/* One colored vertex, as the RSP sees it. */
typedef struct {
    short ob[3];            /* x, y, z */
    unsigned short flag;
    short tc[2];            /* texture coords */
    unsigned char cn[4];    /* color & alpha */
} Vtx_t;

typedef struct {
    u8 unk0;
    u8 v0;
    u8 v1;
    u8 v2;
    u8 unk4[0x10 - 0x4];
} DLTri;

/* size: 0x90 */
typedef struct {
/*00*/ Gfx dl[3];
/*18*/ Vtx_t unk18[4];
/*58*/ DLTri unk58[2];
/*78*/ f32 unk78;
/*7C*/ f32 unk7C;
/*80*/ void *obj;
/*84*/ s32 unk84;
/*88*/ s16 unk88;
} UnkFootstepsStruct;

extern f32 gWorldX;
extern f32 gWorldZ;
extern UnkFootstepsStruct gUnkFootstepStructs[40];
```
