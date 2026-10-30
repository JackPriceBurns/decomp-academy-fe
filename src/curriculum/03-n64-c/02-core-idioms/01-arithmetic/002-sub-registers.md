---
id: a15960e1-7b1d-4b03-b747-2218bcab55d8
slug: arithmetic-sub-registers
title: Subtraction and Operand Order
difficulty: 1
concepts:
  - arithmetic
  - registers
symbol: func_80056580
hints:
  - "`subu rd, rs, rt` computes `rs - rt`. The middle operand is the one being subtracted *from*."
  - "Check which argument register is second and which is third in the target's `subu`. Then write the C in that order."
---

# subu, and why order matters

Register subtraction is `subu rd, rs, rt`. Unlike addition, the order of the
operands matters here. `subu` computes `rs - rt`: the *second* operand minus
the *third*.

Here is a function that returns its **second** argument minus its first. It is
`revDiff(x, y)`, returning `y - x`:

```asm
subu v0, a1, a0    # v0 = a1 - a0, i.e. y - x
jr   ra
nop
```

Look at the operands: `a1` comes before `a0`. If you swapped them, you would
have a different function. It would use the same instruction and the same
registers, but give the opposite sign. A one-line `subu` is one of the most
common places in MIPS to write C that looks right but is backwards. The diff
then shows two identical mnemonics with the operands swapped.

So make this a habit. Every time you see a `subu`, say the subtraction out loud
("*this* minus *that*"), and match each register to the argument it holds.
`a0` is the first argument, and `a1` is the second.

The target below is the same single instruction, with its own operand order.
Read it carefully before you write anything.

## Your task

Write `func_80056580` to reproduce the target `subu`.

<!-- solution -->
```c
s32 func_80056580(s32 a, s32 b) {
    return a - b;
}
```
