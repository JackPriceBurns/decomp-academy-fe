---
id: 3c2b8af2-75d0-441c-b0e1-304ddee4800b
slug: structs-flag-set
title: "Setting a Flag"
difficulty: 2
concepts:
  - structs
  - flags
  - rmw
symbol: func_8030ae28
hints:
  - "`lbu`/`ori`/`sb`, all at the same offset — which byte field of
    `Enemy` is that? The `ori` immediate is the flag being set."
  - "One `|=` line. Write the flag constant in hex, as the listing spells it."
---

# flags |= BIT

Games track dozens of on/off facts per object — seen, invincible,
airborne — packed as individual bits in a flag byte. Setting one bit
is the RMW sandwich with `ori` in the middle, and it's so common it
deserves its own reflex:

```c
typedef struct {
    u8 flags;    // offset 0 — bit 2 = "active"
    u8 kind;     // offset 1
    s16 hp;      // offset 2
} Ent;

void set_active(Ent *e) {
    e->flags |= 4;
}
```

```asm
lbu   t6, 0(a0)     # read the flag byte
ori   t7, t6, 0x4   # switch bit 2 on
sb    t7, 0(a0)     # write it back
jr    ra
nop
```

`lbu`, `ori`, `sb` — same offset throughout. The `ori` immediate is
the mask: `0x4` is bit 2, `0x10` bit 4, `0x81` bits 7 and 0 at once.
OR-ing leaves every other bit alone, which is the entire point:
neighbors' flags survive.

Note what this *isn't*: a bitfield. A `u8` used as a flag byte and a
struct full of 1-bit bitfields both exist in real code, but the flag
byte compiles to these clean `ori`/`andi` one-liners with
programmer-chosen hex masks, and the C convention is a plain integer
field plus `#define`d or literal masks. When you see `ori` with a
round hex immediate on a byte field, decompile it as `|=`.

In the target, the flag byte isn't the struct's first field — check
the offset against the `Enemy` layout below before naming it — and a
different bit gets set.

## Your task

Write `func_8030ae28` to reproduce the target assembly.

<!-- solution -->
```c
void func_8030ae28(Enemy *e) {
    e->flags |= 0x10;
}
```

<!-- context -->
```c
typedef struct {
    u8 state;
    u8 flags;
    u8 timer;
    u8 pad;
    s32 target;
} Enemy;
```
