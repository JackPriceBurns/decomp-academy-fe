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

# A mask keeps low bits in a register

When you narrow a wide value *without* storing it — e.g. returning just the low
half of an `int` — the compiler can't lean on a narrow store. Instead it masks the
register with a rotate-mask instruction, printed as **`clrlwi`** (*clear left word
immediate*).

For example, a function that returns the low 16 bits of an `int`:

```asm
clrlwi r3,r3,16   # keep low 16 bits, zero the rest
blr
```

This is the *register-resident* twin of the truncating store: `stb`/`sth`
truncate on their way to memory, while a `clrlwi` truncates a value that stays in
a register.

Reading the shift amount tells you the mask width — the shift is just how many
**high** bits are cleared:

```text
clrlwi r3, r3, 16   →  24 bits remain  →  keep low 16 bits
clrlwi r3, r3, 24   →  8 bits remain   →  keep low 8 bits
```

## Your task

Write `low_byte`, taking an `int`, to reproduce the assembly shown for that symbol.

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
