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
with zeros. PowerPC has no dedicated immediate left-shift; instead MWCC uses
`rlwinm` and the assembler prints the friendly **`slwi`** extended mnemonic:

```asm
slwi  r3, r3, 4    # x << 4
blr
```

Under the hood `slwi r3, r3, 4` *is* `rlwinm r3, r3, 4, 0, 27` — rotate left by 4
and keep the top 28 bits. You don't have to decode that by hand; recognizing the
`slwi` mnemonic as "left shift by a constant" is enough. (As a mental check,
`x << n` equals `x * 2^n` arithmetically — and because MWCC strength-reduces a
power-of-two multiply, `x * 16` and `x << 4` compile to the *same* `slwi`. Write
whichever matches the original's intent.)

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
