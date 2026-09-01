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
  - "`bhs` is the unsigned relation, so neither operand can be `s32`. The two
    arms return a difference and a constant."
  - Two `u32` arguments and a `u32` result. When the first is at least as large
    as the second the function answers with their difference, otherwise with
    zero.
---

# The mnemonic is the type declaration

A subtraction sets the same four flags whatever the operands mean. What differs
is which flags a branch consults, so ARM carries two complete families of
conditional branch and the compiler picks a family from the *types* in the
source:

    signed     blt   bge   ble   bgt
    unsigned   blo   bhs   bls   bhi

`blo` and `bhs` are the ones to memorise, because objdiff prints them under
their ARM aliases: they are the carry-clear and carry-set conditions, and you
will also see them written `bcc` and `bcs` in hand-written GBA assembly.

Here is one function compiled twice, with nothing changed but the declared type
of the two values being compared:

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

Ten bytes each, identical registers, identical layout, one mnemonic apart. The
first pair of arguments is `s32`, the second `u32`. Nothing else in the listing
records that difference — no extra masking, no extra shift, no change of
instruction. If you are deriving a signature from a target with no other clue,
the branch is the clue.

The distinction is not cosmetic. `cmp r0, r1` with `r0` holding `0xFFFFFFFF`
and `r1` holding `1` is "greater" to `bhi` and "less" to `bgt`, and a decomp
that picks the wrong family compiles to different bytes on the first negative
input. Real GBA code is full of `u16` counters and `u8` indices promoted into
these compares, so the unsigned family turns up constantly.

Your target's branch is from the unsigned family. Read what that settles before
you write a line.

## Your task

Write `func_0812c408` to reproduce the target assembly.

<!-- solution -->
```c
u32 func_0812c408(u32 a, u32 b) {
    if (a >= b) return a - b;
    return 0;
}
```
