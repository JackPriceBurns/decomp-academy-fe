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
  - Three `u32` arguments and a `u32` result. The first is masked and left at
    the bottom; the other two are shifted up by different amounts and or-ed on
    in argument order.
---

# The order the pieces go together

Three fields work exactly like two, with one extra thing to read: the path the
running result takes through the registers. gcc 2.9 folds an or-chain left to
right in source order, and it keeps the partial result wherever it happens to
be, moving it into `r0` only at the very end.

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

Three nibbles into one word. The mask 15 is built once in `r3` and used three
times. The first field stays at bit 0, the second goes up by 4, the third by 8,
and each `orr` writes into the register holding the *newest* field: the
accumulator starts in `r0`, moves to `r1`, then to `r2`, and a final
`mov r0, r2` delivers it.

That closing `mov` shows up whenever the chain finishes somewhere other than
`r0`. A chain whose first term already sits in `r0` keeps the accumulator there
and ends without one, so read the register the `orr`s write into rather than
counting on the `mov` to be there.

Read the shift amounts as field positions and the gaps between them as widths.
Bit 0, bit 4 and bit 8 with 4-bit masks means the fields are packed tight. A
gap wider than the mask means the layout has room the author did not use, which
usually means you are looking at a hardware register with reserved bits or a
field you have not identified yet.

Your target packs its fields with a mask big enough to need the literal pool.
Convert the `.word` to hex before you do anything else — the workspace prints
it in decimal, and the hex form is the one that will look familiar.

## Your task

Write `func_0810cfdc` to reproduce the target assembly.

<!-- solution -->
```c
u32 func_0810cfdc(u32 x, u32 flip, u32 size) {
    return (x & 0x1FF) | (flip << 12) | (size << 14);
}
```
