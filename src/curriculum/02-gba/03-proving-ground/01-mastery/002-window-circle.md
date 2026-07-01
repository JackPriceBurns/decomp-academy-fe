---
id: gba-idioms-window-circle
title: "UpdateWindowCircleEffect: A Hardware Window"
difficulty: 4
concepts:
  - hardware-registers
  - fixed-point
  - bios
symbol: UpdateWindowCircleEffect
hints:
  - It reads REG_VCOUNT and a script-state radius, does fixed-point geometry,
    calls BiosSquareRoot, then writes a packed value to REG_WIN1H.
  - REG_WIN1H packs two 8-bit edges as (left << 8) | right; the guard writes 0
    when the half-width exceeds the screen.
---

# A real hardware effect

This is `UpdateWindowCircleEffect` from **Klonoa: Empire of Dreams**. Each
scanline it computes the horizontal span of a circular window and writes it to
the GBA's window register `REG_WIN1H`, which packs the left and right edges as
`(left << 8) | right`.

The function reads `REG_VCOUNT` and a script-state radius, runs a chain of
fixed-point arithmetic, hands the result to the BIOS square-root routine
(`BiosSquareRoot`, reached with a `bl`), halves it, and writes the packed edges —
guarded so an oversized half-width stores `0` instead.

The packed-write idiom on its own — writing two bytes to a different register —
looks like this:

```asm
lsl	r0, r0, #0x18
lsl	r1, r1, #0x18
lsr	r1, r1, #0x18
ldr	r2, .L3
lsr	r0, r0, #0x10
orr	r0, r0, r1
strh	r0, [r2]
bx	lr
```

The register's address comes from a `.word` in the constant pool (the
`ldr r2, .L3`), the two bytes are shifted into place and `orr`'d, and `strh`
writes the half-word. The full exercise wraps a lot more arithmetic and a `bl`
around that final write — work through the target a few instructions at a time.

## Your task

Write `UpdateWindowCircleEffect` to reproduce the target assembly.

<!-- context -->
```c
typedef unsigned char u8;
typedef unsigned short u16;
typedef unsigned int u32;
typedef signed int s32;
typedef volatile unsigned short vu16;
#define REG_VCOUNT (*(vu16 *)0x04000006)
#define REG_WIN1H  (*(vu16 *)0x04000042)
#define gSceneScriptState (*(u32 *)0x03005488)
extern u32 BiosSquareRoot(u32 value);
```

<!-- starter -->
```c
void UpdateWindowCircleEffect(void) {
}
```

<!-- solution -->
```c
void UpdateWindowCircleEffect(void) {
    u16 vcount = REG_VCOUNT;
    u32 radius = gSceneScriptState;
    u32 half_r = radius >> 1;
    s32 y = vcount - half_r;
    s32 y_adj = y + 12;
    s32 x_span;
    u32 val;
    u32 sqr;
    u32 hw;
    x_span = 0xE4 - y;
    x_span -= radius;
    val = (u32)(x_span * y_adj) << 2;
    sqr = BiosSquareRoot(val);
    hw = (u8)sqr >> 1;
    if (hw <= 0x78) {
        REG_WIN1H = ((0x78 - hw) << 8) | (hw + 0x78);
    } else {
        REG_WIN1H = 0;
    }
}
```
