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
neighbours: `(x >> 4) & 0xF` pulls out the 4-bit nibble sitting at bits 4-7. In C
that reads like two operations, but `rlwinm` does **rotate and mask together**, so
MWCC fuses the whole thing into one instruction:

```asm
rlwinm  r3, r3, 28, 28, 31    # (x >> 4) & 0xF
blr
```

Read the operands: rotate left by **28** (which is the same as rotating *right* by
4, moving bits 4-7 down to bits 0-3). Concretely, `0x000000F0` rotated left by 28
becomes `0x0000000F` — the nibble at bits 4-7 lands at bits 0-3. Then keep mask
`[28,31]` — the bottom 4 bits. One `rlwinm` expresses the entire `>>`-then-`&`
field extract. This is one of the most useful `rlwinm` patterns to recognize:
whenever you see a rotate amount paired with a low-bit mask, read it back as
`(x >> shift) & ((1 << width) - 1)`.

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
