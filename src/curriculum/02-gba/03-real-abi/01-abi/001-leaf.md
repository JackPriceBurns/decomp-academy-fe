---
id: c19cfcd4-d5bb-428f-925d-ce6ea322262c
slug: gba-abi-leaf
title: A Function With No Frame
difficulty: 3
concepts:
  - abi
  - calling-convention
  - registers
symbol: func_082dd6fc
hints:
  - Nothing is pushed and nothing is popped, so every register in the listing is
    one the function was free to destroy — including the ones written before
    they are read.
  - Three `s32` parameters in, an `s32` out. Two different bitwise operations
    combine the first two arguments, and the third argument only ever
    multiplies.
---

# The cheapest function on the machine

The ABI splits the register file in two. `r0`-`r3` carry the first four
arguments in, `r0` carries the result back out, and all four are **scratch**:
whoever calls you assumes nothing in them survives. `r4`-`r7` are the opposite
promise — a function must hand them back exactly as it found them, so touching
one costs a save and a restore.

A function that fits inside that first group and calls nobody therefore needs no
bookkeeping at all. No `push`, no `sub sp`, no saved registers. The first
instruction is real work and the last is `bx lr`, jumping to the return address
the caller left in `lr`. That is a **leaf**, and it is the only shape on this
machine with zero overhead.

Here is one that computes a tile index from a width and a height:

```asm
0        mov       r2, r0
2        mul       r2, r1
4        add       r2, r0
6        add       r2, r1
8        mov       r0, r2
10       bx        lr
```

The function has two parameters, so `r2` and `r3` arrived holding nothing in
particular — and gcc uses `r2` as a free workspace. It copies `w` there, builds
the whole expression in it with the two-operand `mul` and `add` forms, and only
at the end moves the answer into `r0` where the caller will look for it. The
copy costs an instruction and saves gcc from destroying `w`, which is still
needed after the multiply.

`bx lr` rather than `mov pc, lr` is the interworking return: `bx` restores the
caller's instruction set from the low bit of the address, so a Thumb function
can be called from ARM code and still come back correctly. Every function you
match in this course ends in some form of `bx`.

Your target is a leaf too. Nothing is saved, so read it knowing that any
register it writes before reading was scratch, not an argument.

## Your task

Write `func_082dd6fc` to reproduce the target assembly.

<!-- solution -->
```c
s32 func_082dd6fc(s32 a, s32 b, s32 c) {
    return (a ^ b) * c + (a | b);
}
```
