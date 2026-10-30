---
id: 7a1d8840-fa11-4306-b5ff-8fd6922efd40
slug: bitwise-variable-shifts
title: Shifting by a Variable
difficulty: 2
concepts:
  - shifts
  - registers
  - types
symbol: func_80287620
hints:
  - "In the `v` forms, the amount is the LAST operand and the value being shifted is the middle one. No instruction you have seen so far uses this order, so read carefully."
  - "The mnemonic is still a type oracle, as in the last lesson. Whether it is `srlv` or `srav` tells you how to declare the shifted value."
---

# sllv, srlv, srav

In every shift so far, the amount was a constant stored in the instruction.
When the amount is a variable, each shift has a register form with a **v** on
the end: `sllv`, `srlv` and `srav`. Here is a function that shifts a value left
by the amount in its second argument:

```asm
sllv v0, a0, a1    # v0 = x << n (value in a0, amount in a1)
jr   ra
nop
```

Look carefully at the operand order: **destination, value, amount**. The shift
amount is in the *last* position. Two argument registers sit side by side in
one instruction. If you swap them, you get `n << x`, which compiles without
complaint and does not match. Use the same care as with `subu`: say it out
loud ("`a0` shifted by `a1`") before you write the C.

(The hardware reads only the bottom 5 bits of the amount register, so a shift
by 33 behaves like a shift by 1. In C, shifting past the width of the type is
undefined, so the compiler does not care what happens in that case. The code
you decompile will not depend on it either.)

Everything else works the same as in the constant forms, including the type
oracle. `srlv` means the shifted value is unsigned, and `srav` means it is
signed. The target below shifts right. Check the mnemonic, declare the type to
match, and keep the operands in the right order.

## Your task

Write `func_80287620` to reproduce the target assembly.

<!-- solution -->
```c
u32 func_80287620(u32 x, s32 n) {
    return x >> n;
}
```
