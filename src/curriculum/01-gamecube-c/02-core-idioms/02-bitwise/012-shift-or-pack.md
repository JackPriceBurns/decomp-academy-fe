---
id: 0f1986f6-13af-50ee-949d-66c87614c552
slug: bitwise-shift-or-pack
title: Packing Two Values with a Shift and OR
difficulty: 2
concepts:
  - bitwise
  - shift
  - or
  - chaining
symbol: func_803c6618
hints:
  - "`slwi rD, rA, n` shifts rA left by n bits, the same shift you'd write `<< n` in C."
  - The `or` joins two registers bit-by-bit — which register holds the shifted value,
    and which holds the unshifted one?
---

# A shift feeding an OR

Chaining bitwise work means the result of one operation immediately becomes fuel
for the next. The bread-and-butter version goes like this: you slide a value left
to open up some room, then OR a second value down into the bits you just cleared.

`make_word(hi, lo)` is a fine example. It pushes the high part up by 16 and drops
the low part in underneath it.

```asm
slwi    r0,r3,16
or      r3,r0,r4
blr
```

`slwi r0, r3, 16` shifts `r3` left by 16. Every bit climbs 16 places and the
result parks in `r0`, leaving the bottom 16 bits of `r0` at zero. There's your
gap. Now `or r3, r0, r4` fills it straight from `r4`, because any bit set in
either operand still shows up in `r3`.

Two instructions, sure, but one idea. The `slwi` output only has to stay alive
for a single cycle before `or` eats it.

Your target unpacks the same way: the `slwi` amount is how far the high value
travels, and the two `or` operands tell you which register is carrying which
half, which between them is enough to write the C.

## Your task

Write `func_803c6618` to reproduce the assembly above.

<!-- solution -->
```c
int func_803c6618(int a, int b) {
    return (a << 8) | b;
}
```
