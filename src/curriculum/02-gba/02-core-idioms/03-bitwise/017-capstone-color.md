---
id: 196a11a6-f289-4489-902b-38773a009c11
slug: gba-bitwise-capstone-color
title: "Capstone: A BGR555 Colour"
difficulty: 5
concepts:
  - bitwise
  - shifts
  - constants
symbol: func_08115ec4
hints:
  - Each component is shifted down by 3 before it is masked, which is what turns
    an 8-bit channel into a 5-bit one. The three fields then land at bits 0, 5
    and 10.
  - Three `u32` arguments — red, green, blue, in that order — and a 15-bit
    colour as the result.
---

# The colour the hardware actually stores

A GBA palette entry is 16 bits holding three 5-bit channels: red at bits 0
through 4, green at 5 through 9, blue at 10 through 14. The top bit is unused.
Every fade, every flash, every palette animation in a GBA game is built out of
the masks and shifts this chapter has covered, applied to that layout.

Here is a function taking a packed colour apart and putting it back together
with red and blue exchanged:

```asm
0        lsr       r2, r0, #10
2        mov       r3, #31
4        and       r2, r3
6        mov       r1, #248
8        lsl       r1, #2
10       and       r1, r0
12       orr       r2, r1
14       and       r0, r3
16       lsl       r0, #10
18       orr       r2, r0
20       mov       r0, r2
22       bx        lr
```

Three fields, three different treatments, and each one is a technique you have
already met.

Blue comes down from bit 10 with a shift and a mask, so it needs a copy of the
source word — hence the three-operand `lsr r2, r0, #10` and the shared mask 31
built once in `r3`. Green never moves: 248 shifted left by 2 is `0x3E0`, exactly
bits 5 through 9, so the middle channel is masked in place with no shift at all.
Red is masked at the bottom and shifted up by 10 to take blue's old position.
Then the or-chain accumulates in `r2` and the closing `mov r0, r2` delivers it.

Your target builds a colour instead of rearranging one. A single 31 is built
once and shared here too, so take one channel at a time and read the shift on
each side of its `and`: the one in front says what had to happen to the channel
before it would fit, the one behind says where in the layout it lands. Work out
one channel and the rest is the packing you did two lessons ago.

Watch the register the or-chain accumulates in. It never leaves `r0` this time,
and that is a consequence of where the first field's value ends up rather than
anything you write differently.

## Your task

Write `func_08115ec4` to reproduce the target assembly.

<!-- solution -->
```c
u16 func_08115ec4(u32 r, u32 g, u32 b) {
    return ((r >> 3) & 31) | (((g >> 3) & 31) << 5) | (((b >> 3) & 31) << 10);
}
```
