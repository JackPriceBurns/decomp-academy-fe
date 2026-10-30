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
  - Divide each byte offset by the element size to get its index. Do this for
    the offset inside the `ldr` and for the one that needed its own `add`.
  - "It takes no arguments and returns an `s32`. The element loaded through the copied base is the one being subtracted. Read `sub r0, r1` in that order."
---

# A constant index goes inside the load, up to a limit

A Thumb load offset is a five-bit immediate. The processor multiplies it by the
size of the access: by 4 for `ldr`, by 2 for `ldrh`, and by 1 for `ldrb`. Five
bits can hold 0 to 31, so a load can reach elements 0 to 31 for each of those
widths. That is up to byte offset 124 for words, 62 for halfwords and 31 for
bytes.

Inside that range, a constant index costs nothing extra. The compiler puts it
straight into the load's offset, so the only cost is the pool word for the
array's base.

```asm
0        ldr       r0, [pc, #4] (->8)
2        ldrh      r0, [r0, #62]
4        bx        lr
6        .hword    0
8        .word     gShades
```

One element further on, the offset no longer fits. The compiler adds it to the
base first and then loads at offset zero:

```asm
0        ldr       r0, [pc, #4] (->8)
2        add       r0, #64
4        ldrh      r0, [r0, #0]
6        bx        lr
8        .word     gShades
```

Both functions read one element of the same halfword array. They differ by one
instruction because of where the limit falls. Remember that the limit is at the
same *index* for all three widths. The byte offset at the limit is different
for each width. You can also use this in reverse: `ldrh r0, [r0, #62]` can only
be element 31, and `add r0, #64 / ldrh r0, [r0, #0]` is element 32.

There is one more detail for a function that reads two elements when one of
them is out of range. If the base register is still needed afterwards, the
compiler copies it first (`mov rN, rM / add rN, #imm`). If the far access is
the last use of the base, the compiler adds the offset straight into the base
register with a single `add`, and the base is lost. Your target is the first
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
