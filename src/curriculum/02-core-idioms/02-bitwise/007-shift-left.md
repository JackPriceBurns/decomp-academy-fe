---
id: bitwise-shift-left
title: Shifting Left by a Constant
difficulty: 2
concepts:
  - bitwise
  - shifts
  - rlwinm
symbol: shl4
hints:
  - A constant left shift is the `slwi` extended mnemonic.
  - "`x << 4` compiles to `slwi r3, r3, 4`."
---

# `slwi` — shift left, fill with zeros

Shifting left by a constant moves bits toward the high end and pads the low end
with zeros. PowerPC has no dedicated immediate left-shift opcode; instead MWCC
uses `rlwinm` and the assembler prints the friendly **`slwi`** extended mnemonic.
For example, a left shift by 3:

```asm
slwi    r3,r3,3
blr
```

Under the hood `slwi r3, r3, 3` *is* `rlwinm r3, r3, 3, 0, 28` — rotate left by 3
and keep the top 29 bits. You don't have to decode that by hand; recognizing the
`slwi` mnemonic as "left shift by a constant" is enough. The immediate field is
the shift count directly.

As a mental check, `x << n` equals `x * 2^n` arithmetically, so MWCC will also
strength-reduce a power-of-two multiply to a `slwi`. Write whichever form matches
the original's intent; look at the shift count in the target assembly and pick the
matching constant.

## Your task

Write `shl4` so it compiles to the `slwi` above.

<!-- starter -->
```c
u32 shl4(u32 x) {
    return 0;
}
```

<!-- solution -->
```c
u32 shl4(u32 x) {
    return x << 4;
}
```
