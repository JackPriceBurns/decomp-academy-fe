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
  - The stack frame is misleading, because nothing is called here. Count the
    argument registers the body reads. Read the two `lsl`/`orr` pairs as one
    expression that builds one halfword.
  - "There are four `u32` parameters (an entry index and three colour
    components, five bits each with red at the bottom), and nothing is
    returned. The base address 83886592 is 0x05000200, the sprite palette."
---

# Colours are halfwords in a small array

Palette RAM starts at `0x05000000` and holds 512 entries of two bytes each. The
first 256 are for backgrounds, and the next 256 are for sprites, starting at
`0x05000200`. A colour is `BGR555`: five bits of red at the bottom, five bits
of green above it, five bits of blue above that, and one bit left over. To
build a colour, you move each component into its own five-bit slot and join the
pieces. To store it, you use a single `strh`, because palette RAM ignores byte
writes, in the same way as VRAM.

Indexing it works like any other halfword array. Here is a store to background
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

`lsl r0, #1` scales the index by the element size. The `mov`/`lsl` pair builds
`0x05000000` inline as a shifted byte, and `add` combines the two. Palette RAM
is only a kilobyte, so the whole region can be reached this way and no pool word
is needed.

A constant index does not even need the multiply:

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
The compiler folded the index into the address. In doing so, it turned a cheap
shifted-byte base into a number that needs the pool. The same happens with the
sprite half of palette RAM. Its base is not a byte times a power of two, so any
function that writes there carries the address as a `.word`.

The next part of your target will look wrong. It starts with `push {r4, lr}`
and ends with `pop {r4}` / `pop {r0}` / `bx r0`, but it calls nothing. This
frame comes from register pressure. Once all the low registers are in use and
there is still an address to keep somewhere, gcc uses `r4`. The ABI says `r4`
must be saved and restored. `lr` is saved in the same `push` because adding it
costs nothing. The interworking epilogue then pops the return address into a
scratch register and jumps to it. A push/pop frame is a sign of register
pressure at least as often as it is a sign of calls.

## Your task

Write `func_083799d8` to reproduce the target assembly.

<!-- solution -->
```c
void func_083799d8(u32 index, u32 r, u32 g, u32 b)
{
    ((vu16 *)0x05000200)[index] = r | (g << 5) | (b << 10);
}
```
