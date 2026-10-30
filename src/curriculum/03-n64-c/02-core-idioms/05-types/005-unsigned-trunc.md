---
id: 500eceb3-108c-4b1d-87e4-2a742bde4076
slug: types-unsigned-trunc
title: "Casting Down, Unsigned: andi"
difficulty: 2
concepts:
  - types
  - casts
  - bitwise
symbol: func_80003b38
hints:
  - "There is an addition first, then a truncation of the sum. Count the f's in the mask to find the width of the cast."
  - "The extra `or` into `v0` after the `andi` is IDO's usual copy into the return register. Don't write a C statement for it."
---

# A cast you can see

Loads and stores convert values for free as they move between memory and
registers. If you cast a value that is already *in a register*, the compiler
has to emit a real instruction. For unsigned narrow types, that instruction is
`andi`, which you know from the bitwise chapter. Here it does a new job:

```c
u32 low_byte(u32 x) {
    return (u8)x;
}
```

```asm
andi  v0, a0, 0xff    # (u8)x: keep 8 bits, zero the rest
jr    ra
nop
```

```c
u32 keep_half(u32 x) {
    return (u16)x;
}
```

```asm
andi  v0, a0, 0xffff  # (u16)x: keep 16 bits
jr    ra
nop
```

A cast to `u8` is the same as `& 0xff`, and a cast to `u16` is the same as
`& 0xffff`. The machine code is identical. So when you decompile, an `andi`
with one of these two masks can be written two ways. The original programmer
may have written a cast, or may have masked by hand. Both match, and matching
is the goal. Pick whichever fits the code better: a cast when a narrow *type*
is nearby, and a mask when the code is about bits.

Masks with *other* values, such as `0x3`, `0xf0` or `0x7ff`, are never casts.
They are ordinary bit operations. Only these two masks also work as type
conversions.

The target computes a sum and returns its low bits. This is a wrapping
counter, the kind that counts 254, 255, 0, 1 and repeats forever. It is one
expression.

## Your task

Write `func_80003b38` to reproduce the target assembly.

<!-- solution -->
```c
u32 func_80003b38(u32 t, u32 step) {
    return (u8)(t + step);
}
```
