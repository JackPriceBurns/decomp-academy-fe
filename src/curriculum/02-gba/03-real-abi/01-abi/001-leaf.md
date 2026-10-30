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
  - Nothing is pushed and nothing is popped, so the function was free to destroy
    every register in the listing. That includes the registers it writes before
    it reads them.
  - The function takes three `s32` parameters and returns an `s32`. Two
    different bitwise operations combine the first two arguments. The third
    argument is only used in a multiply.
---

# Leaf functions

The ABI splits the registers into two groups. `r0` to `r3` carry the first
four arguments in, and `r0` carries the result back out. All four are
**scratch** registers: the caller assumes that nothing in them survives the
call. `r4` to `r7` work the other way. A function must give them back exactly
as it found them, so using one costs a save and a restore.

A function that uses only the first group and calls no other function needs no
setup at all. There is no `push`, no `sub sp`, and no saved register. The first
instruction does real work, and the last one is `bx lr`, which jumps to the
return address the caller left in `lr`. This kind of function is called a
**leaf**. It is the only shape on this machine with no overhead.

Here is a leaf that computes a tile index from a width and a height:

```asm
0        mov       r2, r0
2        mul       r2, r1
4        add       r2, r0
6        add       r2, r1
8        mov       r0, r2
10       bx        lr
```

This function has two parameters, so `r2` and `r3` arrive holding nothing
useful. That makes `r2` free working space for gcc. It copies `w` into `r2`,
builds the whole expression there with the two-operand forms of `mul` and
`add`, and only at the end moves the answer into `r0`, where the caller looks
for it. The copy costs one instruction, but it means gcc does not destroy `w`,
which is still needed after the multiply.

The function returns with `bx lr` instead of `mov pc, lr`. This is the
interworking return. `bx` uses the low bit of the address to restore the
caller's instruction set, so a Thumb function can be called from ARM code and
still return correctly. Every function you match in this course ends with some
form of `bx`.

Your target is also a leaf. It saves nothing, so if it writes a register before
reading it, that register was scratch and did not hold an argument.

## Your task

Write `func_082dd6fc` to reproduce the target assembly.

<!-- solution -->
```c
s32 func_082dd6fc(s32 a, s32 b, s32 c) {
    return (a ^ b) * c + (a | b);
}
```
