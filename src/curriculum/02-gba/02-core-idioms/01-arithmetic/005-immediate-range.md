---
id: fec3b7de-276d-4baf-8bb1-3784fcd3146f
slug: gba-arithmetic-immediate-range
title: How Far an Immediate Reaches
difficulty: 2
concepts:
  - immediates
  - registers
  - arithmetic
symbol: func_080455e0
hints:
  - The opening `mov` is the immediate encoding's doing, not the arithmetic's -
    the eight-bit form can only work on the register it writes.
  - "Four `s32` parameters in, an `s32` out, and only the fourth is read. The
    constant is applied before the doubling, not after."
---

# Two immediate fields, one cliff between them

Thumb encodes an add-or-subtract-a-constant two different ways, and the boundary
between them is somewhere you would never expect.

The three-operand form carries a **three-bit** immediate, so it covers 0 to 7,
and it can write its answer anywhere. Here is `y + 7`:

```asm
0        add       r0, r1, #7
2        bx        lr
```

One instruction: read `r1`, add 7, write `r0`.

Change the constant to 8 and the same function costs two:

```asm
0        mov       r0, r1
2        add       r0, #8
4        bx        lr
```

Eight does not fit in three bits, so gcc has to use the other encoding — the
**two-operand, eight-bit** one, `add rD, #imm8`. That form reaches all the way
to 255, but it can only add to the register it writes, so the value has to be
copied into the destination first.

The cost jumps in one step and then stays flat. Every constant from 8 to 255
costs exactly those two instructions, and 7 costs one. When you see a bare
`mov rD, rS` immediately before an `add rD, #imm` or `sub rD, #imm`, that copy
is the encoding's fault and nothing else — it is not a spill and not a value
being preserved.

The eight-bit field turns up in the rest of the immediate instructions too:
`mov rD, #imm8` and `cmp rD, #imm8` share the same range, which is why 255 is
such a recurring number in this course. Shifts escape all of this:
`lsl rD, rM, #imm5` has a five-bit immediate **and** a three-operand form, so a
shift never needs a preparatory copy.

Read the copy in your target as a statement about the constant, then check what
the last instruction does to the result.

## Your task

Write `func_080455e0` to reproduce the target assembly.

<!-- solution -->
```c
s32 func_080455e0(s32 a, s32 b, s32 c, s32 d) {
    return (d - 250) * 2;
}
```
