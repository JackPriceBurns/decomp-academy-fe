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
  - Both pool words are statics from the context. The `$d` row is the one
    declared first, and the code around each row tells you which is which.
  - "It takes no arguments and returns an `s32`. One static counts down and is reset when it reaches zero. The other is incremented and returned."
---

# When the listing loses a variable's name

A file-scope `static` compiles exactly like any other global. It lives in .data
or .bss, its address goes into the literal pool, and reads and writes use the
same two steps. Marking a variable `static` does not change the code the
compiler produces.

One thing does change in the *listing*. The assembler puts an ARM mapping
symbol called `$d` at offset 0 of each data region, to mark where the data
starts. When a local symbol is at that same offset, the workspace shows the
relocation as `$d`, and the variable's own name disappears:

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

`volUp` adds a step static to a master volume static and stores the result
back. Both are `static s32` with initialisers, so both live in .data, in the
order they were declared. `sMasterVol` was declared second. It sits four bytes
in and keeps its name. The static declared before it is at offset 0, so it
shows up as `$d`.

So `$d` in a pool row means a file-local object whose name the listing does not
show. Real decompilation work is like this too, because the symbol table of a
retail ROM has no names for anything. You work out which variable it is from
how the code uses it. Look at what is written to it, what it is compared
against, and which other rows in the function share it.

Declaration order decides which static is shown as `$d`, and only one per
section can be. The names that *do* appear are a strong clue to what the
unnamed one must be.

Your target works on two statics, one shown by name and one shown as `$d`. It
uses one of them three times.

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
