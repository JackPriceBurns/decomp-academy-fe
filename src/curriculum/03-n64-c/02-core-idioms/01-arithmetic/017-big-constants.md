---
id: e606f38a-5452-479d-999a-0c96015d58e0
slug: arithmetic-big-constants
title: "lui/ori: Constants Too Big for One Instruction"
difficulty: 2
concepts:
  - immediates
  - registers
symbol: func_80181bcc
hints:
  - "`lui` fills the top 16 bits, and `ori` fills the bottom 16. Write the two immediates side by side as one eight-digit hex number."
  - "The `lui` immediate is shifted up by 16 bits, so 0x5 in a `lui` means 0x50000."
---

# Sixteen bits at a time

The immediate field of an instruction holds 16 bits. The warmup said that a
larger constant takes a pair of instructions. Here is that pair, building
0x20033:

```asm
lui v0, 0x2         # v0 = 0x0002_0000: the immediate goes in the TOP half
ori v0, v0, 0x33    # v0 = 0x0002_0033: OR in the bottom half
jr  ra
nop
```

**`lui`** (**l**oad **u**pper **i**mmediate) writes its 16-bit immediate into
the *upper* half of the register and sets the lower half to zero. So `lui` of
0x2 makes 0x20000, not 2. Then **`ori`** (OR immediate) fills the bottom 16
bits, which the `lui` left as zeros.

To read the pair, join the two immediates: put the `lui` immediate in front of
the `ori` immediate and you have the full 32-bit constant. `lui 0x2` +
`ori 0x33` = `0x0002_0033`. There is no arithmetic to do, only place value.

Two habits to build now:

- **Constants this size almost always make sense in hex**: addresses, bit
  patterns, packed fields. Write them in hex in your C unless the value is
  clearly meant as a decimal number.
- A `lui` with **no `ori` after it** means the low half is all zeros. A
  constant like 0x80000 takes one instruction. Don't add an `ori 0x0` that
  isn't in the target. The compiler doesn't add one.

The target below is one pair. Join the immediates and return the result.

## Your task

Write `func_80181bcc` to reproduce the target assembly.

<!-- solution -->
```c
s32 func_80181bcc(void) {
    return 0x54321;
}
```
