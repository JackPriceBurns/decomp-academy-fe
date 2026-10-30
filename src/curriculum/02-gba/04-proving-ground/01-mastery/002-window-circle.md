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
  - "Work through the target in four pieces: the two reads at the top that load
    their addresses from the pool, the arithmetic that feeds the `mul`, the
    `bl`, and the guarded write at the bottom. Match them one at a time."
  - "`REG_WIN1H` packs the two edges as `(left << 8) | right`. The guard stores
    a plain 0 when the half-width goes past the edge of the screen. 120 is half
    of the GBA's 240-pixel width."
  - "Nothing goes in and nothing comes out. Every input is a global or a
    register. The `lsl #24` / `lsr #25` after the call is a cast to `u8`
    followed by a shift right by one, in that order."
symbol: UpdateWindowCircleEffect
---

# A hardware window, one scanline at a time

This is `UpdateWindowCircleEffect` from **Klonoa: Empire of Dreams**. The GBA
can clip rendering to a rectangle in hardware. `REG_WIN1H` sets the left and
right edges of window 1, packed into one halfword as `(left << 8) | right`. If
you rewrite that register on every scanline, the rectangle can become any
shape. Here it is a circle that closes over the screen.

The routine reads `REG_VCOUNT` to find out which scanline is being drawn, and it
reads a radius from the game's script state. It does a short series of integer
calculations to get the square of the chord's half-width, and passes that to
the BIOS square-root call. Then it halves the result and writes the two edges.
If the half-width is larger than half the screen, it writes 0 instead, and the
window becomes empty.

You have seen every piece of this before. Here is how two bytes are packed into
one hardware halfword, on the vertical window register:

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

On `r0`, the unbalanced pair `lsl #24` / `lsr #16` zero-extends one byte and
then shifts it up by eight. On `r1`, the balanced pair `lsl #24` / `lsr #24`
keeps its byte where it is. `orr` combines them, and one `strh` writes the
halfword. The register's address comes from a pool word (67108934 is
0x04000046). Only region *bases* such as 0x04000000 are cheap enough to build
inline.

The important part is what happens when both branches of an `if` write the same
register:

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
same register both times. gcc 2.9 places a pool wherever it needs one. It never
checks for a matching word that it already placed further down the function,
so each branch loads its own copy. The pool at 16 is also in the middle of the
code, and the `b 28` at offset 14 jumps over it. The store at 26 writes `r1`,
which still holds the incoming argument. On that path, the argument is known to
be zero.

Your target does the same thing with its own register, so expect the pool word
you are matching to appear twice. The call is shown as `bl BiosSquareRoot-4`.
The `-4` is the unrelocated Thumb branch displacement and is not part of the
name.

Build it in pieces. First get the two reads at the top to match. Then do the
arithmetic that feeds the `mul`, and then the guard. Read every constant from
the listing instead of guessing the geometry.

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
