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
  - The pooled base is used twice - once as the thing the scaled index is added
    to, and once on its own as an address.
  - "An `s32` in, an `s32` out. `ldr r1, [r1, #0]` with the base register untouched is element zero of the array."
---

# Scaling the index by hand

A runtime index cannot fold into a load offset, so the address has to be
computed. The recipe is always the same three steps: shift the index left by the
log of the element size, add the pooled base, load at offset zero.

The shift is the tell for the element width. A byte array skips it entirely:

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

Both take the index in `r0` and fold the pooled base into it; the halfword case
pays one shift on the way, the byte case pays none. Word arrays follow the
pattern with `lsl #2`. The load instruction agrees with the shift — `ldrb` with
no shift, `ldrh` with one, `ldr` with two — so those two rows always corroborate
each other, and a mismatch between them means you are looking at something other
than a plain array subscript.

Notice that the base lands in `r1` rather than being consumed by the `add`. That
matters when the function needs the base again: a second access at a constant
index can then be a bare load through the surviving register, with no arithmetic
at all.

Your target does exactly that. One pool word, two elements, and only one of them
needed any address computation.

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
