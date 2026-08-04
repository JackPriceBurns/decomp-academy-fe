---
id: 7e1a34d7-6914-5098-b31e-b415baeb8175
slug: structs-copy-chain
title: Combining a Copy With a Field Update
difficulty: 3
concepts:
  - structs
  - copy
  - write
  - chaining
symbol: func_803868d0
hints:
  - First a member-to-member copy (loads from one set of offsets, stores to
    another, all off the same base pointer), then a separate write to a scalar
    field.
  - Split the assembly into the copy block and the trailing field write; each half
    is a technique you have already used.
---

# Chaining a struct copy with another step

Real functions rarely copy a struct and stop. This lesson combines two techniques
you already know — a struct copy and a plain field write — back to back. A struct
copy can also happen between two members of the same object:
`obj->a = obj->b` copies one sub-struct over another, with loads and stores hanging
off the same base pointer at different offsets.

Consider an entity that snaps its velocity back to a saved value and bumps a
counter:

```c
typedef struct { f32 x; f32 y; f32 z; } Vec3;
typedef struct { Vec3 vel; Vec3 origin; s32 frame; } Particle;

void Particle_reset(Particle* p) {
    p->vel = p->origin;
    p->frame += 1;
}
```

```asm
lwz   r4, 12(r3)    # origin.x   (origin starts at offset 12)
lwz   r0, 16(r3)    # origin.y
stw   r4, 0(r3)     # vel.x      (vel starts at offset 0)
stw   r0, 4(r3)     # vel.y
lwz   r0, 20(r3)    # origin.z
stw   r0, 8(r3)     # vel.z
lwz   r4, 24(r3)    # frame
addi  r0, r4, 1     # frame + 1
stw   r0, 24(r3)    # frame = frame + 1
blr
```

Two steps sit side by side. The six `lwz`/`stw` that read `origin` (offsets
12/16/20) and write `vel` (offsets 0/4/8) are the member copy
`p->vel = p->origin` — both halves use the single base pointer `r3` because source
and destination live in the same object. The trailing `lwz`/`addi`/`stw` on offset
24 is the separate field update `p->frame += 1`. Mentally split the copy block from
the scalar tail and each piece is familiar.

The target does the same — a member copy followed by one scalar field update (read
its tail carefully; the second step differs from above). Pull the two apart, then
write both.

## Your task

With the `Mob` struct above, write `func_803868d0` to reproduce the target
assembly.

<!-- solution -->
```c
void func_803868d0(Mob* m) {
    m->pos = m->home;
    m->hp = 100;
}
```

<!-- context -->
```c
typedef struct { f32 x; f32 y; f32 z; } Vec3;
typedef struct { Vec3 pos; Vec3 home; s32 hp; } Mob;
```
