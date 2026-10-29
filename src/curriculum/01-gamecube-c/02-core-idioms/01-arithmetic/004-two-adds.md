---
id: 43bd9493-8b88-5885-91b4-43e279fbc514
slug: arithmetic-two-adds
title: Two Adds, Reassociated
difficulty: 2
concepts:
  - arithmetic
  - chaining
  - reassociation
symbol: func_800ef650
hints:
  - Addition is associative, so the compiler is free to regroup the operands.
  - Write the natural left-to-right sum. MWCC reassociates it on its own; adding
    parentheses to copy the instruction order can change the output.
---

# When the compiler regroups your chain

MWCC can reassociate a chain of additions while scheduling instructions. The
order of the machine operations need not follow the left-to-right grouping
of the C expression.

For example, consider the assembly for a four-term sum:

```asm
add     r0,r4,r5
mr      r4,r3
add     r3,r0,r6
add     r3,r4,r3
blr
```

The first `add` combines `b` and `c`. The `mr` saves `a` in `r4`, the next
`add` includes `d`, and the final `add` brings in the saved value. MWCC chose
that order from a natural left-to-right expression.

An `mr` is a register-to-register copy. Follow the saved value to its later
use, then trace each `add` back to its inputs to find which operands belong
to the sum. Write the natural left-to-right expression and let MWCC choose
the instruction order. Parenthesizing the C to imitate the compiler's
regrouping can produce different assembly.

## Your task

Write `func_800ef650` to reproduce the target assembly.

<!-- solution -->
```c
int func_800ef650(int a, int b, int c) {
    return a + b + c;
}
```
