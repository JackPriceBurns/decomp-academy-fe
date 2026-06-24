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

# Shift *and* mask, fused into a single instruction

Extracting a packed field means shifting it down to bit 0 and masking off the
neighbours. In C that reads like two operations, but `rlwinm` does **rotate and
mask together**, so MWCC fuses the whole thing into one instruction.

Consider extracting the 4-bit nibble at bits 8-11 (the second-lowest nibble):

```asm
rlwinm  r3,r3,24,28,31
blr
```

Read the operands: rotate left by **24** (the same as rotating *right* by 8,
moving bits 8-11 down to bits 0-3). Concretely, `0x00000F00` rotated left by 24
becomes `0x0000000F` — the nibble at bits 8-11 lands at bits 0-3. Then the mask
`[28,31]` keeps only the bottom 4 bits.

One `rlwinm` expresses the entire shift-then-AND field extract. The general
pattern: a rotate amount `r` paired with a low-bit mask `[32-w, 31]` is a
right-shift of `r` followed by a keep of the bottom `w` bits.

For your target assembly, decode the rotate amount to find the right-shift count,
and decode the mask `[MB,ME]` to find the bit-width of the field, then write the
equivalent C.

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
