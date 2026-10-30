---
id: 613b4c1f-e15f-4f76-9663-606931c84eb5
slug: arithmetic-unsigned-divide
title: "divu: Signedness Shows in the Mnemonic"
difficulty: 2
concepts:
  - arithmetic
  - divide
  - types
symbol: func_8004ed30
hints:
  - "`divu` means the C works on unsigned values, so declare the types to match."
  - "Check whether the target fetches LO or HI after the divide. That tells you the operator."
---

# One letter of type information

Division is the first place where the instructions directly tell you a C type.
Signed division is `div`, and unsigned division is `divu`. This time the `u`
really does mean unsigned. It is not the "don't trap" suffix. Here's
`udivTen(x)`, dividing a `u32` by 10:

```asm
addiu at, zero, 10
divu  zero, a0, at   # LO = x / 10,  HI = x % 10  (unsigned)
mflo  v0
nop
nop
jr    ra
nop
```

Everything else in the sequence is unchanged: the divisor goes into `at`, the
results go into HI/LO, `mflo`/`mfhi` fetch them, and the two safety `nop`s
follow. Only the mnemonic is different.

This matters because *you* choose the types when you write the C, and the
compiler picks the instruction based on your types. When you see `divu` in a
target, declare the operands `u32`. Otherwise you will produce a `div`, and one
diff line will not match. This is your first example of **type detective
work**: recovering declarations from the instructions, as well as expressions.
A later chapter is built entirely on this idea.

`mfhi` works after `divu` the same way it does after `div`. The target below
needs both facts: read the divide mnemonic to get the types, and read the
fetch to get the operator.

## Your task

Write `func_8004ed30` to reproduce the target assembly.

<!-- solution -->
```c
u32 func_8004ed30(u32 a) {
    return a % 9;
}
```
