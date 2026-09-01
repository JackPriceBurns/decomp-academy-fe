---
id: ef4f96f8-f421-58b8-ba38-89de499c013b
slug: gba-idioms-window-circle
title: "UpdateWindowCircleEffect: A Hardware Window"
difficulty: 4
concepts:
  - hardware-registers
  - fixed-point
  - bios
hints:
  - Work the target in four pieces - the two pooled reads at the top, the
    arithmetic chain feeding the `mul`, the `bl`, and the guarded write at the
    bottom. Match them one at a time.
  - "`REG_WIN1H` packs the two edges as `(left << 8) | right`, and the guard
    stores a bare 0 when the half-width runs off the screen. 120 is half of the
    GBA's 240-pixel width."
  - "Nothing goes in and nothing comes out; every input is a global or a
    register. The `lsl #24` / `lsr #25` after the call is a cast to `u8`
    followed by a shift right by one, in that order."
symbol: UpdateWindowCircleEffect
---

# A hardware window, one scanline at a time

This is `UpdateWindowCircleEffect` from **Klonoa: Empire of Dreams**. The GBA
can clip rendering to a rectangle in hardware: `REG_WIN1H` sets the left and
right edges of window 1, packed into one halfword as `(left << 8) | right`.
Rewrite that register every scanline and the rectangle becomes any shape you
like - here, a circle closing over the screen.

The routine reads `REG_VCOUNT` to find out which scanline is being drawn and a
radius out of the game's script state, runs a short chain of integer arithmetic
to get the square of the chord's half-width, hands it to the BIOS square-root
call, halves the result, and writes the two edges. If the half-width comes out
larger than half the screen, it writes 0 instead and the window collapses.

You have seen every piece of this before. Packing two bytes into one hardware
halfword looks like this, on the vertical window register:

```asm
0        lsl       r0, #24
2        lsl       r1, #24
4        lsr       r1, #24
6        ldr       r2, [pc, #8] (->16)
8        lsr       r0, #16
10       orr       r0, r1
12       strh      r0, [r2, #0]
14       bx        lr
16       .word     67108934
```

The unbalanced pair `lsl #24` / `lsr #16` on `r0` is one byte zero-extended and
then shifted up eight; the balanced `lsl #24` / `lsr #24` on `r1` leaves its
own byte where it sits. `orr` merges them and one `strh` commits the halfword.
The register's address arrives as a pool word - 67108934 is 0x04000046 -
because only region *bases* like 0x04000000 are cheap enough to synthesise
inline.

The part worth staring at is what happens when both arms of an `if` write the
same register:

```asm
0        mov       r1, r0
2        cmp       r1, #0
4        beq       24 ~>
6        ldr       r1, [pc, #8] (->16)
8        ldr       r2, [pc, #8] (->20)
10       mov       r0, r2
12       strh      r0, [r1, #0]
14       b         28 ~>
16       .word     67108940
20       .word     13107
24     ~>ldr       r0, [pc, #4] (->32)
26       strh      r1, [r0, #0]
28     ~>bx        lr
30       .hword    0
32       .word     67108940
```

The address 67108940 is in the pool **twice**, at 16 and at 32, and it is the
same register both times. gcc 2.9 emits a pool where it needs one and never
looks for a word it already has further down the function - each arm loads its
own copy. The pool at 16 also sits in the middle of the code, with the `b 28` at
offset 14 stepping over it. And the store at 26 writes `r1`, which still holds
the incoming argument, because on that path the argument is known to be zero.

Your target does the same thing with its own register, so expect the pool word
you are matching to appear twice. The call renders as `bl BiosSquareRoot-4`;
the `-4` is the unrelocated Thumb branch displacement, not part of the name.

Build it in pieces. Get the two reads at the top matching, then the arithmetic
into the `mul`, then the guard - and read every constant off the listing rather
than guessing at the geometry.

## Your task

Write `UpdateWindowCircleEffect` to reproduce the target assembly.

<!-- context -->
```c
#define REG_VCOUNT (*(vu16 *)0x04000006)
#define REG_WIN1H  (*(vu16 *)0x04000042)
#define gSceneScriptState (*(u32 *)0x03005488)
extern u32 BiosSquareRoot(u32 value);
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
