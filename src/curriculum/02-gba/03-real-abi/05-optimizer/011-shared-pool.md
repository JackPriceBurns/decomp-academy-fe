---
id: 0bb7bb26-f922-468d-b8d8-5f4de5d65771
slug: gba-optimizer-shared-pool
title: One Pool Word, Several Uses
difficulty: 4
concepts:
  - optimizer
  - literal-pool
  - globals
symbol: func_083e4cb8
hints:
  - "`r2` is loaded once at address 0 and is still in use at address 18. Count
    the separate addresses computed from it - that is how many times the C
    named the array."
  - "`extern s32 gTable[32];` is declared for you. One `s32` parameter, an
    `s32` out. Three elements are summed: two of them are chosen by the
    parameter and one is fixed."
---

# One word per distinct value

The literal pool is built after the function body is generated, from the set of
distinct constants that body asked for. A value that four instructions need
still occupies one word. And because the address of a global is itself a
constant, every reference to the same global draws on the same word.

The pc-relative load is shared as well. Loading a pool word is ordinary
arithmetic on `pc`, so common-subexpression elimination merges repeated loads
the way it merges repeated adds: one `ldr rN, [pc, #k]`, and `rN` then stays
live as a base register for as long as the function keeps touching that global.
A global array read at several subscripts turns into one pool load and several
`add`s off the same base.

Reading that backwards is the useful direction. One `.word name` at the bottom
and one pc-relative load at the top, with a base register consumed at three
different places, means the C named that global three times.

Here is `scramble`, which uses one constant too wide for an immediate twice
over, once for an add and once for an exclusive-or:

```asm
0        ldr       r1, [pc, #4] (->8)
2        add       r0, r1
4        eor       r0, r1
6        bx        lr
8        .word     74565
```

One word, one load, two consumers. Now the same function with the second
constant changed:

```asm
0        ldr       r1, [pc, #8] (->12)
2        add       r0, r1
4        ldr       r1, [pc, #8] (->16)
6        eor       r0, r1
8        bx        lr
10       .hword    0
12       .word     74565
16       .word     344865
```

Two distinct values, so two words and two loads. The extra `ldr` pushes the end
of the code to address 10, which is not word-aligned, so the `.hword 0` filler
appeared to align the pool. One changed constant cost two bytes of code, two of
padding and four of data.

Your target reaches into one global array three times. The pool has a single
word in it; everything else is address arithmetic hanging off the register that
word was loaded into.

## Your task

Write `func_083e4cb8` to reproduce the target assembly.

<!-- context -->
```c
extern s32 gTable[32];
```

<!-- solution -->
```c
s32 func_083e4cb8(s32 i) {
    return gTable[i] + gTable[i + 1] + gTable[0];
}
```
