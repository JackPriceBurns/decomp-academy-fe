---
id: 4c2e58d3-bef1-403a-b813-cd177aebb523
slug: gba-bitwise-pack-three
title: Packing Three
difficulty: 4
concepts:
  - bitwise
  - constants
  - register-allocation
symbol: func_0810cfdc
hints:
  - "`.word 511` is the mask, and 511 is `0x1FF`. Only one of the three fields
    is trimmed."
  - The function takes three `u32` arguments and returns a `u32`. The first is
    masked and left at the bottom. The other two are shifted up by different
    amounts and or-ed on in argument order.
---

# The order the pieces go together

Three fields work the same way as two, with one extra thing to read: the path
that the running result takes through the registers. gcc 2.9 combines an
or-chain from left to right in source order. It keeps the partial result in
whichever register it is already in, and moves it into `r0` only at the very
end.

```asm
0        mov       r3, #15
2        and       r0, r3
4        and       r1, r3
6        lsl       r1, #4
8        orr       r1, r0
10       and       r2, r3
12       lsl       r2, #8
14       orr       r2, r1
16       mov       r0, r2
18       bx        lr
```

This packs three nibbles into one word. The mask 15 is built once in `r3` and
used three times. The first field stays at bit 0, the second is shifted up by
4, and the third by 8. Each `orr` writes into the register that holds the
*newest* field. So the running result starts in `r0`, moves to `r1`, then to
`r2`, and a final `mov r0, r2` puts it in place for the return.

That final `mov` appears whenever the chain finishes in a register other than
`r0`. If the chain's first term is already in `r0`, the running result stays
there and the chain ends without a `mov`. So read which register the `orr`s
write into, and do not rely on the `mov` being there.

Read the shift amounts as field positions, and the gaps between them as widths.
Bit 0, bit 4 and bit 8 with 4-bit masks means the fields are packed with no
gaps. A gap wider than the mask means the layout has space the author did not
use. Usually that means you are looking at a hardware register with reserved
bits, or at a field you have not identified yet.

Your target packs its fields with a mask large enough to need the literal pool.
Convert the `.word` to hex before you do anything else. The workspace prints it
in decimal, and the hex form is the one you are more likely to recognise.

## Your task

Write `func_0810cfdc` to reproduce the target assembly.

<!-- solution -->
```c
u32 func_0810cfdc(u32 x, u32 flip, u32 size) {
    return (x & 0x1FF) | (flip << 12) | (size << 14);
}
```
