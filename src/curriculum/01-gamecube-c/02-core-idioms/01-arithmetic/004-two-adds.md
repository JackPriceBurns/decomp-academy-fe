---
id: 43bd9493-8b88-5885-91b4-43e279fbc514
slug: arithmetic-two-adds
title: Two Adds, Reassociated
difficulty: 2
concepts:
  - arithmetic
  - chaining
  - reassociation
symbol: add3
hints:
  - Addition is associative, so the compiler is free to regroup the operands.
  - Watch for an `mr` that just parks `a` while `b + c` is computed first.
---

# When the compiler regroups your chain

Addition is associative. `(a + b) + c` and `a + (b + c)` come out the same, and
the compiler happily exploits that to schedule the arithmetic however suits it.
Rather than march left-to-right through the registers, it might hold one operand
back and pair off two others first.

Here is `sum4`, a four-argument sum.

```asm
add  r0, r4, r5   # r0 = b + c  (computed first)
mr   r4, r3       # r4 = a      (saved aside)
add  r3, r0, r6   # r3 = (b + c) + d
add  r3, r4, r3   # r3 = a + ((b + c) + d)
blr
```

That `mr` (*move register*) is just a register-to-register copy, no math
attached. In this case it tucks `a` aside so the compiler can knock out `b + c`
first, fold in `d`, and slot `a` back in at the very end. Sum it left-to-right or
sum it this way, the number is identical; all that moved was the grouping.

An `mr` near the top of a function is a tell. The operand it saves will resurface
in a later `add`, so go hunting for it. Count the instructions and you know how
many operations the expression holds; read the registers and you know which
arguments take part. Chase every `add`'s sources back to the argument registers
(`r3`→`a`, `r4`→`b`, `r5`→`c`) and the expression comes back together.

## Your task

Write `add3`, taking three `int`s, to reproduce the target assembly.

<!-- starter -->
```c
int add3(int a, int b, int c) {
    return 0;
}
```

<!-- solution -->
```c
int add3(int a, int b, int c) {
    return a + b + c;
}
```
