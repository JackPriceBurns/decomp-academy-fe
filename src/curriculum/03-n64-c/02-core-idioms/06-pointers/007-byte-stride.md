---
id: f6bc67fd-ef42-4e6b-9e47-c986feae1105
slug: pointers-byte-stride
title: "Byte Arrays: No Shift at All"
difficulty: 2
concepts:
  - pointers
  - arrays
  - types
symbol: func_801af19c
hints:
  - "There are two plain `addu`s on the same base register, so there are two indexed byte reads. Match each `lbu` to its address by following the registers."
  - "Both index parameters are used in one expression. The final `addu` tells you how the two loaded bytes are combined."
---

# Stride 1 removes the sll

Byte arrays are the last stride to cover, and they need one instruction
fewer. Each element is 1 byte, so the index scale is ×1, and multiplying by 1
changes nothing. So the trio loses its `sll` and becomes a duo of two
instructions:

```c
s32 byte_at(u8 *m, s32 i) {
    return m[i];
}
```

```asm
addu  t6, a0, a1    # m + i, no scaling needed
lbu   v0, 0(t6)     # m[i]
jr    ra
nop
```

An `addu` on its own, adding a pointer argument and an integer argument and
feeding a byte load, is `m[i]`. Because it looks so plain, you can mistake it
for some clever pointer arithmetic. Learn to recognize the duo the same way
you recognize the trio.

Here is the complete stride table. The shift amount before an indexed access
tells you `sizeof(element)`:

| element | stride | index scaling |
| --- | --- | --- |
| `u8`/`s8` | 1 | *(none)* |
| `u16`/`s16` | 2 | `sll … 1` |
| `s32`/`u32`/pointers | 4 | `sll … 2` |

The target reads a byte table at **two** different variable indexes and
combines the two values. You will see two duos, one after the other, sharing
their base register. (IDO puts the address computations and loads in its own
order. Write the natural C and let the compiler choose the order.)

## Your task

Write `func_801af19c` to reproduce the target assembly.

<!-- solution -->
```c
s32 func_801af19c(u8 *tbl, s32 i, s32 j) {
    return tbl[i] + tbl[j];
}
```
