---
id: 1ec58644-0ad5-4d86-9c3a-c90e3ec95d66
slug: gba-globals-array-const
title: A Global Array, Constant Index
difficulty: 4
concepts:
  - globals
  - arrays
  - addressing
symbol: func_08332498
hints:
  - Divide each byte offset by the element size to get its index - both the
    one riding the `ldr` and the one that needed its own `add`.
  - "Nothing in, an `s32` out. The element loaded through the copied base is the one subtracted; read `sub r0, r1` in that order."
---

# The index rides the load, until it cannot

A Thumb load offset is a five-bit immediate, and the processor scales it by the
size of the access: by 4 for `ldr`, by 2 for `ldrh`, by 1 for `ldrb`. Five bits
gives 0 to 31, so the reachable window is elements 0 through 31 for every one of
those widths — up to byte offset 124 for words, 62 for halfwords, 31 for bytes.

Inside that window a constant index is free. It folds straight into the load and
costs nothing beyond the pool word for the array's base.

```asm
0        ldr       r0, [pc, #4] (->8)
2        ldrh      r0, [r0, #62]
4        bx        lr
6        .hword    0
8        .word     gShades
```

Step one element further and the offset no longer fits, so the compiler adds it
to the base first and loads at zero:

```asm
0        ldr       r0, [pc, #4] (->8)
2        add       r0, #64
4        ldrh      r0, [r0, #0]
6        bx        lr
8        .word     gShades
```

Both functions read one element of one halfword array, and they differ by an
instruction because of where the boundary falls. The cutoff is at the same
*index* for all three widths, not at the same byte offset, which is the thing to
internalise. Reading it backwards: `ldrh r0, [r0, #62]` is unambiguously element
31, and `add r0, #64 / ldrh r0, [r0, #0]` is element 32.

One more wrinkle appears when a function touches two elements and one of them is
out of range. If the base register is still needed afterwards it gets copied
first (`mov rN, rM / add rN, #imm`); if the far access is the last use of the
base, the base is simply destroyed with a bare `add`. Your target is the first
case.

## Your task

Write `func_08332498` to reproduce the target assembly.

<!-- context -->
```c
extern s32 gTiles[64];
```

<!-- solution -->
```c
s32 func_08332498(void) {
    return gTiles[9] - gTiles[50];
}
```
