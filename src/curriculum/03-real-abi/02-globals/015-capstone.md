---
id: globals-capstone
title: "★ Capstone: A Lighting-Update Function"
difficulty: 4
concepts:
  - globals
  - sda21
  - capstone
  - mixed-types
  - highlight
symbol: worldUpdate
hints:
  - Each global is an independent @sda21 access; the type fixes the opcode
    (lwz/stw, lfs/stfs, stb).
  - Write the three statements in order; the float->int cast emits
    fctiwz/stfd/lwz before the `stb` to gColor.
---

# Many globals in one function

Real engine code reads and writes a fistful of globals per function. The assembly
below is drawn from `worldplanet_updateMapLighting` in Star Fox Adventures.
Every access is its own `@sda21` load or store; the types pick the opcodes. Here a
counter is bumped, a float is copied, and the product of two floats is truncated
into a byte global:

```asm
stwu  r1, -16(r1)
lfs   f1, gSrcA@sda21(r2)     # read float global gSrcA
lfs   f0, gSrcB@sda21(r2)     # read float global gSrcB
lwz   r3, gCounter@sda21(r13) # read int global gCounter
fmuls f0, f1, f0             # gSrcA * gSrcB
stfs  f1, gLerpT@sda21(r2)    # gLerpT = gSrcA  (fmuls wrote f0, so f1 still holds gSrcA)
addi  r0, r3, 1              # gCounter + 1
stw   r0, gCounter@sda21(r13) # store it back
fctiwz f0, f0               # (s32) of the product
stfd  f0, 8(r1)
lwz   r0, 12(r1)            # move the low word FPR->GPR via the stack
stb   r0, gColor@sda21(r13)   # gColor = (u8) result
addi  r1, r1, 16
blr
```
```
R_PPC_EMB_SDA21   gSrcA / gSrcB / gCounter / gLerpT / gColor
```

Nothing new per line — `lwz`/`stw` for the `int`, `lfs`/`stfs` for the floats,
`stb` for the `u8`, all at `@sda21` offsets — but together they're the texture of
real global-heavy code. The `fctiwz` -> `stfd` -> `lwz` is the float->int cast
from the floats chapter, here landing in a byte global.

## Your task

The globals are declared for you:
`gCounter` (int), `gSrcA`/`gSrcB`/`gLerpT` (f32), `gColor` (u8). Write
`worldUpdate` to reproduce the assembly above. Read each opcode to determine
what type each global is, which operands feed each instruction, and what the
float-to-byte path looks like.

<!-- starter -->
```c
void worldUpdate(void) {
    // 1) advance the counter global by one
    // 2) copy one float global into another
    // 3) truncate the product of the two float globals into the byte global
}
```

<!-- solution -->
```c
void worldUpdate(void) {
    gCounter = gCounter + 1;
    gLerpT = gSrcA;
    gColor = (u8)(s32)(gSrcA * gSrcB);
}
```

<!-- context -->
```c
extern int gCounter;
extern f32 gSrcA;
extern f32 gSrcB;
extern f32 gLerpT;
extern u8 gColor;
```
