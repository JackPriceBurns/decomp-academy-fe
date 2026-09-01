---
id: 2687c998-9603-417e-8e95-110752d99b19
slug: gba-hardware-capstone
title: "Capstone: A Scanline Effect"
difficulty: 5
concepts:
  - hardware
  - branches
  - shifts
hints:
  - The `lsr` in the body is applied to the register that still holds the
    scanline shifted left by sixteen, so subtract 16 from the shift amount to
    recover the shift the source wrote.
  - "One `u8` goes in and nothing comes out. Read 0x04000006, do nothing when it
    is 160 or more, and otherwise write a single halfword to 0x04000040 whose
    high byte is the shifted scanline and whose low byte is that same value plus
    the parameter."
symbol: func_08387034
---

# Everything in this chapter, in fifteen instructions

Raster effects are the reason GBA games poll `VCOUNT`. An interrupt fires per
scanline, the handler asks which line the display is on, and it rewrites a
display register before the beam gets there — scrolling one row of a background
sideways, sliding a window edge, fading a layer as it descends the screen. Every
such handler has the same three parts: a volatile read of the counter, a guard
that does nothing outside the visible region, and a packed write.

Here is one that walks the blend weights of `BLDALPHA` down the screen:

```asm
0        ldr       r0, [pc, #24] (->28)
2        ldrh      r0, [r0, #0]
4        lsl       r1, r0, #16
6        lsr       r0, r1, #16
8        cmp       r0, #159
10       bhi       26 ~>
12       ldr       r2, [pc, #16] (->32)
14       lsr       r1, #20
16       mov       r0, #16
18       sub       r0, r1
20       lsl       r0, #8
22       orr       r1, r0
24       strh      r1, [r2, #0]
26     ~>bx        lr
28       .word     67108870
32       .word     67108946
```

The first two instructions are the read: 67108870 is `0x04000006`. Then the
guard — the same `cmp #159` / `bhi` pair you met in the polling lesson, except
here the branch clears the entire body and lands on the `bx lr`. Skipping the
work is spelled as a branch to the return, so a function like this has one exit
and a large forward jump over everything.

Offsets 4 and 6 are where it gets interesting. Widening the halfword to a 32-bit
value is the usual `lsl #16` / `lsr #16` pair, except gcc used the three-operand
form and put the intermediate in a **different** register. `r1` is left holding
the scanline shifted up by sixteen, and it stays live.

Which is why offset 14 says `lsr r1, #20` and means `y >> 4`. Shifting left by
16 and then right by 20 lands four places lower than where you started, so a
single instruction does the zero-extension and the shift together, reusing a
value that was only supposed to be scaffolding. Whenever you see a right shift
somewhere between 17 and 31 applied to a register produced by an `lsl #16`,
subtract 16 to recover the shift the programmer actually wrote.

The rest is the packing you already know: `mov #16` / `sub` computes the
complementary weight, `lsl #8` moves it into the high byte, `orr` joins the two
halves, and `strh` writes the halfword to `0x04000052`. Two pool words sit after
the return, one for each hardware address the function names.

Your target reads the same counter and guards it the same way. Past the branch
it builds its halfword out of the scanline, and one of the shifts you see there
has sixteen baked into it.

## Your task

Write `func_08387034` to reproduce the target assembly.

<!-- solution -->
```c
void func_08387034(u8 width)
{
    u32 y = *(vu16 *)0x04000006;
    if (y < 160)
        *(vu16 *)0x04000040 = ((y >> 2) << 8) | ((y >> 2) + width);
}
```
