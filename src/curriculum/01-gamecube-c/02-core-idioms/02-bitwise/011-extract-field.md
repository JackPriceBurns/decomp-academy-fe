---
id: bitwise-extract-field
title: Extracting a Bitfield in One rlwinm
difficulty: 4
concepts:
  - bitwise
  - rlwinm
  - bitfields
  - instruction-selection
symbol: extract_nibble
hints:
  - Shift the field down, then mask off the unwanted high bits.
  - "`rlwinm` fuses the shift and the mask into one instruction."
  - "Expect `rlwinm r3, r3, 28, 28, 31`: rotate-left-28 (= right-4), keep low 4
    bits."
---

# One rlwinm does the shift and the mask

In C, prying a packed field loose reads as two steps. Shift it down to bit 0,
then mask off the neighbours that tagged along. PowerPC won't spend two
instructions on that. `rlwinm` rotates and masks together, and MWCC leans on it
every chance it gets.

Suppose the field you want is the 4-bit nibble at bits 8-11, one notch up from
the bottom nibble.

```asm
rlwinm  r3,r3,24,28,31
blr
```

Start with the `24`. A left rotate by 24 is just a right rotate by 8 wearing a
different hat, and it drops bits 8-11 squarely onto bits 0-3. Don't trust me,
trace a value. `0x00000F00` rotated left by 24 comes out `0x0000000F`. Anything
still hanging around above the low 4 bits is wiped by that `[28,31]` mask.

There's your whole shift-and-AND in a single instruction. Memorise the shape and
you'll spot it everywhere: rotate by `r`, mask `[32-w, 31]`, and what you've
really written is a right shift of `r` keeping the bottom `w` bits.

One heads-up before you open the diff: the disassembler there doesn't print
`rlwinm` for this shape. It uses the **extended mnemonic** `extrwi` (*extract
word immediate*) — PowerPC's shorthand for exactly this extract-a-field rotate.
Same 32-bit instruction, friendlier name; hover the line and the diff spells the
underlying `rlwinm` back out. The worked example renders there as
`extrwi r3, r3, 4, 20`, read as `extrwi rD, rS, n, b`: take the `n`-bit field
(`4` wide) that begins at bit `b` (`20`, counted from the top — PowerPC numbers
bit 0 as the most significant) and right-justify it. The width and position
you'd otherwise decode out of the `rlwinm` are just named outright.

Now your target. The rotate amount hands you the right-shift count, the mask
`[MB,ME]` hands you the width, and the C falls out of the two.

## Your task

Write `extract_nibble` to reproduce the assembly above.

<!-- starter -->
```c
u32 extract_nibble(u32 x) {
    return 0;
}
```

<!-- solution -->
```c
u32 extract_nibble(u32 x) {
    return (x >> 4) & 0xF;
}
```
