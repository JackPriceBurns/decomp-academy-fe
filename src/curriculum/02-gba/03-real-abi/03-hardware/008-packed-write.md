---
id: 63bed602-cca8-4a85-b4bf-b2040cc9c6af
slug: gba-hardware-packed-write
title: Packing Two Edges Into One Register
difficulty: 4
concepts:
  - hardware
  - narrow-types
  - shifts
symbol: func_08375464
hints:
  - An unbalanced shift pair carries two facts at once - the left shift is 32
    minus the width of the parameter's type, and the gap between the two shifts
    is how far the value is then moved up.
  - "Two `u8` parameters in, nothing out. The halfword at 0x04000044 takes the
    first one in its high byte and the second in its low byte."
---

# One halfword, two fields

The GBA's window registers describe a rectangle in two halfwords: `WIN0H` at
`0x04000040` holds the left edge in its high byte and the right edge in its low
byte, and `WIN0V` at `0x04000044` does the same for top and bottom. Code that
sets one of them takes the two coordinates apart, shifts one into place, ors
them together and stores a single halfword.

The shifting comes out looking strange, because agbcc fuses two separate jobs
into one pair of instructions. Here is a write to `MOSAIC` at `0x0400004C`,
which packs a horizontal size and a vertical size four bits apart:

```asm
0        lsl       r0, #16
2        lsr       r0, #16
4        lsl       r1, #16
6        ldr       r2, [pc, #8] (->16)
8        lsr       r1, #12
10       orr       r0, r1
12       strh      r0, [r2, #0]
14       bx        lr
16       .word     67108940
```

`r0` gets the balanced pair, `lsl #16` then `lsr #16`, which is how this
compiler zero-extends a 16-bit parameter — it distrusts the caller and re-clears
the top half on entry even though the `strh` would throw those bits away anyway.

`r1` gets `lsl #16` and then `lsr #12`, and that is the interesting one. The
left shift is the same zero-extension; the right shift comes up four short,
which leaves the value shifted **left** by four. One pair of instructions does
"narrow to sixteen bits" and "move up by four" together.

The rule generalises. For a parameter of width W shifted left by S, you get
`lsl #(32 - W)` followed by `lsr #(32 - W - S)`. Run it backwards from a
listing: the left shift tells you the declared width, and the difference between
the two shifts tells you the shift the source wrote. A balanced pair is a plain
narrow parameter with no shift at all.

Note also that the `ldr` of the address is scheduled into the middle of the
shift sequence. Instructions are not in source order here, and the pool word
still belongs to the store at the bottom.

Your target writes one of the window registers. Run that rule backwards on both
of its shift pairs before you write anything.

## Your task

Write `func_08375464` to reproduce the target assembly.

<!-- solution -->
```c
void func_08375464(u8 top, u8 bottom)
{
    *(vu16 *)0x04000044 = (top << 8) | bottom;
}
```
