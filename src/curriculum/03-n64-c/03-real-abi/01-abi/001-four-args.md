---
id: 216920ec-f848-4f55-9fc3-f4dfe14106fa
slug: abi-four-args
title: Four Arguments, Four Registers
difficulty: 1
concepts:
  - abi
  - arguments
  - arithmetic
symbol: func_8005a480
hints:
  - "Walk the chain top to bottom and track what each temporary holds — every line folds one more argument in."
  - "The mnemonic on each line tells you whether that argument is added or subtracted."
---

# a0 through a3, in order

You've been living on one or two arguments so far. The o32 calling convention —
the contract every function in this game obeys — hands a function its first
**four** word-sized arguments in registers, in declaration order: `a0`, `a1`,
`a2`, `a3`. No loads, no setup; they're just *there* when the function starts.

Here's `blend4(a, b, c, d)`, which computes `(a + b) - (c + d)`:

```asm
addu  t6, a0, a1    # a + b
subu  t7, t6, a2    # (a + b) - c
subu  v0, t7, a3    # ((a + b) - c) - d
jr    ra
nop
```

All four registers show up exactly once, in order. But look closer: the C said
"subtract the sum `c + d`", and the assembly never computes that sum. IDO
**re-associated** the expression into one left-to-right chain — subtracting a
sum is the same as subtracting each piece, so it folds one argument in per
instruction and never needs a second temporary chain.

That's the general reading technique for these: don't try to match parentheses.
Walk the chain line by line, note whether each argument is added or subtracted,
and write the flattened expression. Any C spelling with the same meaning
compiles to the same chain.

## Your task

Write `func_8005a480` to reproduce the chain in the target assembly.

<!-- solution -->
```c
s32 func_8005a480(s32 a, s32 b, s32 c, s32 d) {
    return a + b + c - d;
}
```
