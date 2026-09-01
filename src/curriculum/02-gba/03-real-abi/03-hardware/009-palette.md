---
id: f422ebad-db9d-48f2-9c54-5b7cc2a45cc9
slug: gba-hardware-palette
title: Writing a Palette Entry
difficulty: 4
concepts:
  - hardware
  - palette
  - addressing
symbol: func_083799d8
hints:
  - The frame is a red herring - nothing is called here. Count the argument
    registers the body reads, and read the two `lsl`/`orr` pairs as one
    expression building one halfword.
  - "Four `u32` parameters — an entry index and three colour components, five
    bits each with red at the bottom — and nothing returned. The base address
    83886592 is 0x05000200, the sprite palette."
---

# Colours are halfwords in a small array

Palette RAM starts at `0x05000000` and holds 512 entries of two bytes each: 256
for backgrounds, then 256 for sprites starting at `0x05000200`. A colour is
`BGR555` — five bits of red at the bottom, five of green above it, five of
blue above that, and one bit left over. Building one means moving each
component into its own five-bit slot and joining the pieces; storing it is a
single `strh`, because palette RAM ignores byte writes the same way VRAM
does.

Indexing it looks like any other halfword array. Here is a store to background
entry `index`:

```asm
0        lsl       r1, #16
2        lsr       r1, #16
4        lsl       r0, #1
6        mov       r2, #160
8        lsl       r2, #19
10       add       r0, r2
12       strh      r1, [r0, #0]
14       bx        lr
```

`lsl r0, #1` scales the index by the element size, the `mov`/`lsl` pair builds
`0x05000000` inline as a shifted byte, and `add` puts them together. Palette RAM
is only a kilobyte, so the whole region is reachable this way and no pool word
is needed at all.

A constant index does not even cost the multiply:

```asm
0        lsl       r0, #16
2        lsr       r0, #16
4        ldr       r1, [pc, #4] (->12)
6        strh      r0, [r1, #0]
8        bx        lr
10       .hword    0
12       .word     83886114
```

83886114 is `0x05000022`, which is `0x05000000` plus 17 entries of two bytes.
The compiler folded the index into the address, and by doing so it turned a
cheap shifted-byte base into a number that needs the pool. The same thing
happens to the sprite half of palette RAM: its base is not a byte times a power
of two, so any function reaching into it carries the address as a `.word`.

Now the part of your target that will look wrong. It opens with `push {r4, lr}`
and ends with `pop {r4}` / `pop {r0}` / `bx r0`, and it calls nothing. That
frame comes from register pressure. Once the low registers are all spoken for
and there is still an address to keep somewhere, gcc reaches for `r4`, which the
ABI says it must save and restore. `lr` rides along in the same `push` because
pushing it is free, and the interworking epilogue then unstacks the return
address into a scratch register and jumps to it. A push/pop frame tells you
about register pressure at least as often as it tells you about calls.

## Your task

Write `func_083799d8` to reproduce the target assembly.

<!-- solution -->
```c
void func_083799d8(u32 index, u32 r, u32 g, u32 b)
{
    ((vu16 *)0x05000200)[index] = r | (g << 5) | (b << 10);
}
```
