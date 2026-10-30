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
  - Each component is shifted down by 3 before it is masked. That turns an
    8-bit channel into a 5-bit one. The three fields then land at bits 0, 5
    and 10.
  - The function takes three `u32` arguments (red, green and blue, in that
    order) and returns a 15-bit colour.
---

# The colour format the hardware stores

A GBA palette entry is 16 bits holding three 5-bit channels: red at bits 0
through 4, green at 5 through 9, and blue at 10 through 14. The top bit is
unused. Fades, flashes and palette animations in GBA games are all built from
the masks and shifts this chapter has covered, applied to that layout.

Here is a function that takes a packed colour apart and puts it back together
with red and blue swapped:

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

Each of the three fields is handled differently, and each one uses a technique
you have already seen.

Blue comes down from bit 10 with a shift and a mask. That needs a copy of the
source word, so the shift is the three-operand `lsr r2, r0, #10`, and the mask
31 is built once in `r3` and shared. Green does not move: 248 shifted left by 2
is `0x3E0`, exactly bits 5 through 9, so the middle channel is masked in place
with no shift. Red is masked at the bottom and shifted up by 10 into blue's old
position. The or-chain then builds up the running result in `r2`, and the final
`mov r0, r2` moves it into `r0` for the return.

Your target builds a colour instead of rearranging one. Here too, a single 31 is
built once and shared. Take one channel at a time, and read the shift on each
side of its `and`. The shift before it tells you what had to happen to the
channel before it would fit. The shift after it tells you where in the layout it
lands. Once you have worked out one channel, the rest is the packing you did two
lessons ago.

Watch which register the or-chain builds up in. This time the result stays in
`r0` the whole way. That comes from where the first field's value ends up. You
do not write anything differently to cause it.

## Your task

Write `func_08115ec4` to reproduce the target assembly.

<!-- solution -->
```c
u16 func_08115ec4(u32 r, u32 g, u32 b) {
    return ((r >> 3) & 31) | (((g >> 3) & 31) << 5) | (((b >> 3) & 31) << 10);
}
```
