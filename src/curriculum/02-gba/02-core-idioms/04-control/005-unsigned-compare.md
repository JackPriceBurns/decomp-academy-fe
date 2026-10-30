---
id: 3378b655-51e6-4854-b920-1c26d04be169
slug: gba-control-unsigned-compare
title: Unsigned Comparisons
difficulty: 3
concepts:
  - branches
  - comparisons
  - types
symbol: func_0812c408
hints:
  - "`bhs` is an unsigned comparison, so neither operand can be `s32`. One arm
    returns a difference and the other returns a constant."
  - There are two `u32` arguments and a `u32` result. When the first is at least
    as large as the second, the function returns their difference. Otherwise it
    returns zero.
---

# The branch mnemonic shows the type

A subtraction sets the same four flags, whatever the operands mean. The
difference is in which flags a branch reads. So ARM has two complete families
of conditional branches, and the compiler picks a family from the *types* in
the source:

    signed     blt   bge   ble   bgt
    unsigned   blo   bhs   bls   bhi

Memorise `blo` and `bhs`, because objdiff prints them under these ARM alias
names. They are the carry-clear and carry-set conditions. In hand-written GBA
assembly you will also see them written as `bcc` and `bcs`.

Here is one function compiled twice. The only change is the declared type of
the two values being compared:

```asm
0        cmp       r0, r1
2        ble       6 ~>
4        mov       r2, #0
6      ~>mov       r0, r2
8        bx        lr
```

```asm
0        cmp       r0, r1
2        bls       6 ~>
4        mov       r2, #0
6      ~>mov       r0, r2
8        bx        lr
```

Both versions are ten bytes, with the same registers and the same layout. Only
one mnemonic is different. The arguments in the first version are `s32`, and in
the second they are `u32`. Nothing else in the listing shows that difference:
there is no extra masking, no extra shift and no other change of instruction.
If you are working out a signature from a target with no other clue, the branch
is the clue.

This difference matters. With `r0` holding `0xFFFFFFFF` and `r1` holding `1`,
`cmp r0, r1` counts as "greater" for `bhi` and "less" for `bgt`. A decomp that
picks the wrong family compiles to different bytes, and it gives a different
answer on the first negative input. Real GBA code is full of `u16` counters and
`u8` indices that are promoted into these compares, so you will see the
unsigned family all the time.

Your target's branch is from the unsigned family. Work out what that tells you
about the types before you write any code.

## Your task

Write `func_0812c408` to reproduce the target assembly.

<!-- solution -->
```c
u32 func_0812c408(u32 a, u32 b) {
    if (a >= b) return a - b;
    return 0;
}
```
