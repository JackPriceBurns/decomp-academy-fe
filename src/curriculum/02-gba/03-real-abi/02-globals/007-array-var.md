---
id: 45e3485b-ba3a-4d06-aa7c-0e2a3c953287
slug: gba-globals-array-var
title: A Global Array, Variable Index
difficulty: 4
concepts:
  - globals
  - arrays
  - addressing
symbol: func_08336c0c
hints:
  - "The pooled base is used twice: once as the value the scaled index is added to, and once on its own as an address."
  - "It takes an `s32` and returns an `s32`. `ldr r1, [r1, #0]`, with the base register unchanged, is element zero of the array."
---

# Scaling the index by hand

An index that is only known at run time can't go into a load offset, so the
code has to compute the address. It always takes the same three steps: shift
the index left by the log of the element size, add the pooled base (the array
address loaded from the pool), and load at offset zero.

The shift tells you the element width. A byte array has no shift at all:

```asm
0        ldr       r1, [pc, #4] (->8)
2        add       r0, r1
4        ldrb      r0, [r0, #0]
6        bx        lr
8        .word     gLevels
```

A halfword array shifts by one:

```asm
0        ldr       r1, [pc, #8] (->12)
2        lsl       r0, #1
4        add       r0, r1
6        ldrh      r0, [r0, #0]
8        bx        lr
10       .hword    0
12       .word     gPalette
```

Both functions take the index in `r0` and add the pooled base to it. The
halfword case needs one shift first, and the byte case needs none. Word arrays
follow the same pattern with `lsl #2`. The load instruction always matches the
shift: `ldrb` with no shift, `ldrh` with a shift of one, `ldr` with a shift of
two. So those two rows should always agree. If they don't, the code is doing
something other than a plain array subscript.

Notice that the base stays in `r1`. The `add` writes its result into `r0`, so
`r1` still holds the base afterwards. That matters when the function needs the
base again. A second access at a constant index can then be a single load
through the register that still holds the base, with no arithmetic at all.

Your target does this. It uses one pool word and reads two elements, and only
one of them needs any address computation.

## Your task

Write `func_08336c0c` to reproduce the target assembly.

<!-- context -->
```c
extern s32 gRow[32];
```

<!-- solution -->
```c
s32 func_08336c0c(s32 i) {
    return gRow[i] - gRow[0];
}
```
