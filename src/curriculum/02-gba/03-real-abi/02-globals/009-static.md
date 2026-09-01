---
id: dd288ea8-9da1-4541-99d0-2d22e0e5d4c3
slug: gba-globals-static
title: Statics Look the Same
difficulty: 4
concepts:
  - globals
  - statics
  - literal-pool
symbol: func_0833faf4
hints:
  - Both pool words are statics from the context; the `$d` row is the one
    declared first, and the code around each row tells you which is which.
  - "Nothing in, an `s32` out. One static counts down and is reloaded when it hits zero; the other is bumped and returned."
---

# The variable whose name went missing

A file-scope `static` is compiled exactly like any other global: it lives in
.data or .bss, its address goes into the literal pool, and the reads and writes
are the same two-step dance. Nothing about `static` changes the code the
compiler emits.

One thing does change in the *listing*. The assembler plants an ARM mapping
symbol called `$d` at offset 0 of each data region, marking "data starts here".
When a local symbol happens to sit at that same offset, the workspace resolves
the relocation to `$d` and the variable's own name disappears:

```asm
0        ldr       r2, [pc, #12] (->16)
2        ldr       r1, [pc, #16] (->20)
4        ldr       r0, [r2, #0]
6        ldr       r1, [r1, #0]
8        add       r0, r1
10       str       r0, [r2, #0]
12       bx        lr
14       .hword    0
16       .word     sMasterVol
20       .word     $d
```

`volUp` adds a step static into a master-volume static and stores the result
back. Both are `static s32` with initialisers, so both live in .data in
declaration order. `sMasterVol` was declared second, sits four bytes in, and
keeps its name; the static declared ahead of it landed at offset 0 and shows up
as `$d`.

So `$d` in a pool row means "a file-local object, and I am not going to tell you
which one". That is a fair simulation of real decompilation work, where the
symbol table of a retail ROM has no names for anything. You recover the identity
from behaviour: what gets written to it, what it is compared against, which
other rows in the function share it.

Which static gets the `$d` treatment depends on declaration order, and only one
per section can. Whichever names *do* survive are a strong clue to what the
nameless one must be.

Your target works on two statics, one of each kind, and touches one of them
three times.

## Your task

Write `func_0833faf4` to reproduce the target assembly.

<!-- context -->
```c
static s32 sSpawnTimer = 60;
static s32 sWave = 1;
```

<!-- solution -->
```c
s32 func_0833faf4(void) {
    sSpawnTimer = sSpawnTimer - 1;
    if (sSpawnTimer == 0) {
        sSpawnTimer = 60;
        sWave = sWave + 1;
    }
    return sWave;
}
```
