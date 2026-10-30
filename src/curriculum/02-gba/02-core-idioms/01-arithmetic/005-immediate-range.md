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
  - The `mov` at the start comes from the immediate encoding, and the
    arithmetic does not need it. The eight-bit form can only work on the
    register it writes.
  - The function takes four `s32` parameters and returns an `s32`, and only
    the fourth is read. The constant is applied first, and the doubling comes
    after it.
---

# The two immediate sizes

Thumb has two encodings for adding or subtracting a constant. The constant and
the destination register decide which one gcc can use.

The three-operand form has a **three-bit** immediate, so it holds values from 0
to 7. It can write its result to any register. Here is `y + 7`:

```asm
0        add       r0, r1, #7
2        bx        lr
```

That is one instruction. It reads `r1`, adds 7, and writes the result to `r0`.

Change the constant to 8, and the same function needs two instructions:

```asm
0        mov       r0, r1
2        add       r0, #8
4        bx        lr
```

Eight does not fit in three bits, so gcc has to use the other encoding: the
**two-operand, eight-bit** form, `add rD, #imm8`. That form holds values up to
255, but it can only add to the register it writes. So the value has to be
copied into the destination first.

The cost goes up once, at 8, and then stays the same. Every constant from 8 to
255 costs exactly those two instructions, and 7 costs one. When you see a plain
`mov rD, rS` just before an `add rD, #imm` or `sub rD, #imm`, the copy exists
only because of the encoding. It does not spill a value, and it does not save a
value for later.

The other immediate instructions use the same eight-bit field. `mov rD, #imm8`
and `cmp rD, #imm8` have the same range, which is why 255 comes up so often in
this course. Shifts do not have this limit. `lsl rD, rM, #imm5` has a five-bit
immediate **and** a three-operand form, so a shift never needs a copy first.

In your target, read the copy as information about the constant. Then check
what the last instruction does to the result.

## Your task

Write `func_080455e0` to reproduce the target assembly.

<!-- solution -->
```c
s32 func_080455e0(s32 a, s32 b, s32 c, s32 d) {
    return (d - 250) * 2;
}
```
