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
  - "An addition first, then the truncation of the sum — count the f's in the mask to size the cast."
  - "The extra `or` into `v0` after the `andi` is IDO's usual copy-out; don't invent a C statement for it."
---

# The cast you can see

Loads and stores convert at memory's edge for free. Cast a value that's
already *in a register*, though, and the compiler must emit a real
instruction. For unsigned narrow types the instruction is an old friend
from the bitwise chapter — `andi`, wearing a new hat:

```c
u32 low_byte(u32 x) {
    return (u8)x;
}
```

```asm
andi  v0, a0, 0xff    # (u8)x — keep 8 bits, zero the rest
jr    ra
nop
```

```c
u32 keep_half(u32 x) {
    return (u16)x;
}
```

```asm
andi  v0, a0, 0xffff  # (u16)x — keep 16 bits
jr    ra
nop
```

A cast to `u8` *is* `& 0xff`; a cast to `u16` *is* `& 0xffff`. Identical
machine code — which cuts both ways when decompiling. See `andi` with one
of these two masks and you have a choice of spellings: the original
programmer may have written a cast, or masked by hand. Both match, and
matching is the goal; pick whichever reads truer for the code (a cast when
a narrow *type* is nearby, a mask when it's about bits).

Masks with *other* values — `0x3`, `0xf0`, `0x7ff` — are never casts;
that's ordinary bit work. Only the two register-width masks moonlight as
type conversions.

The target computes a sum and hands back its low bits — a wrapping
counter, the kind that ticks 254, 255, 0, 1 forever. One expression.

## Your task

Write `func_80003b38` to reproduce the target assembly.

<!-- solution -->
```c
u32 func_80003b38(u32 t, u32 step) {
    return (u8)(t + step);
}
```
