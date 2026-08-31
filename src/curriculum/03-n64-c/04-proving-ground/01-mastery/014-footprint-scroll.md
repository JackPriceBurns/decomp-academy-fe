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
  - "Skeleton: outer loop over the 40-entry global array (stride 144, `beqzl`
    skips inactive entries by `132(v1)`), two deltas = global minus field at
    120/124, added back into those fields, then the vertex adjustments."
  - "The four-vertex inner loop is fully unrolled — write it as a plain `for (k = 0; k < 4; k++)` over the entry's `Vtx_t`s, subtracting one delta from `ob[0]` and the other from `ob[2]`. The two float locals must be initialized to 0 before the loop."
---

# The world moves; the footprints stay

The game world is bigger than an N64 can address with float precision, so the
engine *slides the world* under the player, keeping the camera near the origin —
`gWorldX` and `gWorldZ` record the current shift. Anything stamped into world
space must be dragged along when the origin jumps. This function drags the
**footprints**: up to 40 of them, each a little quad of four vertices, each
remembering (fields `unk78`/`unk7C`) the world offset it was last adjusted to.

Everything in it is something you've matched before, at shipped-game density:
`%hi`/`%lo` address builds hoisted to the top, a `beqzl`-guarded loop over
144-byte structs, float deltas computed from globals, and — the capstone
fingerprint — a **fully unrolled** inner loop. The original C says
`for (k = 0; k < 4; k++)`; the assembly says the same thing four times with
no branch, exactly as tier 3's constant-trip unrolling promised.

Each unrolled iteration subtracts a float from an `s16` vertex coordinate.
That conversion chain is the one genuinely new-feeling read, so here it is
alone — `sinkOne`, which lowers a single vertex coordinate:

```asm
 0:  mtc1  a1, fa0          # the f32 arg (it followed a pointer arg)
 4:  nop
 8:  lh    t6, 0(a0)        # pt[0], an s16
 c:  mtc1  t6, ft0          # integer bits over to the FPU…
10:  nop
14:  cvt.s.w ft1, ft0       # …become a float
18:  sub.s ft2, ft1, fa0    # pt[0] - d, in float land
1c:  trunc.w.s ft3, ft2     # back to int, rounding toward zero
20:  mfc1  t8, ft3
24:  nop
28:  sh    t8, 0(a0)        # stored as s16 again
2c:  jr    ra
30:  nop
```

`lh` → `mtc1`/`cvt.s.w` → `sub.s` → `trunc.w.s` → `mfc1` → `sh`: once per
coordinate, and the target has eight such chains braided together by the
scheduler, two coordinates (`ob[0]` and `ob[2]`) times four vertices. Don't
try to read them in order — pick one `sh`, trace its value backwards, and
trust that the C is just the loop.

Three details that decide the match:

- **The homed argument.** The `sw a0, 0(sp)` on line one is `-g3` homing
  an argument the function never reads. Declare it anyway, or the store
  vanishes.
- **The loop bound.** The `addiu` building the end address carries the whole
  array's size in its `%lo` — the compiler walks a pointer from the array's
  start to its end. Your C just loops `i` to 40; IDO does the
  strength-reduction, as tier 3 showed.
- **The two deltas** are computed from the globals *once per entry*, stored
  back into `unk78`/`unk7C` via `add.s`, and only then applied to vertices.
  Declare them as `f32` locals set to 0 before the loop — the original did,
  and the compiler's layout depends on it.

The struct, with its display-list header and vertex array, is in the context.
This is the last target of the course. Take it slow, label the listing, and
write the function the way its author did — plainly.

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
