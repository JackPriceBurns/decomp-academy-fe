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
runs, and each branch flips the same flag bit in opposite directions. Because the
function *calls* something, you get a real prologue/epilogue with a saved
register.

```c
typedef struct { f32 timer; s16 flags; u8 fadeTimer; u8 pad; } CrFuelTankObject;
extern int timerCountDown(f32* t);
extern void ObjHits_EnableObject(CrFuelTankObject* o);
```

**Two idioms, same field.** A single-bit clear and a single-bit set on the same
`s16` flags field compile differently:

- `flags & ~MASK` → `rlwinm` (rotate-and-mask; clears exactly one bit)
- `flags | MASK` → `ori` (OR immediate; sets exactly one bit)

Writing `flags &= 0xbfff` instead of `flags &= ~0x4000` would emit `andi` — a
different instruction that won't match.

The `(s16)` cast around each result keeps the field halfword-wide: reads use
`lha` and writes use `sth`.

To see both idioms in a simpler context, here is a particle-timer variant that
operates on bit `0x2000` instead:

```asm
# nonzero branch:
lha     r3, 4(r31)
li      r0, 128
rlwinm  r3, r3, 0, 19, 17  # flags &= ~0x2000
sth     r3, 4(r31)
stb     r0, 6(r31)         # alpha = 0x80
b       .end
# zero branch:
lha     r0, 4(r31)
ori     r0, r0, 8192       # flags |= 0x2000
sth     r0, 4(r31)
```

Note `rlwinm r3, r3, 0, 19, 17`: rotate by 0, keep bits from MB=19 through
ME=17 (wrapping), which zeros every bit *except* those in that range — the
excluded bit is at MSB-position 18, i.e. `0x2000`. The `ori 8192` is
`0x2000` in decimal.

In the target assembly below, read the `rlwinm` MB/ME fields to work out which
bit is cleared, and read the `ori` immediate to confirm the same bit is set.
Read the `li` immediate to find the byte-field value.

```asm
stwu    r1, -16(r1)
mflr    r0
...
bl      timerCountDown
cmpwi   r3, 0
beq-    .else
mr      r3, r31
bl      ObjHits_EnableObject
lha     r3, 4(r31)
li      r0, 255
rlwinm  r3, r3, 0, 18, 16
sth     r3, 4(r31)
stb     r0, 6(r31)
b       .end
.else:
lha     r0, 4(r31)
ori     r0, r0, 16384
sth     r0, 4(r31)
.end:
...
blr
```

## Your task

With the struct above, write `crfueltank_tick` to reproduce the assembly above.

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
