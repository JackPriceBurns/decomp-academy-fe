---
id: 6c69e827-c923-5b61-ad6f-4bc6c4ca07cc
slug: gba-foundations-immediate
title: Constants Stored in the Instruction
difficulty: 1
concepts:
  - arithmetic
  - immediates
symbol: bias
hints:
  - The constant in the target's `add` is the constant your C adds.
  - Immediates print in decimal here, so read the number exactly as shown.
---

# A constant with no load

Adding a small constant needs no extra instructions. The number is stored inside
the instruction itself, using the immediate form `add rD, #imm`. Here is a
function that adds twelve to its argument:

```asm
0        add       r0, #12
2        bx        lr
```

This is one instruction. There is no separate load, and no register is used to
hold the twelve. The value is part of the instruction's encoding.

The sixteen-bit instruction size limits this encoding. The immediate field in
this form is **eight bits wide**, so it can only hold values from 0 to 255. For
a bigger constant, the compiler has to build the value in another way. You will
see how in a few lessons. Your target's constant is well inside the range.

The number in the target's `add` is the number you want.

## Your task

Write `bias`, taking an `s32 x`, to reproduce the target assembly.

<!-- starter -->
```c
s32 bias(s32 x) {
    return 0;
}
```

<!-- solution -->
```c
s32 bias(s32 x) {
    return x + 16;
}
```
