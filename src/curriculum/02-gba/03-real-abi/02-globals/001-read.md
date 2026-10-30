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
  - The `.word` row is the only place the variable's name appears. The two
    `ldr`s turn that name into a value.
  - "It takes one `s32` and returns one `s32`. Read `sub r1, r0` in the order it is written: the global is on the left."
---

# Two loads for one variable

Thumb immediates are eight bits wide. A RAM address on this machine looks like
0x03000420, and no instruction can hold a value that large: there is no
`mov r0, #0x03000420`, and no load instruction takes an absolute address.

So the compiler reaches every global in two steps. It stores the variable's
*address* as a `.word` in the literal pool. It loads that word with a
PC-relative load, and then it loads from the address now in the register.

Here is `doubleEnemies`, which returns twice the value of a global counter:

```asm
0        ldr       r0, [pc, #4] (->8)
2        ldr       r0, [r0, #0]
4        lsl       r0, #1
6        bx        lr
8        .word     gEnemyCount
```

Read it from the bottom. The `.word gEnemyCount` at address 8 is a relocation:
the linker writes the final address of `gEnemyCount` into those four bytes. The
`ldr r0, [pc, #4]` loads that word, so after address 0 `r0` holds *where the
variable is stored*. The `ldr r0, [r0, #0]` at address 2 loads from that
address, so `r0` now holds *the value of the variable*. The shift doubles it.

Without the arithmetic, the two loads look like this:

```asm
0        ldr       r0, [pc, #4] (->8)
2        ldr       r0, [r0, #0]
4        bx        lr
6        .hword    0
8        .word     gEnemyCount
```

It takes two loads to read one variable. The `.hword 0` is the same two bytes
of padding you have seen before. They move the pool word onto a four-byte
boundary.

Both loads use `r0` here because no other value needs it. The address arrives
in `r0`, and the value replaces it straight away. If `r0` already holds
something when the function starts, the address goes into another low register
instead. Whatever the function computes is then moved back into `r0` before the
return. That extra `mov` comes from register pressure. Nothing in the source
causes it.

The name in the pool row is the only place the variable appears. The
instructions above it only turn that name into a value.

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
