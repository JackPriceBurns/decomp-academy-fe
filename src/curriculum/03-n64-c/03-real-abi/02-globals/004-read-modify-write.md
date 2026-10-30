---
id: 0c0fb5c3-7c9a-4938-abe9-e4d9c80e2f55
slug: globals-read-modify-write
title: Read, Modify, Write
difficulty: 2
concepts:
  - globals
  - hi-lo
  - rmw
symbol: func_80303ed4
hints:
  - "The address is built once, then used by both the `lw` and the `sw` at offset 0. One global is accessed twice."
  - "The middle instruction combines the loaded value with the argument. Its mnemonic tells you the operation, and `+=` is the natural way to write it in C."
---

# One address, used twice

When you increment a global, you read it, change it, and store it back. This
adds something new to the address math. Two accesses to the same global would
need two `%lo` pairs, so IDO **builds the full address once** in a register and
reuses it. Here is `bumpFrames`, which adds 1 to the global `gFrames`:

```asm
lui    v0, %hi(gFrames)
addiu  v0, v0, %lo(gFrames)  # full address, finished in a register
lw     t6, 0(v0)             # read…
addiu  t7, t6, 1             # …modify…
sw     t7, 0(v0)             # …write back through the same register
jr     ra
nop
```

This is the third pattern from the machinery lesson. `lui` + `addiu` with `%lo`
completes the address *as a value*. After that, the accesses are plain `0(v0)`
with no relocations, because the register already holds the whole address.
Whenever you see a global's address finished with an `addiu` like this, expect
**more than one access** through it.

This pattern translates directly into a C compound assignment: a load, one
arithmetic operation, and a store back. The target does the same to a different
global, except that the amount is not a constant this time.

## Your task

`extern s32 gCoins;` is declared for you. Write `func_80303ed4` to reproduce the
target assembly.

<!-- solution -->
```c
void func_80303ed4(s32 n) {
    gCoins += n;
}
```

<!-- context -->
```c
extern s32 gCoins;
```
