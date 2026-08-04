---
id: 07be341c-5c54-5383-b7c0-058ea2ed4394
slug: types-truncate-mask
title: Truncating With a Mask
difficulty: 3
concepts:
  - truncation
  - masking
  - rlwinm
symbol: func_801ef8d0
hints:
  - Keeping the low 8 bits of a register is a rotate-mask.
  - "`x & 0xFF` compiles to `clrlwi r3, r3, 24`."
---

# A mask keeps low bits in a register

Now and then you narrow a value but keep it in a register, with nothing written
out to memory, like returning only the low half of an `int`. A narrow store is no
help there, so the compiler masks the register instead. The instruction it uses is
a rotate-mask, which the disassembler shows as **`clrlwi`** (*clear left word
immediate*).

Take a function that returns the low 16 bits of an `int`:

```asm
clrlwi r3,r3,16   # keep low 16 bits, zero the rest
blr
```

It is the in-register version of a truncating store. `stb` and `sth` cut a value
down on the way to memory, and `clrlwi` cuts one down while it stays in a register.

The shift count tells you the mask width: the number of **high** bits the
instruction clears.

```text
clrlwi r3, r3, 16   →  24 bits remain  →  keep low 16 bits
clrlwi r3, r3, 24   →  8 bits remain   →  keep low 8 bits
```

## Your task

Write `func_801ef8d0` to reproduce the assembly shown for that symbol.

<!-- solution -->
```c
u8 func_801ef8d0(int x) {
    return x & 0xFF;
}
```
