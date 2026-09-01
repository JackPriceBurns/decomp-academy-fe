---
id: eac878bc-6189-4a16-847a-d803e0f8ce5e
slug: gba-globals-read
title: Reading a Global
difficulty: 3
concepts:
  - globals
  - literal-pool
  - memory
symbol: func_0831bf54
hints:
  - The `.word` row is the only place the variable's name appears; the two
    `ldr`s are the machinery that turns that name into a value.
  - "One `s32` in, one `s32` out. Read `sub r1, r0` in the order it is written: the global is on the left."
---

# Two loads for one variable

Thumb immediates are eight bits wide. A RAM address on this machine looks like
0x03000420, and nothing in the instruction set can name it: there is no
`mov r0, #0x03000420`, and no load that takes an absolute address.

So every global is reached in two steps. The compiler parks the variable's
*address* as a `.word` in the literal pool, loads that word PC-relative, and
then loads through the register it landed in.

Here is `doubleEnemies`, which returns twice a global counter:

```asm
0        ldr       r0, [pc, #4] (->8)
2        ldr       r0, [r0, #0]
4        lsl       r0, #1
6        bx        lr
8        .word     gEnemyCount
```

Read it from the bottom. The `.word gEnemyCount` at address 8 is a relocation —
the linker writes the final address of `gEnemyCount` into those four bytes. The
`ldr r0, [pc, #4]` fetches it, so after address 0 `r0` holds *where the variable
lives*. The `ldr r0, [r0, #0]` at address 2 dereferences that, so `r0` now holds
*what the variable is*. The shift doubles it.

Strip the arithmetic away and the pair stands on its own:

```asm
0        ldr       r0, [pc, #4] (->8)
2        ldr       r0, [r0, #0]
4        bx        lr
6        .hword    0
8        .word     gEnemyCount
```

Two loads to read one variable, and the `.hword 0` is the familiar two bytes of
padding that push the pool word onto a four-byte boundary.

Both loads land in `r0` here because nothing else wants it — the address arrives
and is immediately overwritten by the value. When `r0` is already carrying
something as the function starts, the address goes to another low register
instead, and whatever the function computes gets moved back into `r0` before the
return. That extra `mov` is a symptom of register pressure, not of anything in
the source.

The name in the pool row is the only place the variable appears. Everything
above it is plumbing.

## Your task

Write `func_0831bf54` to reproduce the target assembly.

<!-- context -->
```c
extern s32 gFrameCount;
```

<!-- solution -->
```c
s32 func_0831bf54(s32 x) {
    return gFrameCount - x;
}
```
