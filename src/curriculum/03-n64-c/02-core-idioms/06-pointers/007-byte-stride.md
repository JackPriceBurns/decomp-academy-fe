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
  - "Two bare `addu`s against the same base register — two indexed byte reads. Match each `lbu` to its address by following the registers."
  - "Both index parameters land in one expression; the final `addu` says how the two loaded bytes combine."
---

# Stride 1 erases the sll

Byte arrays complete the stride story by deleting an instruction.
Elements are 1 byte, the index scale is ×1, and multiplying by 1 is
nothing — so the trio loses its `sll` and becomes a duo:

```c
s32 byte_at(u8 *m, s32 i) {
    return m[i];
}
```

```asm
addu  t6, a0, a1    # m + i — no scaling needed
lbu   v0, 0(t6)     # m[i]
jr    ra
nop
```

A bare `addu` of a pointer argument and an integer argument, feeding a
byte load — that *is* `m[i]`. It's easy to misread this as "pointer
arithmetic, something clever" precisely because it looks so plain.
Recognize the duo the way you recognize the trio.

The full stride table, now complete — the shift amount before an
indexed access telling you `sizeof(element)`:

| element | stride | index scaling |
| --- | --- | --- |
| `u8`/`s8` | 1 | *(none)* |
| `u16`/`s16` | 2 | `sll … 1` |
| `s32`/`u32`/pointers | 4 | `sll … 2` |

The target reads a byte table at **two** different variable indexes and
combines the pair. Two duos back to back, sharing their base register. (IDO schedules the address
computations and loads in its own order; write the natural C and let it.)

## Your task

Write `func_801af19c` to reproduce the target assembly.

<!-- solution -->
```c
s32 func_801af19c(u8 *tbl, s32 i, s32 j) {
    return tbl[i] + tbl[j];
}
```
