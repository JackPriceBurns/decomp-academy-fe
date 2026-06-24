---
id: mastery-fueltank-tick
title: A Flag Toggle Behind a Helper Call
difficulty: 3
concepts:
  - bitmask
  - control-flow
  - calls
  - narrow-types
symbol: crfueltank_tick
hints:
  - Clear the bit with `flags & ~0x4000` (→ `rlwinm`), never `& 0xbfff` (→
    `andi`).
  - Set the bit with `flags | 0x4000` (→ `ori`).
  - Wrap both in `(s16)(...)` so the field stays halfword-wide and reads/writes
    with `lha`/`sth`.
---

# Clearing and setting a flag bit

Straight from SFA's `crfueltank_update`: a timer helper decides which branch
runs, and each branch flips the same `0x4000` flag bit in opposite directions.
Because the function now *calls* something, you get your first real
prologue/epilogue with a saved register.

```c
typedef struct { f32 timer; s16 flags; u8 fadeTimer; u8 pad; } CrFuelTankObject;
extern int timerCountDown(f32* t);
extern void ObjHits_EnableObject(CrFuelTankObject* o);
```

The two flag writes are the heart of it. A **single-bit clear** written as
`flags & ~0x4000` leads MWCC to emit an `rlwinm` mask rather than an `andi`; the
**set** is a plain `| 0x4000` → `ori`. The `(s16)` cast keeps the
field at halfword width (`lha`/`sth`):

```asm
stwu    r1, -16(r1)        # prologue — we make a call
mflr    r0
...
bl      timerCountDown
cmpwi   r3, 0
beq-    .else
bl      ObjHits_EnableObject
lha     r3, 4(r31)
li      r0, 255
rlwinm  r3, r3, 0, 18, 16  # flags &= ~0x4000   (clear one bit)
sth     r3, 4(r31)
stb     r0, 6(r31)         # fadeTimer = 0xff
b       .end
.else:
lha     r0, 4(r31)
ori     r0, r0, 16384      # flags |= 0x4000     (set one bit)
sth     r0, 4(r31)
.end:
```

Reading `rlwinm r3, r3, 0, 18, 16` back: the fields are
`rlwinm rA, rS, SH, MB, ME` — rotate by `SH`=0 (no rotate), then keep the bits
from `MB`=18 through `ME`=16 *wrapping* (because MB > ME), which is every bit
except the one at MSB-position 17, i.e. `0x4000`. So this is exactly
`flags &= ~0x4000`. The contrast `rlwinm` (clear) vs `ori` (set) is the lesson:
same flag, two different mask idioms, and a different C expression like
`&= 0xbfff` would emit `andi` and miss the match.

## Your task

With the struct above, write `crfueltank_tick`. If `timerCountDown(&obj->timer)`
is nonzero, enable hits, **clear** the `0x4000` flag, and set `fadeTimer` to
`0xff`. Otherwise, **set** the `0x4000` flag. Keep the `(s16)` casts.

<!-- starter -->
```c
void crfueltank_tick(CrFuelTankObject* obj) {
    // branch on the timer; clear vs set the 0x4000 flag
}
```

<!-- solution -->
```c
void crfueltank_tick(CrFuelTankObject* obj) {
    if (timerCountDown(&obj->timer) != 0) {
        ObjHits_EnableObject(obj);
        obj->flags = (s16)(obj->flags & ~0x4000);
        obj->fadeTimer = 0xff;
    } else {
        obj->flags = (s16)(obj->flags | 0x4000);
    }
}
```

<!-- context -->
```c
typedef struct { f32 timer; s16 flags; u8 fadeTimer; u8 pad; } CrFuelTankObject;
extern int timerCountDown(f32* t);
extern void ObjHits_EnableObject(CrFuelTankObject* o);
```
