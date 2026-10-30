---
id: 216920ec-f848-4f55-9fc3-f4dfe14106fa
slug: abi-four-args
title: The Four Argument Registers
difficulty: 1
concepts:
  - abi
  - arguments
  - arithmetic
symbol: func_8005a480
hints:
  - "Read the chain from top to bottom and track what each temporary holds. Each line adds or subtracts one more argument."
  - "The mnemonic on each line tells you whether that argument is added or subtracted."
---

# a0 through a3, in order

So far your functions have taken one or two arguments. The o32 calling
convention is the set of rules that every function in this game follows. It
passes the first **four** word-sized arguments in registers, in the order they
are declared: `a0`, `a1`, `a2`, `a3`. The function does not load them or set
them up. They are already in those registers when the function starts.

This is `blend4(a, b, c, d)`, which computes `(a + b) - (c + d)`:

```asm
addu  t6, a0, a1    # a + b
subu  t7, t6, a2    # (a + b) - c
subu  v0, t7, a3    # ((a + b) - c) - d
jr    ra
nop
```

All four registers appear exactly once, in order. Now look at the C again. It
subtracts the sum `c + d`, but the assembly never computes that sum. IDO
**re-associated** the expression into one chain that runs left to right.
Subtracting a sum is the same as subtracting each part, so the compiler handles
one argument per instruction and never needs a second chain of temporaries.

This gives you a general way to read code like this. Don't try to match
parentheses. Read the chain line by line, note whether each argument is added
or subtracted, and write the flattened expression. Any C expression with the
same meaning compiles to the same chain.

## Your task

Write `func_8005a480` to reproduce the chain in the target assembly.

<!-- solution -->
```c
s32 func_8005a480(s32 a, s32 b, s32 c, s32 d) {
    return a + b + c - d;
}
```
