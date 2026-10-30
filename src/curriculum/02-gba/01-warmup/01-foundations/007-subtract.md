---
id: 97d507c7-a675-431d-9a5d-2fc6d86fc062
slug: gba-foundations-subtract
title: Subtracting a Constant
difficulty: 1
concepts:
  - arithmetic
  - immediates
symbol: decay
hints:
  - The target subtracts, so your C should too. Use the constant that is shown.
  - Adding a negative number would compile to exactly the same `sub`, so either
    spelling matches.
---

# The compiler picks the instruction

Subtracting a constant works the same way as adding one:

```asm
0        sub       r0, #20
2        bx        lr
```

`sub rD, #imm` is `rD = rD - imm`. It has the same eight-bit immediate field,
and it also needs no separate load.

Now look at this function. Its C adds negative nine:

```c
s32 backNine(s32 x) {
    return x + -9;
}
```

and the compiler emits this:

```asm
0        sub       r0, #9
2        bx        lr
```

There is no "add a negative" instruction, so the compiler chooses `add` or `sub`
based only on the sign of the constant. Two different pieces of C compile to the
same instruction, so the assembly cannot tell you which one the original author
wrote. Matching only compares instructions, so either version is correct. You
will see this kind of ambiguity often. Write whichever version reads more
naturally.

## Your task

Write `decay`, taking an `s32 x`, to reproduce the target assembly.

<!-- starter -->
```c
s32 decay(s32 x) {
    return 0;
}
```

<!-- solution -->
```c
s32 decay(s32 x) {
    return x - 5;
}
```
