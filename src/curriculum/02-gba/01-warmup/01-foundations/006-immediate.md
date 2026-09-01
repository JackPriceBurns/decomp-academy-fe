---
id: 6c69e827-c923-5b61-ad6f-4bc6c4ca07cc
slug: gba-foundations-immediate
title: Constants Ride Inside the Instruction
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

Adding a small constant costs nothing extra. The number rides inside the
instruction itself, in the immediate form `add rD, #imm`. Here is a function
that adds twelve to its argument:

```asm
0        add       r0, #12
2        bx        lr
```

One instruction. No separate load, no register set aside to hold the twelve —
the value is part of the encoding.

That encoding is where sixteen bits starts to pinch. The immediate field in this
form is **eight bits wide**, so it reaches 0 to 255 and no further. Ask for a
bigger constant and the compiler has to build the value some other way, which is
a problem you will meet in a few lessons' time. Your target's constant is
comfortably inside the range.

Read the number the target's `add` carries and that is the number you want.

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
