---
id: 3019bcca-1250-4b42-8172-c1ea1bc027b2
slug: gba-types-load-signed-halfword
title: The Register-Offset ldrsh
difficulty: 2
concepts:
  - narrow-types
  - sign-extension
  - loads
symbol: func_081bf9fc
hints:
  - The constant in each `mov` is the byte offset of that load, so halve it to
    get the subscript. Two `mov`s means two signed halfword reads.
  - "One `s16 *` in, an `s32` out, built from the elements at byte offsets 2 and
    8."
---

# A whole register spent on an offset

Signed halfwords get a load instruction of their own. `ldrsh` fetches 16 bits
and sign-extends them into the register in one go, which sounds like the end of
the story until you look at what forms of it exist. ARMv4T encodes `ldrsh` and
`ldrsb` only in the register-offset form `ldrs* rD, [rB, rI]`. There is no
`ldrsh rD, [rB, #imm]` at all.

So agbcc materialises the offset in a register. Reading `p[5]` from an `s16 *`
looks like this:

```asm
0        mov       r1, #10
2        ldrsh     r0, [r0, r1]
4        add       r0, #1
6        bx        lr
```

`mov r1, #10` does no arithmetic. It puts the byte offset of element 5 somewhere
the load can reach, because the constant folds into the index register instead
of into the instruction. Every `mov rX, #N` sitting immediately above an `ldrsh`
is an addressing mode, and `N / 2` is the subscript.

Now the same function through an `s8 *`:

```asm
0        ldrb      r0, [r0, #5]
2        lsl       r0, #24
4        asr       r0, #24
6        add       r0, #1
8        bx        lr
```

The narrower type produces the longer code. gcc's halfword sign-extend pattern
carries a spare operand it can allocate a register into, so it can always reach
`ldrsh`; the byte pattern has no such operand, so a signed byte normally falls
back to the shift pair you met in the last lesson. This asymmetry is pure
ARMv4T, and it means `s8` and `s16` fields are read in completely different
shapes.

One consequence is worth keeping: count the `mov rX, #N` instructions that feed
an `ldrsh` and you have counted the function's signed halfword reads, without
reading a single load.

Your target does two of them.

## Your task

Write `func_081bf9fc` to reproduce the target assembly.

<!-- solution -->
```c
s32 func_081bf9fc(s16 *p) {
    return p[1] - p[4];
}
```
