---
id: 0bb7bb26-f922-468d-b8d8-5f4de5d65771
slug: gba-optimizer-shared-pool
title: Several Uses Share One Pool Word
difficulty: 4
concepts:
  - optimizer
  - literal-pool
  - globals
symbol: func_083e4cb8
hints:
  - "`r2` is loaded once at address 0 and is still in use at address 18. Count
    the separate addresses computed from it. That number is how many times the
    C named the array."
  - "`extern s32 gTable[32];` is declared for you. The function takes one `s32`
    parameter and returns an `s32`. It adds three elements together: the
    parameter chooses two of them, and one is fixed."
---

# One word per distinct value

The literal pool is built after the function body is generated. It holds each
distinct constant that the body asked for, once. A value that four instructions
need still takes up only one word. The address of a global is also a constant,
so every reference to the same global uses the same word.

The pc-relative load is shared as well. Loading a pool word is ordinary
arithmetic on `pc`, so common-subexpression elimination merges repeated loads
the way it merges repeated adds. You get one `ldr rN, [pc, #k]`, and `rN` then
stays live as a base register for as long as the function keeps using that
global. A global array read at several subscripts becomes one pool load and
several `add`s from the same base.

For decomp, you read this in reverse. Suppose there is one `.word name` at the
bottom and one pc-relative load at the top, and the base register is used in
three different places. That means the C named that global three times.

Here is `scramble`. It uses one constant that is too wide for an immediate,
twice: once for an add and once for an exclusive-or:

```asm
0        ldr       r1, [pc, #4] (->8)
2        add       r0, r1
4        eor       r0, r1
6        bx        lr
8        .word     74565
```

There is one word and one load, and two instructions use the loaded value. Here
is the same function with the second constant changed:

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

There are two distinct values, so there are two words and two loads. The extra
`ldr` moves the end of the code to address 10, which is not word-aligned, so the
`.hword 0` filler appears to align the pool. Changing one constant cost two
bytes of code, two bytes of padding and four bytes of data.

Your target uses one global array three times. The pool has a single word in
it. Everything else is address arithmetic based on the register that the word
was loaded into.

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
