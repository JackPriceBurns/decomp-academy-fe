---
id: 261caeda-8d29-53c8-84ab-69232daab891
slug: bitwise-shift-left
title: Shifting Left by a Constant
difficulty: 2
concepts:
  - bitwise
  - shifts
  - rlwinm
symbol: func_801872b8
hints:
  - A constant left shift is the `slwi` extended mnemonic.
  - "`x << 4` compiles to `slwi r3, r3, 4`."
---

# `slwi` — shift left, fill with zeros

Shift left and the bits climb toward the high end while zeros flood in
underneath. PowerPC has no immediate left-shift opcode at all, so MWCC works
around it by reaching for `rlwinm`, which the assembler then prints as the tidier
`slwi`. Take a shift by 3:

```asm
slwi    r3,r3,3
blr
```

That `slwi r3, r3, 3` is really `rlwinm r3, r3, 3, 0, 28` wearing a nicer name, a
rotate by 3 that holds onto the top 29 bits. No need to decode it by hand. Spot
`slwi`, read it as a constant left shift, and the immediate beside it is the
shift count.

There's a second route to the same instruction. Since `x << n` carries the same
value as `x * 2^n`, MWCC strength-reduces a power-of-two multiply straight into a
`slwi`. Whichever the source intended, pull the shift count off the target and
pick the constant that lines up.

## Your task

Write `func_801872b8` so it compiles to the `slwi` above.

<!-- solution -->
```c
u32 func_801872b8(u32 x) {
    return x << 4;
}
```
