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
  - "The address is built once, then used by both the `lw` and the `sw` at offset 0 — one global, touched twice."
  - "The middle instruction combines the loaded value with the argument; its mnemonic tells you the operation, and `+=` is the natural C spelling."
---

# One address, used twice

Bump a global — read it, change it, store it back — and something new appears
in the address math. Two accesses to the same global would mean two `%lo`
pairs, so instead IDO **materializes the full address once** and reuses it.
Watch `bumpFrames`, which adds 1 to the global `gFrames`:

```asm
lui    v0, %hi(gFrames)
addiu  v0, v0, %lo(gFrames)  # full address, finished in a register
lw     t6, 0(v0)             # read…
addiu  t7, t6, 1             # …modify…
sw     t7, 0(v0)             # …write back through the same register
jr     ra
nop
```

There's the third shape from the machinery lesson: `lui` + `addiu` with `%lo`
completes the address *as a value*, and after that the accesses are plain
`0(v0)` — no relocations needed, because the register already holds the whole
address. Whenever you see a global's address finished with an `addiu` like
this, expect **more than one access** through it.

The pattern reads straight into C as a compound assignment: load, one
arithmetic op, store back. The target does the same to a different global,
except the amount isn't a constant this time.

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
