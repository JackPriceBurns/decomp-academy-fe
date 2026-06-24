---
id: types-truncate-mask
title: Truncating With a Mask
difficulty: 3
concepts:
  - truncation
  - masking
  - rlwinm
symbol: low_byte
hints:
  - Keeping the low 8 bits of a register is a rotate-mask.
  - "`x & 0xFF` compiles to `clrlwi r3, r3, 24`."
---

# `& 0xFF` is the same as keeping the low byte

When you narrow a wide value *without* storing it — e.g. returning the low byte
of an `int` — the compiler can't lean on a narrow store. Instead it masks the
register. `x & 0xFF` keeps the low 8 bits and clears the rest, which is again the
`clrlwi` rotate-mask:

```asm
clrlwi r3, r3, 24   # x & 0xFF
blr
```

This is the *register-resident* twin of the truncating store from earlier: `stb`
truncates on its way to memory, while `& 0xFF` truncates a value staying in a
register. Recognizing the mask width from the shift amount is a core reading
skill — the shift is just how many high bits get cleared:

```text
clrlwi r3, r3, 24   = x & 0xFF     (keep low 8 bits)
clrlwi r3, r3, 16   = x & 0xFFFF   (keep low 16 bits)
```

## Your task

Write `low_byte` to reproduce the `clrlwi` assembly above.

<!-- starter -->
```c
u8 low_byte(int x) {
    return 0;
}
```

<!-- solution -->
```c
u8 low_byte(int x) {
    return x & 0xFF;
}
```
